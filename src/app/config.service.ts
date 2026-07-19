import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { firstValueFrom, map, retry, window } from 'rxjs';



export interface AppConfig {
  apiUrl?: string;
  rootUrl: string;
  payStackPublicKey: string;
  appName: string;
  appVersion: string;
  tokenKey: string;
  userKey: string;

  googleMapsApiKey: string;
  enableDebug: boolean;
  sessionTimeout: number;
  pageSize: number;
  pageSizeOptions: number[];
  dateFormat: string;
  timeFormat: string;
  currency: string;
  currencySymbol: string;
}
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
 public Config!: AppConfig;
 public appUrl:string ="appUrl"
 public approotUrl:string ="rootUrl"

  constructor(private readonly http: HttpClient) {}

  async load(): Promise<void> {
    try {
  this.Config = await firstValueFrom(
    this.http.get<AppConfig>('config.json').pipe(
      // 1. Check the response. If it's null/invalid, throw an error to trigger retry.
      map(config => {
        if (!config?.apiUrl) {
         // location.reload()
          throw new Error('Configuration is null or incomplete.');
        }
        return config;
      }),

      retry({
        count: 2,
        delay: 1000 // Wait 1 second between retries
      })
    )
  );

  // By the time we get here, we are guaranteed to have a non-null Config
  sessionStorage.setItem(this.appUrl, this.Config.apiUrl!);
  sessionStorage.setItem(this.approotUrl, this.Config.rootUrl!);

  //console.log('Config Service - App URL Configured:', this.Config.apiUrl!);

} catch (err) {
  console.error('Failed to load configuration after 100 attempts:', err);
}
  }


   get apiUrl(): string {

    return this.Config?.apiUrl || "Not Configured" ;
  }

  get rootUrl(): string {
    return this.Config?.rootUrl || 'Not Configured';
  }
}
