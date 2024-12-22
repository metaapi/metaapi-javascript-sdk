const CopyFactory = require('metaapi.cloud-sdk').CopyFactory
const util = require('util');
const axios = require('axios');

// your MetaApi API token
let token = process.env.TOKEN || '<put in your token here>';
// your provider MetaApi account id
// provider account must have PROVIDER value in copyFactoryRoles
let providerAccountId = process.env.PROVIDER_ACCOUNT_ID || '<put in your providerAccountId here>';

const copyfactory = new CopyFactory(token);

async function main() {
  try {
    const configurationApi = copyfactory.configurationApi;
    const strategies = await configurationApi.getStrategiesWithInfiniteScrollPagination();
    const strategy = strategies.find(s => s.accountId === providerAccountId);
    let strategyId;
    if (strategy) {
      strategyId = strategy._id;
    } else {
      strategyId = await configurationApi.generateStrategyId();
      strategyId = strategyId.id;
    }

    console.log(`Creating a strategy ${strategyId} if it does not exist`);
    await configurationApi.updateStrategy(strategyId, {
      name: 'Test strategy',
      description: 'Some useful description about your strategy',
      accountId: providerAccountId
    });
    
    console.log('Creating a webhook');
    let webhook = await configurationApi.createWebhook(strategyId, {
      symbolMapping: [{from: 'EURUSD.m', to: 'EURUSD'}],
      magic: 100
    });
    console.log('Created webhook', webhook);

    console.log('Updating webhook');
    await configurationApi.updateWebhook(strategyId, webhook.id, {
      symbolMapping: [
        {from: 'EURUSD.m', to: 'EURUSD'},
        {from: 'BTCUSD.m', to: 'BTCUSD'}
      ],
      magic: 100
    });

    console.log('Retrieving webhooks with infinite scroll pagination');
    let webhooks1 = await configurationApi.getWebhooksWithInfiniteScrollPagination(strategyId);
    console.log('Retrieved webhooks', util.inspect(webhooks1, {depth: Infinity}));

    console.log('Retrieving webhooks with classic pagination');
    let webhooks2 = await configurationApi.getWebhooksWithClassicPagination(strategyId);
    console.log('Retrieved webhooks', util.inspect(webhooks2, {depth: Infinity}));

    console.log('Sending a trading signal to the webhook. Curl command:');
    let payload = {
      symbol: 'EURUSD',
      type: 'POSITION_TYPE_BUY',
      time: new Date().toISOString(),
      volume: 0.1
    };
    console.log(`curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '${
      JSON.stringify(payload, undefined, 2)
    }' '${webhook.url}'`);
    let response = await axios.post(webhook.url, payload);
    console.log('Sent the signal, signal ID: ' + response.data.signalId);

    console.log('Deleting webhook', webhook.id);
    await configurationApi.deleteWebhook(strategyId, webhook.id);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

main();
