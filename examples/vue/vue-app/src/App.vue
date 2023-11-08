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
} from '@/components';

interface IExample {
  name: string
  items: string[]
}

const examples: IExample[] = [
  {
    name: 'MetaApi',
    items: [
      'meta-api.stream',
      'meta-api.rpc',
      'historical.get-candles',
      'historical.get-ticks',
      'stream-quotes'
    ]
  }, {
    name: 'Risk Management',
    items: [
      'risk-management.period-statistics-stream',
      'risk-management.equity-chart-stream',
      'risk-management.equlity-balance',
      'risk-management.equity-tracking',
    ]
  }, {
    name: 'Copy Factory',
    items: [
      'copy-factory.external-signal',
      'copy-factory.stopout-listener',
      'copy-factory.copy-trade',
      'copy-factory.strategy-transaction-listener',
      'copy-factory.strategy-user-log-listener',
      'copy-factory.subscriber-transaction-listener',
      'copy-factory.subscriber-user-log-listener',
      'copy-factory.telegram'
    ]
  }, {
    name: 'Meta Stats',
    items: [
      'meta-stats.get-open-trades',
      'meta-stats.get-metrics',
      'meta-stats.get-trades',
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

const activeExample = ref('meta-api.rpc');
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
      <MetaApiStream v-if="activeExample === 'meta-api.stream'" 
        :defaultAccountId="accountId" :defaultToken="token"
        :defaultDomain="domain" 
      />
      <MetaApiRPC v-if="activeExample === 'meta-api.rpc'" 
        :defaultAccountId="accountId" :defaultToken="token"
        :defaultDomain="domain" 
      />

      <!-- Historical -->
      <HistoricalGetCandles v-if="activeExample === 'historical.get-candles'" 
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" :defaultSymbol="symbol" 
      />
      <HistoricalGetTicks v-if="activeExample === 'historical.get-ticks'" 
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" :defaultSymbol="symbol" 
      />

      <!-- MetaStats -->
      <MetaStatsGetOpenTrades v-if="activeExample === 'meta-stats.get-open-trades'" 
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" 
      />
      <MetaStatsGetMetrics v-if="activeExample === 'meta-stats.get-metrics'" 
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" 
      />
      <MetaStatsGetTrades v-if="activeExample === 'meta-stats.get-trades'" 
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" 
      />

      <!-- RiskManagement -->
      <RiskManagementPeriodStatisticsStream v-if="activeExample === 'risk-management.period-statistics-stream'" 
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" 
      />
      <RiskManagementEquityChartStream v-if="activeExample === 'risk-management.equity-chart-stream'" 
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" 
      />
      <RiskManagementEqulityBalance v-if="activeExample === 'risk-management.equlity-balance'" 
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" 
      />
      <RiskManagementEquityTracking v-if="activeExample === 'risk-management.equity-tracking'" 
        :defaultAccountId="accountId" :defaultToken="token" 
        :defaultDomain="domain" 
      />

      <!-- CopyFactory -->
      <CopyFactorySubscriberTransactionListener v-if="activeExample === 'copy-factory.subscriber-transaction-listener'" 
        :defaultSubscriberAccountId="subscriberAccountId" 
        :defaultToken="token" :defaultDomain="domain" 
      />
      <CopyFactoryStrategyTransactionListener v-if="activeExample === 'copy-factory.strategy-transaction-listener'" 
        :defaultStrategyId="strategyId"
        :defaultToken="token" :defaultDomain="domain" 
      />
      <CopyFactorySubscriberUserLogListener v-if="activeExample === 'copy-factory.subscriber-user-log-listener'" 
        :defaultSubscriberAccountId="subscriberAccountId" 
        :defaultToken="token" :defaultDomain="domain" 
      />
      <CopyFactoryUserLogListener v-if="activeExample === 'copy-factory.strategy-user-log-listener'" 
        :defaultStrategyId="strategyId"
        :defaultToken="token" :defaultDomain="domain" 
      />
      <CopyFactoryStopoutListener v-if="activeExample === 'copy-factory.stopout-listener'" 
        :defaultToken="token" :defaultDomain="domain" 
      />
      <CopyFactoryExternalSignal v-if="activeExample === 'copy-factory.external-signal'" 
        :defaultSubscriberAccountId="subscriberAccountId" :defaultProviderAccountId="providerAccountId"
        :defaultToken="token" :defaultDomain="domain" 
      />
      <CopyFactoryCopyTrade v-if="activeExample === 'copy-factory.copy-trade'" 
        :defaultSubscriberAccountId="subscriberAccountId" :defaultProviderAccountId="providerAccountId" 
        :defaultToken="token" :defaultDomain="domain" 
      />
      <CopyFactoryTelegram v-if="activeExample === 'copy-factory.telegram'" 
        :defaultProviderAccountId="providerAccountId" 
        :defaultBotToken="botToken" :defaultChatId="chatId"
        :defaultToken="token" :defaultDomain="domain"
      />
      
      <StreamQuotes v-if="activeExample === 'stream-quotes'" 
        :defaultAccountId="accountId" :defaultSymbol="symbol"
        :defaultToken="token" :defaultDomain="domain"
      />
    </div>
  </main>
</template>

<style>
@import './App.css';
</style>
