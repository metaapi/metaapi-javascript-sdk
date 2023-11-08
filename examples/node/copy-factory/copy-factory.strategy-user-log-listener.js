let CopyFactory = require('metaapi.cloud-sdk').CopyFactory;
let UserLogListener = require('metaapi.cloud-sdk').UserLogListener;

// your MetaApi API token
let token = process.env.TOKEN || '<put in your token here>';

// your strategy id
let strategyId = process.env.STRATEGY_ID || '<put in your strategy id here>';

const copyFactory = new CopyFactory(token);

class Listener extends UserLogListener {

  async onUserLog(logEvent) {
    console.log('Log event', logEvent);
  }

  async onError(error) {
    console.log('Error event', error);
  }

}

async function userLogListenerExample() {
  try {
    const listener = new Listener();

    let tradingApi = copyFactory.tradingApi;
    const listenerId = tradingApi.addStrategyLogListener(listener, strategyId);

    // eslint-disable-next-line no-constant-condition
    while(true) {
      await new Promise(res => setTimeout(res, 10000));
    }

    // eslint-disable-next-line no-unreachable
    tradingApi.removeStrategyLogListener(listenerId);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

userLogListenerExample();
