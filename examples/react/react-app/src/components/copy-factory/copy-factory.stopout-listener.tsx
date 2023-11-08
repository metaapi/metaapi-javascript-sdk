/* eslint-disable complexity */
/* eslint-disable max-len */
import { useEffect, useState, useRef } from 'react';

import MetaApi, { CopyFactory, StopoutListener } from 'metaapi.cloud-sdk';

import { 
  PrintLog, // for log
  Sections, Section, // Layout
  Form, Field // Form
} from '../../shared';

interface ICopyFactoryStopoutListenerProps {
  domain?: string
  token?: string
}

export function CopyFactoryStopoutListener({
  domain: defaultDomain,
  token: defaultToken
}: ICopyFactoryStopoutListenerProps) {
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

  // your MetaApi API token
  const [domain, setDomain] = useState<string>(defaultDomain || '');
  const [token, setToken] = useState<string>(defaultToken || '');

  const tradingApiRef = useRef<CopyFactory['tradingApi']>();
  const listenerIdRef = useRef<string>();

  /* Control */
  const reset = () => {
    setIsConnecting(false);
    setIsConnected(false);

    setResultLog([]);
    setErrorLog([]);

    setDomain(defaultDomain || '');
    setToken(defaultToken ||'');
  };

  const triggerToMakeRequest = () => {
    if (isConnected || !token) {
      return;
    }

    setIsConnecting(true);
  };
  
  useEffect(() => {
    class Listener extends StopoutListener {
      async onStopout(strategyStopoutEvent: any) {
        log('Strategy stopout event', strategyStopoutEvent);
      }
      async onError(error: any) {
        log('Error event', error);
      }
    }

    const makeRequest = async () => {
      const copyFactory = new CopyFactory(token, { domain });
      tradingApiRef.current = copyFactory.tradingApi;

      const metaApi = new MetaApi(token, { domain });
      const areTokenResourcesNarrowedDown = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token);
      setAreResourcesNarrowedDown(areTokenResourcesNarrowedDown);
      
      try {
        const listener = new Listener();
        listenerIdRef.current = tradingApiRef.current.addStopoutListener(listener);
        log('Start listening stopout events');
      }
      catch (err){
        logErr(err);
        throw err;
      }
    };

    const connect = async () => {
      try {
        await makeRequest();
        log('Wait 5 seconds');
        await new Promise(res => setTimeout(res, 5000));
        log('5 seconds passed');
      } catch (err) {
        console.log('failed', err);
      } finally {
        setIsConnecting(false);
      }
    };

    const disconnect = () => {
      if (listenerIdRef.current && tradingApiRef.current) {
        tradingApiRef.current.removeStopoutListener(listenerIdRef.current);
        listenerIdRef.current = undefined;
        log('Stop listening stopout events');
      }
    };
    
    if (isConnecting && !isConnected) {
      connect()
        .then(() => setIsConnected(true))
        .then(() => disconnect())
        .catch(() => setIsConnected(false))
        .finally(() => setIsConnecting(false));
    }

    return disconnect;
  }, [isConnecting, isConnected]);

  return (
    <Sections>
      <h1>CopyFactory. Stopout Listener</h1>

      <Section modifier="form">
        <h2>Connect to your account</h2>

        <Form 
          onSubmit={triggerToMakeRequest} onReset={reset}
          disabled={isConnecting || isConnected} done={isConnected}
        >
          <Field value={token} onChange={value => setToken(value)} label="Token"/>
          <Field value={domain} onChange={value => setDomain(value)} label="Domain"/>
        </Form>
      </Section>
      
      {!areResourcesNarrowedDown && <Section modifier="warning">
        <h2>Warning</h2>
        <p>It seems like you are using a admin API token.</p>
        <p>Since the token can be retrieven from the browser or mobile apps by end user this can lead to your application being compromised, unless you understand what are you doing.</p>
        <p>Please use <a href="https://github.com/agiliumtrade-ai/metaapi-node.js-sdk/blob/master/docs/tokenManagementApi.md" target="__blank">Token Management API</a> in your backend application to produce secure tokens which you can then use in web UI or mobile apps.</p>
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