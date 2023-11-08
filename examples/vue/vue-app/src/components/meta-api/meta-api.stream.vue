<script setup lang="ts">
import { ref, watch } from 'vue';
import MetaApi, { StreamingMetaApiConnectionInstance } from 'metaapi.cloud-sdk';

import { Log, Section, Form, Field } from '../../shared';

const props = defineProps({
  defaultAccountId: { type: String, default: '' },
  defaultToken: { type: String, default: '' },
  defaultDomain: { type: String, default: '' },
});

const areResourcesNarrowedDown = ref(false);
const isConnecting = ref(false);
const isConnected = ref(false);

const resultLog = ref<Array<any>>([]);
const errorLog = ref<Array<any>>([]);

const accountId = ref(props.defaultAccountId);
const token = ref(props.defaultToken);
const domain = ref(props.defaultDomain);

const logErr = (...args: unknown[]) => {
  console.log(...args);
  errorLog.value = [...errorLog.value, ...args.map((arg: any) => arg.message || arg)];
};
const log = (...args: unknown[]) => {
  console.log(...args);
  resultLog.value = [...resultLog.value, ...args];
};

const connectToMetaApi = async (): Promise<StreamingMetaApiConnectionInstance> => {
  /* Get instance of MetaApi with your MetaApi token */
  const metaApi = new MetaApi(token.value, { domain: domain.value });
  areResourcesNarrowedDown.value = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token.value);
  /* Get MetaTrader account */
  const account = await metaApi.metatraderAccountApi.getAccount(accountId.value);

  /* Get connection instance */
  await account.waitConnected();
  const connection = account.getStreamingConnection();

  /* Wait until connection is established */
  await connection.connect();
  await connection.waitSynchronized();

  return connection;
};

const fetchData = async () => {
  try {
    log('Waiting for API server to connect to broker (may take couple of minutes)');
    const connection = await connectToMetaApi();

    /* Testing terminal state access */ 
    const terminalState = connection.terminalState;
    log(
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
    log (
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
    
    log(
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

      log( 'Trade successful', 'Result code: ', result.stringCode);
    } catch (err) {
      log('Trade failed', err);
      logErr('Trade failed with result code', err);
    }
  } catch (err) {
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
</script>

<template>
  <Section>
    <h1>MetaApi. Streaming API</h1>

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