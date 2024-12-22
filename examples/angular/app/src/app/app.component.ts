import { BehaviorSubject } from 'rxjs';
import { Component } from '@angular/core';
import { environment } from './environment/environment';

interface IExample {
  name: string
  items: string[]
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  activeExample$ = new BehaviorSubject<string>('metaapi.rpc');
  setActiveExample = (example: string) => {
    this.activeExample$.next(example);
  }

  examples: IExample[] = [
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

  /* For CopyFactory */
  providerAccountId = environment.PROVIDER_ACCOUNT_ID || 'your-provider-account-id';
  subscriberAccountId = environment.SUBSCRIBER_ACCOUNT_ID || 'your-subscriber-account-id';
  strategyId = environment.STRATEGY_ID || 'your-strategy-id';
  botToken = environment.TELEGRAM_BOT_TOKEN || 'your-telegram-bot-token';
  chatId = environment.TELEGRAM_CHAT_ID || 'your-telegram-chat-id';

  /* For MetaApi */
  accountId = environment.ACCOUNT_ID || 'your-metaapi-account-id';
  token = environment.TOKEN || 'your-metaapi-token';

  /* Meta */
  domain = environment.DOMAIN || 'agiliumtrade.agiliumtrade.ai';
  symbol = environment.SYMBOL || 'EURUSD';
}
