/* eslint-disable max-len */
/* eslint-disable complexity */
import { useEffect, useState } from 'react';

import MetaApi, { CopyFactory } from 'metaapi.cloud-sdk';

import { 
  PrintLog, // for log
  Sections, Section, // Layout
  Form, Field // Form
} from '../../shared';

interface ICopyFactoryCopyTradeProps {
  providerAccountId?: string
  subscriberAccountId?: string
  domain?: string
  token?: string
}

export function CopyFactoryCopyTrade({
  providerAccountId: defaultProviderAccountId, 
  subscriberAccountId: defaultSubscriberAccountId, 
  domain: defaultDomain,
  token: defaultToken
}: ICopyFactoryCopyTradeProps) {
  /* UI control */
  const [areResourcesNarrowedDown, setAreResourcesNarrowedDown] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  /* Logging */
  const [resultLog, setResultLog] = useState<unknown[]>([]);  
  const [errorLog, setErrorLog] = useState<unknown[]>([]);

  const logErr = (...args: unknown[]) => setErrorLog(logs => {
    console.log(...args);
    return [...logs, ...args.map((arg: any) => arg.message || arg)];
  });
  const log = (...args: unknown[]) => setResultLog(logs => {
    console.log(...args);
    return [...logs, ...args];
  });

  /* 
    Your provider MetaApi account id
    provider account must have PROVIDER value in copyFactoryRoles
  */
  const [providerAccountId, setProviderAccountId] = useState<string>(defaultProviderAccountId || '');
  /* 
    Your subscriber MetaApi account id
    subscriber account must have SUBSCRIBER value in copyFactoryRoles
  */
  const [subscriberAccountId, setSubscriberAccountId] = useState<string>(defaultSubscriberAccountId || '');

  // your MetaApi API token
  const [domain, setDomain] = useState<string>(defaultDomain || '');
  const [token, setToken] = useState<string>(defaultToken || '');

  const makeRequest = async () => {
    const copyFactory = new CopyFactory(token, { domain });
    const metaApi = new MetaApi(token, { domain });
    const areTokenResourcesNarrowedDown = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token);
    setAreResourcesNarrowedDown(areTokenResourcesNarrowedDown);
    
    const configurationApi = copyFactory.configurationApi;

    try {
      const providerMetaapiAccount = await metaApi.metatraderAccountApi.getAccount(providerAccountId);
      if(
        !providerMetaapiAccount.copyFactoryRoles || 
        !providerMetaapiAccount.copyFactoryRoles.includes('PROVIDER')
      ) {
        throw new Error(
          'Please specify PROVIDER copyFactoryRoles value in your MetaApi account in ' +
          'order to use it in CopyFactory API'
        );
      }
      
      const subscriberMetaapiAccount = await metaApi.metatraderAccountApi.getAccount(subscriberAccountId);
      if(
        !subscriberMetaapiAccount.copyFactoryRoles || 
        !subscriberMetaapiAccount.copyFactoryRoles.includes('SUBSCRIBER')
      ) {
        throw new Error(
          'Please specify SUBSCRIBER copyFactoryRoles value in your MetaApi account in ' +
          'order to use it in CopyFactory API'
        );
      }
      
      const strategies = await configurationApi.getStrategies();
      const strategy = strategies.find((s: any) => s.accountId === providerMetaapiAccount.id);
      
      const strategyId = !strategy
        ? (await configurationApi.generateStrategyId()).id
        : strategy._id;
        
      /* Create a strategy being copied */
      log('Creating strategy');
      await configurationApi.updateStrategy(strategyId, {
        name: 'Test strategy',
        description: 'Some useful description about your strategy',
        accountId: providerMetaapiAccount.id
      });

      log('Strategy created', 'Creating subscriber');
      /* Create subscriber */
      await configurationApi.updateSubscriber(subscriberMetaapiAccount.id, {
        name: 'Test subscriber',
        subscriptions: [
          {
            strategyId: strategyId,
            multiplier: 1
          }
        ]
      });
      log('Subscriber created');
    }
    catch (err){
      logErr(err);
      throw err;
    }
  };

  /* Control */
  const reset = () => {
    setIsConnecting(false);
    setIsConnected(false);

    setResultLog([]);
    setErrorLog([]);

    setProviderAccountId(defaultProviderAccountId || '');
    setSubscriberAccountId(defaultSubscriberAccountId || '');
    setToken(defaultToken ||'');
    setDomain(defaultDomain || '');
  };

  const triggerToMakeRequest = () => {
    if (isConnected || !providerAccountId || !subscriberAccountId || !token) {return;}
    setIsConnecting(true);
  };
  
  /* Use one for control request and rerender */
  useEffect(() => {
    if (isConnected || !isConnecting) {
      return;
    }

    makeRequest()
      .then(() => setIsConnected(true)) // If success
      .catch(err => console.log('failed', err)) // If failed
      .finally(() => setIsConnecting(false)); // Enable a interaction with UI

  }, [isConnecting]); // if change isConnecting run useEffect

  return (
    <Sections>
      <h1>CopyFactory. Copy Trade</h1>

      <Section modifier="form">
        <h2>Connect to your account</h2>

        <Form 
          onSubmit={triggerToMakeRequest} onReset={reset}
          disabled={isConnecting || isConnected} done={isConnected}
        >
          <Field value={providerAccountId} onChange={setProviderAccountId} label="Provider Account ID"/>
          <Field value={subscriberAccountId} onChange={setSubscriberAccountId} label="Subscriber Account ID"/>
          <Field value={token} onChange={setToken} label="Token"/>
          <Field value={domain} onChange={setDomain} label="Domain"/>
        </Form>
      </Section>

      {!areResourcesNarrowedDown && <Section modifier="warning">
        <h2>Warning</h2>
        <p>It seems like you are using a admin API token.</p>
        <p>Since the token can be retrieven from the browser or mobile apps by end user this can lead to your application being compromised, unless you understand what are you doing.</p>
        <p>Please use <a href="https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/tokenManagementApi.md" target="__blank">Token Management API</a> in your backend application to produce secure tokens which you can then use in web UI or mobile apps.</p>
      </Section>}

      {resultLog && resultLog.length > 0 && <Section modifier="results">
        <h2>Logs</h2>
        <PrintLog items={resultLog} />
      </Section>}

      {errorLog && errorLog.length > 0 && <Section modifier="errors">
        <h2>Errors</h2>
        <PrintLog items={errorLog} />
      </Section>}
    </Sections>
  );
}