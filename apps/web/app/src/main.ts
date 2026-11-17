import { bootstrapApplication } from '@angular/platform-browser';

import { config } from './app/app.config.browser';
import { App } from './app/app';
import { startBrowser } from './app/shared/start-browser';

void startBrowser((configuration) => bootstrapApplication(App, configuration), config, window);
