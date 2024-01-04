import { Component, Input, OnInit } from '@angular/core';
import { MetastatsService } from '../metastats.service';

@Component({
  selector: 'metastats-getOpenTrades',
  templateUrl: './getOpenTrades.component.html',
})
export class MetastatsGetOpenTradesComponent {
  @Input() accountId?: string;
  @Input() token?: string;
  @Input() domain?: string;

  areTokenResourcesNarrowedDown = true;
  logs: string[] = [];
  fetching = false;
  done = false;

  constructor(
    private metaStatsService: MetastatsService
  ) {}

  ngOnInit() {
    this.metaStatsService.logs$.subscribe((log) => {
      this.logs = log;
    });
  }

  ngOnDestroy() {
    this.metaStatsService.reset();
  }

  fetchData = async () => {
    try {
      await this.metaStatsService.setConnection(this.accountId!, this.token!, this.domain!);
      this.areTokenResourcesNarrowedDown = this.metaStatsService.areTokenResourcesNarrowedDown;
      await this.metaStatsService.getOpenTrades();
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
    this.metaStatsService.reset();
    this.logs = [];

    this.fetching = false;
    this.done = false;
  }
}
