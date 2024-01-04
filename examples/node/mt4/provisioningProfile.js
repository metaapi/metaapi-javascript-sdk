const MetaApi = require('metaapi.cloud-sdk').default;

// Note: for information on how to use this example code please read https://metaapi.cloud/docs/client/usingCodeExamples
// It is recommended to create accounts with automatic broker settings detection instead,
// see metaApiSynchronizationExample.js

const token = process.env.TOKEN || '<put in your token here>';
const login = process.env.LOGIN || '<put in your MT login here>';
const password = process.env.PASSWORD || '<put in your MT password here>';
const serverName = process.env.SERVER || '<put in your MT server name here>';
const brokerSrvFile = process.env.PATH_TO_BROKER_SRV || '/path/to/your/broker.srv';

const api = new MetaApi(token);

// eslint-disable-next-line max-statements
async function testMetaApiSynchronization() {
  try {
    const profiles = await api.provisioningProfileApi.getProvisioningProfilesWithInfiniteScrollPagination();

    // create test MetaTrader account profile
    let profile = profiles.find(p => p.name === serverName);
    if (!profile) {
      console.log('Creating account profile');
      profile = await api.provisioningProfileApi.createProvisioningProfile({
        name: serverName,
        version: 4,
        brokerTimezone: 'EET',
        brokerDSTSwitchTimezone: 'EET'
      });
      await profile.uploadFile('broker.srv', brokerSrvFile);
    }
    if (profile && profile.status === 'new') {
      console.log('Uploading broker.srv');
      await profile.uploadFile('broker.srv', brokerSrvFile);
    } else {
      console.log('Account profile already created');
    }

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
        provisioningProfileId: profile.id,
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
    console.log('history orders:', historyStorage.historyOrders.slice(-5));

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
    console.log('Undeploying MT4 account so that it does not consume any unwanted resources');
    await connection.close();
    await account.undeploy();
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

testMetaApiSynchronization();
