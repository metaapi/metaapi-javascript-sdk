/* eslint-disable complexity */
/* eslint-disable max-len */
import { useEffect, useRef, useState } from 'react';
import MetaApi, { StreamingMetaApiConnectionInstance, SynchronizationListener } from 'metaapi.cloud-sdk';

import { 
  PrintLog, // Logging
  Sections, Section, // Layout
  Form, Field // Form
} from '../../shared';

interface IStreamQuotesProps {
  accountId?: string
  token?: string
  domain?: string
  symbol?: string
}

export function StreamQuotes({
  accountId: defaultAccountId,
  symbol: defaultSymbol,
  domain: defaultDomain,
  token: defaultToken
} : IStreamQuotesProps) {
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
  const [symbol, setSymbol] = useState<string>(defaultSymbol || '');

  const connectionRef = useRef<StreamingMetaApiConnectionInstance>();

  /* Control */
  const reset = () => {
    setIsConnecting(false);
    setIsConnected(false);

    setResultLog([]);
    setErrorLog([]);

    setAccountId(defaultAccountId || '');
    setSymbol(defaultSymbol || '');
    setDomain(defaultDomain || '');
    setToken(defaultToken ||'');
  };
  
  const triggerToFetchData = () => {
    if (isConnected || !token) {
      return;
    }

    setIsConnecting(true);
  };

  useEffect(() => {
    class QuoteListener extends SynchronizationListener {
      async onSymbolPriceUpdated(instanceIndex: any, price: any) {
        if(price.symbol === symbol) {
          log(symbol + ' price updated', price);
        }
      }
      async onCandlesUpdated(instanceIndex: any, candles: any) {
        for (const candle of candles) {
          if (candle.symbol === symbol) {
            log(symbol + ' candle updated', candle);
          }
        }
      }
      async onTicksUpdated(instanceIndex: any, ticks: any) {
        for (const tick of ticks) {
          if (tick.symbol === symbol) {
            log(symbol + ' tick updated', tick);
          }
        }
      }
      async onBooksUpdated(instanceIndex: any, books: any) {
        for (const book of books) {
          if (book.symbol === symbol) {
            log(symbol + ' order book updated', book);
          }
        }
      }
      async onSubscriptionDowngraded(instanceIndex: any, _symbol: any, updates: any, unsubscriptions: any) {
        log('Market data subscriptions for ' + _symbol + ' were downgraded by the server due to rate limits');
      }
    }

    /* Connect to MetaApi */
    const connectToMetaApi = async (): Promise<StreamingMetaApiConnectionInstance> => {
    /* Get instance of MetaApi with your MetaApi token */
      const metaApi = new MetaApi(token, { domain });
      const areTokenResourcesNarrowedDown = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token);
      setAreResourcesNarrowedDown(areTokenResourcesNarrowedDown as boolean);

      /* Get MetaTrader account */
      const account = await metaApi.metatraderAccountApi.getAccount(accountId);

      // wait until account is deployed and connected to broker
      log('Deploying account');
      if (account.state !== 'DEPLOYED') {
        await account.deploy();
      } else {
        log('Account already deployed');
      }

      /* Get connection instance */
      log('Waiting for API server to connect to broker (may take couple of minutes)');
      if (account.connectionStatus !== 'CONNECTED') {
        await account.waitConnected();
      }
      const connection = account.getStreamingConnection();

      /* Add listener */
      const quoteListener = new QuoteListener();
      connection.addSynchronizationListener(quoteListener);

      /* Wait until connection is established */
      await connection.connect();
      await connection.waitSynchronized();

      return connection;
    };

    /* Interaction with metaapi */
    const makeRequest = async () => {
      try {
        log('Waiting for API server to connect to broker (may take couple of minutes)');
        connectionRef.current = await connectToMetaApi();

        // Add symbol to MarketWatch if not yet added and subscribe to market data
        // Please note that currently only G1 and MT4 G2 instances support extended subscription management
        // Other instances will only stream quotes in response
        // Market depth streaming is available in MT5 only
        // ticks streaming is not available for MT4 G1
        await connectionRef.current.subscribeToMarketData(symbol, [
          {type: 'quotes', intervalInMilliseconds: 5000},
          {type: 'candles', timeframe: '1m', intervalInMilliseconds: 10000},
          {type: 'ticks'},
          {type: 'marketDepth', intervalInMilliseconds: 5000}
        ]);
        log('Price after subscribe:', connectionRef.current.terminalState.price(symbol));

        log('[' + (new Date().toISOString()) + '] Synchronized successfully, streaming ' + symbol + ' market data now...');

      } catch (err) {
        logErr(err);
        throw err;
      }
    };

    const connect = async () => {
      try {
        await makeRequest();
        log('Start timer fort 60 seconds');
        await new Promise(res => setTimeout(res, 1000));
        log('60 seconds passed');
      } catch (err) {
        console.log('failed', err);
      } finally {
        setIsConnecting(false);
      }
    };

    const disconnect = () => {
      if (connectionRef.current) {
        connectionRef.current.unsubscribeFromMarketData(symbol, [
          {type: 'quotes'},
          {type: 'candles'},
          {type: 'ticks'},
          {type: 'marketDepth'}
        ]).then(() => {
          log('Stop listening stopout events');
        }).catch((err: any) => {
          logErr(err);
        });
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
      <h1>MetaApi. Stream Quotes</h1>

      <Section modifier="form">
        <h2>Connect to your account</h2>
        <Form 
          onSubmit={triggerToFetchData} onReset={reset}
          disabled={isConnecting || isConnected} done={isConnected}
        >
          <Field value={accountId} onChange={setAccountId} label="Account ID"/>
          <Field value={token} onChange={setToken} label="Token"/>
          <Field value={domain} onChange={setDomain} label="Domain"/>
          <Field value={symbol} onChange={setSymbol} label="Symbol"/>
        </Form>
      </Section>

      {!areResourcesNarrowedDown && <Section modifier="warning">
        <h2>Warning</h2>
        <p>It seems like you are using a admin API token.</p>
        <p>Since the token can be retrieven from the browser or mobile apps by end user this can lead to your application being compromised, unless you understand what are you doing.</p>
        <p>Please use <a href="httpsz://github.com/agiliumtrade-ai/metaapi-node.js-sdk/blob/master/docs/tokenManagementApi.md" target="__blank">Token Management API</a> in your backend application to produce secure tokens which you can then use in web UI or mobile apps.</p>
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