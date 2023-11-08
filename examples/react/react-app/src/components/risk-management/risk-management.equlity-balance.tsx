/* eslint-disable max-len */
/* eslint-disable complexity */
import { useEffect, useState } from 'react';

import MetaApi, { EquityBalanceListener, RiskManagement } from 'metaapi.cloud-sdk';

import { 
  PrintLog, // for log
  Sections, Section, // Layout
  Form, Field // Form
} from '../../shared';

interface IRiskManagementEqulityBalanceProps {
  accountId?: string
  token?: string
  domain?: string
}
export function RiskManagementEqulityBalance({
  accountId: defaultAccountId, token: defaultToken, domain: defaultDomain
}: IRiskManagementEqulityBalanceProps) {
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

  /*! STORE MAIN VARIABLE */
  const [accountId, setAccountId] = useState<string>(defaultAccountId || '');
  const [token, setToken] = useState<string>(defaultToken || '');
  const [domain, setDomain] = useState<string>(defaultDomain || 'agiliumtrade.agiliumtrade.ai');

  class ExampleEquityBalanceListener extends EquityBalanceListener {
    async onEquityOrBalanceUpdated(equityBalanceData: unknown) {
      log('equity balance update received', equityBalanceData);
    }

    async onConnected() {
      log('on connected event received');
    }

    async onDisconnected() {
      log('on disconnected event received');
    }

    async onError(error: unknown) {
      logErr(error);
    }
  }

  const fetchData = async () => {
    const metaApi = new MetaApi(token, { domain });
    const areTokenResourcesNarrowedDown = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token);
    setAreResourcesNarrowedDown(areTokenResourcesNarrowedDown);

    const riskManagement = new RiskManagement(token, { domain });
    const riskManagementApi = riskManagement.riskManagementApi;

    try {
      const equityBalanceListener = new ExampleEquityBalanceListener(accountId);
      const listenerId = await riskManagementApi.addEquityBalanceListener(equityBalanceListener, accountId);

      log('Streaming equity balance for 1 minute...');
      await new Promise(res => setTimeout(res, 1000 * 60));

      riskManagementApi.removeEquityBalanceListener(listenerId);
      log('Listener removed');
    } catch (err) {
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

    setAccountId(defaultAccountId || '');
    setToken(defaultToken ||'');
    setDomain(defaultDomain || '');
  };

  const triggerToFetchData = () => {
    if (isConnected || !accountId || !token) {return;}
    setIsConnecting(true);
  };
  
  /* Use one for control request and rerender */
  useEffect(() => {
    if (isConnected || !isConnecting) {
      return;
    }

    fetchData()
      .then(() => setIsConnected(true)) // If success
      .catch(err => console.log('failed', err)) // If failed
      .finally(() => setIsConnecting(false)); // Enable a interaction with UI

  }, [isConnecting]); // if change isConnecting run useEffect

  return (
    <Sections>
      <h1>Risk management. Equity balance example</h1>

      <Section modifier="form">
        <h2>Connect to your account</h2>

        <Form 
          onSubmit={triggerToFetchData} onReset={reset}
          disabled={isConnecting || isConnected} done={isConnected}
        >
          <Field value={accountId} onChange={value => setAccountId(value)} label="Account ID"/>
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

