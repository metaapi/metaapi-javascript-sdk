import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import MetaApi, { 
  RiskManagement,
  PeriodStatisticsListener,
  EquityBalanceListener,
  TrackerEventListener,
  EquityChartListener,
} from 'metaapi.cloud-sdk';

@Injectable({
  providedIn: 'root'
})
export class RiskManagementService {
  private riskManagementApi: RiskManagement['riskManagementApi'] | null = null;
  private riskManagement: RiskManagement | null = null;

  public areTokenResourcesNarrowedDown = true;

  logs$ = new BehaviorSubject<any[]>([]);
  logs: any[] = [];

  constructor() {}

  log = (...args: unknown[]) => {
    console.log(...args);
    this.logs.push(...args);
    this.logs$.next([...this.logs$.value, ...args]);
  }

  reset = () => {
    this.logs = [];
    this.logs$.next([]);
  }

  async setConnection(token: string, domain: string): Promise<void> {
    const metaApi = new MetaApi(token, { domain });
    this.areTokenResourcesNarrowedDown = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token) as boolean;
    
    this.riskManagement = new RiskManagement(token, { domain });
    this.riskManagementApi = this.riskManagement.riskManagementApi;
  }

  async periodStatisticsStream(accountId: string, trackerName: string): Promise<void> {
    const log = this.log;

    try {
      if (!this.riskManagementApi) {
        throw new Error('No connection');
      }

      class PeriodStatisticsListenerLogged extends PeriodStatisticsListener {
        override async onPeriodStatisticsCompleted() {
          log('period completed event received');
        }

        async onTrackerCompleted() {
          log('tracker completed event received');
        }

        override async onConnected() {
          log('on connected event received');
        }

        override async onDisconnected() {
          log('on disconnected event received');
        }

        override async onError() {
          log('error event received');
        }
      }

      const trackerId = await this.riskManagementApi.createTracker(accountId, {
        name: trackerName || 'example-tracker',
        absoluteDrawdownThreshold: 5,
        period: 'day'
      });
      log(`Created an event tracker ${trackerName}`, trackerId.id);

      const periodStatisticsListener = new PeriodStatisticsListenerLogged(accountId, trackerId.id);
      const listenerId = await this.riskManagementApi.addPeriodStatisticsListener(
        periodStatisticsListener, accountId, trackerId.id);

      log('Streaming period statistics events for 1 minute...');
      await new Promise(res => setTimeout(res, 1000 * 60));

      this.riskManagementApi.removePeriodStatisticsListener(listenerId);
      log('1 minute passed, removed the listener');

      const equityChart = await this.riskManagementApi.getEquityChart(accountId);
      log('Equity chart', equityChart);

      await this.riskManagementApi.deleteTracker(accountId, trackerId.id);
      log('Removed the tracker');
    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  async equlityBalance(accountId: string): Promise<void> {
    const log = this.log;

    try {
      if (!this.riskManagementApi) {
        throw new Error('No connection');
      }

      class ExampleEquityBalanceListener extends EquityBalanceListener {
        override async onEquityOrBalanceUpdated(equityBalanceData: unknown) {
          log('equity balance update received', equityBalanceData);
        }

        override async onConnected() {
          log('on connected event received');
        }

        override async onDisconnected() {
          log('on disconnected event received');
        }

        override async onError(error: unknown) {
          log(error);
        }
      }

      const equityBalanceListener = new ExampleEquityBalanceListener(accountId);
      const listenerId = await this.riskManagementApi.addEquityBalanceListener(equityBalanceListener, accountId);

      log('Streaming equity balance for 1 minute...');
      await new Promise(res => setTimeout(res, 1000 * 60));
      log('1 minute passed, removing the listener');
      this.riskManagementApi.removeEquityBalanceListener(listenerId);
      log('Listener removed');
    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  async equityTracking(accountId: string, trackerName: string): Promise<void> {
  const log = this.log;
    
    try {
      if (!this.riskManagementApi) {
        throw new Error('No connection');
      }

      class TrackerEventListenerLogged extends TrackerEventListener {
        override async onTrackerEvent(trackerEvent: unknown) {
          log('tracker event received', JSON.stringify(trackerEvent));
        }
        override async onError(error: unknown) {
          log('error event received', error);
        }
      }

      const trackerId = await this.riskManagementApi.createTracker(accountId, {
        name: trackerName || 'example-tracker',
        absoluteDrawdownThreshold: 5,
        period: 'day'
      });
      log('Created an event tracker ', trackerId.id);

      const trackerEventListener = new TrackerEventListenerLogged(accountId, trackerId.id);
      const listenerId = await this.riskManagementApi.addTrackerEventListener(trackerEventListener, accountId, trackerId.id);

      log('Streaming tracking events for 1 minute...');
      await new Promise(res => setTimeout(res, 1000 * 60));
      this.riskManagementApi.removeTrackerEventListener(listenerId);

      log('Receiving statistics with REST API' );

      const events = await this.riskManagementApi.getTrackerEvents(
        undefined, undefined, accountId, trackerId.id);
      log('tracking events', events );

      const statistics = await this.riskManagementApi.getTrackingStatistics(accountId, trackerId.id);
      log('tracking statistics', statistics);

      const equityChart = await this.riskManagementApi.getEquityChart(accountId);
      log('equity chart', equityChart);

      // removing the tracker
      await this.riskManagementApi.deleteTracker(accountId, trackerId.id);
      log('Removed the tracker');

    } catch (err) {
      this.log(err);
      throw err;
    }
  }

  async equityChartStream(accountId: string): Promise<void> {
    const log = this.log;
    try {
      if (!this.riskManagementApi) {
        throw new Error('No connection');
      }

      class EquityChartListenerLogged extends EquityChartListener {
        override async onEquityRecordUpdated(equityChartEvent: unknown) {
          log('equity record updated event received', equityChartEvent);
        }

        override async onEquityRecordCompleted() {
          log('equity record completed event received');
        }

        override async onConnected() {
          log('on connected event received');
        }

        override async onDisconnected() {
          log('on disconnected event received');
        }

        override async onError(error: unknown) {
          log('Error event received', error);
        }
      }

      const equityChartListener = new EquityChartListenerLogged(accountId);
      const listenerId = await this.riskManagementApi.addEquityChartListener(equityChartListener, accountId);

      log('Streaming equity chart events for 1 minute...');
      await new Promise(res => setTimeout(res, 1000 * 60));

      log('1 minute passed, removing the listener');
      this.riskManagementApi.removeEquityChartListener(listenerId);

      const equityChart = await this.riskManagementApi.getEquityChart(accountId);
      log('Equity chart', equityChart);

    } catch (err) {
      this.log(err);
      throw err;
    }
  }
}
