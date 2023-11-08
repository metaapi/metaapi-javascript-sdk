## Enable log4js logging
By default SDK logs messages to console. You can select the SDK to use [log4js](https://www.npmjs.com/package/log4js) logging library by calling `MetaApi.enableLog4jsLogging()` static method before creating MetaApi instances.

```javascript
import MetaApi from 'metaapi.cloud-sdk';

MetaApi.enableLog4jsLogging();

const metaApi = new MetaApi(token);
```

Please note that the SDK does not configure log4js automatically. If you decide to use log4js, then your application is still responsible to configuring log4js appenders and categories. Please refer to log4js documentation for details.
