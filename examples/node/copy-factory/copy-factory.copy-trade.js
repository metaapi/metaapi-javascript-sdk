const MetaApi = require('metaapi.cloud-sdk').default;
const CopyFactory = require('metaapi.cloud-sdk').CopyFactory;

// your MetaApi API token
const token = process.env.TOKEN || '<put in your token here>';
// your provider MetaApi account id
// provider account must have PROVIDER value in copyFactoryRoles
const providerAccountId = process.env.PROVIDER_ACCOUNT_ID || '<put in your providerAccountId here>';
// your subscriber MetaApi account id
// subscriber account must have SUBSCRIBER value in copyFactoryRoles
const subscriberAccountId = process.env.SUBSCRIBER_ACCOUNT_ID || '<put in your subscriberAccountId here>';
const domain = process.env.DOMAIN || 'agiliumtrade.agiliumtrade.ai';

const api = new MetaApi(token);
const copyFactory = new CopyFactory(token);

async function configureCopyFactory() {
  try {
    let providerMetaapiAccount = await api.metatraderAccountApi.getAccount(providerAccountId);
    if(!providerMetaapiAccount.copyFactoryRoles || !providerMetaapiAccount.copyFactoryRoles.includes('PROVIDER')) {
      throw new Error('Please specify PROVIDER copyFactoryRoles value in your MetaApi account in ' +
        'order to use it in CopyFactory API');
    }

    let subscriberMetaapiAccount = await api.metatraderAccountApi.getAccount(subscriberAccountId);
    if(!subscriberMetaapiAccount.copyFactoryRoles || !subscriberMetaapiAccount.copyFactoryRoles.includes('SUBSCRIBER')) {
      throw new Error('Please specify SUBSCRIBER copyFactoryRoles value in your MetaApi account in ' +
        'order to use it in CopyFactory API');
    }

    let configurationApi = copyFactory.configurationApi;
    const strategies = await configurationApi.getStrategies();
    const strategy = strategies.find(s => s.accountId === providerMetaapiAccount.id);
    let strategyId;
    if(strategy) {
      strategyId = strategy._id;
    } else {
      strategyId = await configurationApi.generateStrategyId();
      strategyId = strategyId.id;
    }

    // create a strategy being copied
    await configurationApi.updateStrategy(strategyId, {
      name: 'Test strategy',
      description: 'Some useful description about your strategy',
      accountId: providerMetaapiAccount.id
    });

    // create subscriber
    await configurationApi.updateSubscriber(subscriberMetaapiAccount.id, {
      name: 'Test subscriber',
      subscriptions: [
        {
          strategyId: strategyId,
          multiplier: 1
        }
      ]
    });
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

configureCopyFactory();
