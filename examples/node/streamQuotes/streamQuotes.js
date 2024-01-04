let MetaApi = require('metaapi.cloud-sdk').default;
let SynchronizationListener = require('metaapi.cloud-sdk').SynchronizationListener;

let token = process.env.TOKEN || '<put in your token here>';
let accountId = process.env.ACCOUNT_ID || '<put in your account id here>';
let symbol = process.env.SYMBOL || 'EURUSD';
let domain = process.env.DOMAIN || 'agiliumtrade.agiliumtrade.ai';

const api = new MetaApi(token, {domain});

class QuoteListener extends SynchronizationListener {
  async onSymbolPriceUpdated(instanceIndex, price) {
    if(price.symbol === symbol) {
      console.log(symbol + ' price updated', price);
    }
  }
  async onCandlesUpdated(instanceIndex, candles) {
    for (const candle of candles) {
      if (candle.symbol === symbol) {
        console.log(symbol + ' candle updated', candle);
      }
    }
  }
  async onTicksUpdated(instanceIndex, ticks) {
    for (const tick of ticks) {
      if (tick.symbol === symbol) {
        console.log(symbol + ' tick updated', tick);
      }
    }
  }
  async onBooksUpdated(instanceIndex, books) {
    for (const book of books) {
      if (book.symbol === symbol) {
        console.log(symbol + ' order book updated', book);
      }
    }
  }
  async onSubscriptionDowngraded(instanceIndex, _symbol, updates, unsubscriptions) {
    console.log('Market data subscriptions for ' + _symbol + ' were downgraded by the server due to rate limits');
  }
}

// eslint-disable-next-line
async function streamQuotes() {
  try {
    let account = await api.metatraderAccountApi.getAccount(accountId);

    // wait until account is deployed and connected to broker
    console.log('Deploying account');
    if (account.state !== 'DEPLOYED') {
      await account.deploy();
    } else {
      console.log('Account already deployed');
    }
    console.log('Waiting for API server to connect to broker (may take couple of minutes)');
    if (account.connectionStatus !== 'CONNECTED') {
      await account.waitConnected();
    }

    // create connection
    let connection = account.getStreamingConnection();

    // add listener
    const quoteListener = new QuoteListener();
    connection.addSynchronizationListener(quoteListener);

    // connect to MetaApi API
    await connection.connect();

    // wait until terminal state synchronized to the local state
    console.log('Waiting for SDK to synchronize to terminal state (may take some time depending on your history ' +
        'size), the price streaming will start once synchronization finishes');
    await connection.waitSynchronized();

    // Add symbol to MarketWatch if not yet added and subscribe to market data
    // Please note that currently only G1 and MT4 G2 instances support extended subscription management
    // Other instances will only stream quotes in response
    // Market depth streaming is available in MT5 only
    // ticks streaming is not available for MT4 G1
    await connection.subscribeToMarketData(symbol, [
      {type: 'quotes', intervalInMilliseconds: 5000},
      {type: 'candles', timeframe: '1m', intervalInMilliseconds: 10000},
      {type: 'ticks'},
      {type: 'marketDepth', intervalInMilliseconds: 5000}
    ]);
    console.log('Price after subscribe:', connection.terminalState.price(symbol));

    console.log('[' + (new Date().toISOString()) + '] Synchronized successfully, streaming ' + symbol +
      ' market data now...');

    // eslint-disable-next-line
    while(true){
      await new Promise(res => setTimeout(res, 1000));
    }

  } catch (err) {
    console.error(err);
  }
}

streamQuotes();
