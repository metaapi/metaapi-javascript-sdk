/* eslint-disable max-len */
/* eslint-disable complexity */

import { useEffect, useState } from 'react';

import MetaApi, { CopyFactory } from 'metaapi.cloud-sdk';

import { 
  PrintLog, // for log
  Sections, Section, // Layout
  Form, Field // Form
} from '../../shared';

interface ICopyFactoryExternalSignalProps {
  providerAccountId?: string
  subscriberAccountId?: string
  domain?: string
  token?: string
}

export function CopyFactoryExternalSignal({
  providerAccountId: defaultProviderAccountId, 
  subscriberAccountId: defaultSubscriberAccountId, 
  domain: defaultDomain,
  token: defaultToken
}: ICopyFactoryExternalSignalProps) {
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
  const [token, setToken] = useState<string>(defaultToken || '');
  const [domain, setDomain] = useState<string>(defaultDomain || '');


  const makeRequest = async () => {
    const copyFactory = new CopyFactory(token, { domain });
    const metaApi = new MetaApi(token, { domain });
    const areTokenResourcesNarrowedDown = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token);
    setAreResourcesNarrowedDown(areTokenResourcesNarrowedDown);

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
      
      const configurationApi = copyFactory.configurationApi;
      
      const strategies = await configurationApi.getStrategies();
      const strategy = strategies.find((s) => s.accountId === providerMetaapiAccount.id);
      
      const strategyId = !strategy
        ? (await configurationApi.generateStrategyId()).id
        : strategy._id;
      
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
      
      /* Send external signal */
      const tradingApi = copyFactory.tradingApi;
      const signalClient = await tradingApi.getSignalClient(subscriberMetaapiAccount.id);
      const signalId = signalClient.generateSignalId();
      await signalClient.updateExternalSignal(
        strategyId, 
        signalId,
        {
          symbol: 'EURUSD',
          type: 'POSITION_TYPE_BUY',
          time: new Date(),
          volume: 0.01
        }
      );

      await new Promise(res => setTimeout(res, 10000));

      /* Output strategy external signals */
      const outputStrategyExternalSignals = await signalClient.getStrategyExternalSignals(strategyId);
      log('Output strategy external signals', outputStrategyExternalSignals);

      /* Output trading signals */
      const outputTradingSignals = await signalClient.getTradingSignals();
      log('Output trading signals', outputTradingSignals);

      /* Remove external signal */
      await signalClient.removeExternalSignal(
        strategyId, 
        signalId,
        { time: new Date() }
      );
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
    setDomain(defaultDomain || '');
    setToken(defaultToken ||'');
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
      <h1>CopyFactory. External Signal</h1>

      <Section modifier="form">
        <h2>Connect to your account</h2>

        <Form 
          onSubmit={triggerToMakeRequest} onReset={reset}
          disabled={isConnecting || isConnected} done={isConnected}
        >
          <Field value={providerAccountId} onChange={value => setProviderAccountId(value)} label="Provider Account ID"/>
          <Field value={subscriberAccountId} onChange={value => setSubscriberAccountId(value)} label="Subscriber Account ID"/>
          <Field value={token} onChange={value => setToken(value)} label="Token"/>
          <Field value={domain} onChange={value => setDomain(value)} label="Domain"/>
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