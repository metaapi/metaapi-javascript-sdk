import { Component, Input, OnInit } from '@angular/core';
import { CopyFactoryService } from '../copy-factory.service';

@Component({
  selector: 'copy-factory-telegram',
  templateUrl: './copy-factory.telegram.component.html',
})

export class CopyFactoryTelegramComponent {
  @Input() providerAccountId?: string;
  @Input() botToken?: string;
  @Input() chatId?: string;
  @Input() domain?: string;
  @Input() token?: string;

  areTokenResourcesNarrowedDown = true;
  logs: string[] = [];
  fetching = false;
  done = false;

  constructor(
    private copyFactoryService: CopyFactoryService
  ) {}

  ngOnInit() {
    this.copyFactoryService.logs$.subscribe((log) => {
      this.logs = log;
    });
  }

  ngOnDestroy() {
    this.copyFactoryService.reset();
  }

  fetchData = async () => {
    try {
      await this.copyFactoryService.init(this.token!, this.domain!);
      this.areTokenResourcesNarrowedDown = this.copyFactoryService.areTokenResourcesNarrowedDown;
      await this.copyFactoryService.setProviderConnection(this.providerAccountId!);
      const strategyId = await this.copyFactoryService.getStategyId();
      await this.copyFactoryService.createStrategy(strategyId, {
        telegram: {
          publishing: {
            token: this.botToken,
            chatId: this.chatId,
            template: '${description}'
          }
        }
      });

      await this.copyFactoryService.telegram(strategyId);
    } catch(err) {
      console.log(err);
      throw err;
    }
  }

  submit = () => {
    this.fetching = true;
    this.fetchData()
      .then(() => {
        this.done = true;
      })
      .finally(() => {
        this.fetching = false;
      });
  }

  reset = () => {
    this.copyFactoryService.reset();
    this.logs = [];

    this.fetching = false;
    this.done = false;
  }
}
