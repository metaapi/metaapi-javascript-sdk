<script setup lang="ts">
import { ref } from 'vue';
import { Toggler } from './shared';

import { 
  MetaApiStream,
  MetaApiRPC, 
  
  StreamQuotes,

  HistoricalGetCandles,
  HistoricalGetTicks,
  
  MetaStatsGetOpenTrades,
  MetaStatsGetMetrics,
  MetaStatsGetTrades,

  RiskManagementPeriodStatisticsStream,
  RiskManagementEquityChartStream,
  RiskManagementEqulityBalance,
  RiskManagementEquityTracking,

  CopyFactorySubscriberTransactionListener,
  CopyFactoryStrategyTransactionListener,
  CopyFactorySubscriberUserLogListener,
  CopyFactoryUserLogListener,
  CopyFactoryStopoutListener,
  CopyFactoryExternalSignal,
  CopyFactoryCopyTrade,
  CopyFactoryTelegram,
  CopyFactoryWebhooks
} from '@/components';

interface IExample {
  name: string
  items: string[]
}

const examples: IExample[] = [
  {
    name: 'MetaApi',
    items: [
      'metaapi.stream',
      'metaapi.rpc',
      'historical.getCandles',
      'historical.getTicks',
      'streamQuotes'
    ]
  }, {
    name: 'Risk Management',
    items: [
      'riskManagement.periodStatisticsStream',
      'riskManagement.equityChartStream',
      'riskManagement.equlityBalance',
      'riskManagement.equityTracking',
    ]
  }, {
    name: 'Copy Factory',
    items: [
      'copyfactory.externalSignal',
      'copyfactory.stopoutListener',
      'copyfactory.copyTrade',
      'copyfactory.strategyTransactionListener',
      'copyfactory.strategyUserLogListener',
      'copyfactory.subscriberTransactionListener',
      'copyfactory.subscriberUserLogListener',
      'copyfactory.telegram',
      'copyfactory.webhooks'
    ]
  }, {
    name: 'Meta Stats',
    items: [
      'metastats.getOpenTrades',
      'metastats.getMetrics',
      'metastats.getTrades',
    ]
  }
];

/* For CopyFactory */
const providerAccountId = import.meta.env.VITE_PROVIDER_ACCOUNT_ID || 'your-provider-account-id';
const subscriberAccountId = import.meta.env.VITE_SUBSCRIBER_ACCOUNT_ID || 'your-subscriber-account-id';
const strategyId = import.meta.env.VITE_STRATEGY_ID || 'your-strategy-id';
const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || 'your-telegram-bot-token';
const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID || 'your-telegram-chat-id';

/* For MetaApi */
const accountId = import.meta.env.VITE_ACCOUNT_ID || 'your-metaapi-account-id';
const token = import.meta.env.VITE_TOKEN || 'your-metaapi-token';

/* Meta */
const domain = import.meta.env.VITE_DOMAIN || 'agiliumtrade.agiliumtrade.ai';
const symbol = import.meta.env.VITE_SYMBOL || 'EURUSD';

const activeExample = ref('metaapi.rpc');
const setActiveExample = (example: string) => {
  activeExample.value = example;
};
</script>

<template>
  <main class="App">
    <h1>MetaApi + Vue</h1>

    <div className="togglers">
      <Toggler 
        v-for="example in examples" 
        :key="example.name"
        :name="example.name"
        :items="example.items"
        :onClickHandler="setActiveExample"
        :activeItem="activeExample"
      />
    </div>

    <div class="component">
      <!-- MetaApi -->
      <MetaApiStream v-if="activeExample === 'metaapi.stream'"
        :defaultAccountId="accountId" :defaultToken="token"
        :defaultDomain="domain" 
      />
      <MetaApiRPC v-if="activeExample === 'metaapi.rpc'"
        :defaultAccountId="accountId" :defaultToken="token"
        :defaultDomain="domain" 
      />

      <!-- Historical -->
      <HistoricalGetCandles v-if="activeExample === 'historical.getCandles'"
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" :defaultSymbol="symbol" 
      />
      <HistoricalGetTicks v-if="activeExample === 'historical.getTicks'"
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" :defaultSymbol="symbol" 
      />

      <!-- MetaStats -->
      <MetaStatsGetOpenTrades v-if="activeExample === 'metastats.getOpenTrades'"
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" 
      />
      <MetaStatsGetMetrics v-if="activeExample === 'metastats.getMetrics'"
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" 
      />
      <MetaStatsGetTrades v-if="activeExample === 'metastats.getTrades'"
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" 
      />

      <!-- RiskManagement -->
      <RiskManagementPeriodStatisticsStream v-if="activeExample === 'riskManagement.periodStatisticsStream'"
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" 
      />
      <RiskManagementEquityChartStream v-if="activeExample === 'riskManagement.equityChartStream'"
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" 
      />
      <RiskManagementEqulityBalance v-if="activeExample === 'riskManagement.equlityBalance'"
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" 
      />
      <RiskManagementEquityTracking v-if="activeExample === 'riskManagement.equityTracking'"
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" 
      />

      <!-- CopyFactory -->
      <CopyFactorySubscriberTransactionListener v-if="activeExample === 'copyfactory.subscriberTransactionListener'"
        :defaultSubscriberAccountId="subscriberAccountId" 
        :defaultToken="token" :defaultDomain="domain" 
      />
      <CopyFactoryStrategyTransactionListener v-if="activeExample === 'copyfactory.strategyTransactionListener'"
        :defaultStrategyId="strategyId"
        :defaultToken="token" :defaultDomain="domain" 
      />
      <CopyFactorySubscriberUserLogListener v-if="activeExample === 'copyfactory.subscriberUserLogListener'"
        :defaultSubscriberAccountId="subscriberAccountId" 
        :defaultToken="token" :defaultDomain="domain" 
      />
      <CopyFactoryUserLogListener v-if="activeExample === 'copyfactory.strategyUserLogListener'"
        :defaultStrategyId="strategyId"
        :defaultToken="token" :defaultDomain="domain" 
      />
      <CopyFactoryStopoutListener v-if="activeExample === 'copyfactory.stopoutListener'"
        :defaultToken="token" :defaultDomain="domain" 
      />
      <CopyFactoryExternalSignal v-if="activeExample === 'copyfactory.externalSignal'"
        :defaultSubscriberAccountId="subscriberAccountId" :defaultProviderAccountId="providerAccountId"
        :defaultToken="token" :defaultDomain="domain" 
      />
      <CopyFactoryCopyTrade v-if="activeExample === 'copyfactory.copyTrade'"
        :defaultSubscriberAccountId="subscriberAccountId" :defaultProviderAccountId="providerAccountId" 
        :defaultToken="token" :defaultDomain="domain" 
      />
      <CopyFactoryTelegram v-if="activeExample === 'copyfactory.telegram'"
        :defaultProviderAccountId="providerAccountId" 
        :defaultBotToken="botToken" :defaultChatId="chatId"
        :defaultToken="token" :defaultDomain="domain"
      />
      <CopyFactoryWebhooks v-if="activeExample === 'copyfactory.webhooks'"
        :defaultProviderAccountId="providerAccountId" :defaultToken="token" :defaultDomain="domain"
      />
      
      <StreamQuotes v-if="activeExample === 'streamQuotes'"
        :defaultAccountId="accountId" :defaultSymbol="symbol"
        :defaultToken="token" :defaultDomain="domain"
      />
    </div>
  </main>
</template>

<style>
@import './App.css';
</style>
