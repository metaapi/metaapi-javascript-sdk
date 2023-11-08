<div align="center">
  <img src="https://metaapi.cloud/favicon.ico" alt="Logo-MetaApi" width="50" height="50"/>
  <img src="https://vuejs.org/logo.svg" alt="Logo-Vue" width="50" height="50"/>
</div>

# MetaApi Integration with Vue 3

You can look at a demo of these examples [here](https://youtu.be/MQSOU7DK1J4).

## Table of contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Using](#using)
4. [Examples](#examples)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

* Node.js `10.x.x` or later installed
* NPM `6.x` or later installed
* A valid MetaApi API token (you can get one by [signing up for a MetaApi account](https://app.metaapi.cloud/api-access/generate-token))
* A MetaTrader account connected to MetaApi

## Installation

Install MetaApi with npm:

```bash
npm install --save metaapi.cloud-sdk
```

## Using

You can apply MetaApi to your Vue 3 application in two ways:

* Composition API (recommended);
* Options API.

### Using with Composition API

``` html
<script setup lang="ts">
  
import { toRefs, ref } from 'vue'
// import library in your component file
import MetaApi, { 
  RpcMetaApiConnectionInstance,
  StreamingMetaApiConnectionInstance
} from 'metaapi.cloud-sdk'

const accountId = 'your-metaapi-account-id'
const token = 'your-metaapi-token'

// Connect to API
async function getConnectionConnection(): Promise<
  RpcMetaApiConnectionInstance|StreamingMetaApiConnectionInstance
> {
  // Get instance of MetaApi with your MetaApi token
  const metaApi = new MetaApi(token.value);
  // Get MetaTrader account
  const account = await metaApi.metatraderAccountApi.getAccount(accountId.value);

  // Get connection instance
  await account.waitConnected();
  const connection = account.getRPCConnection();
  /* For WS connection use:
  const connection = account.getStreamingConnection();
  */

  // Wait until connection is established
  await connection.connect();
  await connection.waitSynchronized();

  return connection;
}

// Work with RPC API
async function fetchData() {
  connecting.value = true;
  try {
    const connection = await getConnectionConnection();

    const accountInformation = await connection.getAccountInformation();
    console.log("accountInformation", accountInformation);

    const positions = await connection.getPositions();
    console.log("positions", positions);

    const orders = await connection.getOrders();
    console.log("orders", orders);

  } catch(err) {
    console.error(err);
  } finally {
    connecting.value = false;
  }
}
</script>

<template>
  <div>
    <button @click="fetchData()" v-if="!connecting">Connect to MetaApi and do smth...</button>
    <div v-else>Connecting...</div>
  </div>
</template>
```

## Examples

Integration examples are located in the [`examples/vue/vue-app/`](../../examples/vue/vue-app/) directory.

- Historical Market Data: [src/components/historical/](../../examples/vue/vue-app/src/components/historical)
- RiskManagement: [src/components/risk-management/](../../examples/vue/vue-app/src/components/risk-management)
- Stream Quotes: [src/components/stream-quotes](../../examples/vue/vue-app/src/components/stream-quotes)
- CopyFactory: [src/components/copy-factory/](../../examples/vue/vue-app/src/components/copy-factory)
- MetaStats: [src/components/meta-stats/](../../examples/vue/vue-app/src/components/meta-stats)
- MetaApi: [src/components/meta-api/](../../examples/vue/vue-app/src/components/meta-api)

### Prerequisites of examples

- Node.js `14.18+, 16+` or later installed _(for Vite)_
- NPM `6.14+` or later installed

### Installation and Running

Download the MetaApi SDK from GitHub using the following command:

```bash
git clone https://github.com/metaapi/metaapi-javascript-sdk.git
cd metaapi-node.js-sdk/examples/vue/vue-app/
```

#### Runnig manually

```bash
npm install
npm run dev
# runned at localhost:5173
```

#### Start via docker

Use `docker`:

```bash
docker build -t metaapi-vue-app-example -f Dockerfile .
docker run -d -p 5173:5173 metaapi-vue-app-example
#  runned at localhost:5173
```

Or use `docker-compose`:

```bash
docker-compose up 
# runned at localhost:5173 
```

## Troubleshooting

If you encounter any issues while running the examples or integrating MetaApi with your Vue application, please, contact the MetaApi support team via online chat.
