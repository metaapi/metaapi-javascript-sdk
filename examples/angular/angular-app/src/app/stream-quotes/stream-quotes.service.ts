import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import MetaApi, {
  StreamingMetaApiConnectionInstance, 
  SynchronizationListener
} from 'metaapi.cloud-sdk';

@Injectable({
  providedIn: 'root'
})
export class StreamQuotesService {
  private metaApi: MetaApi | null = null;
  private connection: StreamingMetaApiConnectionInstance | null = null;

  private accountId: string = '';
  private symbol: string = '';
  

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
    
    if (this.connection) {
      this.connection.unsubscribeFromMarketData(this.symbol, [
        {type: 'quotes'},
        {type: 'candles'},
        {type: 'ticks'},
        {type: 'marketDepth'}
      ]).then(() => {
        this.log('Stop listening stopout events');
      }).catch((err: any) => {
        this.log(err);
      });
    }
  }

  async setConnection(accountId: string, token: string, domain: string, symbol: string): Promise<void> {
    this.symbol = symbol;
    const log = this.log;

    class QuoteListener extends SynchronizationListener {
      override async onSymbolPriceUpdated(instanceIndex: any, price: any) {
        if(price.symbol === symbol) {
          log(symbol + ' price updated', price);
        }
      }
      override async onCandlesUpdated(instanceIndex: any, candles: any) {
        for (const candle of candles) {
          if (candle.symbol === symbol) {
            log(symbol + ' candle updated', candle);
          }
        }
      }
      override async onTicksUpdated(instanceIndex: any, ticks: any) {
        for (const tick of ticks) {
          if (tick.symbol === symbol) {
            log(symbol + ' tick updated', tick);
          }
        }
      }
      override async onBooksUpdated(instanceIndex: any, books: any) {
        for (const book of books) {
          if (book.symbol === symbol) {
            log(symbol + ' order book updated', book);
          }
        }
      }
      override async onSubscriptionDowngraded(instanceIndex: any, _symbol: any, updates: any, unsubscriptions: any) {
        log('Market data subscriptions for ' + _symbol + ' were downgraded by the server due to rate limits');
      }
    }

    this.accountId = accountId;

    this.metaApi = new MetaApi(token, { domain });
    this.areTokenResourcesNarrowedDown = this.metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token) as boolean;
    try {
      const account = await this.metaApi.metatraderAccountApi.getAccount(this.accountId);

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

      const connection = account.getStreamingConnection();

      /* Add listener */
      const quoteListener = new QuoteListener();
      connection.addSynchronizationListener(quoteListener);

      /* Wait until connection is established */
      await connection.connect();
      await connection.waitSynchronized();

      this.connection = connection;
    } catch (err) {
      this.log(err);
    }
  }

  makeRequest = async (): Promise<void> => {
    try {
      if (!this.connection) {
        throw new Error('No connection');
      }

      this.log('Waiting for API server to connect to broker (may take couple of minutes)');

      // Add symbol to MarketWatch if not yet added and subscribe to market data
      // Please note that currently only G1 and MT4 G2 instances support extended subscription management
      // Other instances will only stream quotes in response
      // Market depth streaming is available in MT5 only
      // ticks streaming is not available for MT4 G1
      await this.connection.subscribeToMarketData(this.symbol, [
        {type: 'quotes', intervalInMilliseconds: 5000},
        {type: 'candles', timeframe: '1m', intervalInMilliseconds: 10000},
        {type: 'ticks'},
        {type: 'marketDepth', intervalInMilliseconds: 5000}
      ]);
      this.log('Price after subscribe:', this.connection.terminalState.price(this.symbol));

      this.log('[' + (new Date().toISOString()) + '] Synchronized successfully, streaming ' + this.symbol + ' market data now...');

      this.log('Start timer fort 60 seconds');
      await new Promise(res => setTimeout(res, 60000));
      this.log('60 seconds passed');

      if (this.connection) {
        this.connection.unsubscribeFromMarketData(this.symbol, [
          {type: 'quotes'},
          {type: 'candles'},
          {type: 'ticks'},
          {type: 'marketDepth'}
        ]).then(() => {
          this.log('Stop listening stopout events');
        }).catch((err: any) => {
          this.log(err);
        });
      }
    } catch (err) {
      this.log(err);
      throw err;
    }
  }
}
