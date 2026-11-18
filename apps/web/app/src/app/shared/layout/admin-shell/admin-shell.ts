import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { button } from '@visomi-stack/web-frontend-ui/lib/button';
import { dialog } from '@visomi-stack/web-frontend-ui/lib/overlays';
import { navItem, navbar } from '@visomi-stack/web-frontend-ui/lib/shell';

import { OwnerSession } from '../../../auth/session/owner-session';
import { AppShell } from '../app-shell/app-shell';
import { Preferences } from '../preferences/preferences';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

@Component({
  selector: 'app-admin-shell',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, RouterOutlet, AppShell, Preferences, Sidebar, Topbar],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShell {
  private readonly session = inject(OwnerSession);

  readonly busy = signal(false);
  readonly failed = signal(false);

  readonly valid = this.session.valid;

  protected readonly navClass = navItem.classes();
  protected readonly mobileBar = navbar.classes();
  protected readonly mobileItem = navItem.classes({ placement: 'navbar' });
  protected readonly mobileDialog = dialog.classes();
  protected readonly signOutButton = button.classes();
  protected readonly closeButton = button.classes({ variant: 'ghost', size: 'icon' });
  protected readonly mobileSignOut = button.classes({ variant: 'secondary' });
  protected readonly links = [
    { path: '/admin/dashboard', label: $localize`:@@dashboardHeroTitle:Contact requests` },
    { path: '/admin/metrics', label: $localize`:@@metricsHeroTitle:Technical metrics` },
    { path: '/admin/visits', label: $localize`:@@visitsTitle:Visit analytics` },
  ] as const;

  async signOut(): Promise<void> {
    if (this.busy()) {
      return;
    }

    this.busy.set(true);
    this.failed.set(false);

    try {
      await this.session.signOut();
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
