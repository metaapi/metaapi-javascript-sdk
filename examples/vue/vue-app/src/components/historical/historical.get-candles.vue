<script setup lang="ts">
import { ref, watch } from 'vue';
import MetaApi, { MetatraderAccount } from 'metaapi.cloud-sdk';

import { Log, Section, Form, Field } from '../../shared';

const props = defineProps({
  defaultAccountId: { type: String, default: '' },
  defaultToken: { type: String, default: '' },
  defaultDomain: { type: String, default: '' },
  defaultSymbol: { type: String, default: '' },
});

const areResourcesNarrowedDown = ref(true);
const isConnecting = ref(false);
const isConnected = ref(false);

const resultLog = ref<Array<any>>([]);
const errorLog = ref<Array<any>>([]);

const accountId = ref(props.defaultAccountId);
const token = ref(props.defaultToken);
const domain = ref(props.defaultDomain);
const symbol = ref(props.defaultSymbol);

const logErr = (...args: unknown[]) => {
  console.log(...args);
  errorLog.value = [...errorLog.value, ...args.map((arg: any) => arg.message || arg)];
};
const log = (...args: unknown[]) => {
  console.log(...args);
  resultLog.value = [...resultLog.value, ...args];
};

const connectToMetaApiAccount = async (): Promise<MetatraderAccount> => {
  /* Get instance of MetaApi with your MetaApi token */
  const metaApi = new MetaApi(token.value, { domain: domain.value });
  areResourcesNarrowedDown.value = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token.value);

  /* Get MetaTrader account */
  const account = await metaApi.metatraderAccountApi.getAccount(accountId.value);

  /* Wait until account is deployed and connected to broker */
  log('Deploying account');
  if (account.state !== 'DEPLOYED') {
    await account.deploy();
  } else {
    log('Account already deployed');
  }

  log('Waiting for API server to connect to broker (may take couple of minutes)');
  if (account.connectionStatus !== 'CONNECTED') {
    await account.waitConnected();
  }

  return account;
};

const fetchData = async () => {
  try {
    const account = await connectToMetaApiAccount();
    /*
      Retrieve last 10K 1m candles
      The API to retrieve historical market data
        is currently available for G1 and MT4 G2 only
    */
    const pages = 10;
    log(`Downloading ${pages}K latest candles for ${symbol.value}`);
    
    const startedAt = Date.now();
    let startTime;
    let candles;
    
    for (let i = 0; i < pages; i++) {
      const newCandles = await account.getHistoricalCandles(symbol.value, '1m', startTime);
      log(`Downloaded ${newCandles ? newCandles.length : 0} historical candles for ${symbol.value}`);
      
      if (newCandles && newCandles.length) {
        candles = newCandles;
      }

      if (candles && candles.length) {
        startTime = candles[0].time;
        startTime.setMinutes(startTime.getMinutes() - 1);
        log(`First candle time is ${startTime}`);
      }
    }
    if (candles) {
      log('First candle is', candles[0]);
    }
    log(`Took ${Date.now() - startedAt}ms`);
  } catch(err) {
    logErr(err);
    throw err;
  }
};

watch(isConnecting, () => {
  if (isConnected.value || !isConnecting.value) {
    return;
  }
  fetchData()
    .then(() => isConnected.value = true)
    .catch(err => console.log('failed', err))
    .finally(() => isConnecting.value = false);
});

const reset = () => {
  isConnecting.value = false;
  isConnected.value = false;

  resultLog.value = [];
  errorLog.value = [];

  accountId.value = props.defaultAccountId;
  domain.value = props.defaultDomain;
  token.value = props.defaultToken;
};

const triggerToFetchData = () => {
  if (isConnected.value || !accountId.value || !token.value) { return; }
  isConnecting.value = true;
};

const setAccountId = (newAccountId: string) => {
  accountId.value = newAccountId;
};

const setToken = (newToken: string) => {
  token.value = newToken;
};

const setDomain = (newDomain: string) => {
  domain.value = newDomain;
};

const setSymbol = (newSymbol: string) => {
  symbol.value = newSymbol;
};
</script>

<template>
  <Section>
    <h1>MetaApi. Historical Market Data. Get candles</h1>

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
        <Field :value="symbol" @change="setSymbol" label="Symbol"/>
        <Field :value="domain" @change="setDomain" label="Domain"/>
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