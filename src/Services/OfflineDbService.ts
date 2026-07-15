import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { OfflineGpsPing } from '../Data/data-interface';



@Injectable({
  providedIn: 'root'
})
export class OfflineDbService extends Dexie {
  // 2. Define your tables
  public gpsPings!: Table<OfflineGpsPing, number>;

  constructor() {
    super('FleetTrackingDb');

    // 3. Define your schema.
    // '++id' means id is an auto-incrementing primary key.
    // We index companyId and timestamp so we can query them fast later if needed.
    this.version(1).stores({
      gpsPings: '++id, companyId, timestamp'
    });
  }
}
