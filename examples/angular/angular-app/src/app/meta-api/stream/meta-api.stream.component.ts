import { Component, Input, OnInit } from '@angular/core';
import { MetaApiService } from '../meta-api.service';

@Component({
  selector: 'meta-api-stream',
  templateUrl: './meta-api.stream.component.html',
})
export class MetaApiStreamComponent {
  @Input() accountId?: string;
  @Input() token?: string;
  @Input() domain?: string;

  areTokenResourcesNarrowedDown = true;
  logs: string[] = [];
  fetching = false;
  done = false;

  constructor(
    private metaApiService: MetaApiService
  ) {}

  ngOnInit() {
    this.metaApiService.logs$.subscribe((log) => {
      this.logs = log;
    });
  }

  ngOnDestroy() {
    this.metaApiService.reset();
  }

  fetchData = async () => {
    try {
      await this.metaApiService.setConnectionStream(this.accountId!, this.token!, this.domain!);
      this.areTokenResourcesNarrowedDown = this.metaApiService.areTokenResourcesNarrowedDown;
      await this.metaApiService.exampleStream();
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
    this.metaApiService.reset();
    this.logs = [];

    this.fetching = false;
    this.done = false;
  }
}
