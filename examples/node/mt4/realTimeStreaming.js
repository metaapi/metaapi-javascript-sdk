const MetaApi = require('metaapi.cloud-sdk').default;

// Note: for information on how to use this example code please read https://metaapi.cloud/docs/client/usingCodeExamples

const token = process.env.TOKEN || '<put in your token here>';
const login = process.env.LOGIN || '<put in your MT login here>';
const password = process.env.PASSWORD || '<put in your MT password here>';
const serverName = process.env.SERVER || '<put in your MT server name here>';

const api = new MetaApi(token);

// eslint-disable-next-line max-statements, complexity
async function testMetaApiSynchronization() {
  try {
    // Add test MetaTrader account
    const accounts = await api.metatraderAccountApi.getAccountsWithInfiniteScrollPagination();
    let account = accounts.find(a => a.login === login && a.type.startsWith('cloud'));
    if (!account) {
      console.log('Adding MT4 account to MetaApi');
      account = await api.metatraderAccountApi.createAccount({
        name: 'Test account',
        type: 'cloud',
        login: login,
        password: password,
        server: serverName,
        platform: 'mt4',
        magic: 1000
      });
    } else {
      console.log('MT4 account already added to MetaApi');
    }

    // wait until account is deployed and connected to broker
    console.log('Deploying account');
    await account.deploy();
    console.log('Waiting for API server to connect to broker (may take couple of minutes)');
    await account.waitConnected();

    // connect to MetaApi API
    const connection = account.getStreamingConnection();
    await connection.connect();

    // wait until terminal state synchronized to the local state
    console.log('Waiting for SDK to synchronize to terminal state (may take some time depending on your history size)');
    await connection.waitSynchronized();

    // access local copy of terminal state
    console.log('Testing terminal state access');
    const terminalState = connection.terminalState;
    console.log('connected:', terminalState.connected);
    console.log('connected to broker:', terminalState.connectedToBroker);
    console.log('account information:', terminalState.accountInformation);
    console.log('positions:', terminalState.positions);
    console.log('orders:', terminalState.orders);
    console.log('specifications:', terminalState.specifications);
    console.log('EURUSD specification:', terminalState.specification('EURUSD'));
    await connection.subscribeToMarketData('EURUSD');
    console.log('EURUSD price:', terminalState.price('EURUSD'));

    // access history storage
    const historyStorage = connection.historyStorage;
    console.log('deals:', historyStorage.deals.slice(-5));
    console.log('deals with id=1:', historyStorage.getDealsByTicket(1));
    console.log('deals with positionId=1:', historyStorage.getDealsByPosition(1));
    // eslint-disable-next-line max-len
    console.log('deals for the last day:', historyStorage.getDealsByTimeRange(new Date(Date.now() - 24 * 60 * 60 * 1000),
      new Date()));
    console.log('history orders:', historyStorage.historyOrders.slice(-5));
    console.log('history orders with id=1:', historyStorage.getHistoryOrdersByTicket(1));
    console.log('history orders with positionId=1:', historyStorage.getHistoryOrdersByPosition(1));
    console.log('history orders for the last day:', historyStorage.getHistoryOrdersByTimeRange(
      new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()));

    // calculate margin required for trade
    console.log('margin required for trade', await connection.calculateMargin({
      symbol: 'GBPUSD',
      type: 'ORDER_TYPE_BUY',
      volume: 0.1,
      openPrice: 1.1
    }));    

    // trade
    console.log('Submitting pending order');
    try {
      const result = await
      connection.createLimitBuyOrder('GBPUSD', 0.07, 1.0, 0.9, 2.0, {
        comment: 'comm',
        clientId: 'TE_GBPUSD_7hyINWqAlE',
        expiration: {
          type: 'ORDER_TIME_SPECIFIED',
          time: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });
      console.log('Trade successful, result code is ' + result.stringCode);
    } catch (err) {
      console.log('Trade failed with result code ' + err.stringCode);
    }

    // finally, undeploy account after the test
    console.log('Undeploying MT4 account so that it does not consume any unwanted resources');
    await connection.close();
    await account.undeploy();
  } catch (err) {
    // process errors
    if(err.details) {
      // returned if the server file for the specified server name has not been found
      // recommended to check the server name or create the account using a provisioning profile
      if(err.details.code === 'E_SRV_NOT_FOUND') {
        console.error(err);
      // returned if the server has failed to connect to the broker using your credentials
      // recommended to check your login and password
      } else if (err.details === 'E_AUTH') {
        console.log(err);
      // returned if the server has failed to detect the broker settings
      // recommended to try again later or create the account using a provisioning profile
      } else if (err.details === 'E_SERVER_TIMEZONE') {
        console.log(err);
      // returned if provided resource slots amount is lower than estimated for the account
      } else if (err.details.code === 'E_RESOURCE_SLOTS') {
        console.log(err);
      }
    }
    console.error(err);
  }
  process.exit();
}

testMetaApiSynchronization();
