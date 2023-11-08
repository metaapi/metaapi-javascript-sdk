import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { StreamQuotesService } from './stream-quotes.service';

@Component({
  selector: 'stream-quotes',
  templateUrl: './stream-quotes.component.html',
})
export class StreamQuotesComponent {
  @Input() accountId?: string;
  @Input() symbol?: string;
  @Input() token?: string;
  @Input() domain?: string;

  areTokenResourcesNarrowedDown = true;
  logs: string[] = [];
  fetching = false;
  done = false;

  constructor(
    private streamQuotesService: StreamQuotesService
  ) {}

  ngOnInit() {
    this.streamQuotesService.logs$.subscribe((log) => {
      this.logs = log;
    });
  }

  ngOnDestroy() {
    this.streamQuotesService.reset();
  }

  fetchData = async () => {
    try {
      await this.streamQuotesService.setConnection(this.accountId!, this.token!, this.domain!, this.symbol!);
      this.areTokenResourcesNarrowedDown = this.streamQuotesService.areTokenResourcesNarrowedDown;
      await this.streamQuotesService.makeRequest();
      await new Promise(res => setTimeout(res, 6000));
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
    this.streamQuotesService.reset();
    this.logs = [];

    this.fetching = false;
    this.done = false;
  }
}
