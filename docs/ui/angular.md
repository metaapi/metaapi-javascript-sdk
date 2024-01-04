 <div align="center">
  <img src="https://metaapi.cloud/favicon.ico" alt="Logo-MetaApi" width="50" height="50"/> 
  <img src="https://angular.io/assets/images/favicons/favicon.ico" alt="Logo-Angular" width="50" height="50"/>
</div>

# MetaApi Integration with Angular

You can look at a demo of these examples [here](https://youtu.be/O4XmyMh1ozg).

## Table of contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Using](#using)
4. [Examples](#examples)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js `16.14+, 18.10+` or later installed
- NPM `8+` or later installed
- A valid MetaApi API token (you can get one by [signing up for a MetaApi account](https://app.metaapi.cloud/api-access/generate-token))
- A MetaTrader account connected to MetaApi

## Installation

Install MetaApi with npm:

```bash
npm install --save metaapi.cloud-sdk
```

## Using

To work with `MetaApi` in `Angular`, create a service called `MetaapiService` that will be responsible for connecting to and interacting with the API.

``` javascript
// metaapi.service.ts
import { Injectable } from '@angular/core';

//  import library in your component file
import MetaApi, { 
  MetatraderAccountInformation, 
  RpcMetaApiConnectionInstance
} from 'metaapi.cloud-sdk';

@Injectable({
  providedIn: 'root'
})
export class MetaapiService {
  public metaApi: MetaApi;

  private _accountId = 'your-metaapi-account-id';
  private _token = 'your-metaapi-token';

  constructor() {
    // Get instance of MetaApi with your MetaApi token
    this.metaApi = new MetaApi(this._token);
  }

  async connectToMetaTraderApi(): Promise<RpcMetaApiConnectionInstance> {
    const account = await this.metaApi
      .metatraderAccountApi.getAccount(this._accountId);

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

  // Use connectToMetaTraderApiRPC to work with API
  async getAccountInformation(): Promise<MetatraderAccountInformation> {
    const connection = await this.connectToMetaTraderApi();
    // Get account information
    return await connection.getAccountInformation();
  }
}
```

Inject service into your component and use it:

``` javascript
// app.component.ts
import { Component } from '@angular/core';
import { MetaapiService } from 'metaapi.service';
import { MetatraderAccountInformation } from 'metaapi.cloud-sdk';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <p>{{ accountInfo | json }}</p>
    </div>
  `,
})
export class AppComponent {
  accountInfo?: MetatraderAccountInformatipon;

  constructor(private metaApiService: MetaapiService) {
    this.fetchData();
  }

  async fetchData() {
    try {
      this.accountInfo = await this.metaApiService.getAccountInformation();
      /* You can work directly with MetaApi:
        this.metaApiService.metaApi...
      */
    } catch (error) {
      console.error(error);
    }
  }
}
```

## Examples

Integration examples are located in the [`examples/angular/app/`](../../examples/angular/app/) directory.

- Historical Market Data: [src/app/historical/](../../examples/angular/app/src/app/historical)
- RiskManagement: [src/app/riskManagement/](../../examples/angular/app/src/app/riskManagement)
- Stream Quotes: [src/app/streamQuotes](../../examples/angular/app/src/app/streamQuotes)
- CopyFactory: [src/app/copyfactory/](../../examples/angular/app/src/app/copyfactory)
- MetaStats: [src/app/metastats/](../../examples/angular/app/src/app/metastats)
- MetaApi: [src/app/metaapi/](../../examples/angular/app/src/app/metaapi)

### Installation and Running

Download the MetaApi SDK from GitHub using the following command:

```bash
git clone https://github.com/metaapi/metaapi-javascript-sdk.git
cd metaapi-node.js-sdk/examples/angular/app/
```

#### Runnig manually

```bash
npm install
npm start
# runned at localhost:4200
```

#### Start via docker

Use `docker`:

```bash
docker build -t metaapi-app-example -f Dockerfile .
docker run -d -p 4200:4200 metaapi-app-example
# runned at localhost:4200
```

Or use `docker-compose`:

```bash
docker-compose up
# runned at localhost:4200
```

## Troubleshooting

If you encounter any issues while running the examples or integrating MetaApi with your Angular application, please, contact the MetaApi support team via online chat.
