import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

export type Contact = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  locale: string;
  type: string;
  message?: string;
};
export type DashboardData = {
  state: 'ready' | 'error' | 'denied';
  items?: Contact[];
  item?: Contact;
  next?: string | null;
};
export const dashboardResolver: ResolveFn<DashboardData> = (route) => {
  const http = inject(HttpClient);
  const id = route.paramMap.get('id');

  if (id) {
    return http.get<{ item: Contact }>(`/api/contact/submissions/${encodeURIComponent(id)}`).pipe(
      map(({ item }): DashboardData => ({ state: 'ready', item })),
      catchError(() => of<DashboardData>({ state: 'error' })),
    );
  }

  const before = route.queryParamMap.get('before');

  return http
    .get<{ items: Contact[]; next: string | null }>('/api/contact/submissions', { params: before ? { before } : {} })
    .pipe(
      map((list): DashboardData => ({ state: 'ready', ...list })),
      catchError(() => of<DashboardData>({ state: 'error' })),
    );
};
