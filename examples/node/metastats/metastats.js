let MetaStats = require('metaapi.cloud-sdk').MetaStats;
let MetaApi = require('metaapi.cloud-sdk').default;

// your MetaApi API token
let token = process.env.TOKEN || '<put in your token here>';
// your MetaApi account id
let accountId = process.env.ACCOUNT_ID || '<put in your MetaApi account id here>';
// your MetaApi account
let account;

const api = new MetaApi(token);
const metaStats = new MetaStats(token);
// you can configure http client via second parameter,
// see esdoc in-code documentation for full definition of possible configuration options

async function accountDeploy() {
  try {
    account = await api.metatraderAccountApi.getAccount(accountId);

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

  } catch (err) {
    console.error(err);
  }
}

accountDeploy();

async function getAccountMetrics() {
  try {
    let metrics = await metaStats.getMetrics(accountId);
    console.log(metrics);//-> {trades: ..., balance: ..., ...}

  } catch (err) {
    console.error(err);
  }
  process.exit();
}

getAccountMetrics();

async function getAccountTrades(startTime, endTime) {
  try {
    let trades = await metaStats.getAccountTrades(accountId, startTime, endTime);
    console.log(trades.slice(-5));//-> {_id: ..., gain: ..., ...}

  } catch (err) {
    console.error(err);
  }
  process.exit();
}

getAccountTrades('2020-01-01 00:00:00.000', '2021-01-01 00:00:00.000');

async function getAccountOpenTrades() {
  try {
    let openTrades = await metaStats.getAccountOpenTrades(accountId);
    console.log(openTrades);//-> {_id: ..., gain: ..., ...}

  } catch (err) {
    console.error(err);
  }
  process.exit();
}

getAccountOpenTrades();
