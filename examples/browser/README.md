<div align="center">
  <img src="https://metaapi.cloud/favicon.ico" alt="Logo-MetaApi" width="50" height="50"/> 
</div>

# MetaApi example using in browser

How to use MetaApi in browser.

## Prerequisites

* A valid MetaApi API token (you can get one by signing up for a MetaApi account)
* A MetaTrader account connected to MetaApi

## Installation

Include CDN link to MetaApi SDK in your HTML file:

```html
<!-- For UMD -->
<script src="unpkg.com/metaapi.cloud-sdk"></script>

<!-- For ES6 -->
<script module src="unpkg.com/metaapi.cloud-sdk"></script>
```

## Using

In the case of using UMD to get a MetaApi instance, use:

``` html
<script>
  // Get instance of MetaApi with your MetaApi token
  const metaApi = new MetaApi.default(token);

  // To use another MetaApi SDK api use:
  const { RiskManagement, CopyFactory /* , ...etc */ } = MetaApi;
</script>
```

In the case of using ES6 to get MetaApi instance use:

``` html
<script>
  // Get instance of MetaApi with your MetaApi token
  import MetaApi, { RiskManagement, CopyFactory /* , ...etc */ } from 'metaapi.cloud-sdk';
</script>

```

Create instance of MetaApi with your MetaApi token:

``` javascript
// Get instance of MetaApi with your MetaApi token
const metaApi = new MetaApi(token);
```

Establish connection with MetaTrader account.

``` javascript
const account = await metaApi.metatraderAccountApi.getAccount(accountId);

// Get connection instance
await account.waitConnected();
const connection = account.getRPCConnection();

/* For WS connection use:
const connection = account.getStreamingConnection();
*/ 

// Wait until connection is established
await connection.connection();
await connection.waitSynchronized();
```

Use _connection_ to work with API:

``` javascript
// Get account information
const accountInformation = await connection.getAccountInformation();
```

## More integration examples

- [Browser](https://github.com/agiliumtrade-ai/metaapi-node.js-sdk/tree/master/examples/browser)
- [Angular](https://github.com/agiliumtrade-ai/metaapi-node.js-sdk/tree/master/examples/angular)
- [NodeJS](https://github.com/agiliumtrade-ai/metaapi-node.js-sdk/tree/master/examples/node)
- [React](https://github.com/agiliumtrade-ai/metaapi-node.js-sdk/tree/master/examples/react)
- [Vue](https://github.com/agiliumtrade-ai/metaapi-node.js-sdk/tree/master/examples/vue)

## Troubleshooting

If you encounter any issues while running the examples or integrating MetaApi with your web application, please, contact the MetaApi support team via online chat.
