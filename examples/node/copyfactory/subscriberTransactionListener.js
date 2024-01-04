let CopyFactory = require('metaapi.cloud-sdk').CopyFactory;
let TransactionListener = require('metaapi.cloud-sdk').TransactionListener;

// your MetaApi API token
let token = process.env.TOKEN || '<put in your token here>';

// your subscriber id
let subscriberId = process.env.SUBSCRIBER_ID || '<put in your subscriber id here>';

const copyFactory = new CopyFactory(token);

class Listener extends TransactionListener {

  async onTransaction(transactionEvent) {
    console.log('Transaction event', transactionEvent);
  }

  async onError(error) {
    console.log('Error event', error);
  }

}

async function transactionListenerExample() {
  try {
    const listener = new Listener();

    let historyApi = copyFactory.historyApi;
    const listenerId = historyApi.addSubscriberTransactionListener(listener, subscriberId);

    // eslint-disable-next-line no-constant-condition
    while(true) {
      await new Promise(res => setTimeout(res, 10000));
    }

    // eslint-disable-next-line no-unreachable
    historyApi.removeSubscriberTransactionListener(listenerId);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

transactionListenerExample();
