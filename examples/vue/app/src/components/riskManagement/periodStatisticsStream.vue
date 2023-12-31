<script setup lang="ts">
import { ref, watch } from 'vue';
import MetaApi, { PeriodStatisticsListener, RiskManagement } from 'metaapi.cloud-sdk';

import { Log, Section, Form, Field } from '../../shared';

const props = defineProps({
  defaultAccountId: { type: String, default: '' },
  defaultDomain: { type: String, default: '' },
  defaultToken: { type: String, default: '' },
});

const areResourcesNarrowedDown = ref(false);
const isConnecting = ref(false);
const isConnected = ref(false);

const resultLog = ref<Array<any>>([]);
const errorLog = ref<Array<any>>([]);

const trackerName = ref('example-tracker');

const accountId = ref(props.defaultAccountId);
const domain = ref(props.defaultDomain);
const token = ref(props.defaultToken);

const logErr = (...args: unknown[]) => {
  console.log(...args);
  errorLog.value = [...errorLog.value, ...args.map((arg: any) => arg.message || arg)];
};
const log = (...args: unknown[]) => {
  console.log(...args);
  resultLog.value = [...resultLog.value, ...args];
};

watch(isConnecting, () => {
  class PeriodStatisticsListenerLogged extends PeriodStatisticsListener {
    async onPeriodStatisticsCompleted() {
      log('period completed event received');
    }

    async onTrackerCompleted() {
      log('tracker completed event received');
    }

    async onConnected() {
      log('on connected event received');
    }

    async onDisconnected() {
      log('on disconnected event received');
    }

    async onError() {
      logErr('error event received');
    }
  }

  const fetchData = async () => {
    const metaApi = new MetaApi(token.value, { domain: domain.value });
    areResourcesNarrowedDown.value = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token.value);
    
    const riskManagement = new RiskManagement(token.value, { domain: domain.value });
    const riskManagementApi = riskManagement.riskManagementApi;

    try {
      // creating a tracker
      const trackerId = await riskManagementApi.createTracker(accountId.value, {
        absoluteDrawdownThreshold: 5,
        name: trackerName.value,
        period: 'day'
      });
      log('Created an event tracker ', trackerId.id);

      const periodStatisticsListener = new PeriodStatisticsListenerLogged(accountId.value, trackerId.id);
      const listenerId = await riskManagementApi.addPeriodStatisticsListener(
        periodStatisticsListener, accountId.value, trackerId.id);

      log('Streaming period statistics events for 1 minute...');
      await new Promise(res => setTimeout(res, 1000 * 60));

      riskManagementApi.removePeriodStatisticsListener(listenerId);

      const equityChart = await riskManagementApi.getEquityChart(accountId.value);
      log('Equity chart', equityChart);

      await riskManagementApi.deleteTracker(accountId.value, trackerId.id);
      log('Removed the tracker');
    } catch (err) {
      logErr(err);
      throw err;
    }
  };

  if (!isConnected.value && isConnecting.value) {
    fetchData()
      .then(() => {
        isConnected.value = true;
        isConnecting.value = false;
      })
      .catch(() => {
        isConnecting.value = false;
      });
  }
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
  if (isConnected.value || !accountId.value || !token.value || !trackerName.value) { return; }
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
    <h1>Risk management. Period statistics stream</h1>

    <Section modifier="form">
      <h2>Connect to your account</h2>
      <Form 
        :on-submit="triggerToFetchData" 
        :on-reset="reset"
        :disabled="isConnecting || isConnected" 
        :done="isConnected"
      >
        <Field :value="trackerName" @change="setAccountId" label="Tracker Name"/>
        <Field :value="accountId" @change="setAccountId" label="Account ID"/>
        <Field :value="domain" @change="setDomain" label="Domain"/>
        <Field :value="token" @change="setToken" label="Token"/>
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