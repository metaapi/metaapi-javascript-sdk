<div align="center">
  <img src="https://metaapi.cloud/favicon.ico" alt="Logo-MetaApi" width="50" height="50"/>
  <img src="https://react.dev/favicon.ico" alt="Logo-React" width="50" height="50"/>
</div>

# MetaApi Integration with React

You can look at a demo of these examples [here](https://youtu.be/7Ka-XGuIInA).

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

You can apply MetaApi to your React application in two ways:

* Functional component;
* Class component.

### Using in Functional Component

``` javascript
import React, { useState, useEffect } from 'react';
// import library in your component file
import MetaApi, { RpcMetaApiConnectionInstance } from 'metaapi.cloud-sdk1';

const accountId = 'your-metatrader-account-id';
const token = 'your-metaapi-token';

const MyComponent = () => {
  const [data, setData] = useState(null);

  const connectToMetaApi = async (): Promise<RpcMetaApiConnectionInstance> => {
    // Get instance of MetaApi with your MetaApi token
    const metaApi = new MetaApi(token);
    // Get MetaTrader account
    const account = await metaApi.metatraderAccountApi.getAccount(accountId);

    // Get connection instance
    await account.waitConnected();
    const connection = account.getRPCConnection();

    // Wait until connection is established
    await connection.connect();
    await connection.waitSynchronized();

    return connection;
  }

  const fetchData = async () => {
    const connection = await connectToMetaApi();

    // For example, get account information
    const accountInformation = await connection.getAccountInformation();
    console.log(accountInformation);
    setData(accountInformation);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {!data && <p>Loading...</p>}
      {data && <p>{JSON.stringify(data)}</p>}
    </div>
  );
};

export default MyComponent;
```

### Using in Class Component

``` javascript
import React, { Component } from 'react';
// import library in your component file
import MetaApi from 'metaapi.cloud-sdk';

interface IMyComponentProps {}
interface IMyComponentState {
  data: any;
}

class MyComponent extends Component<IMyComponentProps, IMyComponentState> {
  state: IMyComponentState = { data: null }; 

  accountId: string = 'your-metatrader-account-id';
  token: string = 'your-metaapi-token';

  async componentDidMount(): Promise<void> {
    const connection = await this.connectToMetaTraderApiRPC();

    // For example, get account information
    const accountInformation = await connection.getAccountInformation();
    console.log(accountInformation);
    this.setState({ data: accountInformation });
  }

  async connectToMetaTraderApiRPC(): Promise<RpcMetaApiConnectionInstance> {
    // Get instance of MetaApi with your MetaApi token
    const metaApi = new MetaApi(this.token);
    // Get MetaTrader account
    const account = await metaApi.metatraderAccountApi.getAccount(this.accountId);

    // Get connection instance
    await account.waitConnected();
    const connection = account.getRPCConnection();

    // Wait until connection is established
    await connection.connect();
    await connection.waitSynchronized();

    return connection;
  }

  render() {
    const { data } = this.state;

    return (
      <div>
        {!data && <p>Loading...</p>}
        {data && <p>{JSON.stringify(data)}</p>}
      </div>
    );
  }
}

export default MyComponent;
```

## Examples

Integration examples are located in the [`examples/react/react-app/`](../../examples/react/react-app/) directory.

- Historical Market Data: [src/components/historical/](../../examples/react/react-app/src/components/historical)
- RiskManagement: [src/components/risk-management/](../../examples/react/react-app/src/components/risk-management)
- Stream Quotes: [src/components/stream-quotes](../../examples/react/react-app/src/components/stream-quotes)
- CopyFactory: [src/components/copy-factory/](../../examples/react/react-app/src/components/copy-factory)
- MetaStats: [src/components/meta-stats/](../../examples/react/react-app/src/components/meta-stats)
- MetaApi: [src/components/meta-api/](../../examples/react/react-app/src/components/meta-api)

### Prerequisites of examples

- Node.js `14.18+, 16+` or later installed _(for Vite)_
- NPM `6.14+` or later installed

### Installation and Running

Download the MetaApi SDK from GitHub using the following command:

```bash
git clone https://github.com/metaapi/metaapi-javascript-sdk.git
cd metaapi-node.js-sdk/examples/react/react-app/
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
docker build -t metaapi-react-app-example -f Dockerfile .
docker run -d -p 5173:5173 metaapi-react-app-example
# runned at localhost:5173
```

Or use `docker-compose`:

```bash
docker-compose up
# runned at localhost:5173
```

## Troubleshooting

If you encounter any issues while running the examples or integrating MetaApi with your React application, please, contact the MetaApi support team via online chat.
