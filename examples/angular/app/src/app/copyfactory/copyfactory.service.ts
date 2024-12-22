// @ts-nocheck

import MetaApi, {
  CopyFactory, MetatraderAccount,
  StopoutListener, TransactionListener, UserLogListener
} from 'metaapi.cloud-sdk';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class CopyfactoryService {
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

      this.connectionProvider = providerMetaapiAccount;
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

      const strategies = await this.configurationApi.getStrategiesWithInfiniteScrollPagination();
      const strategy = strategies.find((s) => s.accountId === this.connectionProvider!.id);

      const strategyId = strategy
        ? strategy._id
        : (await this.configurationApi.generateStrategyId()).id;

      return strategyId;
    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  createStrategy = async (strategyId: string, options: {} = {}): Promise<void> => {
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
      const subscriberSignalClient = await this.tradingApi!.getSubscriberSignalClient(this.connectionSubscriber!.id);
      const strategySignalClient = await this.tradingApi!.getStrategySignalClient(strategyId);
      const signalId = strategySignalClient.generateSignalId();
      await strategySignalClient.updateExternalSignal(
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
      const outputStrategyExternalSignals = await strategySignalClient.getExternalSignals();
      this.log('Output strategy external signals', outputStrategyExternalSignals);

      /* Output trading signals */
      const outputTradingSignals = await subscriberSignalClient.getTradingSignals();
      this.log('Output trading signals', outputTradingSignals);

      /* Remove external signal */
      await strategySignalClient.removeExternalSignal(
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
      const strategySignalClient = await this.tradingApi!.getStrategySignalClient(strategyId);
      const signalId = strategySignalClient.generateSignalId();
      await strategySignalClient.updateExternalSignal(signalId, {
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
      await strategySignalClient.removeExternalSignal(signalId, {
        time: new Date()
      });
      this.log('External signal removed');
    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  webhooks = async(strategyId: string) => {
    try {
      this.log('Creating a webhook');
      let webhook = await this.configurationApi!.createWebhook(strategyId, {
        symbolMapping: [{from: 'EURUSD.m', to: 'EURUSD'}],
        magic: 100
      });
      this.log('Created webhook', webhook);

      this.log('Updating webhook');
      await this.configurationApi!.updateWebhook(strategyId, webhook.id, {
        symbolMapping: [
          {from: 'EURUSD.m', to: 'EURUSD'},
          {from: 'BTCUSD.m', to: 'BTCUSD'}
        ],
        magic: 100
      });

      this.log('Retrieving webhooks with infinite scroll pagination');
      let webhooks1 = await this.configurationApi!.getWebhooksWithInfiniteScrollPagination(strategyId);
      this.log('Retrieved webhooks', webhooks1);

      this.log('Retrieving webhooks with classic pagination');
      let webhooks2 = await this.configurationApi!.getWebhooksWithClassicPagination(strategyId);
      this.log('Retrieved webhooks', webhooks2);

      this.log('Sending a trading signal to the webhook. Curl command:');
      let payload = {
        symbol: 'EURUSD',
        type: 'POSITION_TYPE_BUY',
        time: new Date().toISOString(),
        volume: 0.1
      };
      this.log(`curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '${
        JSON.stringify(payload)
      }' '${webhook.url}'`);
      let response = await axios.post(webhook.url, payload);
      this.log('Sent the signal, signal ID: ' + response.data.signalId);

      this.log('Deleting webhook ' + webhook.id);
      await this.configurationApi!.deleteWebhook(strategyId, webhook.id);
    } catch (err) {
      this.log(err);
      throw err;
    }
  }
}
