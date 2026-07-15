import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './Auth/interceptor';
import { provideToastr } from 'ngx-toastr';
import { ConfigService } from './config.service';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([jwtInterceptor]) // 🌟 Critical injection layer setup
    ),
      provideAppInitializer(async () => {
      const appConfigService = inject(ConfigService);
      return await appConfigService.load(); // returns Promise<void> directly
    }),
      provideToastr({
      positionClass: 'toast-top-right',
      timeOut: 4000,
      closeButton: true,
      progressBar: true,
    }),
  ]
};
