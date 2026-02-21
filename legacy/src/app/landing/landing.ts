import {
  Component,
  HostBinding,
  inject,
  LOCALE_ID,
  OnInit,
} from '@angular/core';

import { SEO } from '../shared/seo';

import { Header } from './header/header';
import { Content } from './content/content';

@Component({
  selector: 'app-landing',
  imports: [Header, Content],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit {
  @HostBinding('class') readonly cls =
    /* tw */ 'flex flex-col md:flex-row relative min-h-full md:justify-center w-full';

  private readonly locale = inject(LOCALE_ID);
  private readonly seo = inject(SEO);

  ngOnInit() {
    this.seo.configure({
      title: 'visomi.dev',
      description: 'Michael (visomi) | cross-over developer',
      url: 'https://visomi.dev/',
      preview: `https://visomi.dev/assets/images/galaxy-illustration.webp`,
      index: true,
      follow: true,
      keywords:
        'visomi.dev, visomi, Michael, cross-over developer, full-stack developer, front-end developer, back-end developer, web developer, mobile developer, desktop developer, software developer, game developer, blockchain developer, smart contract developer, solidity developer, rust developer, rustacean, rustlang, rustlang developer, rustlangacean, javascript developer, typescript developer, node.js developer, deno developer, react developer, reactjs developer, react native developer, reactnative developer, react-native developer, angular developer, vue developer, svelte, python, django, flask, fastapi, rust, rocket, actix, wasm, webassembly, golang, go, echo, gin',
      subject: 'Michael (visomi) | cross-over developer',
      copyright: 'visomi.dev',
      abstract: 'Michael (visomi) | cross-over developer',
      topic: 'Software Development',
      author: 'visomi.dev',
      owner: 'visomi.dev',
    });
  }
}
