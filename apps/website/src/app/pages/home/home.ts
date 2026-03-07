import { Component } from '@angular/core';

import { Navbar } from '../../shared/layout/navbar/navbar';

import { Background } from './background/background';
import { Features } from './features/features';
import { Footer } from './footer/footer';
import { Hero } from './hero/hero';
import { Journey } from './journey/journey';
import { Works } from './works/works';

@Component({
  selector: 'app-home',
  imports: [Background, Features, Footer, Hero, Journey, Navbar, Works],
  templateUrl: './home.html',
  styleUrl: './home.css',
  host: {
    class:
      /* tw */ 'block min-h-full w-full overflow-x-hidden pt-20 bg-surface-light text-muted-light dark:bg-surface-dark dark:text-muted-dark selection:bg-neutral-900 selection:text-white',
  },
})
export class Home {}
