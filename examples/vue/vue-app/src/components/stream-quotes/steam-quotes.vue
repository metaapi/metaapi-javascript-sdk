<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import MetaApi, { StreamingMetaApiConnectionInstance, SynchronizationListener } from 'metaapi.cloud-sdk';

import { Log, Section, Form, Field } from '../../shared';

const props = defineProps({
  defaultAccountId: { type: String, default: '' },
  defaultSymbol: { type: String, default: '' },
  defaultDomain: { type: String, default: '' },
  defaultToken: { type: String, default: '' },
});

const areResourcesNarrowedDown = ref(true);
const isConnecting = ref(false);
const isConnected = ref(false);

const resultLog = ref<Array<any>>([]);
const errorLog = ref<Array<any>>([]);

const accountId = ref(props.defaultAccountId);
const symbol = ref(props.defaultSymbol);
const domain = ref(props.defaultDomain);
const token = ref(props.defaultToken);

const setAccountId = (newAccountId: string) => { accountId.value = newAccountId; };
const setDomain = (newDomain: string) => { domain.value = newDomain; };
const setSymbol = (newSymbol: string) => { domain.value = newSymbol; };
const setToken = (newToken: string) => { token.value = newToken; };

const logErr = (...args: unknown[]) => {
  console.log(...args);
  errorLog.value = [...errorLog.value, ...args.map((arg: any) => arg.message || arg)];
};
const log = (...args: unknown[]) => {
  console.log(...args);
  resultLog.value = [...resultLog.value, ...args];
};

class QuoteListener extends SynchronizationListener {
  async onSymbolPriceUpdated(instanceIndex: any, price: any) {
    if(price.symbol === symbol.value) {
      log(symbol.value + ' price updated', price);
    }
  }
  async onCandlesUpdated(instanceIndex: any, candles: any) {
    for (const candle of candles) {
      if (candle.symbol === symbol.value) {
        log(symbol.value + ' candle updated', candle);
      }
    }
  }
  async onTicksUpdated(instanceIndex: any, ticks: any) {
    for (const tick of ticks) {
      if (tick.symbol === symbol.value) {
        log(symbol.value + ' tick updated', tick);
      }
    }
  }
  async onBooksUpdated(instanceIndex: any, books: any) {
    for (const book of books) {
      if (book.symbol === symbol.value) {
        log(symbol.value + ' order book updated', book);
      }
    }
  }
  async onSubscriptionDowngraded(instanceIndex: any, _symbol: any, updates: any, unsubscriptions: any) {
    log('Market data subscriptions for ' + _symbol + ' were downgraded by the server due to rate limits');
  }
}


let connection: StreamingMetaApiConnectionInstance;

const connectToMetaApi = async (): Promise<StreamingMetaApiConnectionInstance> => {
  /* Get instance of MetaApi with your MetaApi token */
  const metaApi =  new MetaApi(token.value, { domain: domain.value }); 
  areResourcesNarrowedDown.value = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token.value);

  /* Get MetaTrader account */
  const account = await metaApi.metatraderAccountApi.getAccount(accountId.value);

  // wait until account is deployed and connected to broker
  log('Deploying account');
  if (account.state !== 'DEPLOYED') {
    await account.deploy();
  } else {
    log('Account already deployed');
  }

  /* Get connection instance */
  log('Waiting for API server to connect to broker (may take couple of minutes)');
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

  return connection;
};

/* Interaction with metaapi */
const makeRequest = async () => {
  try {
    log('Waiting for API server to connect to broker (may take couple of minutes)');
    connection = await connectToMetaApi();

    // Add symbol to MarketWatch if not yet added and subscribe to market data
    // Please note that currently only G1 and MT4 G2 instances support extended subscription management
    // Other instances will only stream quotes in response
    // Market depth streaming is available in MT5 only
    // ticks streaming is not available for MT4 G1
    await connection.subscribeToMarketData(symbol.value, [
      {type: 'quotes', intervalInMilliseconds: 5000},
      {type: 'candles', timeframe: '1m', intervalInMilliseconds: 10000},
      {type: 'ticks'},
      {type: 'marketDepth', intervalInMilliseconds: 5000}
    ]);
    log('Price after subscribe:', connection.terminalState.price(symbol.value));

    log('[' + (new Date().toISOString()) + '] Synchronized successfully, streaming ' + symbol.value + ' market data now...');

  } catch (err) {
    logErr(err);
    throw err;
  }
};

const disconnect = () => {
  if (connection) {
    connection.unsubscribeFromMarketData(symbol.value, [
      {type: 'quotes'},
      {type: 'candles'},
      {type: 'ticks'},
      {type: 'marketDepth'}
    ]).then(() => {
      log('Stop listening stopout events');
    }).catch((err: any) => {
      logErr(err);
    });
  }
};

watch(isConnecting, () => {
  if (isConnected.value || !isConnecting.value) {
    return;
  }

  if (connection) {
    disconnect();
  }

  makeRequest()
    .then(() => isConnected.value = true)
    .then(() => log('Start waiting 60s'))
    .then(() => new Promise(resolve => setTimeout(resolve, 60000)))
    .then(() => log('60s passed'))
    .then(() => disconnect())
    .then(() => isConnecting.value = false)
    .catch(err => console.log('failed', err));
});

onUnmounted(() => {
  disconnect();
});

const reset = () => {
  isConnecting.value = false;
  isConnected.value = false;

  resultLog.value = [];
  errorLog.value = [];

  accountId.value = props.defaultAccountId;
  symbol.value = props.defaultSymbol;
  domain.value = props.defaultDomain;
  token.value = props.defaultToken;
};

const triggerToFetchData = () => {
  if (isConnected.value || !accountId.value || !token.value || !symbol.value)  {
    return; 
  }
  isConnecting.value = true;
};
</script>

<template>
  <Section>
    <h1>MetaApi. Stream Quotes</h1>

    <Section modifier="form">
      <h2>Connect to your account</h2>
      <Form 
        :on-submit="triggerToFetchData" 
        :on-reset="reset"
        :disabled="isConnecting || isConnected" 
        :done="isConnected"
      >
      <Field :value="accountId" @change="setAccountId" label="Account ID"/>
      <Field :value="token" @change="setToken" label="Token"/>
      <Field :value="domain" @change="setDomain" label="Domain"/>
      <Field :value="symbol" @change="setSymbol" label="Symbol"/>
      </Form>
    </Section>

    <Section v-if="!areResourcesNarrowedDown" modifier="warning">
      <h2>Warning</h2>
      <p>It seems like you are using a admin API token.</p>
      <p>Since the token can be retrieven from the browser or mobile apps by end user this can lead to your application being compromised, unless you understand what are you doing.</p>
      <p>Please use <a href="https://github.com/agiliumtrade-ai/metaapi-node.js-sdk/blob/master/docs/tokenManagementApi.md" target="__blank">Token Management API</a> in your backend application to produce secure tokens which you can then use in web UI or mobile apps.</p>
    </Section>

    <Section v-if="resultLog.length > 0" modifier="results">
      <h2>Logs</h2>
      <Log :items="resultLog" />
    </Section>

    <Section v-if="errorLog.length > 0" modifier="errors">
      <h2>Errors</h2>
      <Log :items="errorLog" />
    </Section>
  </Section>
</template>
