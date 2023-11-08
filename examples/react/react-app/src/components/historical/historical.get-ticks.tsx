/* eslint-disable max-len */
/* eslint-disable complexity */
import { useEffect, useState } from 'react';
import { 
  PrintLog, // for log
  Sections, Section, // Layout
  Form, Field // Form
} from '../../shared';
import MetaApi, { MetatraderAccount } from 'metaapi.cloud-sdk';

interface IHistoricalGetTicksProps {
  accountId?: string 
  domain?: string
  symbol?: string
  token?: string 
}
export function HistoricalGetTicks({
  token: defaultToken, accountId: defaultAccountId, symbol: defaultSymbol, domain: defaultDomain
}: IHistoricalGetTicksProps) {
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
  const [domain, setDomain] = useState<string>(defaultDomain || '');
  const [symbol, setSymbol] = useState<string>(defaultSymbol || '');
  const [token, setToken] = useState<string>(defaultToken || '');

  /* Connect to MetaApi */
  const connectToMetaApiAccount = async (): Promise<MetatraderAccount> => {
    /* Get instance of MetaApi with your MetaApi token */
    const metaApi = new MetaApi(token, { domain });
    const areTokenResourcesNarrowedDown = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token);
    setAreResourcesNarrowedDown(areTokenResourcesNarrowedDown);
    /* Get MetaTrader account */
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

    return account;
  };

  /* Interaction with metaapi */
  const fetchData = async () => {
    try {
      const account = await connectToMetaApiAccount();
      /* Retrieve last 10K 1m Ticks 
        The API to retrieve historical market data is currently available for G1 only
        historical ticks can be retrieved from MT5 only
      */
      const pages = 10;
      log(`Downloading ${pages}K latest Ticks for ${symbol}`);
      
      const startedAt = Date.now();
      let startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      let offset = 0;
      let ticks;

      for (let i = 0; i < pages; i++) {
        ticks = await account.getHistoricalTicks(symbol, startTime, offset);
        log( `Downloaded ${ticks ? ticks.length : 0} historical ticks for ${symbol}`);
        if (ticks && ticks.length) {
          startTime = ticks[ticks.length - 1].time;
          offset = 0;
          while (
            ticks[ticks.length - 1 - offset] &&
            ticks[ticks.length - 1 - offset].time.getTime() === startTime.getTime()
          ) { offset++; }

          log(`Last tick time is ${startTime}, offset is ${offset}`);
        }
      }

      if (ticks) {
        log('First tick is ', ticks[0]);
      }
      log(`Took ${Date.now() - startedAt}ms`,);
    } catch(err) {
      logErr(err);
      throw err;
    }
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
  
  return (
    <Sections>
      <h1>MetaApi. Historical Market Data. Get ticks</h1>

      <Section modifier="form">
        <h2>Connect to your account</h2>

        <Form 
          onSubmit={triggerToFetchData} onReset={reset}
          disabled={isConnecting || isConnected} done={isConnected}
        >
          <Field value={accountId} onChange={setAccountId} label="AccountId"/>
          <Field value={domain} onChange={setDomain} label="Domain"/>
          <Field value={symbol} onChange={setSymbol} label="Symbol"/>
          <Field value={token} onChange={setToken} label="Token"/>
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