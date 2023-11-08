/* eslint-disable max-len */
/* eslint-disable complexity */
import { useEffect, useState } from 'react';

import MetaApi, { CopyFactory } from 'metaapi.cloud-sdk';

import { 
  PrintLog, // for log
  Sections, Section, // Layout
  Form, Field // Form
} from '../../shared';

interface ICopyFactoryTelegramProps {
  providerAccountId?: string
  botToken?: string
  chatId?: string
  domain?: string
  token?: string
}

export function CopyFactoryTelegram({
  providerAccountId: defaultProviderAccountId,
  botToken: defaultBotToken,
  chatId: defaultChatId,
  domain: defaultDomain,
  token: defaultToken
}: ICopyFactoryTelegramProps) {
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

  const [botToken, setBotToken] = useState<string>(defaultBotToken || '');
  const [chatId, setChatId] = useState<string>(defaultChatId || '');
  const [domain, setDomain] = useState<string>(defaultDomain || '');
  const [token, setToken] = useState<string>(defaultToken || '');

  /* 
    Your provider MetaApi account id
    provider account must have PROVIDER value in copyFactoryRoles
  */
  const [providerAccountId, setProviderAccountId] = useState<string>(defaultProviderAccountId || '');

  /* Control */
  const reset = () => {
    setIsConnecting(false);
    setIsConnected(false);

    setResultLog([]);
    setErrorLog([]);

    setProviderAccountId(defaultProviderAccountId || '');
    setBotToken(defaultBotToken || '');
    setChatId(defaultChatId || '');
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
    const makeRequest = async () => {
      const copyFactory = new CopyFactory(token, { domain });
      const metaApi = new MetaApi(token, { domain });
      const areTokenResourcesNarrowedDown = metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token);
      setAreResourcesNarrowedDown(areTokenResourcesNarrowedDown);


      const configurationApi = copyFactory.configurationApi;
      const tradingApi = copyFactory.tradingApi;
      
      try {
        log('Get provider account');
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

        log('Provider account received');
      
        const strategies = await configurationApi.getStrategies();
        const strategy = strategies.find((s) => s.accountId === providerMetaapiAccount.id);
        
        const strategyId = !strategy
          ? (await configurationApi.generateStrategyId()).id
          : strategy._id;
          
        /* Create a strategy being copied */
        log('Creating strategy');
        await configurationApi.updateStrategy(strategyId, {
          name: 'Test strategy',
          description: 'Some useful description about your strategy',
          accountId: providerMetaapiAccount.id,
          telegram: {
            publishing: {
              token: botToken,
              chatId: chatId,
              template: '${description}'
            }
          }
        });
        log('Strategy created');
        
        /* Send external signal */
        log('Sending external signal');
        const signalClient = await tradingApi.getSignalClient(providerMetaapiAccount.id);
        const signalId = signalClient.generateSignalId();
        await signalClient.updateExternalSignal(strategyId, signalId, {
          symbol: 'EURUSD',
          type: 'POSITION_TYPE_BUY',
          time: new Date(),
          volume: 0.01
        });
        log('External signal sent');
        
        log('Wait 5 seconds');
        await new Promise(res => setTimeout(res, 5000));
        log('5 seconds passed');

        /* Remove external signal */
        log('Removing external signal');
        await signalClient.removeExternalSignal(strategyId, signalId, {
          time: new Date()
        });
        log('External signal removed');
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
    
    if (isConnecting && !isConnected) {
      connect()
        .then(() => setIsConnected(true))
        .catch(() => setIsConnected(false))
        .finally(() => setIsConnecting(false));
    }
  }, [isConnecting, isConnected]);

  return (
    <Sections>
      <h1>CopyFactory. Telegram</h1>

      <Section modifier="form">
        <h2>Connect to your account</h2>

        <Form 
          onSubmit={triggerToMakeRequest} onReset={reset}
          disabled={isConnecting || isConnected} done={isConnected}
        >
          <Field value={providerAccountId} onChange={setProviderAccountId} label="Provider Account ID"/>
          <Field value={token} onChange={setToken} label="Token"/>
          <Field value={botToken} onChange={setBotToken} label="Bot token"/>
          <Field value={chatId} onChange={setChatId} label="Chat ID"/>
          <Field value={domain} onChange={setDomain} label="Domain"/>
        </Form>
      </Section>
      

      {!areResourcesNarrowedDown && <Section modifier="warning">
        <h2>Warning</h2>
        <p>It seems like you are using a admin API token.</p>
        <p>Since the token can be retrieven from the browser or mobile apps by end user this can lead to your application being compromised, unless you understand what are you doing.</p>
        <p>Please use <a href="httpsz://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/tokenManagementApi.md" target="__blank">Token Management API</a> in your backend application to produce secure tokens which you can then use in web UI or mobile apps.</p>
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