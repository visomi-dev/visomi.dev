import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, afterNextRender, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Subject } from 'rxjs';
import { io, type Socket } from 'socket.io-client';

type SessionView = { authenticated: boolean; csrfToken: string; user: { id: string } | null };

// eslint-disable-next-line @angular-eslint/prefer-service-decorator -- Keep explicit singleton scope.
@Injectable({ providedIn: 'root' })
export class OwnerSession {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly lifetime = inject(DestroyRef);

  private readonly visible = signal(true);

  readonly valid = this.visible.asReadonly();
  readonly cancelled = new Subject<void>();

  private revision = 0;
  private token = '';
  private identity: string | null | undefined;
  private channel?: BroadcastChannel;
  private socket?: Socket;
  private pending?: Promise<void>;

  invalidate(): void {
    this.revision++;
    this.token = '';
    this.pending = undefined;
    this.visible.set(false);
    this.cancelled.next();
  }

  async revalidate(): Promise<void> {
    if (this.pending) {
      return this.pending;
    }

    const revision = this.revision;
    const pending = firstValueFrom(this.http.get<SessionView>('/api/auth/session', { transferCache: false }))
      .then(async (session) => {
        if (this.revision !== revision || this.lifetime.destroyed) {
          return;
        }

        let authorized = false;

        if (session.authenticated) {
          const ownership = await firstValueFrom(
            this.http.get<{ owner: boolean }>('/api/contact/session', { transferCache: false }),
          );

          authorized = ownership.owner === true;
        }

        if (this.revision !== revision || this.lifetime.destroyed) {
          return;
        }

        const changed = this.identity !== undefined && this.identity !== (session.user?.id ?? null);

        if (changed || (!authorized && this.privateRoute())) {
          this.invalidate();
        }

        this.identity = session.user?.id ?? null;
        this.token = session.csrfToken;

        if (authorized) {
          this.visible.set(!changed);
          this.connectRealtime();
        } else {
          this.visible.set(false);
          this.socket?.disconnect();
        }

        if ((!authorized || changed) && this.privateRoute()) {
          await this.router.navigate(['/admin/auth/sign-in'], { replaceUrl: true });
        }
      })
      .catch(async () => {
        if (this.revision !== revision || this.lifetime.destroyed) {
          return;
        }

        this.invalidate();

        if (this.privateRoute()) {
          await this.router.navigate(['/admin/auth/sign-in'], { replaceUrl: true });
        }
      })
      .finally(() => {
        if (this.pending === pending) {
          this.pending = undefined;
        }
      });

    this.pending = pending;

    return pending;
  }

  async csrf(): Promise<string> {
    if (!this.token) {
      await this.revalidate();
    }

    if (!this.token) {
      throw new Error('authentication_unavailable');
    }

    return this.token;
  }

  async signedIn(): Promise<void> {
    this.identity = undefined;
    this.invalidate();

    await this.revalidate();

    this.notify();
  }

  async signOut(): Promise<void> {
    const csrf = await this.csrf();

    await firstValueFrom(this.http.post('/api/auth/logout', {}, { headers: { 'x-csrf-token': csrf } }));

    this.invalidate();
    this.socket?.disconnect();
    this.notify();

    await this.router.navigate(['/admin/auth/sign-in'], { replaceUrl: true });
  }

  private privateRoute(): boolean {
    const current = this.document.defaultView?.location.pathname;
    const privatePath = /^(?:\/app\/(?:en|es))?\/admin\/(?:dashboard|contacts|metrics|visits)(?:[/?#]|$)/;

    return privatePath.test(this.router.url) || Boolean(current && privatePath.test(current));
  }

  private notify(): void {
    this.channel?.postMessage('session-changed');

    try {
      this.document.defaultView?.localStorage.setItem('visomi-session-change', String(Date.now()));
    } catch {
      /* Optional storage. */
    }
  }

  private connectRealtime(): void {
    if (this.socket?.active) {
      return;
    }

    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = io('/session', { path: '/socket.io', transports: ['websocket'], autoConnect: false, forceNew: true });
    const refresh = () => {
      this.invalidate();
      void this.revalidate();
    };

    this.socket.on('session:changed', refresh);
    // A transport/handshake failure is not evidence of HTTP session revocation.
    // Let Socket.IO retry transient failures; focus, API denial and server notices still revalidate.
    this.socket.on('connect', () => {
      void this.revalidate();
    });

    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        refresh();
      }
    });

    this.socket.connect();
  }

  private readonly initialize = afterNextRender(() => {
    const view = this.document.defaultView;

    if (!view) {
      return;
    }

    const refresh = () => {
      if (this.document.visibilityState !== 'hidden') {
        // A passive check must not cancel valid resolvers. Confirmed invalidity cancels them in revalidate().
        void this.revalidate();
      }
    };
    const changed = () => {
      this.invalidate();
      void this.revalidate();
    };
    const storage = (event: StorageEvent) => {
      if (event.key === 'visomi-session-change') {
        changed();
      }
    };

    view.addEventListener('focus', refresh);
    view.addEventListener('online', refresh);
    view.addEventListener('storage', storage);

    try {
      this.channel = new BroadcastChannel('visomi-auth');
      this.channel.onmessage = (event: MessageEvent<unknown>) => {
        if (event.data === 'session-changed') {
          changed();
        }
      };
    } catch {
      /* Focus/online and storage remain available without BroadcastChannel. */
    }
    this.lifetime.onDestroy(() => {
      view.removeEventListener('focus', refresh);
      view.removeEventListener('online', refresh);
      view.removeEventListener('storage', storage);
      this.channel?.close();
      this.socket?.removeAllListeners();
      this.socket?.disconnect();
      this.cancelled.complete();
    });

    void this.revalidate();
  });
}
