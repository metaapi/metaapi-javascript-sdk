# metaapi.cloud SDK for node.js and browser javascript

MetaApi is a powerful, fast, cost-efficient, easy to use and standards-driven cloud forex trading API for MetaTrader 4 and MetaTrader 5 platform designed for traders, investors and forex application developers to boost forex application development process. MetaApi can be used with any broker and does not require you to be a brokerage.

CopyFactory is a simple yet powerful copy-trading API which is a part of MetaApi. See below for CopyFactory readme section.

MetaApi is a paid service, however we offer a free tier for testing and personal use.

The [MetaApi pricing](https://metaapi.cloud/#pricing) was developed with the intent to make your charges less or equal to what you would have to pay
for hosting your own infrastructure. This is possible because over time we managed to heavily optimize
our MetaTrader infrastructure. And with MetaApi you can save significantly on application development and
maintenance costs and time thanks to high-quality API, open-source SDKs and convenience of a cloud service.

Official REST and websocket API documentation: [https://metaapi.cloud/docs/client/](https://metaapi.cloud/docs/client/)

Please note that this SDK provides an abstraction over REST and websocket API to simplify your application logic.

For more information about SDK APIs please check esdoc documentation in source codes located inside lib folder of this npm package.

## Working code examples
Please check [this short video](https://youtu.be/dDOUWBjdfA4) to see how you can download samples via our web application.

You can also find code examples at [examples folder of our github repo](https://github.com/metaapi/metaapi-javascript-sdk/tree/master/examples) or in the examples folder of the npm package.

We have composed a [short guide explaining how to use the example code](https://metaapi.cloud/docs/client/usingCodeExamples/)

## Installation
```bash
npm install --save metaapi.cloud-sdk
```

## Installing SDK in browser SPA applications
```bash
npm install --save metaapi.cloud-sdk
```

Examples of integration with : 

1. [Angular](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/ui/angular.md)
2. [React](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/ui/react.md)
3. [Vue](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/ui/vue.md)

## Installing SDK in browser HTML applications
```html
<script src="unpkg.com/metaapi.cloud-sdk"></script>
<script>
  const token = '...';
  const api = new MetaApi.default(token);
</script>
```

Details of [integration into HTML](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/ui/html.md). 

## Connecting to MetaApi
Please use one of these ways: 
1. [https://app.metaapi.cloud/api-access/generate-token](https://app.metaapi.cloud/api-access/generate-token) web UI to obtain your API token.
2. An account access token which grants access to a single account. See section below on instructions on how to retrieve account access token.

Supply token to the MetaApi class constructor.

```javascript
import MetaApi from 'metaapi.cloud-sdk';

const token = '...';
const api = new MetaApi(token);
```

## Retrieving account access token
Account access token grants access to a single account. You can retrieve account access token via [token management API](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/tokenManagementApi.md#narrow-down-access-specific-applications-resources-and-roles):
```javascript
const accountId = '...';
const validityInHours = 24;
const accountAccessToken = await api.tokenManagementApi.narrowDownToken(
  {
    applications: ['trading-account-management-api', 'copyfactory-api', 'metaapi-rest-api', 'metaapi-rpc-api', 'metaapi-real-time-streaming-api', 'metastats-api', 'risk-management-api'],
    roles: ['reader'],
    resources: [{entity: 'account', id: accountId}]
  }, 
  validityInHours
);
console.log(accountAccessToken);
```

Alternatively, you can retrieve account access token via web UI. For that go to https://app.metaapi.cloud/accounts page and choose "Account access token" option in the trading account card actions menu.

## Table of contents
1. [MT account management](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/metaApi/managingAccounts.md)

2. [MetaApi RPC API](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/metaApi/rpcApi.md)

3. [MetaApi real-time streaming API (websocket API)](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/metaApi/streamingApi.md)

4. [Risk management API](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/riskManagement.md)

5. [CopyFactory copy trading API](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/copyTrading.md)

6. [MetaStats trading statistics API](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/metaStats.md)

7. [MetaApi MT manager API](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/managerApi.md)

8. [Tracking latencies](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/trackingLatencies.md)

9. [Enable log4js logging](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/logging.md)

10. [Rate limits & quotas](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/rateLimits.md)

11. [Token Management API](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/tokenManagementApi.md)

12. [Intergration for Web UI](https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/ui/index.md)