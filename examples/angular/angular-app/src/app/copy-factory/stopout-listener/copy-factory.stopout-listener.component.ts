import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CopyFactoryService } from '../copy-factory.service';

@Component({
  selector: 'copy-factory-stopout-listener',
  templateUrl: './copy-factory.stopout-listener.component.html',
})
export class CopyFactoryStopoutListenerComponent implements OnInit, OnDestroy {
  @Input() domain?: string;
  @Input() token?: string;

  disconnect?: () => void;

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

  ngOnDestroy(): void {
    if (this.disconnect) {
      this.disconnect();
    }

    this.copyFactoryService.reset();
  }

  fetchData = async () => {
    try {
      await this.copyFactoryService.init(this.token!, this.domain!);
      this.areTokenResourcesNarrowedDown = this.copyFactoryService.areTokenResourcesNarrowedDown;
      this.disconnect = await this.copyFactoryService.stopoutListener();
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
    if (this.disconnect) {
      this.disconnect();
      this.disconnect = undefined;
    }

    this.copyFactoryService.reset();
    this.logs = [];

    this.fetching = false;
    this.done = false;
  }
}
