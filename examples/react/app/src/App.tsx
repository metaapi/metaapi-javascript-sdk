/* eslint-disable complexity */
import './App.css';

import { useState } from 'react';

import {
  MetaApiStream,
  MetaApiRpc,
  RiskManagementPeriodStatisticsStream,
  RiskManagementEquityChartStream,
  RiskManagementEqulityBalance,
  RiskManagementEquityTracking,
  HistoricalGetCandles,
  HistoricalGetTicks,
  CopyfactoryExternalSignal,
  CopyfactoryStopoutListener,
  CopyfactoryCopyTrade,
  CopyfactoryStrategyTransactionListener,
  CopyfactoryUserLogListener,
  CopyfactorySubscriberTransactionListener,
  CopyfactorySubscriberUserLogListener,
  CopyfactoryTelegram,
  CopyfactoryWebhooks,
  MetastatsGetOpenTrades,
  MetastatsGetTrades,
  MetastatsGetMetrics,
  StreamQuotes
} from './components';

import { Toggler } from './shared';

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
      'riskManagement.equityTracking'
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
      'metastats.getTrades',
      'metastats.getMetrics',
    ]
  }
];

/* For Copyfactory */
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

function App() {
  const [activeExample, setActiveExamples] = useState<string>('metaapi.rpc');
  
  return (
    <div className="App">
      <h1>MetaApi + React</h1>
      
      <div className="togglers">
        {examples.map(example => <Toggler key={example.name}
          className="togglers__item"
          onClickHandler={(value: string) => setActiveExamples(value)} 
          {...example}
          activeItem={activeExample}
        />)}
      </div>

      <div className="component">
        { (activeExample === 'metaapi.stream') &&
          <MetaApiStream {...{ accountId, domain, token }} /> }
        { (activeExample === 'metaapi.rpc') &&
          <MetaApiRpc {...{ accountId, domain, token }} /> }

        { (activeExample === 'riskManagement.periodStatisticsStream') &&
          <RiskManagementPeriodStatisticsStream {...{ accountId, domain, token }} /> }
        { (activeExample === 'riskManagement.equityChartStream') &&
          <RiskManagementEquityChartStream {...{ accountId, domain, token }} /> }
        { (activeExample === 'riskManagement.equlityBalance') &&
          <RiskManagementEqulityBalance {...{ accountId, domain, token }} /> }
        { (activeExample === 'riskManagement.equityTracking') &&
          <RiskManagementEquityTracking {...{ accountId, domain, token }} /> }

        { (activeExample === 'historical.getCandles') &&
          <HistoricalGetCandles {...{ token, accountId, symbol, domain }} /> }
        { (activeExample === 'historical.getTicks') &&
          <HistoricalGetTicks {...{ token, accountId, symbol, domain }} /> }

        { (activeExample === 'copyfactory.externalSignal') &&
          <CopyfactoryExternalSignal {...{ providerAccountId, subscriberAccountId, token, domain }} /> }
        { (activeExample === 'copyfactory.stopoutListener') &&
          <CopyfactoryStopoutListener {...{ token, domain }} /> }
        { (activeExample === 'copyfactory.copyTrade') &&
          <CopyfactoryCopyTrade {...{ token, providerAccountId, subscriberAccountId, domain }} /> }
        { (activeExample === 'copyfactory.strategyTransactionListener') &&
          <CopyfactoryStrategyTransactionListener {...{ token, strategyId, domain }} /> }
        { (activeExample === 'copyfactory.strategyUserLogListener') &&
          <CopyfactoryUserLogListener {...{ token, strategyId, domain }} /> }
        { (activeExample === 'copyfactory.subscriberTransactionListener') &&
          <CopyfactorySubscriberTransactionListener {...{ token, subscriberAccountId, domain }} /> }
        { (activeExample === 'copyfactory.subscriberUserLogListener') &&
          <CopyfactorySubscriberUserLogListener {...{ token, subscriberAccountId, domain }} /> }
        { (activeExample === 'copyfactory.telegram') &&
          <CopyfactoryTelegram {...{ token, domain, botToken, chatId, providerAccountId }} /> }
        { (activeExample === 'copyfactory.webhooks') &&
          <CopyfactoryWebhooks {...{ token, domain, providerAccountId }} /> }

        { (activeExample === 'metastats.getOpenTrades') &&
          <MetastatsGetOpenTrades {...{ token, accountId, domain }} /> }
        { (activeExample === 'metastats.getTrades') &&
          <MetastatsGetTrades {...{ token, accountId, domain }} /> }
        { (activeExample === 'metastats.getMetrics') &&
          <MetastatsGetMetrics {...{ token, accountId, domain }} /> }

        { (activeExample === 'streamQuotes') &&
          <StreamQuotes {...{ token, accountId, domain, symbol }} /> }        
      </div> 
    </div>
  );
}

export default App;
