import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

/* Shared UI */
import { TogglerComponent } from './toggler/toggler.component';
import { SectionComponent } from './section/section.component';
import { LoggerComponent } from './logger/logger.component';
import { FieldComponent } from './field/field.component';
import { FormComponent } from './form/form.component';

/* MetaApi SDK components examples */ 
import { HistoricalGetCandlesComponent, HistoricalGetTicksComponent } from './historical';
import { MetaApiStreamComponent, MetaApiRpcComponent} from './meta-api';
import {
  RiskManagementPeriodStatisticsStreamComponent,
  RiskManagementEquityChartStreamComponent,
  RiskManagementEquityBalanceComponent,
  RiskManagementEquityTrackComponent,
} from './risk-management';

import {
  CopyFactorySubscriberTransactionListenerComponent,
  CopyFactoryStrategyTransactionListenerComponent,
  CopyFactorySubscriberUserLogListenerComponent,
  CopyFactoryUserLogListenerComponent,
  CopyFactoryStopoutListenerComponent,
  CopyFactoryExternalSignalComponent,
  CopyFactoryCopyTradeComponent,
  CopyFactoryTelegramComponent,
} from './copy-factory';

import {
  MetaStatsGetOpenTradesComponent,
  MetaStatsGetMetricsComponent,
  MetaStatsGetTradesComponent,
} from './meta-stats';

import { StreamQuotesComponent } from './stream-quotes';

@NgModule({
  declarations: [
    AppComponent,

    /* Shared */
    SectionComponent,
    TogglerComponent,
    LoggerComponent,
    FieldComponent,
    FormComponent,
    
    /* MetaApi */
    MetaApiStreamComponent,
    MetaApiRpcComponent,

    /* Historical */
    HistoricalGetCandlesComponent,
    HistoricalGetTicksComponent,

    /* RiskManagement */
    RiskManagementPeriodStatisticsStreamComponent,
    RiskManagementEquityChartStreamComponent,
    RiskManagementEquityBalanceComponent,
    RiskManagementEquityTrackComponent,

    /* MetaStats */
    MetaStatsGetOpenTradesComponent,
    MetaStatsGetMetricsComponent,
    MetaStatsGetTradesComponent,

    /* CopyFactory */
    CopyFactorySubscriberTransactionListenerComponent,
    CopyFactoryStrategyTransactionListenerComponent,
    CopyFactorySubscriberUserLogListenerComponent,
    CopyFactoryUserLogListenerComponent,
    CopyFactoryStopoutListenerComponent,
    CopyFactoryExternalSignalComponent,
    CopyFactoryCopyTradeComponent,
    CopyFactoryTelegramComponent,

    /* Stream Quotes */
    StreamQuotesComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
