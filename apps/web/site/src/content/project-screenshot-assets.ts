import type { ImageMetadata } from 'astro';

import dataGoDashboard from '../assets/projects/data-go/dashboard.png';
import dataGoDashboard2 from '../assets/projects/data-go/dashboard_2.png';
import dataGoLogin from '../assets/projects/data-go/login.png';
import dataGoPhone from '../assets/projects/data-go/phone.png';
import circularESelectScreen from '../assets/projects/circular-e/select-screen.png';
import circularETwoPhones from '../assets/projects/circular-e/two-phones.png';
import guiraAdminKycList from '../assets/projects/guira/admin-kyc-list.png';
import guiraKycDocuments from '../assets/projects/guira/kyc-documents.png';
import guiraSignUp from '../assets/projects/guira/sign-up.png';
import guiraWelcome from '../assets/projects/guira/welcome.png';
import linneHome from '../assets/projects/linne/home.png';
import linneNewTicketFeed from '../assets/projects/linne/new-ticket-feed.png';
import linneNewTicketStoryVideo from '../assets/projects/linne/new-ticket-story-video.png';
import linneProfileHistory from '../assets/projects/linne/profile-history.png';
import mesadaHistory from '../assets/projects/mesada/history.png';
import mesadaSend from '../assets/projects/mesada/send.png';
import mesadaTransactionSummary from '../assets/projects/mesada/transaction_summary.png';
import mesadaWebsite from '../assets/projects/mesada/website.png';

export const projectScreenshotAssets = {
  'circular-e': [circularETwoPhones, circularESelectScreen],
  guira: [guiraWelcome, guiraSignUp, guiraKycDocuments, guiraAdminKycList],
  linne: [linneHome, linneNewTicketFeed, linneNewTicketStoryVideo, linneProfileHistory],
  mesada: [mesadaWebsite, mesadaSend, mesadaHistory, mesadaTransactionSummary],
  'data-go': [dataGoDashboard, dataGoDashboard2, dataGoPhone, dataGoLogin],
} as const satisfies Record<string, ImageMetadata[]>;
