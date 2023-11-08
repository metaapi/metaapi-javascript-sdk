import { Component, Input, OnInit } from '@angular/core';
import { RiskManagementService } from '../risk-management.service';

@Component({
  selector: 'risk-management-equity-tracking',
  templateUrl: './risk-management.equity-tracking.component.html',
})
export class RiskManagementEquityTrackComponent {
  @Input() accountId?: string;
  @Input() token?: string;
  @Input() domain?: string;

  trackerName = 'example-tracker';

  areTokenResourcesNarrowedDown = true;
  logs: string[] = [];
  fetching = false;
  done = false;

  constructor(
    private riskManagementService: RiskManagementService
  ) {}

  ngOnInit() {
    this.riskManagementService.logs$.subscribe((log) => {
      this.logs = log;
    });
  }

  ngOnDestroy() {
    this.riskManagementService.reset();
  }

  fetchData = async () => {
    try {
      await this.riskManagementService.setConnection(this.token!, this.domain!);
      this.areTokenResourcesNarrowedDown = this.riskManagementService.areTokenResourcesNarrowedDown;
      await this.riskManagementService.equityTracking(this.accountId!, this.trackerName);
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
    this.riskManagementService.reset();
    this.logs = [];

    this.fetching = false;
    this.done = false;
  }
}
