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
  CopyFactoryExternalSignal,
  CopyFactoryStopoutListener,
  CopyFactoryCopyTrade,
  CopyFactoryStrategyTransactionListener,
  CopyFactoryUserLogListener,
  CopyFactorySubscriberTransactionListener,
  CopyFactorySubscriberUserLogListener,
  CopyFactoryTelegram,
  MetaStatsGetOpenTrades,
  MetaStatsGetTrades,
  MetaStatsGetMetrics,
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
      'risk-management.equity-tracking'
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
      'meta-stats.get-trades',
      'meta-stats.get-metrics',
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
        { (activeExample === 'meta-api.stream') && 
          <MetaApiStream {...{ accountId, domain, token }} /> }
        { (activeExample === 'meta-api.rpc') && 
          <MetaApiRpc {...{ accountId, domain, token }} /> }

        { (activeExample === 'risk-management.period-statistics-stream') && 
          <RiskManagementPeriodStatisticsStream {...{ accountId, domain, token }} /> }
        { (activeExample === 'risk-management.equity-chart-stream') && 
          <RiskManagementEquityChartStream {...{ accountId, domain, token }} /> }
        { (activeExample === 'risk-management.equlity-balance') && 
          <RiskManagementEqulityBalance {...{ accountId, domain, token }} /> }
        { (activeExample === 'risk-management.equity-tracking') && 
          <RiskManagementEquityTracking {...{ accountId, domain, token }} /> }

        { (activeExample === 'historical.get-candles') && 
          <HistoricalGetCandles {...{ token, accountId, symbol, domain }} /> }
        { (activeExample === 'historical.get-ticks') && 
          <HistoricalGetTicks {...{ token, accountId, symbol, domain }} /> }

        { (activeExample === 'copy-factory.external-signal') && 
          <CopyFactoryExternalSignal {...{ providerAccountId, subscriberAccountId, token, domain }} /> }
        { (activeExample === 'copy-factory.stopout-listener') && 
          <CopyFactoryStopoutListener {...{ token, domain }} /> }
        { (activeExample === 'copy-factory.copy-trade') && 
          <CopyFactoryCopyTrade {...{ token, providerAccountId, subscriberAccountId, domain }} /> }
        { (activeExample === 'copy-factory.strategy-transaction-listener') && 
          <CopyFactoryStrategyTransactionListener {...{ token, strategyId, domain }} /> }
        { (activeExample === 'copy-factory.strategy-user-log-listener') && 
          <CopyFactoryUserLogListener {...{ token, strategyId, domain }} /> }
        { (activeExample === 'copy-factory.subscriber-transaction-listener') && 
          <CopyFactorySubscriberTransactionListener {...{ token, subscriberAccountId, domain }} /> }
        { (activeExample === 'copy-factory.subscriber-user-log-listener') && 
          <CopyFactorySubscriberUserLogListener {...{ token, subscriberAccountId, domain }} /> }
        { (activeExample === 'copy-factory.telegram') && 
          <CopyFactoryTelegram {...{ token, domain, botToken, chatId, providerAccountId }} /> }

        { (activeExample === 'meta-stats.get-open-trades') && 
          <MetaStatsGetOpenTrades {...{ token, accountId, domain }} /> }
        { (activeExample === 'meta-stats.get-trades') && 
          <MetaStatsGetTrades {...{ token, accountId, domain }} /> }
        { (activeExample === 'meta-stats.get-metrics') && 
          <MetaStatsGetMetrics {...{ token, accountId, domain }} /> }        

        { (activeExample === 'stream-quotes') && 
          <StreamQuotes {...{ token, accountId, domain, symbol }} /> }        
      </div> 
    </div>
  );
}

export default App;
