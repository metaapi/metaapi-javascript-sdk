import { Component, Input, OnInit } from '@angular/core';
import { MetaStatsService } from '../meta-stats.service';

@Component({
  selector: 'meta-stats-get-trades',
  templateUrl: './meta-stats.get-trades.component.html',
})
export class MetaStatsGetTradesComponent {
  @Input() accountId?: string;
  @Input() token?: string;
  @Input() domain?: string;

  areTokenResourcesNarrowedDown = true;
  logs: string[] = [];
  fetching = false;
  done = false;

  constructor(
    private metaStatsService: MetaStatsService
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
      await this.metaStatsService.getTrades('2020-01-01 00:00:00.000', '2021-01-01 00:00:00.000');
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
