import { Component, inject } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';

type PreviewCard = {
  href: string;
  id: string;
  iframeTitle: string;
  label: string;
  src: SafeResourceUrl;
};

@Component({
  host: {
    class: 'app-shell',
  },
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly sanitizer = inject(DomSanitizer);

  readonly previewIntro =
    'These iframes render the HTML social-card template directly, so you can debug spacing, copy, and layout before generating PNGs.';

  readonly previewCards: readonly PreviewCard[] = [
    {
      id: 'en-home',
      href: '/social-image-previews/en/home.html',
      iframeTitle: 'English home social image preview',
      label: 'English / Home',
      src: this.createPreviewUrl('/social-image-previews/en/home.html'),
    },
    {
      id: 'en-journey',
      href: '/social-image-previews/en/journey.html',
      iframeTitle: 'English journey social image preview',
      label: 'English / Journey',
      src: this.createPreviewUrl('/social-image-previews/en/journey.html'),
    },
    {
      id: 'en-projects',
      href: '/social-image-previews/en/projects.html',
      iframeTitle: 'English projects social image preview',
      label: 'English / Projects',
      src: this.createPreviewUrl('/social-image-previews/en/projects.html'),
    },
    {
      id: 'en-resume',
      href: '/social-image-previews/en/resume.html',
      iframeTitle: 'English resume social image preview',
      label: 'English / Resume',
      src: this.createPreviewUrl('/social-image-previews/en/resume.html'),
    },
    {
      id: 'en-contact',
      href: '/social-image-previews/en/contact.html',
      iframeTitle: 'English contact social image preview',
      label: 'English / Contact',
      src: this.createPreviewUrl('/social-image-previews/en/contact.html'),
    },
    {
      id: 'es-home',
      href: '/social-image-previews/es/home.html',
      iframeTitle: 'Spanish home social image preview',
      label: 'Spanish / Inicio',
      src: this.createPreviewUrl('/social-image-previews/es/home.html'),
    },
    {
      id: 'es-journey',
      href: '/social-image-previews/es/journey.html',
      iframeTitle: 'Spanish journey social image preview',
      label: 'Spanish / Trayectoria',
      src: this.createPreviewUrl('/social-image-previews/es/journey.html'),
    },
    {
      id: 'es-projects',
      href: '/social-image-previews/es/projects.html',
      iframeTitle: 'Spanish projects social image preview',
      label: 'Spanish / Proyectos',
      src: this.createPreviewUrl('/social-image-previews/es/projects.html'),
    },
    {
      id: 'es-resume',
      href: '/social-image-previews/es/resume.html',
      iframeTitle: 'Spanish resume social image preview',
      label: 'Spanish / Experiencia',
      src: this.createPreviewUrl('/social-image-previews/es/resume.html'),
    },
    {
      id: 'es-contact',
      href: '/social-image-previews/es/contact.html',
      iframeTitle: 'Spanish contact social image preview',
      label: 'Spanish / Contacto',
      src: this.createPreviewUrl('/social-image-previews/es/contact.html'),
    },
  ];

  private createPreviewUrl(path: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(path);
  }
}
