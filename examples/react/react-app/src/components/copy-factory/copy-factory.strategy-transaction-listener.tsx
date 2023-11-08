/* eslint-disable max-len */
/* eslint-disable complexity */

import { useEffect, useState, useRef } from 'react';

import MetaApi, { CopyFactory, TransactionListener } from 'metaapi.cloud-sdk';

import { 
  PrintLog, // for log
  Sections, Section, // Layout
  Form, Field // Form
} from '../../shared';

interface ICopyFactoryStrategyTransactionListenerProps {
  strategyId?: string
  domain?: string
  token?: string
}

export function CopyFactoryStrategyTransactionListener({
  strategyId: defaltStrategyId,
  domain: defaultDomain,
  token: defaultToken
}: ICopyFactoryStrategyTransactionListenerProps) {
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

  const [domain, setDomain] = useState<string>(defaultDomain || '');
  /* your MetaApi API token */
  const [token, setToken] = useState<string>(defaultToken || '');

  const [strategyId, setStrategyId] = useState<string>(defaltStrategyId || '');


  const historyApiRef = useRef<CopyFactory['historyApi']>();
  const listenerIdRef = useRef<string>();

  /* Control */
  const reset = () => {
    setIsConnecting(false);
    setIsConnected(false);

    setResultLog([]);
    setErrorLog([]);

    setStrategyId(defaltStrategyId || '');
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
    class Listener extends TransactionListener {
      async onTransaction(transactionEvent: any) {
        log('Transaction event', transactionEvent);
      }

      async onError(error: any) {
        log('Error event', error);
      }
    }

    const makeRequest = async () => {
      const copyFactory = new CopyFactory(token, { domain });
      historyApiRef.current = copyFactory.historyApi;

      const metaApi = new MetaApi(token, { domain });
      const areTokenResourcesNarrowedDown = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token);
      setAreResourcesNarrowedDown(areTokenResourcesNarrowedDown);
      
      try {
        const listener = new Listener();
        listenerIdRef.current = historyApiRef.current.addStrategyTransactionListener(listener, strategyId);
        log('Add listener for strategy transaction');
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
      if (listenerIdRef.current && historyApiRef.current) {
        historyApiRef.current.removeStrategyTransactionListener(listenerIdRef.current);
        listenerIdRef.current = undefined;
        log('Remove listener for strategy transaction');
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
      <h1>CopyFactory. Strategy transaction listener</h1>

      <Section modifier="form">
        <h2>Connect to your account</h2>

        <Form 
          onSubmit={triggerToMakeRequest} onReset={reset}
          disabled={isConnecting || isConnected} done={isConnected}
        >
          <Field value={strategyId} onChange={setStrategyId} label="Strategy ID"/>
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