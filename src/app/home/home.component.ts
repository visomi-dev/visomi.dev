import {
  Component,
  effect,
  HostBinding,
  inject,
  LOCALE_ID,
  OnInit,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { SeoService } from '../shared/seo/seo.service';

import { HeaderComponent } from './header/header.component';
import { ContentComponent } from './content/content.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, ContentComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export default class HomeComponent implements OnInit {
  @HostBinding('class') readonly class = /* tw */ 'block relative min-h-full';

  private readonly locale = inject(LOCALE_ID);
  private activatedRoute = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);

  readonly activatedRouteData = toSignal(this.activatedRoute.data);

  activatedRouteDataEffect = effect(() => {
    console.log('Fetching home data');

    this.activatedRouteData();

    console.log('Fetched home data');
  });

  ngOnInit() {
    this.seoService.configure({
      title: 'visomi.dev',
      description: 'Michael V. S. (visomi) | cross-over developer',
      url: 'https://visomi.dev/',
      preview: `https://visomi.dev/${this.locale}/assets/images/galaxy-illustration.svg`,
      index: true,
      follow: true,
      keywords:
        'visomi.dev, Michael V. S., cross-over developer, full-stack developer, front-end developer, back-end developer, web developer, mobile developer, desktop developer, software developer, game developer, blockchain developer, smart contract developer, solidity developer, rust developer, rustacean, rustlang, rustlang developer, rustlangacean, javascript developer, typescript developer, node.js developer, deno developer, react developer, reactjs developer, react native developer, reactnative developer, react-native developer, angular developer, vue developer, svelte, python, django, flask, fastapi, rust, rocket, actix, wasm, webassembly, golang, go, echo, gin',
      subject: 'Michael V. S. (visomi) | cross-over developer',
      copyright: 'visomi.dev',
      abstract: 'Michael V. S. (visomi) | cross-over developer',
      topic: 'Software Development',
      author: 'visomi.dev',
      owner: 'visomi.dev',
    });
  }
}
