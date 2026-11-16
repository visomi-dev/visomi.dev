import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { appShell, navItem, sidebar, topbar } from '@visomi-stack/web-frontend-ui/lib/shell';

import { OwnerSession } from '../../../auth/session/owner-session';
import { Preferences } from '../preferences/preferences';

@Component({
  selector: 'app-admin-shell',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, RouterOutlet, Preferences],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShell {
  private readonly session = inject(OwnerSession);

  readonly busy = signal(false);
  readonly failed = signal(false);

  readonly valid = this.session.valid;
  readonly shellClass = appShell.classes();
  readonly frameClass = appShell.frameClasses();
  readonly sidebarClass = sidebar.classes();
  readonly contentClass = appShell.contentClasses();
  readonly topbarClass = topbar.classes();
  readonly navClass = navItem.classes();

  async signOut(): Promise<void> {
    if (this.busy()) {
      return;
    }

    this.busy.set(true);

    try {
      await this.session.signOut();
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
