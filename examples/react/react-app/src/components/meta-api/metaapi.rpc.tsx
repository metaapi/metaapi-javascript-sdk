/* eslint-disable max-len */
/* eslint-disable complexity */
import { useEffect, useState } from 'react';

import MetaApi, { RpcMetaApiConnectionInstance } from 'metaapi.cloud-sdk';

import { 
  PrintLog, // Logging
  Sections, Section, // Layout
  Form, Field // Form
} from '../../shared';

interface IMetaApiRpcProps {
  accountId?: string
  token?: string
  domain?: string
}
export function MetaApiRpc({
  accountId: defaultAccountId, token: defaultToken , domain: defaultDomain
}: IMetaApiRpcProps) {
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

  /* Connect to MetaApi */
  const connectToMetaApi = async (): Promise<RpcMetaApiConnectionInstance> => {
    /* Get instance of MetaApi with your MetaApi token */
    const metaApi = new MetaApi(token, { domain });
    const areTokenResourcesNarrowedDown = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token);
    setAreResourcesNarrowedDown(areTokenResourcesNarrowedDown as boolean);
  
    /* Get MetaTrader account */
    const account = await metaApi.metatraderAccountApi.getAccount(accountId);

    /* Get connection instance */
    await account.waitConnected();
    const connection = account.getRPCConnection();

    /* Wait until connection is established */
    await connection.connect();
    await connection.waitSynchronized();

    return connection;
  };

  /* Interaction with metaapi */
  const fetchData = async () => {
    try {
      log('Waiting for API server to connect to broker (may take couple of minutes)');
      const connection = await connectToMetaApi();
      /* Invoke rpc api
          (replace ticket numbers with actual ticket 
            numbers which exist in your mt account)
      */
      const accountInformation = await connection.getAccountInformation();

      const positions = await connection.getPositions();
      // const position = await connection.getPosition('1234567');

      const orders = await connection.getOrders();
      // const order = await connection.getOrder('1234567');

      const historyOrdersByTimeRange = await connection.getHistoryOrdersByTimeRange(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 
        new Date());
      const historyDealsByTimeRange = await connection.getDealsByTimeRange(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 
        new Date());
      /*
      const historyOrdersByPosition = await connection.getHistoryOrdersByPosition('1234567');
      const historyOrdersByTicket = await connection.getHistoryOrdersByTicket('1234567');
      const historyDealsByPosition = await connection.getDealsByPosition('1234567');
      const historyDealsByTicket = await connection.getDealsByTicket('1234567');
      */

      const serverTime = await connection.getServerTime();

      log(
        'Testing terminal state access',
        'Account information', accountInformation,
        'Positions', positions,
        'Open orders', orders,
        'History orders (~last 3 months)', historyOrdersByTimeRange,
        'History deals (~last 3 months)', historyDealsByTimeRange,
        'Server time', serverTime ,
      );

      /* Calculate margin required for trade */
      const margin = await connection.calculateMargin({
        type: 'ORDER_TYPE_BUY',
        symbol: 'GBPUSD',
        openPrice: 1.1,
        volume: 0.1
      });
      
      log(
        'Calculate margin required for trade', 
        'margin required for trade',margin,
        'Submitting pending order'
      );

      try {
        // Trade
        const result = await connection.createLimitBuyOrder(
          'GBPUSD', 0.07, 1.0, 0.9, 2.0, 
          {
            clientId: 'TE_GBPUSD_7hyINWqAlE',
            comment: 'comm'
          }
        );

        log( 'Trade successful', 'Result code: ', result.stringCode);
      } catch (err) {
        log('Trade failed', err);
        logErr('Trade failed with result code', err);
      }
    } catch (err) {
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
      <h1>MetaApi. RPC API</h1>

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