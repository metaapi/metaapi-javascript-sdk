# MetaApi risk management API for javascript (a member of [metaapi.cloud](https://metaapi.cloud) project)

MetaApi risk management API is a cloud API for executing trading challenges and competitions. You can use this API for e.g. if you want to launch a proprietary trading company like FTMO. The API is also useful for trading firms/teams which have to enforce trading risk restrictions.

MetaApi risk management API is a member of MetaApi project ([https://metaapi.cloud](https://metaapi.cloud)), a powerful cloud forex trading API which supports both MetaTrader 4 and MetaTrader 5 platforms.

MetaApi is a paid service, however API access to one MetaTrader account is free of charge.

The [MetaApi pricing](https://metaapi.cloud/#pricing) was developed with the intent to make your charges less or equal to what you would have to pay for hosting your own infrastructure. This is possible because over time we managed to heavily optimize
our MetaTrader infrastructure. And with MetaApi you can save significantly on application development and
maintenance costs and time thanks to high-quality API, open-source SDKs and convenience of a cloud service.

## Why do we offer MetaApi risk management API

We found that developing a platform and infrastructure for running trading and investement challenges and competitions is a task which requires lots of effort and investment.

We decided to share our product as it allows developers to start with a powerful solution in almost no time, saving on development and infrastructure maintenance costs.

## MetaApi risk management API features

Features supported:

- fine-granular equity tracking
- configuring and executing trading challenges and competitions consisting from multiple drawdown and profit target criteria
- receiving notifications about failed challenges in real time
- tracking equity chart and challenge/competition statistics in real time
- tracking equity and balance changes in real time
- tracking number of days with trades during a challenge

Please check Features section of the [https://metaapi.cloud/docs/risk-management/](https://metaapi.cloud/docs/risk-management/) documentation for detailed description of all settings you can make

## REST API documentation
RiskManagement SDK is built on top of RiskManagement REST API.

RiskManagement REST API docs are available at [https://metaapi.cloud/docs/risk-management/](https://metaapi.cloud/docs/risk-management/)

## FAQ
Please check this page for FAQ: [https://metaapi.cloud/docs/risk-management/faq/](https://metaapi.cloud/docs/risk-management/faq/).

## Code examples
We published some code examples in our github repository, namely:

- Javascript: [https://github.com/agiliumtrade-ai/metaapi-node.js-sdk/tree/master/examples/riskManagement](https://github.com/agiliumtrade-ai/metaapi-node.js-sdk/tree/master/examples/riskManagement)

## Configuring equity tracking

In order to configure equity tracking you need to:

- add MetaApi MetaTrader accounts with `riskManagementApiEnabled` field set to true (see below)
- create equity trackers for the accounts with needed parameters

```javascript
import MetaApi, {RiskManagement} from 'metaapi.cloud-sdk';

const token = '...';
const metaapi = new MetaApi(token);
const riskManagement = new RiskManagement(token);

// retrieve MetaApi MetaTrader accounts with riskManagementApiEnabled field set to true
const account = await api.metatraderAccountApi.getAccount('accountId');
if(!account.riskManagementApiEnabled) {
  throw new Error('Please set riskManagementApiEnabled field to true in your MetaApi account in ' +
    'order to use it in RiskManagement API');
}

let riskManagementApi = riskManagement.riskManagementApi;

// create a tracker
let trackerId = await riskManagementApi.createTracker('accountId', {
  name: 'Test tracker',
  period: 'day',
  absoluteDrawdownThreshold: 100
});

// retrieve list of trackers
console.log(await riskManagementApi.getTrackers('accountId'));

// retrieve a tracker by id
console.log(await riskManagementApi.getTracker('accountId', 'trackerId'));

// update a tracker
console.log(await riskManagementApi.updateTracker('accountId', trackerId.id, {name: 'Updated name'}));

// remove a tracker
console.log(await riskManagementApi.deleteTracker('accountId', trackerId.id));
```

See esdoc in-code documentation for full definition of possible configuration options.

## Retrieving equity tracking events and statistics

RiskManagement allows you to monitor equity profits and drawdowns on trading accounts.

### Retrieving tracker events
```javascript
// retrieve tracker events, please note that this method supports filtering by broker time range, accountId, trackerId
// and limits number of records
console.log(await riskManagementApi.getTrackerEvents('2022-04-13 09:30:00.000', '2022-05-14 09:30:00.000'));
```

### Streaming tracker events
You can subscribe to a stream of tracker events using the tracker event listener.
```javascript
import {TrackerEventListener} from 'metaapi.cloud-sdk';

// create a custom class based on the TrackerEventListener
class Listener extends TrackerEventListener {

  // specify the function called on events arrival
  async onTrackerEvent(trackerEvent) {
    console.log('Tracker event', trackerEvent);
  }

}

// add listener
const listener = new Listener('accountId', 'trackerId1');
const listenerId = riskManagementApi.addTrackerEventListener(listener);

// remove listener
riskManagementApi.removeTrackerEventListener(listenerId);
```

### Retrieving tracking statistics
```javascript
// retrieve tracking statistics, please note that this method can filter returned data and supports pagination
console.log(await riskManagementApi.getTrackingStatistics('accountId', trackerId.id));
```

### Streaming period statistics events
You can subscribe to a stream of period statistics events using the period statistics event listener.
```javascript
import {PeriodStatisticsListener} from 'metaapi.cloud-sdk';

// create a custom class based on the PeriodStatisticsListener
class Listener extends PeriodStatisticsListener {

  // specify the function called on events arrival
  async onPeriodStatisticsUpdated(periodStatisticsEvent) {
    console.log('Period statistics updated', periodStatisticsEvent);
  }

  // specify the function called on period complete
  async onPeriodStatisticsCompleted() {
    console.log('Period statistics period completed');
  }

  // specify the function called on tracker period complete
  async onTrackerCompleted() {
    console.log('Tracker period completed');
  }
  
  // specify the function called on connection established
  async onConnected() {
    console.log('Connection established');
  }

  // specify the function called on connection lost
  async onDisconnected() {
    console.log('Connection lost');
  }

}

// add listener
const listener = new Listener('accountId', 'trackerId1');
const listenerId = await riskManagementApi.addPeriodStatisticsListener(listener, 'accountId', 'trackerId1');

// remove listener
riskManagementApi.removePeriodStatisticsListener(listenerId);
```

### Retrieving equity chart
```javascript
// retrieve equity chart, please note that this method supports loading within specified broker time
console.log(await riskManagementApi.getEquityChart('accountId'));
```

### Streaming equity chart events
You can subscribe to a stream of equity chart events using the equity chart event listener.
```javascript
import {EquityChartListener} from 'metaapi.cloud-sdk';

// create a custom class based on the EquityChartListener
class Listener extends EquityChartListener {

  // specify the function called on events arrival
  async onEquityRecordUpdated(equityChartEvent) {
    console.log('Equity chart updated', equityChartEvent);
  }

  // specify the function called on period complete
  async onEquityRecordCompleted() {
    console.log('Equity chart period completed');
  }
  
  // specify the function called on connection established
  async onConnected() {
    console.log('Connection established');
  }

  // specify the function called on connection lost
  async onDisconnected() {
    console.log('Connection lost');
  }

}

// add listener
const listener = new Listener('accountId');
const listenerId = await riskManagementApi.addEquityChartListener(listener, 'accountId');

// remove listener
riskManagementApi.removeEquityChartListener(listenerId);
```

### Equity/balance tracking

You can subscribe to a stream of equity/balance events using the equity balance event listener.
```javascript
import {EquityBalanceListener} from 'metaapi.cloud-sdk';

// create a custom class based on the EquityBalanceListener
class Listener extends EquityBalanceListener {

  // specify the function called on events arrival
  async onEquityOrBalanceUpdated(equityBalanceData) {
    console.log('Equity/balance updated', equityBalanceData);
  }
  
  // specify the function called on connection established
  async onConnected() {
    console.log('Connection established');
  }

  // specify the function called on connection lost
  async onDisconnected() {
    console.log('Connection lost');
  }

}

// add listener
const listener = new Listener('accountId');
const listenerId = await riskManagementApi.addEquityBalanceListener(listener, 'accountId');

// remove listener
riskManagementApi.removeEquityBalanceListener(listenerId);
```
