/* eslint-disable max-len */
/* eslint-disable complexity */
import { useEffect, useState } from 'react';

import MetaApi, { EquityChartListener, RiskManagement } from 'metaapi.cloud-sdk';

import { 
  PrintLog, // for log
  Sections, Section, // Layout
  Form, Field // Form
} from '../../shared';

interface IRiskManagementEquityChartStreamProps {
  accountId?: string
  token?: string
  domain?: string
}
export function RiskManagementEquityChartStream({
  accountId: defaultAccountId,
  token: defaultToken,
  domain: defaultDomain
}: IRiskManagementEquityChartStreamProps) {
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
  const [domain, setDomain] = useState<string>(defaultDomain || '');
  const [token, setToken] = useState<string>(defaultToken || '');

  class EquityChartListenerLogged extends EquityChartListener {
    async onEquityRecordUpdated(equityChartEvent: unknown) {
      log('equity record updated event received', equityChartEvent);
    }

    async onEquityRecordCompleted() {
      log('equity record completed event received');
    }

    async onConnected() {
      log('on connected event received');
    }

    async onDisconnected() {
      log('on disconnected event received');
    }

    async onError(error: unknown) {
      logErr('Error event received', error);
    }
  }

  const fetchData = async () => {
    const metaApi = new MetaApi(token, { domain });
    const areTokenResourcesNarrowedDown = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token);
    setAreResourcesNarrowedDown(areTokenResourcesNarrowedDown);

    const riskManagement = new RiskManagement(token, { domain });
    const riskManagementApi = riskManagement.riskManagementApi;

    try {
      const equityChartListener = new EquityChartListenerLogged(accountId);
      const listenerId = await riskManagementApi.addEquityChartListener(equityChartListener, accountId);

      log('Streaming equity chart events for 1 minute...');
      await new Promise(res => setTimeout(res, 1000 * 60));

      riskManagementApi.removeEquityChartListener(listenerId);

      const equityChart = await riskManagementApi.getEquityChart(accountId);
      log('Equity chart', equityChart);
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
      <h1>Risk management. Equity chart stream</h1>

      <Section modifier="form">
        <h2>Connect to your account</h2>

        <Form 
          onSubmit={triggerToFetchData} onReset={reset}
          disabled={isConnecting || isConnected} done={isConnected}
        >
          <Field value={accountId} onChange={setAccountId} label="Account ID"/>
          <Field value={token} onChange={setToken} label="Token"/>
          <Field value={domain} onChange={setDomain} label="Domain"/>
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

