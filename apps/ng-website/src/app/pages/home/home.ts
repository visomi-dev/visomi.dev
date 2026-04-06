import { Component, inject, OnInit } from '@angular/core';

import { SEO } from '../../shared/seo';

import { Background } from './background/background';
import { Features } from './features/features';
import { Footer } from './footer/footer';
import { Hero } from './hero/hero';
import { Journey } from './journey/journey';
import { Works } from './works/works';

@Component({
  selector: 'app-home',
  imports: [Background, Features, Footer, Hero, Journey, Works],
  templateUrl: './home.html',
  styleUrl: './home.css',
  host: {
    class:
      /* tw */ 'block min-h-full w-full overflow-x-hidden pt-20 bg-surface-light text-muted-light dark:bg-surface-dark dark:text-muted-dark selection:bg-neutral-900 selection:text-white',
  },
})
export class Home implements OnInit {
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
