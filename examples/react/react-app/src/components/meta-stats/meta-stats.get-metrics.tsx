/* eslint-disable max-len */
/* eslint-disable complexity */
import { useEffect, useState } from 'react';

import MetaApi, { MetaStats } from 'metaapi.cloud-sdk';

import { 
  PrintLog, // Logging
  Sections, Section, // Layout
  Form, Field // Form
} from '../../shared';

interface IMetaStatsGetMetricsProps {
  accountId?: string
  domain?: string
  token?: string
}
export function MetaStatsGetMetrics({
  accountId: defaultAccountId, token: defaultToken , domain: defaultDomain
}: IMetaStatsGetMetricsProps) {
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

  /* Store main variables */
  const [accountId, setAccountId] = useState<string>(defaultAccountId || '');
  const [token, setToken] = useState<string>(defaultToken || '');
  const [domain, setDomain] = useState<string>(defaultDomain || '');

  /* UI control */
  const reset = () => {
    setIsConnecting(false);
    setIsConnected(false);
    
    setResultLog([]);
    setErrorLog([]);

    setAccountId(defaultAccountId || '');
    setDomain(defaultDomain || '');
    setToken(defaultToken ||'');
  };

  const triggerToFetchData = () => {
    if (isConnected || !accountId || !token) {return;}
    setIsConnecting(true);
  };

  useEffect(() => {
    const deployAccount = async () => {
      const metaApi = new MetaApi(token, { domain });
      const areTokenResourcesNarrowedDown = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token);
      setAreResourcesNarrowedDown(areTokenResourcesNarrowedDown);
      try {
        const account = await metaApi.metatraderAccountApi.getAccount(accountId);

        /* Wait until account is deployed and connected to broker */
        log('Deploying account');
        if (account.state !== 'DEPLOYED') {
          await account.deploy();
        } else {
          log('Account already deployed');
        }
        log('Waiting for API server to connect to broker (may take couple of minutes)');
        if (account.connectionStatus !== 'CONNECTED') {
          await account.waitConnected();
        }

      } catch (err) {
        logErr(err);
      }
    };

    const fetchAccountMetrics = async () => {
      const metaStats = new MetaStats(token, { domain });
      try {
        log('Fetching account metrics');
        const metrics = await metaStats.getMetrics(accountId);
        log(metrics);

      } catch (err) {
        logErr(err);
      }
    };

    const fetchData = async () => {
      try {
        await deployAccount();
        await fetchAccountMetrics();
      } catch (err) {
        logErr(err);
      }
    };

    if (!isConnected && isConnecting) {
      fetchData()
        .then(() => setIsConnected(true))
        .catch(() => setIsConnected(false))
        .finally(() => setIsConnecting(false));
    }

  }, [isConnecting]);

  return (
    <Sections>
      <h1>MetaStats. Get metrics</h1>

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