import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';

type Stat = {
  name: string;
  percent: number;
  color: string;
};

const WAKATIME_URLS = Object.freeze({
  coding:
    'https://wakatime.com/share/@visomi/3a77752c-e065-4e64-9bde-78945bdb2d8f.json',
  languages:
    'https://wakatime.com/share/@visomi/73ed1619-ca1e-4d2f-8c06-48a531a3f20b.json',
  editors:
    'https://wakatime.com/share/@visomi/218f13c6-5146-41b9-bf03-ed156c0e8612.json',
  operatingSystems:
    'https://wakatime.com/share/@visomi/467e4a57-ae28-4918-911b-3ed72a033567.json',
  categories:
    'https://wakatime.com/share/@visomi/e1000b57-c2b6-419c-90c4-edc855c05878.json',
});

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private readonly httpClient = inject(HttpClient);

  readonly codingTime = signal({
    total: '...',
    bestDay: '...',
  });
  readonly languagesStats = signal<Stat[]>([]);
  readonly editorsStats = signal<Stat[]>([]);
  readonly operatingSystemsStats = signal<Stat[]>([]);
  readonly categoriesStats = signal<Stat[]>([]);

  filterOthers(stats: Stat[], threshold = 0.11) {
    const others = stats.find(({ name }) => name === 'Other');

    const result = stats
      .filter(({ percent, name }) => percent >= threshold && name !== 'Other')
      .map(({ name, percent, color }) => ({
        name,
        percent,
        color,
      }));

    const total = result.reduce((acc, { percent }) => acc + percent, 0);
    const missing = 100 - total;

    if (missing > 0) {
      result.push({
        name: 'Others',
        percent: parseFloat((missing + (others?.percent ?? 0)).toFixed(2)),
        color: '#000000',
      });
    }

    return result;
  }

  async getCodingTime() {
    try {
      const { data } = await lastValueFrom(
        this.httpClient.get<{
          data: {
            grand_total: {
              human_readable_total_including_other_language: string;
            };
            best_day: {
              date: string;
              text: string;
            };
          };
        }>(WAKATIME_URLS.coding),
      );

      this.codingTime.set({
        total: data.grand_total.human_readable_total_including_other_language,
        bestDay: `${data.best_day.date}: ${data.best_day.text}`,
      });
    } catch (error) {
      console.error('An error occurred while fetching coding time data.');
      console.error(error);
    }
  }

  async getLanguagesStats() {
    try {
      const { data } = await lastValueFrom(
        this.httpClient.get<{
          data: Stat[];
        }>(WAKATIME_URLS.languages),
      );

      this.languagesStats.set(this.filterOthers(data));
    } catch (error) {
      console.error('An error occurred while fetching languagesStats data.');
      console.error(error);
    }
  }

  async getEditorsStats() {
    try {
      const { data } = await lastValueFrom(
        this.httpClient.get<{
          data: Stat[];
        }>(WAKATIME_URLS.editors),
      );

      this.editorsStats.set(this.filterOthers(data));
    } catch (error) {
      console.error('An error occurred while fetching editorsStats data.');
      console.error(error);
    }
  }

  async getOperatingSystemsStats() {
    try {
      const { data } = await lastValueFrom(
        this.httpClient.get<{
          data: Stat[];
        }>(WAKATIME_URLS.operatingSystems),
      );

      this.operatingSystemsStats.set(data);
    } catch (error) {
      console.error(
        'An error occurred while fetching operatingSystemsStats data.',
      );
      console.error(error);
    }
  }

  async getCategoriesStats() {
    try {
      const { data } = await lastValueFrom(
        this.httpClient.get<{
          data: Stat[];
        }>(WAKATIME_URLS.categories),
      );

      this.categoriesStats.set(data);
    } catch (error) {
      console.error('An error occurred while fetching categoriesStats data.');
      console.error(error);
    }
  }
}