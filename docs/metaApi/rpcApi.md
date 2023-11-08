## Access MetaTrader account via RPC API
RPC API let you query the trading terminal state. You should use
RPC API if you develop trading monitoring apps like myfxbook or other
simple trading apps.

### Query account information, positions, orders and history via RPC API
```javascript
const connection = account.getRPCConnection();

await connection.connect();
await connection.waitSynchronized();

// retrieve balance and equity
console.log(await connection.getAccountInformation());
// retrieve open positions
console.log(await connection.getPositions());
// retrieve a position by id
console.log(await connection.getPosition('1234567'));
// retrieve pending orders
console.log(await connection.getOrders());
// retrieve a pending order by id
console.log(await connection.getOrder('1234567'));
// retrieve history orders by ticket
console.log(await connection.getHistoryOrdersByTicket('1234567'));
// retrieve history orders by position id
console.log(await connection.getHistoryOrdersByPosition('1234567'));
// retrieve history orders by time range
console.log(await connection.getHistoryOrdersByTimeRange(startTime, endTime));
// retrieve history deals by ticket
console.log(await connection.getDealsByTicket('1234567'));
// retrieve history deals by position id
console.log(await connection.getDealsByPosition('1234567'));
// retrieve history deals by time range
console.log(await connection.getDealsByTimeRange(startTime, endTime));
```

### Query contract specifications and quotes via RPC API
```javascript
const connection = account.getRPCConnection();

await connection.connect();
await connection.waitSynchronized();

// first, subscribe to market data
await connection.subscribeToMarketData('GBPUSD');

// read symbols available
console.log(await connection.getSymbols());
// read constract specification
console.log(await connection.getSymbolSpecification('GBPUSD'));
// read current price
console.log(await connection.getSymbolPrice('GBPUSD'));

// unsubscribe from market data when no longer needed
await connection.unsubscribeFromMarketData('GBPUSD');
```

### Query historical market data via RPC API
Currently this API is supported on G1 and MT4 G2 only.

```javascript
// retrieve 1000 candles before the specified time
let candles = await account.getHistoricalCandles('EURUSD', '1m', new Date('2021-05-01'), 1000);

// retrieve 1000 ticks after the specified time
let ticks = account.getHistoricalTicks('EURUSD', new Date('2021-05-01'), 5, 1000);

// retrieve 1000 latest ticks
ticks = account.getHistoricalTicks('EURUSD', undefined, 0, 1000);
```

### Execute trades
```javascript
const connection = account.getRPCConnection();

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
