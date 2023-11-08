## Use real-time streaming API
Real-time streaming API is good for developing trading applications like trade copiers or automated trading strategies.
The API synchronizes the terminal state locally so that you can query local copy of the terminal state really fast.

### Synchronizing and reading terminal state
```javascript
const account = await api.metatraderAccountApi.getAccount('accountId');
const connection = account.getStreamingConnection();
await connection.connect();

// access local copy of terminal state
const terminalState = connection.terminalState;

// wait until synchronization completed
await connection.waitSynchronized();

console.log(terminalState.connected);
console.log(terminalState.connectedToBroker);
console.log(terminalState.accountInformation);
console.log(terminalState.positions);
console.log(terminalState.orders);
// symbol specifications
console.log(terminalState.specifications);
console.log(terminalState.specification('EURUSD'));
console.log(terminalState.price('EURUSD'));

// access history storage
historyStorage = connection.historyStorage;

// both orderSynchronizationFinished and dealSynchronizationFinished
// should be true once history synchronization have finished
console.log(historyStorage.orderSynchronizationFinished);
console.log(historyStorage.dealSynchronizationFinished);

console.log(historyStorage.deals);
console.log(historyStorage.dealsByTicket(1));
console.log(historyStorage.dealsByPosition(1));
console.log(historyStorage.dealsByTimeRange(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date());
console.log(historyStorage.historyOrders);
console.log(historyStorage.historyOrdersByTicket(1));
console.log(historyStorage.historyOrdersByPosition(1));
console.log(historyStorage.historyOrdersByTimeRange(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date());
```

### Overriding local history storage
By default history is stored in memory only. You can override history storage to save trade history to a persistent storage like MongoDB database.
```javascript
import {HistoryStorage} from 'metaapi.cloud-sdk';

class MongodbHistoryStorage extends HistoryStorage {
  // implement the abstract methods, see MemoryHistoryStorage for sample
  // implementation
}

let historyStorage = new MongodbHistoryStorage();

// Note: if you will not specify history storage, then in-memory storage
// will be used (instance of MemoryHistoryStorage)
const connection = account.getStreamingConnection(historyStorage);
await connection.connect();

// access history storage
historyStorage = connection.historyStorage;

// invoke other methods provided by your history storage implementation
console.log(await historyStorage.yourMethod());
```

### Receiving synchronization events
You can override SynchronizationListener in order to receive synchronization event notifications, such as account/position/order/history updates or symbol quote updates.
```javascript
import {SynchronizationListener} from 'metaapi.cloud-sdk';

// receive synchronization event notifications
// first, implement your listener
class MySynchronizationListener extends SynchronizationListener {
  // override abstract methods you want to receive notifications for
}

// retrieving a connection
const connection = account.getStreamingConnection(historyStorage);

// now add the listener
const listener = new MySynchronizationListener();
connection.addSynchronizationListener(listener);

// open the connection after adding listeners
await connection.connect();

// remove the listener when no longer needed
connection.removeSynchronizationListener(listener);
```

### Retrieve contract specifications and quotes via streaming API
```javascript
const connection = account.getStreamingConnection();
await connection.connect();

await connection.waitSynchronized();

// first, subscribe to market data
await connection.subscribeToMarketData('GBPUSD');

// read constract specification
console.log(terminalState.specification('EURUSD'));
// read current price
console.log(terminalState.price('EURUSD'));

// unsubscribe from market data when no longer needed
await connection.unsubscribeFromMarketData('GBPUSD');
```

### Execute trades
```javascript
const connection = account.getStreamingConnection();

await connection.connect();
await connection.waitSynchronized();

// trade
console.log(await connection.createMarketBuyOrder('GBPUSD', 0.07, 0.9, 2.0, {comment: 'comment', clientId: 'TE_GBPUSD_7hyINWqAl'}));
console.log(await connection.createMarketSellOrder('GBPUSD', 0.07, 2.0, 0.9, {comment: 'comment', clientId: 'TE_GBPUSD_7hyINWqAl'}));
console.log(await connection.createLimitBuyOrder('GBPUSD', 0.07, 1.0, 0.9, 2.0, {comment: 'comment', clientId: 'TE_GBPUSD_7hyINWqAl'}));
console.log(await connection.createLimitSellOrder('GBPUSD', 0.07, 1.5, 2.0, 0.9, {comment: 'comment', clientId: 'TE_GBPUSD_7hyINWqAl'}));
console.log(await connection.createStopBuyOrder('GBPUSD', 0.07, 1.5, 0.9, 2.0, {comment: 'comment', clientId: 'TE_GBPUSD_7hyINWqAl'}));
console.log(await connection.createStopSellOrder('GBPUSD', 0.07, 1.0, 2.0, 0.9, {comment: 'comment', clientId: 'TE_GBPUSD_7hyINWqAl'}));
console.log(await connection.createStopLimitBuyOrder('GBPUSD', 0.07, 1.5, 1.4, 0.9, 2.0, {comment: 'comment', clientId: 'TE_GBPUSD_7hyINWqAl'}));
console.log(await connection.createStopLimitSellOrder('GBPUSD', 0.07, 1.0, 1.1, 2.0, 0.9, {comment: 'comment', clientId: 'TE_GBPUSD_7hyINWqAl'}));
console.log(await connection.modifyPosition('46870472', 2.0, 0.9));
console.log(await connection.closePositionPartially('46870472', 0.9));
console.log(await connection.closePosition('46870472'));
console.log(await connection.closeBy('46870472', '46870482'));
console.log(await connection.closePositionsBySymbol('EURUSD'));
console.log(await connection.modifyOrder('46870472', 1.0, 2.0, 0.9));
console.log(await connection.cancelOrder('46870472'));

// if you need to, check the extra result information in stringCode and numericCode properties of the response
const result = await connection.createMarketBuyOrder('GBPUSD', 0.07, 0.9, 2.0, {comment: 'comment', clientId: 'TE_GBPUSD_7hyINWqAlE'});
console.log('Trade successful, result code is ' + result.stringCode);
```

#### Trailing stop loss
Trailing stop loss is a trade option that allows you to automatically configure and change the order/position stop loss based on the 
current price of the symbol. The specified settings are run on the server and modify the stop loss regardless of your connection to the account.
The stop loss can be modified no more often than once in 15 seconds. Two types of trailing stop loss are available: 
distance stop loss and threshold stop loss, but both can be specified at the same time. You can find the full description here: 
[https://metaapi.cloud/docs/client/models/trailingStopLoss/](https://metaapi.cloud/docs/client/models/trailingStopLoss/)

```javascript
// distance trailing stop loss
console.log(await connection.createMarketBuyOrder('GBPUSD', 0.07, 0.9, 2.0, {
  trailingStopLoss: {
    distance: {
      distance: 200,
      units: 'RELATIVE_POINTS'
    }
  }
}));

// threshold trailing stop loss
console.log(await connection.createMarketBuyOrder('GBPUSD', 0.07, 0.9, 2.0, {
  trailingStopLoss: {
    threshold: {
      thresholds: [
        {
          threshold: 50,
          stopLoss: 100
        },
        {
          threshold: 100,
          stopLoss: 50
        }
      ],
      units: 'RELATIVE_POINTS'
    }
  }
}));
```

### Monitoring account connection health and uptime
You can monitor account connection health using MetaApiConnection.healthMonitor API.
```javascript
let monitor = connection.healthMonitor;
// retrieve server-side app health status
console.log(monitor.serverHealthStatus);
// retrieve detailed connection health status
console.log(monitor.healthStatus);
// retrieve account connection update measured over last 7 days
console.log(monitor.uptime);
```
