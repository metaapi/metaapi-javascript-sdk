import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import MetaApi, {
  MetatraderAccount,
  MetaStats
} from 'metaapi.cloud-sdk';

@Injectable({
  providedIn: 'root'
})
export class MetaStatsService {
  private connection: MetatraderAccount | null = null;
  private metaStats: MetaStats | null = null;
  private metaApi: MetaApi | null = null;

  private accountId: string = '';

  public areTokenResourcesNarrowedDown = true;

  logs$ = new BehaviorSubject<any[]>([]);
  logs: any[] = [];

  constructor() {}

  log = (...args: unknown[]) =>  {
    console.log(...args);
    this.logs.push(...args);
    this.logs$.next([...this.logs$.value, ...args]);
  }

  reset() {
    this.logs = [];
    this.logs$.next([]);
  }

  async setConnection(accountId: string, token: string, domain: string): Promise<void> {
      this.accountId = accountId;

      this.metaStats = new MetaStats(token, { domain });
      this.metaApi = new MetaApi(token, { domain });
      this.areTokenResourcesNarrowedDown = this.metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token) as boolean;
      try {
        const account = await this.metaApi.metatraderAccountApi.getAccount(accountId);

        /* Wait until account is deployed and connected to broker */
        this.log('Deploying account');
        if (account.state !== 'DEPLOYED') {
          await account.deploy();
        } else {
          this.log('Account already deployed');
        }
        this.log('Waiting for API server to connect to broker (may take couple of minutes)');
        if (account.connectionStatus !== 'CONNECTED') {
          await account.waitConnected();
        }

        this.connection = account;
      } catch (err) {
        this.log(err);
      }
  }

  getOpenTrades = async (): Promise<void> => {
    try {
      if (!this.connection) {
        throw new Error('No connection');
      }

      this.log('Fetching account open trades');
      const trades = await this.metaStats!.getAccountOpenTrades(this.accountId);
      this.log(trades);

    } catch (err) {
      this.log(err);
      throw err;
    }
  }
  getMetrics = async (): Promise<void> => {
    try {
      if (!this.connection) {
        throw new Error('No connection');
      }

      this.log('Fetching account metrics');
      const metrics = await this.metaStats!.getMetrics(this.accountId);
      this.log(metrics);

    } catch (err) {
      this.log(err);
      throw err;
    }
  }
  getTrades = async (startTime: string, endTime: string): Promise<void> => {
    try {
      if (!this.connection) {
        throw new Error('No connection');
      }
      this.log('Fetching account trades');
      const trades = await this.metaStats!.getAccountTrades(this.accountId, startTime, endTime);
      this.log(trades.slice(-5));
    } catch (err) {
      this.log(err);
      throw err;
    }
  }
}
