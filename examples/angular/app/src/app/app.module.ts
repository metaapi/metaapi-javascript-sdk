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
import { MetaapiStreamComponent, MetaapiRpcComponent} from './metaapi';
import {
  RiskManagementPeriodStatisticsStreamComponent,
  RiskManagementEquityChartStreamComponent,
  RiskManagementEquityBalanceComponent,
  RiskManagementEquityTrackComponent,
} from './riskManagement';

import {
  CopyfactorySubscriberTransactionListenerComponent,
  CopyfactoryStrategyTransactionListenerComponent,
  CopyfactorySubscriberUserLogListenerComponent,
  CopyFactoryUserLogListenerComponent,
  CopyfactoryStopoutListenerComponent,
  CopyfactoryExternalSignalComponent,
  CopyfactoryCopyTradeComponent,
  CopyfactoryTelegramComponent,
  CopyfactoryWebhooksComponent
} from './copyfactory';

import {
  MetastatsGetOpenTradesComponent,
  MetastatsGetMetricsComponent,
  MetastatsGetTradesComponent,
} from './metastats';

import { StreamQuotesComponent } from './streamQuotes';

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
    MetaapiStreamComponent,
    MetaapiRpcComponent,

    /* Historical */
    HistoricalGetCandlesComponent,
    HistoricalGetTicksComponent,

    /* RiskManagement */
    RiskManagementPeriodStatisticsStreamComponent,
    RiskManagementEquityChartStreamComponent,
    RiskManagementEquityBalanceComponent,
    RiskManagementEquityTrackComponent,

    /* MetaStats */
    MetastatsGetOpenTradesComponent,
    MetastatsGetMetricsComponent,
    MetastatsGetTradesComponent,

    /* CopyFactory */
    CopyfactorySubscriberTransactionListenerComponent,
    CopyfactoryStrategyTransactionListenerComponent,
    CopyfactorySubscriberUserLogListenerComponent,
    CopyFactoryUserLogListenerComponent,
    CopyfactoryStopoutListenerComponent,
    CopyfactoryExternalSignalComponent,
    CopyfactoryCopyTradeComponent,
    CopyfactoryTelegramComponent,
    CopyfactoryWebhooksComponent,

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
