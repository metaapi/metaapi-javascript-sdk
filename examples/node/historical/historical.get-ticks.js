const MetaApi = require('metaapi.cloud-sdk').default;

const accountId = process.env.ACCOUNT_ID || '<put in your account id here>';
const token = process.env.TOKEN || '<put in your token here>';

const domain = process.env.DOMAIN || 'agiliumtrade.agiliumtrade.ai';
const symbol = process.env.SYMBOL || 'EURUSD';

const api = new MetaApi(token, {domain});

// eslint-disable-next-line
async function retrieveHistoricalTicks() {
  try {
    const account = await api.metatraderAccountApi.getAccount(accountId);

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

    // retrieve last 10K 1m candles
    const pages = 10;
    console.log(`Downloading ${pages}K ticks for ${symbol} starting from 7 days ago`);
    
    const startedAt = Date.now();
    let startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let offset = 0;

    let ticks;
    for (let i = 0; i < pages; i++) {
      // the API to retrieve historical market data is currently available for G1 only
      // historical ticks can be retrieved from MT5 only
      ticks = await account.getHistoricalTicks(symbol, startTime, offset);
      console.log(`Downloaded ${ticks ? ticks.length : 0} historical ticks for ${symbol}`);
      if (ticks && ticks.length) {
        startTime = ticks[ticks.length - 1].time;
        offset = 0;
        while (ticks[ticks.length - 1 - offset] &&
          ticks[ticks.length - 1 - offset].time.getTime() === startTime.getTime()) {
          offset++;
        }
        console.log(`Last tick time is ${startTime}, offset is ${offset}`);
      }
    }
    if (ticks) {
      console.log('Last tick is', ticks[ticks.length - 1]);
    }
    console.log(`Took ${Date.now() - startedAt}ms`);

  } catch (err) {
    console.error(err);
  }
}

retrieveHistoricalTicks();
