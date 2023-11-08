/* eslint-disable max-len */
const MetaApi = require('metaapi.cloud-sdk').default;

// Note: for information on how to use this example code please read https://metaapi.cloud/docs/client/usingCodeExamples

const token = process.env.TOKEN || '<put in your token here>';
const login = process.env.LOGIN || '<put in your MT login here>';
const password = process.env.PASSWORD || '<put in your MT password here>';
const serverName = process.env.SERVER || '<put in your MT server name here>';

const api = new MetaApi(token);

// eslint-disable-next-line max-statements
async function testMetaApiSynchronization() {
  try {
    // Add test MetaTrader account
    const accounts = await api.metatraderAccountApi.getAccountsWithInfiniteScrollPagination();
    let account = accounts.find(a => a.login === login && a.type.startsWith('cloud'));
    if (!account) {
      console.log('Adding MT5 account to MetaApi');
      account = await api.metatraderAccountApi.createAccount({
        name: 'Test account',
        type: 'cloud',
        login: login,
        password: password,
        server: serverName,
        platform: 'mt5',
        magic: 1000
      });
    } else {
      console.log('MT5 account already added to MetaApi', account.id);
    }

    // wait until account is deployed and connected to broker
    // eslint-disable-next-line semi
    console.log('Deploying account');
    await account.deploy();
    // eslint-disable-next-line semi
    console.log('Waiting for API server to connect to broker (may take couple of minutes)');
    await account.waitConnected();

    // connect to MetaApi API
    const connection = account.getRPCConnection();
    await connection.connect();

    // wait until terminal state synchronized to the local state
    console.log('Waiting for SDK to synchronize to terminal state (may take some time depending on your history size)');
    await connection.waitSynchronized();

    // invoke RPC API (replace ticket numbers with actual ticket numbers which exist in your MT account)
    console.log('Testing MetaAPI RPC API');
    console.log('account information:', await connection.getAccountInformation());
    console.log('positions:', await connection.getPositions());
    //console.log(await connection.getPosition('1234567'));
    console.log('open orders:', await connection.getOrders());
    //console.log(await connection.getOrder('1234567'));
    console.log('history orders by ticket:', await connection.getHistoryOrdersByTicket('1234567'));
    console.log('history orders by position:', await connection.getHistoryOrdersByPosition('1234567'));
    console.log('history orders (~last 3 months):', await connection.getHistoryOrdersByTimeRange(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()));
    console.log('history deals by ticket:', await connection.getDealsByTicket('1234567'));
    console.log('history deals by position:', await connection.getDealsByPosition('1234567'));
    console.log('history deals (~last 3 months):', await connection.getDealsByTimeRange(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()));
    console.log('server time', await connection.getServerTime());

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
        clientId: 'TE_GBPUSD_7hyINWqAlE'
      });
      console.log('Trade successful, result code is ' + result.stringCode);
    } catch (err) {
      console.log('Trade failed with result code ' + err.stringCode);
    }

    // finally, undeploy account after the test
    console.log('Undeploying MT5 account so that it does not consume any unwanted resources');
    await connection.close();
    await account.undeploy();
  } catch (err) {
    // process errors
    if(err.details) {
      // returned if the server file for the specified server name has not been found
      // recommended to check the server name or create the account using a provisioning profile
      if(err.details === 'E_SRV_NOT_FOUND') {
        console.error(err);
      // returned if the server has failed to connect to the broker using your credentials
      // recommended to check your login and password
      } else if (err.details === 'E_AUTH') {
        console.log(err);
      // returned if the server has failed to detect the broker settings
      // recommended to try again later or create the account using a provisioning profile
      } else if (err.details === 'E_SERVER_TIMEZONE') {
        console.log(err);
      }
    }
    console.error(err);
  }
  process.exit();
}

testMetaApiSynchronization();
