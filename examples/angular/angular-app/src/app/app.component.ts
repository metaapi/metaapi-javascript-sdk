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
  activeExample$ = new BehaviorSubject<string>('meta-api.rpc');
  setActiveExample = (example: string) => {
    this.activeExample$.next(example);
  }

  examples: IExample[] = [
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
