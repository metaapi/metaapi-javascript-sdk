<script setup lang="ts">
import { ref, watch } from 'vue';
import MetaApi, { CopyFactory } from 'metaapi.cloud-sdk';

import { Log, Section, Form, Field } from '../../shared';

const props = defineProps({
  defaultProviderAccountId: { type: String, default: '' },
  defaultDomain: { type: String, default: '' },
  defaultToken: { type: String, default: '' },
  defaultBotToken: { type: String, default: '' },
  defaultChatId: { type: String, default: '' },
});

const areResourcesNarrowedDown = ref(true);
const isConnecting = ref(false);
const isConnected = ref(false);

const resultLog = ref<Array<any>>([]);
const errorLog = ref<Array<any>>([]);

const providerAccountId = ref(props.defaultProviderAccountId);
const domain = ref(props.defaultDomain);
const token = ref(props.defaultToken);
const botToken = ref(props.defaultBotToken);
const chatId = ref(props.defaultChatId);

const setMasterAccountId = (newAccountId: string) => { providerAccountId.value = newAccountId; };
const setDomain = (newDomain: string) => { domain.value = newDomain; };
const setToken = (newToken: string) => { token.value = newToken; };
const setBotToken = (newBotToken: string) => { botToken.value = newBotToken; };
const setChatId = (newChatId: string) => { chatId.value = newChatId; };

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
  const tradingApi = copyFactory.tradingApi;
  
  try {
    log('Get provider account');
    const providerMetaapiAccount = await metaApi.metatraderAccountApi.getAccount(providerAccountId.value);
    if(
      !providerMetaapiAccount.copyFactoryRoles || 
      !providerMetaapiAccount.copyFactoryRoles.includes('PROVIDER')
    ) {
      throw new Error(
        'Please specify PROVIDER copyFactoryRoles value in your MetaApi account in ' +
        'order to use it in CopyFactory API'
      );
    }

    log('Provider account received');
  
    const strategies = await configurationApi.getStrategies();
    const strategy = strategies.find((s) => s.accountId === providerMetaapiAccount.id);
    
    const strategyId = !strategy
      ? (await configurationApi.generateStrategyId()).id
      : strategy._id;
      
    /* Create a strategy being copied */
    log('Creating strategy');
    await configurationApi.updateStrategy(strategyId, {
      name: 'Test strategy',
      description: 'Some useful description about your strategy',
      accountId: providerMetaapiAccount.id,
      telegram: {
        publishing: {
          token: botToken.value,
          chatId: chatId.value,
          template: '${description}'
        }
      }
    });
    log('Strategy created');
    
    /* Send external signal */
    log('Sending external signal');
    const signalClient = await tradingApi.getSignalClient(providerMetaapiAccount.id);
    const signalId = signalClient.generateSignalId();
    await signalClient.updateExternalSignal(strategyId, signalId, {
      symbol: 'EURUSD',
      type: 'POSITION_TYPE_BUY',
      time: new Date(),
      volume: 0.01
    });
    log('External signal sent');
    
    log('Wait 5 seconds');
    await new Promise(res => setTimeout(res, 5000));
    log('5 seconds passed');

    /* Remove external signal */
    log('Removing external signal');
    await signalClient.removeExternalSignal(strategyId, signalId, {
      time: new Date()
    });
    log('External signal removed');
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
  botToken.value = props.defaultBotToken;
  chatId.value = props.defaultChatId;
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
    <h1>CopyFactory. Telegram</h1>

    <Section modifier="form">
      <h2>Connect to your account</h2>
      <Form 
        :on-submit="triggerToFetchData" 
        :on-reset="reset"
        :disabled="isConnecting || isConnected" 
        :done="isConnected"
      >
        <Field :value="providerAccountId" @change="setMasterAccountId" label="Master account ID"/>
        <Field :value="token" @change="setToken" label="Token"/>
        <Field :value="domain" @change="setDomain" label="Domain"/>
        <Field :value="botToken" @change="setBotToken" label="Bot Token"/>
        <Field :value="chatId" @change="setChatId" label="Chat ID"/>
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