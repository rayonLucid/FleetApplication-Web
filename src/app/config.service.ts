import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { firstValueFrom, retry } from 'rxjs';



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
        retry(100)
      )
    );
  

sessionStorage.setItem(this.appUrl,this.Config.apiUrl!)
sessionStorage.setItem(this.approotUrl,this.Config.rootUrl!)
      console.log(this.appUrl);

    } catch (err) {
      console.error(err);
    }
  }


   get apiUrl(): string {

    return this.Config?.apiUrl! || "" ;
  }

  get rootUrl(): string {
    return this.Config?.rootUrl || '';
  }
}
