let RiskManagement = require('metaapi.cloud-sdk').RiskManagement;
let TrackerEventListener = require('metaapi.cloud-sdk').TrackerEventListener;

// your MetaApi API token
let token = process.env.TOKEN || '<put in your token here>';
// your MetaApi account id
// the account must have field riskManagementApiEnabled set to true
let accountId = process.env.ACCOUNT_ID || '<put in your account id here>';
let domain = process.env.DOMAIN;

const riskManagement = new RiskManagement(token, {domain});
const riskManagementApi = riskManagement.riskManagementApi;

class ExampleTrackerEventListener extends TrackerEventListener {
  async onTrackerEvent(trackerEvent) {
    console.log('tracker event received', JSON.stringify(trackerEvent));
  }

  async onError(error) {
    console.log('error event received', error);
  }
}

async function main() {
  try {
    // creating a tracker
    let trackerId = await riskManagementApi.createTracker(accountId, {
      name: 'example-tracker',
      absoluteDrawdownThreshold: 5,
      period: 'day'
    });
    console.log('Created an event tracker ' + trackerId.id);

    // adding a tracker event listener
    let trackerEventListener = new ExampleTrackerEventListener(accountId, trackerId.id);
    let listenerId = riskManagementApi.addTrackerEventListener(trackerEventListener, accountId, trackerId.id);

    console.log('Streaming tracking events for 1 minute...');
    await new Promise(res => setTimeout(res, 1000 * 60));
    riskManagementApi.removeTrackerEventListener(listenerId);

    console.log('Receiving statistics with REST API');
    let events = await riskManagementApi.getTrackerEvents(undefined, undefined, accountId, trackerId.id);
    console.log('tracking events', JSON.stringify(events));
    let statistics = await riskManagementApi.getTrackingStatistics(accountId, trackerId.id);
    console.log('tracking statistics', JSON.stringify(statistics));
    let equityChart = await riskManagementApi.getEquityChart(accountId);
    console.log('equity chart', JSON.stringify(equityChart));

    // removing the tracker
    await riskManagementApi.deleteTracker(accountId, trackerId.id);
    console.log('Removed the tracker');
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

main();
