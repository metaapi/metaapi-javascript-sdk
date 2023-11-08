<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import MetaApi, { CopyFactory, TransactionListener } from 'metaapi.cloud-sdk';

import { Log, Section, Form, Field } from '../../shared';

const props = defineProps({
  defaultStrategyId: { type: String, default: '' },
  defaultDomain: { type: String, default: '' },
  defaultToken: { type: String, default: '' },
});

const areResourcesNarrowedDown = ref(true);
const isConnecting = ref(false);
const isConnected = ref(false);

const resultLog = ref<Array<any>>([]);
const errorLog = ref<Array<any>>([]);

const strategyId = ref(props.defaultStrategyId);
const domain = ref(props.defaultDomain);
const token = ref(props.defaultToken);

const setStrategyId = (newStrategyId: string) => { strategyId.value = newStrategyId; };
const setDomain = (newDomain: string) => { domain.value = newDomain; };
const setToken = (newToken: string) => { token.value = newToken; };

const logErr = (...args: unknown[]) => {
  console.log(...args);
  errorLog.value = [...errorLog.value, ...args.map((arg: any) => arg.message || arg)];
};
const log = (...args: unknown[]) => {
  console.log(...args);
  resultLog.value = [...resultLog.value, ...args];
};

class Listener extends TransactionListener {
  async onTransaction(transactionEvent: any) {
    log('Transaction event', transactionEvent);
  }

  async onError(error: any) {
    log('Error event', error);
  }
}


let historyApi: CopyFactory["historyApi"];
let listenerId: string;

const makeRequest = async () => {
  const metaApi =  new MetaApi(token.value, { domain: domain.value }); 
  areResourcesNarrowedDown.value = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token.value);

  const copyFactory = new CopyFactory(token.value, { domain: domain.value });
  historyApi = copyFactory.historyApi;
  
  try {
    const listener = new Listener();
    listenerId = historyApi.addStrategyTransactionListener(listener, strategyId.value);
    log('Add listener for strategy transaction');
  }
  catch (err){
    logErr(err);
    throw err;
  }
};

const disconnect = () => {
  if (listenerId && historyApi) {
    historyApi.removeStrategyTransactionListener(listenerId);
    log('Remove listener for strategy transaction');
  }
};

watch(isConnecting, () => {
  if (isConnected.value || !isConnecting.value) {
    return;
  }

  if (listenerId) {
    disconnect();
  }

  makeRequest()
    .then(() => isConnected.value = true)
    .then(() => log('Start waiting 5s'))
    .then(() => new Promise(resolve => setTimeout(resolve, 5000)))
    .then(() => log('5s passed'))
    .then(() => disconnect())
    .catch(err => console.log('failed', err))
    .finally(() => isConnecting.value = false);
});

onUnmounted(() => {
  disconnect();
});

const reset = () => {
  isConnecting.value = false;
  isConnected.value = false;

  resultLog.value = [];
  errorLog.value = [];

  strategyId.value = props.defaultStrategyId;
  domain.value = props.defaultDomain;
  token.value = props.defaultToken;
};

const triggerToFetchData = () => {
  if (isConnected.value || !strategyId.value || !token.value )  {
    return; 
  }
  isConnecting.value = true;
};
</script>

<template>
  <Section>
    <h1>CopyFactory. Strategy transaction listener</h1>

    <Section modifier="form">
      <h2>Connect to your account</h2>
      <Form 
        :on-submit="triggerToFetchData" 
        :on-reset="reset"
        :disabled="isConnecting || isConnected" 
        :done="isConnected"
      >
        <Field :value="strategyId" @change="setStrategyId" label="Strategy ID"/>
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