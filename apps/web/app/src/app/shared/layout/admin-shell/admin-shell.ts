import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { OwnerSession } from '../../../auth/session/owner-session';
import { Button } from '../../../ui/actions/button';
import { Alert } from '../../../ui/feedback/alert';
import { NavItem } from '../../../ui/layout/nav-item';
import { Navbar } from '../../../ui/layout/navbar';
import { Dialog } from '../../../ui/overlays/dialog';
import { Heading } from '../../../ui/typography/heading';
import { Text } from '../../../ui/typography/text';
import { AppShell } from '../app-shell/app-shell';
import { Preferences } from '../preferences/preferences';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { ConsentNotice } from '../../observability/consent-notice/consent-notice';
import { PrivacyLink } from '../../observability/privacy-link/privacy-link';

@Component({
  selector: 'app-admin-shell',
  imports: [
    ConsentNotice,
    PrivacyLink,
    NgOptimizedImage,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    AppShell,
    Preferences,
    Sidebar,
    Topbar,
    Button,
    Alert,
    NavItem,
    Navbar,
    Dialog,
    Heading,
    Text,
  ],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShell {
  private readonly session = inject(OwnerSession);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private readonly mobileMenu = viewChild.required(Dialog);

  readonly busy = signal(false);
  readonly failed = signal(false);
  protected readonly sidebarCompact = signal(false);

  readonly valid = this.session.valid;

  protected readonly expandSidebar = $localize`:@@shellExpandSidebar:Expand sidebar`;
  protected readonly collapseSidebar = $localize`:@@shellCollapseSidebar:Collapse sidebar`;
  protected readonly links = [
    {
      path: '/admin/dashboard',
      label: $localize`:@@dashboardHeroTitle:Contact requests`,
      icon: 'M3 5h18v14H3zM3 5l9 8 9-8',
    },
    {
      path: '/admin/metrics',
      label: $localize`:@@metricsHeroTitle:Technical metrics`,
      icon: 'M3 3v18h18M8 16v-4m5 4V8m5 8V5',
    },
    {
      path: '/admin/visits',
      label: $localize`:@@visitsTitle:Visit analytics`,
      icon: 'M3 18h18M5 15l5-5 4 3 6-7',
    },
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

  protected toggleSidebar(): void {
    this.sidebarCompact.update((compact) => !compact);
  }

  private readonly closeDesktopMenu = afterNextRender(() => {
    const media = this.document.defaultView?.matchMedia?.('(min-width: 1024px)');

    if (!media) {
      return;
    }

    const close = () => {
      if (media.matches) {
        this.mobileMenu().close();
      }
    };

    media.addEventListener('change', close);
    this.destroyRef.onDestroy(() => media.removeEventListener('change', close));
  });
}
