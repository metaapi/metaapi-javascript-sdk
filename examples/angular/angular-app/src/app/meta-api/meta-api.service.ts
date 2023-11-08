import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import MetaApi, { 
  RpcMetaApiConnectionInstance,
  StreamingMetaApiConnectionInstance
} from 'metaapi.cloud-sdk';

@Injectable({
  providedIn: 'root'
})
export class MetaApiService {
  private connectionStream: StreamingMetaApiConnectionInstance | null = null;
  private connection: RpcMetaApiConnectionInstance | null = null;

  public areTokenResourcesNarrowedDown = true;
  
  logs$ = new BehaviorSubject<any[]>([]);
  logs: any[] = [];

  constructor() {}

  log = (...args: unknown[]) =>  {
    console.log(...args);
    this.logs.push(...args);
    this.logs$.next([...args, ...this.logs$.value]);
    // this.logs.push(...args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' '));
  }

  reset() {
    this.logs = [];
    this.logs$.next([]);
  }

  async setConnectionRpc(accountId: string, token: string, domain: string): Promise<void> {
    const metaApi = new MetaApi(token, { domain });
    this.areTokenResourcesNarrowedDown = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token) as boolean;
    
    const account = await metaApi.metatraderAccountApi.getAccount(accountId);
    
    await account.waitConnected();
    this.connection = account.getRPCConnection();
    await this.connection.connect();
    await this.connection.waitSynchronized();
  }

  async setConnectionStream(accountId: string, token: string, domain: string): Promise<void> {
    const metaApi = new MetaApi(token, { domain });
    const account = await metaApi.metatraderAccountApi.getAccount(accountId);
    
    await account.waitConnected();
    this.connectionStream = account.getStreamingConnection();
    await this.connectionStream.connect();
    await this.connectionStream.waitSynchronized();
  }

  async exampleStream(): Promise<void> {
    try {
      if (!this.connectionStream) {
        throw new Error('No connection');
      }

      this.logs = [];

      this.log('Waiting for API server to connect to broker (may take couple of minutes)');
      const connection = this.connectionStream;

      /* Testing terminal state access */ 
      const terminalState = connection.terminalState;
      this.log(
        'Testing terminal state access',
        'connected', terminalState.connected,
        'connected to broker', terminalState.connectedToBroker,
        'account information', terminalState.accountInformation,
        'positions', terminalState.positions,
        'orders', terminalState.orders,
        'specifications', terminalState.specifications,
        'EURUSD specification', terminalState.specification('EURUSD') ,
        'EURUSD price', terminalState.price('EURUSD'),
      );

      /* History storage */
      const historyStorage = connection.historyStorage;
      this.log (
        'Testing history storage', 
        'deals', historyStorage.deals.slice(-5), 
        'history orders', historyStorage.historyOrders.slice(-5)
      );

      /* Calculate margin required for trade */
      const margin = await connection.calculateMargin({
        type: 'ORDER_TYPE_BUY',
        symbol: 'GBPUSD',
        openPrice: 1.1,
        volume: 0.1
      });
      
      this.log(
        'Calculate margin required for trade', 
        'margin required for trade',margin,
        'Submitting pending order'
      );

      try {
        // Trade
        const result = await connection.createLimitBuyOrder(
          'GBPUSD', 0.07, 1.0, 0.9, 2.0, 
          {
            clientId: 'TE_GBPUSD_7hyINWqAlE',
            comment: 'comm'
          }
        );

        this.log( 'Trade successful', 'Result code: ', result.stringCode);
      } catch (err) {
        this.log('Trade failed with result code', err);
      }
    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  async exampleRpc(): Promise<void> {
    try {
      if (!this.connection) {
        throw new Error('No connection');
      }

      this.logs = [];

      this.log('Waiting for API server to connect to broker (may take couple of minutes)');
      const connection = this.connection;
      /* Invoke rpc api 
          (replace ticket numbers with actual ticket 
            numbers which exist in your mt account)
      */
      const accountInformation = await connection.getAccountInformation();

      const positions = await connection.getPositions();
      // const position = await connection.getPosition('1234567');

      const orders = await connection.getOrders();
      // const order = await connection.getOrder('1234567');

      const historyOrdersByTimeRange = await connection.getHistoryOrdersByTimeRange(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 
        new Date());
      const historyDealsByTimeRange = await connection.getDealsByTimeRange(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 
        new Date());
      /*
      const historyOrdersByPosition = await connection.getHistoryOrdersByPosition('1234567');
      const historyOrdersByTicket = await connection.getHistoryOrdersByTicket('1234567');
      const historyDealsByPosition = await connection.getDealsByPosition('1234567');
      const historyDealsByTicket = await connection.getDealsByTicket('1234567');
      */

      const serverTime = await connection.getServerTime();

      this.log(
        'Testing terminal state access',
        'Account information', accountInformation,
        'Positions', positions,
        'Open orders', orders,
        'History orders (~last 3 months)', historyOrdersByTimeRange,
        'History deals (~last 3 months)', historyDealsByTimeRange,
        'Server time', serverTime ,
      );

      /* Calculate margin required for trade */
      const margin = await connection.calculateMargin({
        type: 'ORDER_TYPE_BUY',
        symbol: 'GBPUSD',
        openPrice: 1.1,
        volume: 0.1
      });
      
      this.log(
        'Calculate margin required for trade', 
        'margin required for trade',margin,
        'Submitting pending order'
      );

      try {
        // Trade
        const result = await connection.createLimitBuyOrder(
          'GBPUSD', 0.07, 1.0, 0.9, 2.0, 
          {
            clientId: 'TE_GBPUSD_7hyINWqAlE',
            comment: 'comm'
          }
        );

        this.log( 'Trade successful', 'Result code: ', result.stringCode);
      } catch (err) {
        this.log('Trade failed with result code', err);
      }
    } catch (err) {
      this.log(err);
      throw err;
    }
  }
}
