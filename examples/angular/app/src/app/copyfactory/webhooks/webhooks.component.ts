import { Component, Input, OnInit } from '@angular/core';
import { CopyfactoryService } from '../copyfactory.service';

@Component({
  selector: 'copyfactory-webhooks',
  templateUrl: './webhooks.component.html',
})
export class CopyfactoryWebhooksComponent {
  @Input() providerAccountId?: string;
  @Input() domain?: string;
  @Input() token?: string;

  areTokenResourcesNarrowedDown: boolean = true;
  logs: string[] = [];
  fetching = false;
  done = false;

  constructor(
    private copyFactoryService: CopyfactoryService
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

      await this.copyFactoryService.createStrategy(strategyId);
      await this.copyFactoryService.webhooks(strategyId);
    } catch (err) {
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
