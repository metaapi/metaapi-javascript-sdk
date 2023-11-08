// @ts-nocheck

import MetaApi, { 
  CopyFactory, MetatraderAccount,
  StopoutListener, TransactionListener, UserLogListener
} from 'metaapi.cloud-sdk';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CopyFactoryService {
  private copyFactory?: CopyFactory;
  private metaApi?: MetaApi;

  public configurationApi?: CopyFactory['configurationApi'];
  public historyApi?: CopyFactory['historyApi'];
  public tradingApi?: CopyFactory['tradingApi'];

  public areTokenResourcesNarrowedDown: boolean = true;
  
  public connectionProvider?: MetatraderAccount;
  public connectionSubscriber?: MetatraderAccount;
  
  public listenerId?: string;

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

  init = (token: string, domain: string): void => {
    this.copyFactory = new CopyFactory(token, { domain });
    this.metaApi = new MetaApi(token, { domain });
    this.areTokenResourcesNarrowedDown = this.metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token);
    
    this.configurationApi = this.copyFactory.configurationApi;
    this.historyApi = this.copyFactory.historyApi;
    this.tradingApi = this.copyFactory.tradingApi;
  }

  setProviderConnection = async (accountId: string): Promise<void> => {
    try {
      const providerMetaapiAccount = await this.metaApi!.metatraderAccountApi.getAccount(accountId);
      if(
        !providerMetaapiAccount.copyFactoryRoles || 
        !providerMetaapiAccount.copyFactoryRoles.includes('PROVIDER')
      ) {
        throw new Error(
          'Please specify PROVIDER copyFactoryRoles value in your MetaApi account in ' +
          'order to use it in CopyFactory API'
        );
      }

      this.connectionProvider= providerMetaapiAccount;
    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  setSubscriberConnection = async (accountId: string): Promise<void> => {
    try {
      const subscriberMetaapiAccount = await this.metaApi!.metatraderAccountApi.getAccount(accountId);
      if(
        !subscriberMetaapiAccount.copyFactoryRoles || 
        !subscriberMetaapiAccount.copyFactoryRoles.includes('SUBSCRIBER')
      ) {
        throw new Error(
          'Please specify SUBSCRIBER copyFactoryRoles value in your MetaApi account in ' +
          'order to use it in CopyFactory API'
        );
      }

      this.connectionSubscriber = subscriberMetaapiAccount;
    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  getStategyId = async (): Promise<string> => {
    try {
      if (!this.configurationApi) {
        throw new Error('No configurationApi');
      }
      
      const strategies = await this.configurationApi.getStrategies();
      const strategy = strategies.find((s) => s.accountId === this.connectionProvider!.id);
      
      const strategyId = !strategy
        ? (await this.configurationApi.generateStrategyId()).id
        : strategy._id;

      return strategyId;
    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  createStrategy = async (strategyId: string, options?: {} = {}): Promise<void> => {
    try {
      this.log('Creating strategy');
      await this.configurationApi!.updateStrategy(strategyId, {
        name: 'Test strategy',
        description: 'Some useful description about your strategy',
        accountId: this.connectionProvider!.id,
        ...options
      });
      this.log('Strategy created');
    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  createSubscriber = async (strategyId: string) => {
    try {
      this.log('Creating subscriber');
      await this.configurationApi!.updateSubscriber(this.connectionSubscriber!.id, {
        name: 'Test subscriber',
        subscriptions: [
          {
            strategyId: strategyId,
            multiplier: 1
          }
        ]
      });
      this.log('Subscriber created');
    } catch(err) {
      this.log(err);
      throw err;
    }
  }

  /* Examples */
  externalSignal = async(strategyId: string): Promise<void> => {
    try {
      /* Send external signal */
      const signalClient = await this.tradingApi!.getSignalClient(this.connectionSubscriber!.id);
      const signalId = signalClient.generateSignalId();
      await signalClient.updateExternalSignal(
        strategyId, 
        signalId,
        {
          symbol: 'EURUSD',
          type: 'POSITION_TYPE_BUY',
          time: new Date(),
          volume: 0.01
        }
      );

      await new Promise(res => setTimeout(res, 10000));

      /* Output strategy external signals */
      const outputStrategyExternalSignals = await signalClient.getStrategyExternalSignals(strategyId);
      this.log('Output strategy external signals', outputStrategyExternalSignals);

      /* Output trading signals */
      const outputTradingSignals = await signalClient.getTradingSignals();
      this.log('Output trading signals', outputTradingSignals);

      /* Remove external signal */
      await signalClient.removeExternalSignal(
        strategyId, 
        signalId,
        { time: new Date() }
      );

    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  stopoutListener = async(): Promise<() => void> => {
    const log = this.log;

    class Listener extends StopoutListener {
      override async onStopout(strategyStopoutEvent: any) {
        log('Strategy stopout event', strategyStopoutEvent);
      }
      override async onError(error: any) {
        log('Error event', error);
      }
    }

    try {
      const listener = new Listener();
      this.listenerId = this.tradingApi!.addStopoutListener(listener);
      this.log('Start listening stopout events');

      return () => {
        this.tradingApi!.removeStopoutListener(this.listenerId!);
        log('Stop listening stopout events');
      }
    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  strategyTransactionListener = async(strategyId: string): Promise<() => void> => {
    const log = this.log;

    class Listener extends TransactionListener {
      async onTransaction(transactionEvent: any) {
        log('Transaction event', transactionEvent);
      }

      async onError(error: any) {
        log('Error event', error);
      }
    }

    try {
      const listener = new Listener();
      this.listenerId = this.historyApi!.addStrategyTransactionListener(listener, strategyId);
      this.log('Add listener for strategy transaction');

      return () => {
        this.historyApi!.removeStrategyTransactionListener(this.listenerId);
        log('Remove listener for strategy transaction');
      }
    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  strategyUserLogListener = async(strategyId: string): Promise<() => void> => {
    const log = this.log;

    class Listener extends UserLogListener {
      async onUserLog(logEvent: any) {
        log('Log event', logEvent);
      }

      async onError(error: any) {
        log('Error event', error);
      }
    }

    try {
      const listener = new Listener();
      this.listenerId = this.tradingApi!.addStrategyLogListener(listener, strategyId);
      log('Add listener for strategy user log');

      return () => {
        this.tradingApi!.removeStrategyLogListener(this.listenerId!);
        log('Remove listener for strategy user log');
      };
    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  subscriberTransactionListener = async(subscriberAccountId: string): Promise<() => void> => {
    const log = this.log;

    class Listener extends TransactionListener {
      async onTransaction(transactionEvent: any) {
        log('Transaction event', transactionEvent);
      }

      async onError(error: any) {
        log('Error event', error);
      }
    }

    try {
      const listener = new Listener();
      this.listenerId = this.historyApi!.addSubscriberTransactionListener(listener, subscriberAccountId);
      this.log('Add listener for subscriber transaction');

      return () => {
        this.historyApi!.removeSubscriberTransactionListener(this.listenerId);
        this.log('Remove listener for subscriber transaction');
      }
    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  subscriberUserLogListener = async(accountSubscriberId: string): Promise<() => void> => {
    const log = this.log;

    class Listener extends UserLogListener {
      async onUserLog(logEvent: any) {
        log('Log event', logEvent);
      }

      async onError(error: any) {
        log('Error event', error);
      }
    }

    try {
      const listener = new Listener();
      this.listenerId = this.tradingApi!.addSubscriberLogListener(listener, accountSubscriberId);
      this.log('Add listener for subscriber user log');

      return () => {
        this.tradingApi!.removeSubscriberLogListener(this.listenerId!);
        log('Stop listening subscriber logs');
      }
    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  telegram = async(strategyId: string): Promise<void> => {
    try {
      /* Send external signal */
      this.log('Sending external signal');
      const signalClient = await this.tradingApi!.getSignalClient(this.connectionProvider!.id);
      const signalId = signalClient.generateSignalId();
      await signalClient.updateExternalSignal(strategyId, signalId, {
        symbol: 'EURUSD',
        type: 'POSITION_TYPE_BUY',
        time: new Date(),
        volume: 0.01
      });
      this.log('External signal sent');
      
      this.log('Wait 5 seconds');
      await new Promise(res => setTimeout(res, 5000));
      this.log('5 seconds passed');

      /* Remove external signal */
      this.log('Removing external signal');
      await signalClient.removeExternalSignal(strategyId, signalId, {
        time: new Date()
      });
      this.log('External signal removed');
    } catch (err) {
      this.log(err);
      throw err;
    }
  }
}
