<script setup lang="ts">
import { ref, watch } from 'vue';
import MetaApi, { CopyFactory } from 'metaapi.cloud-sdk';

import { Log, Section, Form, Field } from '../../shared';
import axios from 'axios';

const props = defineProps({
  defaultProviderAccountId: { type: String, default: '' },
  defaultDomain: { type: String, default: '' },
  defaultToken: { type: String, default: '' },
});

const areResourcesNarrowedDown = ref(true);
const isConnecting = ref(false);
const isConnected = ref(false);

const resultLog = ref<Array<any>>([]);
const errorLog = ref<Array<any>>([]);

const providerAccountId = ref(props.defaultProviderAccountId);
const domain = ref(props.defaultDomain);
const token = ref(props.defaultToken);

const setProviderAccountId = (newAccountId: string) => { providerAccountId.value = newAccountId; };
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

const makeRequest = async () => {
  const copyFactory = new CopyFactory(token.value, { domain: domain.value });
  const metaApi = new MetaApi(token.value, { domain: domain.value });
  areResourcesNarrowedDown.value = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token.value);
  
  const configurationApi = copyFactory.configurationApi;

  try {
    const providerMetaapiAccount = await metaApi.tradingAccountApi.getAccount(providerAccountId.value);
    if(
      !providerMetaapiAccount.copyFactoryRoles || 
      !providerMetaapiAccount.copyFactoryRoles.includes('PROVIDER')
    ) {
      throw new Error(
        'Please specify PROVIDER copyFactoryRoles value in your MetaApi account in ' +
        'order to use it in CopyFactory API'
      );
    }
    
    const strategies = await configurationApi.getStrategiesWithInfiniteScrollPagination();
    const strategy = strategies.find((s) => s.accountId === providerMetaapiAccount.id);
    
    const strategyId = !strategy
      ? (await configurationApi.generateStrategyId()).id
      : strategy._id;
      
    log('Creating strategy');
    await configurationApi.updateStrategy(strategyId, {
      name: 'Test strategy',
      description: 'Some useful description about your strategy',
      accountId: providerMetaapiAccount.id
    });
    log('Strategy created');
    
    log('Creating webhook');
    let webhook = await configurationApi.createWebhook(strategyId, {
      symbolMapping: [{from: 'EURUSD.m', to: 'EURUSD'}],
      magic: 100
    });
    log('Webhook created', webhook);

    log('Updating webhook');
    await configurationApi.updateWebhook(strategyId, webhook.id, {
      symbolMapping: [
        {from: 'EURUSD.m', to: 'EURUSD'},
        {from: 'BTCUSD.m', to: 'BTCUSD'}
      ],
      magic: 100
    });

    log('Retrieving webhooks with infinite scroll pagination');
    let webhooks1 = await configurationApi.getWebhooksWithInfiniteScrollPagination(strategyId);
    log('Retrieved webhooks', webhooks1);

    log('Retrieving webhooks with classic pagination');
    let webhooks2 = await configurationApi.getWebhooksWithClassicPagination(strategyId);
    log('Retrieved webhooks', webhooks2);

    log('Sending a trading signal to the webhook. Curl command:');
    let payload = {
      symbol: 'EURUSD',
      type: 'POSITION_TYPE_BUY',
      time: new Date().toISOString(),
      volume: 0.1
    };
    log(`curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '${
      JSON.stringify(payload)
    }' '${webhook.url}'`);
    let response = await axios.post(webhook.url, payload);
    log('Sent the signal, signal ID: ' + response.data.signalId);

    log('Deleting webhook ' + webhook.id);
    await configurationApi.deleteWebhook(strategyId, webhook.id);
  }
  catch (err){
    logErr(err);
    throw err;
  }
};

watch(isConnecting, () => {
  if (isConnected.value || !isConnecting.value) {
    return;
  }
  makeRequest()
    .then(() => isConnected.value = true)
    .catch(err => console.log('failed', err))
    .finally(() => isConnecting.value = false);
});

const reset = () => {
  isConnecting.value = false;
  isConnected.value = false;

  resultLog.value = [];
  errorLog.value = [];

  providerAccountId.value = props.defaultProviderAccountId;
  domain.value = props.defaultDomain;
  token.value = props.defaultToken;
};

const triggerToFetchData = () => {
  if (isConnected.value || !providerAccountId.value || !token.value )  {
    return; 
  }
  isConnecting.value = true;
};
</script>

<template>
  <Section>
    <h1>CopyFactory. Webhooks</h1>

    <Section modifier="form">
      <h2>Connect to your account</h2>
      <Form 
        :on-submit="triggerToFetchData" 
        :on-reset="reset"
        :disabled="isConnecting || isConnected" 
        :done="isConnected"
      >
        <Field :value="providerAccountId" @change="setProviderAccountId" label="Provider account ID"/>
        <Field :value="token" @change="setToken" label="Token"/>
        <Field :value="domain" @change="setDomain" label="Domain"/>
      </Form>
    </Section>

    <Section v-if="!areResourcesNarrowedDown" modifier="warning">
      <h2>Warning</h2>
      <p>It seems like you are using a admin API token.</p>
      <p>Since the token can be retrieven from the browser or mobile apps by end user this can lead to your application being compromised, unless you understand what are you doing.</p>
      <p>Please use <a href="https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/tokenManagementApi.md" target="__blank">Token Management API</a> in your backend application to produce secure tokens which you can then use in web UI or mobile apps.</p>
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