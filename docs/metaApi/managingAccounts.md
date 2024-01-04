# Managing MetaTrader accounts and provisioning profiles

## Managing MetaTrader accounts (API servers for MT accounts)
Before you can use the API you have to add an MT account to MetaApi and start an API server for it.

### Managing MetaTrader accounts (API servers) via web UI
You can manage MetaTrader accounts here: [https://app.metaapi.cloud/accounts](https://app.metaapi.cloud/accounts)

### Create a MetaTrader account (API server) via API

#### Creating an account using automatic broker settings detection

To create an account, supply a request with account data and the platform field indicating the MetaTrader version.
Provisioning profile id must not be included in the request for automatic broker settings detection.

```javascript
try {
  const account = await api.metatraderAccountApi.createAccount({
    name: 'Trading account #1',
    type: 'cloud',
    login: '1234567',
    platform: 'mt4',
    // password can be investor password for read-only access
    password: 'qwerty',
    server: 'ICMarketsSC-Demo',
    magic: 123456,
    keywords: ["Raw Trading Ltd"],
    quoteStreamingIntervalInSeconds: 2.5, // set to 0 to receive quote per tick
    reliability: 'high' // set this field to 'high' value if you want to increase uptime of your account (recommended for production environments)
  });
} catch (err) {
  // process errors
  if(err.details) {
    // returned if the server file for the specified server name has not been found
    // recommended to check the server name or create the account using a provisioning profile
    if(err.details === 'E_SRV_NOT_FOUND') {
      console.error(err);
    // returned if the server has failed to connect to the broker using your credentials
    // recommended to check your login and password
    } else if (err.details === 'E_AUTH') {
      console.log(err);
    // returned if the server has failed to detect the broker settings
    // recommended to try again later or create the account using a provisioning profile
    } else if (err.details === 'E_SERVER_TIMEZONE') {
      console.log(err);
    }
  }
}
```

Broker settings detection or connection validation might take some time. If so you will receive response with request processing stage and wait time:

```
Retrying request in 60 seconds because request returned message: Automatic broker settings detection is in progress, please retry in 60 seconds
```

The client will automatically retry the request when the recommended time passes.

#### Error handling
Several types of errors are possible during the request:

- Server file not found
- Authentication error
- Settings detection error

##### Server file not found
This error is returned if the server file for the specified server name has not been found. In case of this error it
is recommended to check the server name. If the issue persists, it is recommended to create the account using a
provisioning profile.

```json
{
  "id": 3,
  "error": "ValidationError",
  "message": "We were unable to retrieve the server file for this broker. Please check the server name or configure the provisioning profile manually.",
  "details": "E_SRV_NOT_FOUND"
}
```

##### Authentication error
This error is returned if the server has failed to connect to the broker using your credentials. In case of this
error it is recommended to check your login and password, and try again.

```json
{
  "id": 3,
  "error": "ValidationError",
  "message": "We failed to authenticate to your broker using credentials provided. Please check that your MetaTrader login, password and server name are correct.",
  "details": "E_AUTH"
}
```

##### Settings detection error
This error is returned if the server has failed to detect the broker settings. In case of this error it is recommended
to retry the request later, or create the account using a provisioning profile.

```json
{
  "id": 3,
  "error": "ValidationError",
  "message": "We were not able to retrieve server settings using credentials provided. Please try again later or configure the provisioning profile manually.",
  "details": "E_SERVER_TIMEZONE"
}
```

#### Creating an account using a provisioning profile
If creating the account with automatic broker settings detection has failed, you can create it using a [provisioning profile](#managing-provisioning-profiles).
To create an account using a provisioning profile, create a provisioning profile for the MetaTrader server, and then add the provisioningProfileId field to the request:

```javascript
const account = await api.metatraderAccountApi.createAccount({
  name: 'Trading account #1',
  type: 'cloud',
  login: '1234567',
  // password can be investor password for read-only access
  password: 'qwerty',
  server: 'ICMarketsSC-Demo',
  provisioningProfileId: provisioningProfile.id,
  application: 'MetaApi',
  magic: 123456,
  quoteStreamingIntervalInSeconds: 2.5, // set to 0 to receive quote per tick
  reliability: 'high' // set this field to 'high' value if you want to increase uptime of your account (recommended for production environments)
});
```

### Account configuration by end user
MetaApi supports trading account configuration by end user. If you do not specify trading account login and password in the createAccount method payload the account will be created in a DRAFT state. You then can generate a link your user can use to enter account login and password or change the account password.

```javascript
// create the account without login and password specified
const account = await api.metatraderAccountApi.createAccount({
  name: 'Trading account #1',
  type: 'cloud',
  server: 'ICMarketsSC-Demo',
  provisioningProfileId: provisioningProfile.id,
  application: 'MetaApi',
  magic: 123456,
  quoteStreamingIntervalInSeconds: 2.5, // set to 0 to receive quote per tick
  reliability: 'high' // set this field to 'high' value if you want to increase uptime of your account (recommended for production environments)
});
let configurationLink = account.createConfigurationLink();
```

### Retrieving existing accounts via API

Method `getAccountsWithInfiniteScrollPagination` provides pagination in infinite scroll style.

```javascript
// filter and paginate accounts, see esdoc for full list of filter options available
const accounts = await api.metatraderAccountApi.getAccountsWithInfiniteScrollPagination({
  limit: 10,
  offset: 0,
  query: 'ICMarketsSC-MT5',
  state: ['DEPLOYED']
});

// get accounts without filter (returns 1000 accounts max)
const accounts = await api.metatraderAccountApi.getAccountsWithInfiniteScrollPagination();
const account = accounts.find(account => account.id === 'accountId')
```

Method `getAccountsWithClassicPagination` provides pagination in a classic style which allows you to calculate page count.

```javascript
// filter and paginate accounts, see esdoc for full list of filter options available
const accounts = await api.metatraderAccountApi.getAccountsWithClassicPagination({
  limit: 10,
  offset: 0,
  query: 'ICMarketsSC-MT5',
  state: ['DEPLOYED']
});
const account = accounts.items.find(account => account.id === 'accountId')
// number of all accounts matching filter without pagination options
console.log(accounts.count)

// get accounts without filter (returns 1000 accounts max)
const accounts = await api.metatraderAccountApi.getAccountsWithClassicPagination();
```

Method `getAccount` retrieves account by account id.

```javascript
const account = await api.metatraderAccountApi.getAccount('accountId');
```

### Updating an existing account via API
```javascript
await account.update({
  name: 'Trading account #1',
  // password can be investor password for read-only access
  password: 'qwerty',
  server: 'ICMarketsSC-Demo',
  quoteStreamingIntervalInSeconds: 2.5 // set to 0 to receive quote per tick
});
```

### Removing an account
```javascript
await account.remove();
```

### Deploying, undeploying and redeploying an account (API server) via API
```javascript
await account.deploy();
await account.undeploy();
await account.redeploy();
```

### Manage custom experts (EAs)
Custom expert advisors can only be used for MT4 accounts on g1 infrastructure. EAs which use DLLs are not supported.

### Creating an expert advisor via API
You can use the code below to create an EA. Please note that preset field is a base64-encoded preset file.
```javascript
const expert = await account.createExpertAdvisor('expertId', {
  period: '1h',
  symbol: 'EURUSD',
  preset: 'a2V5MT12YWx1ZTEKa2V5Mj12YWx1ZTIKa2V5Mz12YWx1ZTMKc3VwZXI9dHJ1ZQ'
});
await expert.uploadFile('/path/to/custom-ea');
```

### Retrieving existing experts via API
```javascript
const experts = await account.getExpertAdvisors();
```

### Retrieving existing expert by id via API
```javascript
const expert = await account.getExpertAdvisor('expertId');
```

### Updating existing expert via API
You can use the code below to update an EA. Please note that preset field is a base64-encoded preset file.
```javascript
await expert.update({
  period: '4h',
  symbol: 'EURUSD',
  preset: 'a2V5MT12YWx1ZTEKa2V5Mj12YWx1ZTIKa2V5Mz12YWx1ZTMKc3VwZXI9dHJ1ZQ'
});
await expert.uploadFile('/path/to/custom-ea');
```

### Removing expert via API
```javascript
await expert.remove();
```

## Managing provisioning profiles
Provisioning profiles can be used as an alternative way to create MetaTrader accounts if the automatic broker settings detection has failed.

### Managing provisioning profiles via web UI
You can manage provisioning profiles here: [https://app.metaapi.cloud/provisioning-profiles](https://app.metaapi.cloud/provisioning-profiles)

### Creating a provisioning profile via API
```javascript
// if you do not have created a provisioning profile for your broker,
// you should do it before creating an account
const provisioningProfile = await api.provisioningProfileApi.createProvisioningProfile({
  name: 'My profile',
  version: 5,
  brokerTimezone: 'EET',
  brokerDSTSwitchTimezone: 'EET'
});
// servers.dat file is required for MT5 profile and can be found inside
// config directory of your MetaTrader terminal data folder. It contains
// information about available broker servers
await provisioningProfile.uploadFile('servers.dat', '/path/to/servers.dat');
// for MT4, you should upload an .srv file instead
await provisioningProfile.uploadFile('broker.srv', '/path/to/broker.srv');
```

### Retrieving existing provisioning profiles via API

Method `getProvisioningProfilesWithInfiniteScrollPagination` provides pagination in infinite scroll style.

```javascript
// filter and paginate profiles, see esdoc for full list of filter options available
const provisioningProfiles = await api.provisioningProfileApi.getProvisioningProfilesWithInfiniteScrollPagination({
  limit: 10,
  offset: 0,
  query: 'ICMarketsSC-MT5', // searches over name
  version: 5
});

// get profiles without filter (returns 1000 profiles max)
const provisioningProfiles = await api.provisioningProfileApi.getProvisioningProfilesWithInfiniteScrollPagination()
const provisioningProfile = provisioningProfiles.find(profile => profile.id === 'profileId')
```

Method `getProvisioningProfilesWithClassicPagination` provides pagination in a classic style which allows you to calculate page count.

```javascript
// filter and paginate profiles, see esdoc for full list of filter options available
const provisioningProfiles = await api.provisioningProfileApi.getProvisioningProfilesWithClassicPagination({
  limit: 10,
  offset: 0,
  query: 'ICMarketsSC-MT5', // searches over name
  version: 5
});
const provisioningProfile = provisioningProfiles.items.find(profile => profile.id === 'profileId')
// number of all profiles matching filter without pagination options
console.log(provisioningProfiles.count)

// get profiles without filter (returns 1000 profiles max)
const provisioningProfiles = await api.provisioningProfileApi.getProvisioningProfilesWithClassicPagination();
```

Method `getProvisioningProfile` retrieves profile by profile id.

```javascript
const provisioningProfile = await api.provisioningProfileApi.getProvisioningProfile('profileId');
```

### Updating a provisioning profile via API
```javascript
await provisioningProfile.update({name: 'New name'});
// for MT5, you should upload a servers.dat file
await provisioningProfile.uploadFile('servers.dat', '/path/to/servers.dat');
// for MT4, you should upload an .srv file instead
await provisioningProfile.uploadFile('broker.srv', '/path/to/broker.srv');
```

### Removing a provisioning profile
```javascript
await provisioningProfile.remove();
```

## Managing MetaTrader accounts via API
Please note that not all MT4/MT5 servers allows you to create MT accounts using the method below.
### Create a MetaTrader 4 demo account
```javascript
const demoAccount = await api.metatraderAccountGeneratorApi.createMT4DemoAccount({
  balance: 100000,
  accountType: 'type',
  email: 'example@example.com',
  leverage: 100,
  serverName: 'Exness-Trial4',
  name: 'Test User',
  phone: '+12345678901',
  keywords: ["Exness Technologies Ltd"]
});

// optionally specify a provisioning profile id if servers file is not found by server name
const demoAccount = await api.metatraderAccountGeneratorApi.createMT4DemoAccount({
  balance: 100000,
  accountType: 'type',
  email: 'example@example.com',
  leverage: 100,
  serverName: 'Exness-Trial4',
  name: 'Test User',
  phone: '+12345678901'
}, provisioningProfile.id);

```

### Create a MetaTrader 5 demo account
```javascript
const demoAccount = await api.metatraderAccountGeneratorApi.createMT5DemoAccount({
  accountType: 'type',
  balance: 100000,
  email: 'example@example.com',
  leverage: 100,
  serverName: 'ICMarketsSC-Demo',
  name: 'Test User',
  phone: '+12345678901',
  keywords: ["Raw Trading Ltd"]
});

// optionally specify provisioning profile id if servers file not found by server name
const demoAccount = await api.metatraderAccountGeneratorApi.createMT5DemoAccount({
  accountType: 'type',
  balance: 100000,
  email: 'example@example.com',
  leverage: 100,
  serverName: 'ICMarketsSC-Demo',
  name: 'Test User',
  phone: '+12345678901'
}, provisioningProfile.id);
```
