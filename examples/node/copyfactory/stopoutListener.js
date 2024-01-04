let CopyFactory = require('metaapi.cloud-sdk').CopyFactory;
let StopoutListener = require('metaapi.cloud-sdk').StopoutListener;

// your MetaApi API token
let token = process.env.TOKEN || '<put in your token here>';

const copyFactory = new CopyFactory(token);

class Listener extends StopoutListener {

  async onStopout(strategyStopoutEvent) {
    console.log('Strategy stopout event', strategyStopoutEvent);
  }

  async onError(error) {
    console.log('Error event', error);
  }

}

async function stopoutExample() {
  try {
    const listener = new Listener();

    let tradingApi = copyFactory.tradingApi;
    const listenerId = tradingApi.addStopoutListener(listener);

    // eslint-disable-next-line no-constant-condition
    while(true) {
      await new Promise(res => setTimeout(res, 10000));
    }

    // eslint-disable-next-line no-unreachable
    tradingApi.removeStopoutListener(listenerId);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

stopoutExample();
