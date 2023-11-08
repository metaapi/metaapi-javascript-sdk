const RiskManagement = require('metaapi.cloud-sdk').RiskManagement;
const EquityBalanceListener = require('metaapi.cloud-sdk').EquityBalanceListener;

// your MetaApi API token
const token = process.env.TOKEN || '<put in your token here>';
// your MetaApi account id
// the account must have field riskManagementApiEnabled set to true
const accountId = process.env.ACCOUNT_ID || '<put in your account id here>';
const domain = process.env.DOMAIN;

const riskManagement = new RiskManagement(token, {domain});
const riskManagementApi = riskManagement.riskManagementApi;

class ExampleEquityBalanceListener extends EquityBalanceListener {
  async onEquityOrBalanceUpdated(equityBalanceData) {
    console.log('equity balance update received', equityBalanceData);
  }

  async onConnected() {
    console.log('on connected event received');
  }

  async onDisconnected() {
    console.log('on disconnected event received');
  }

  async onError(error) {
    console.log('error event received', error);
  }
}

async function main() {
  try {
    // adding an equity balance listener
    const equityBalanceListener = new ExampleEquityBalanceListener(accountId);
    const listenerId = await riskManagementApi.addEquityBalanceListener(equityBalanceListener, accountId);

    console.log('Streaming equity balance for 1 minute...');
    await new Promise(res => setTimeout(res, 1000 * 60));
    riskManagementApi.removeEquityBalanceListener(listenerId);
    console.log('Listener removed');
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

main();
