import { Component, Input, OnInit } from '@angular/core';
import { HistoricalService } from '../historical.service';

@Component({
  selector: 'historical-get-candles',
  templateUrl: './historical.get-candles.component.html',
})
export class HistoricalGetCandlesComponent {
  @Input() accountId?: string;
  @Input() domain?: string;
  @Input() symbol?: string;
  @Input() token?: string;

  areTokenResourcesNarrowedDown = true;
  logs: string[] = [];
  fetching = false;
  done = false;

  constructor(
    private historicalService: HistoricalService
  ) {}

  ngOnInit() {
    this.historicalService.logs$.subscribe((log) => {
      this.logs = log;
    });
  }

  ngOnDestroy() {
    this.historicalService.reset();
  }

  fetchData = async () => {
    try {
      await this.historicalService.setConnection(this.accountId!, this.token!, this.domain!, this.symbol!);
      this.areTokenResourcesNarrowedDown = this.historicalService.areTokenResourcesNarrowedDown;
      await this.historicalService.getCandles();
    } catch(err) {
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
    this.historicalService.reset();
    this.logs = [];

    this.fetching = false;
    this.done = false;
  }
}
