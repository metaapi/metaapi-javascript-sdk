import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import MetaApi, { 
  MetatraderAccount
} from 'metaapi.cloud-sdk';

@Injectable({
  providedIn: 'root'
})
export class HistoricalService {
  private connection: MetatraderAccount | null = null;
  private symbol: string = 'EURUSD';

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

  async setConnection(accountId: string, token: string, domain: string, symbol: string): Promise<void> {
    /* Get instance of MetaApi with your MetaApi token */
    const metaApi = new MetaApi(token, { domain });
    this.areTokenResourcesNarrowedDown = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token) as boolean;
    /* Get MetaTrader account */
    const account = await metaApi.metatraderAccountApi.getAccount(accountId);

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
    this.symbol = symbol;
  }

  async getTicks(): Promise<void> {
    try {
      if (!this.connection) {
        throw new Error('No connection');
      }

      const account = this.connection;
      /* Retrieve last 10K 1m Ticks 
        The API to retrieve historical market data is currently available for G1 only
        historical ticks can be retrieved from MT5 only
      */
      const pages = 10;
      this.log(`Downloading ${pages}K latest Ticks for ${this.symbol}`);
      
      const startedAt = Date.now();
      let startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      let offset = 0;
      let ticks;

      for (let i = 0; i < pages; i++) {
        ticks = await account.getHistoricalTicks(this.symbol, startTime, offset);
        this.log( `Downloaded ${ticks ? ticks.length : 0} historical ticks for ${this.symbol}`);
        if (ticks && ticks.length) {
          startTime = ticks[ticks.length - 1].time;
          offset = 0;
          while (
            ticks[ticks.length - 1 - offset] &&
            ticks[ticks.length - 1 - offset].time.getTime() === startTime.getTime()
          ) { offset++; }

          this.log(`Last tick time is ${startTime}, offset is ${offset}`);
        }
      }

      if (ticks) {
        this.log('First tick is ', ticks[0]);
      }
      this.log(`Took ${Date.now() - startedAt}ms`,);
    } catch(err) {
      this.log(err);
      throw err;
    }
  }

  async getCandles(): Promise<void> {
    try {
      if (!this.connection) {
        throw new Error('No connection');
      }

      const account = this.connection;
      /*
        Retrieve last 10K 1m candles
        The API to retrieve historical market data
          is currently available for G1 and MT4 G2 only
      */
      const pages = 10;
      this.log(`Downloading ${pages}K latest candles for ${this.symbol}`);
      
      const startedAt = Date.now();
      let startTime;
      let candles;
      
      for (let i = 0; i < pages; i++) {
        const newCandles = await account.getHistoricalCandles(this.symbol, '1m', startTime);
        this.log(`Downloaded ${newCandles ? newCandles.length : 0} historical candles for ${this.symbol}`);
        
        if (newCandles && newCandles.length) {
          candles = newCandles;
        }

        if (candles && candles.length) {
          startTime = candles[0].time;
          startTime.setMinutes(startTime.getMinutes() - 1);
          this.log(`First candle time is ${startTime}`);
        }
      }
      if (candles) {
        this.log('First candle is', candles[0]);
      }
      this.log(`Took ${Date.now() - startedAt}ms`);
    } catch(err) {
      this.log(err);
      throw err;
    }
  }
}
