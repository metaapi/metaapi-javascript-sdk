29.0.0
  - breaking change: split signal client interface for Copyfactory SDK into strategy and subscriber signal clients

28.0.1
  - fixed `createStopLimitBuyOrder` and `createStopLimitSellOrder` type signatures
  - fixed `NewMetatraderAccountDto.baseCurrency` type
  - fix - defined `ModifyOrderOptions.stopLimitPrice` option type

28.0.0
  - breaking change: removed support for Node.js < v18.x.x
  - add resource slots error docs
  - upd `E_SRV_NOT_FOUND` error handling in examples

27.2.0
  - add support for native Node ES modules

27.1.2
  - fixed `modifyPosition` parameter docs and types

27.1.1
  - removed excessive logging errors about subscriptions and synchronization

27.1.0
  - added dedicated IPs support

27.0.3
  - add browser examples for Metastats and Copyfactory
  - update docs links

27.0.2
  - update MetaStats SDK and CopyFactory SDK versions

27.0.1
  - breaking change: change modules naming method

27.0.0
  - breaking change: removed `MetatraderAccount.accessToken` getter
  - breaking change: removed `MetatraderAccountApi.getAccountByToken` method

26.0.0
  - breaking change: update CopyFactory SDK to 8.x

25.0.3
  - add backward compatibility for future risk management API changes

25.0.2
  - fix package.json

25.0.1
  - remove excessive console.log

25.0.0
  - breaking change: replaced `getAccounts` api method with `getAccountsWithInfiniteScrollPagination` and `getAccountsWithClassicPagination` methods
  - breaking change: replaced `getProvisioningProfiles` api method with `getProvisioningProfilesWithInfiniteScrollPagination` and `getProvisioningProfilesWithClassicPagination` methods

24.0.0
  - breaking change: updated parameters for `getProvisioningProfiles` api and client, added pagination options

23.6.8
  - restrict websocket connection to unconfigured region in rpc and metaapi connections as well
  - clear synchronization timeouts when connection closes

23.6.7
  - restrict websocket connections to regions filtered out by `region` sdk option

23.6.6
  - fixed readme and removed accessToken field from MetatraderAccountDto

23.6.5
  - fixed broken release

23.6.4
  - fixed broken possibility to configure log4js when custom log4js version is used in an application

23.6.3
  - fixed unsubscribing from candles when timeframe is not specified
  - fixed possibility to unsubscribe from candles with specifying timeframe

23.6.2
  - added backward compatibility for future risk management API changes

23.6.0
 - added auto close for deleted replicas and accounts

23.5.1, 23.5.2
 - added docs for ui integration

23.5.0
  - added `refreshTerminalState` and `refreshSymbolQuotes` methods
  - fixed `MetatraderSymbolPrice.bid` property type

23.4.1
 - added the request URL to the error log
 - added a detailed error log in the examples
 - fixed tests for the httpClient

23.4.0
 - clarify stopLevel, freezeLevel documentation
 - fix order type enum
 - add type field to MetatraderAccountInformation model

23.3.4
 - restore the original naming of classes and functions in builds
 - change the default build for Node.js
 - add an inline sourcemap

23.3.3
 - added sourcemaps for bundles
 - fixed axios file upload

23.3.2
 - fixed dockerfiles
 - fixed UMD-build
 
23.3.1
 - refactored file structure for backward compatibility
 - fixed support for Node.js v13.x.x
 - fixed build for Node.js v11.x.x.

23.3.0
 - refactored build to support ESM, UMD, CJS
 - added examples of usage with Angular, React, and Vue applications

23.2.2
  - fixed reconnecting if the server url has changed

23.2.1
 - updated `TokenManagementApi` documentation

23.2.0
 - added `TokenManagementApi` and `TokenManagementClient` to generate web/mobile app tokens based on admin API access token

23.1.1
  - fixed converting ForbiddenError to InternalError for websocket requests
  - log subscription errors

23.1.0
 - updated CopyFactory SDK

23.0.0
 - breaking change: replaced enableMetastatsHourlyTarification method name with enableMetaStatsApi
 - breaking change: replaced metastatsHourlyTarificationEnabled field with metastatsApiEnabled

22.2.0
 - added new retryOpts option for `HttpClient` to configure long running requests timeout
 - updated `HttpClient` request method: added endTime update after 202 response,
 added isLongRunning parameter

22.1.0
 - added transaction-id header for MetatraderAccountGenerator client and MetatraderAccount client methods to create account, create account replica and generate demo accounts

22.0.1
 - fixed close method

22.0.0
  - breaking change: MetatraderAccountGeneratorApi refactored, deleted public methods for creating live accounts
  - added optional field keywords to be used for broker server search

21.1.0
  - added account configuration by end user
  - login and password are now optional when creating or updating trading account
  
21.0.1
  - fixed hash calculation for browsers

21.0.0
  - breaking change: risk management listeners now require accountId (and trackerId where it's applicable). Check readme for details.
  - fixed handling multiple listeners for the same tracker/account in risk management api

20.12.1
  - fixed resynchronization after position/order removal

20.12.0
  - refactored terminal hash manager

20.11.5
  - update package info

20.11.4
  - fix getLogger import

20.11.3
  - fixed position and order update events during synchronization

20.11.2
  - fixed update events during synchronization

20.11.1
  - fixed getting initial data for period statistics listener
  - fixed event error processing for risk management listeners

20.11.0
  - updated equity chart item model

20.10.4
  - improved reliability of terminal hash manager

20.10.3
  - fix synchronziation listener call order

20.10.2
  - fixed unsubscribeFromMarketData method type

20.10.1
  - fixed a TypeError in terminal state

20.10.0
  - added createdAt field to trading account and trading account replica models

20.9.1
  - fixed terminal state updates

20.9.0
  - added terminal hash manager to improve synchronization performance and memory use
  - changed SynchronizationListener onSynchronizationStarted method signature

20.8.3
  - updated connection type exports

20.8.2
  - fix connection close

20.8.1
  - fix metatraderAccountApi import path

20.8.0
  - fix account and replica models and methods to fit rest api

20.7.0
  - add browser examples for risk management sdk

20.6.0
  - do not throw errors if failed to unsubscribe properly
  - added webpack exports for MetaApi non default classes

20.5.0
  - improved reliability of rpc connection
  - added rolling over to the first region if requests on all regions failed in risk management SDK
  - improved docs for risk management sdk
  - fixed the queueEvent method

20.4.0
  - update risk management feature list
  - it is now possible to prevent subscribeToMarketData from waiting for a quote to arrive  

20.3.0
  - remove application field from create account method
  - add onError events events to risk management sdk

20.2.2
  - fixed typings
  - added tracking tradeDayCount to period statistics stream

20.2.1
  - fixed stopping internal jobs when closing sdk

20.2.0
  - merged risk management sdk into the main project

20.1.1
  - fixed type errors when websocket client clears account cache

20.1.0
  - refactored connection management to unsubscribe only when all connection instances are closed

20.0.0
  - breaking change: updated dependency metaapi.cloud-copyfactory-sdk ^5.10.0 -> ^6.0.0

19.7.8
  - fixed typings

19.7.7
  - fixed resubscribe on disconnect

19.7.6
  - added extra logging to debug connection issues 

19.7.5
  - fixed caching domain settings

19.7.4
  - fixed caching region data

19.7.3
  - fixed streaming connection on connected event

19.7.2
  - fixed synchronization after socket client reconnect

19.7.1
  - improved synchronization stability of accounts on multiple regions

19.7.0
  - added copyfactory user log and transaction streaming

19.6.1
  - fixed synchronization of RPC connections
  - fixed synchronization when using account access tokens

19.6.0
  - added support for multiple account region replicas
  - fixed readme for RPC connections
  - added APIs to manage account replicas deployed in different regions
  - improved logging TooManyRequests error
  - added caching for ignored field lists
  - waitConnected takes into account connection status of account replicas in another region

19.5.4
  - add accountCurrencyExchangeRate to MetatraderAccountInformation

19.5.3
  - made accountCurrencyExchangeRate optional in SynchronizationListener.onSymbolPricesUpdated

19.5.2
  - fixed typings for MetatraderAccount.getStreamingConnection: historyStorage parameter is now optional

19.5.1
  - added margin calculation code examples
  - added get server time code examples
  - bugfix subscription downgrade processing

19.5.0
  - added references to MT manager api and risk management api
  - added risk management API

19.4.1
  - handle errors for queued events and warn if they are executing too long

19.4.0
  - added method to queue an event executed among other synchronization events 

19.3.0
  - added method to calculate margin requirements for a future order

19.2.0
  - added userId field to metatrader account

19.1.0
  - added connections field to MetatraderAccount model to track CopyFactory / risk management API connection status in addition to MetaApi connection status
  - added RPC method to retrieve current server time and a terminal state method to retrieve latest quote time
  - added riskManagementApiEnabled field to MetatraderAccount model
  - improved connection logging

19.0.1
  - fixed recording historyOrders to disk

19.0.0
  - breaking change: refactored demo account generator API to allow creating demo accounts without need to specify a provisioning profile, using server name only

18.3.9
  - fixed streaming connection requests

18.3.8
  - minor bugfix

18.3.7
  - improve synchronization stability

18.3.6
  - improve synchronization stability
  - fixed duplicate trade execution issue introduced in 18.3.0 version

18.3.0
  - improved stability of subscribeToMarketData, unsubscribeFromMarketData, trade requests
  - simplified interface of subscribeToMarketData, unsubscribeFromMarketData requests

18.2.8
  - added extra logging to debug specific synchronization issues

18.2.7
  - improve logging of important events in streaming connection

18.2.6
  - improve logging of important events in streaming connection

18.2.5
  - fixed reconnect event
  - fixed packet orderer to improve synchronization stability

18.2.4
  - fixed synchronization

18.2.3
  - improve waitSynchronized stability for streaming API

18.2.2
  - improve synchronization stability in case concurrent synchronizations are streamed

18.2.1
  - fixed a type error that can happen in terminal state when a stream is closed

18.2.0
 - added pip size, stops level and freeze level to symbol specification model
 - bugfix related to region management

18.1.0
  - added ability to specify region to only allow region accounts
  - upgraded CopyFactory SDK to 5.1.0

18.0.9
  - fix typescript export
  - fix BrowserHistoryDatabase

18.0.8
  - fix typescript types

18.0.7
 - added increasing wait time on socket failed reconnect
 - fixed region data management for websocket client

18.0.6
 - make it possible to add and remove listeners when connection is not connected yet

18.0.5
 - initialize protected properties in base history storage

18.0.3
  - fixed browser SDK compattibility

18.0.2
  - fixed connection url generator

18.0.1
  - throw error if a connecion method is invoked and connection is not active

18.0.0
  - breaking change: refactored HistoryStorage & MemoryHistoryStorage classes
  - breaking change: changed rpc connection initialization
  - fixed html example
  - fixed terminal state memory leak
  - split account instance connections into multiple availability zones for redundancy and failover
  - fixed terminal state hash calculation
  - fixed timeout errors of waitSynchronized for RPC connections and accounts with high reliability
  - implemented region support for historical market data requests and socket connections
  - improved price and equity tracking
  - added SL and TP fields to MetatraderDeal
  - breaking change: replaced MetatraderDemoAccountApi with MetatraderAccountGeneratorApi since we can create live accounts now as well
  - breaking change: refactored MetatraderPosition model, see updated descriptions for *commission, *swap and *profit fields
  - optimized CPU load during mass synchronization
  - support regular account synchronization with a non-zero instance index

17.0.0
  - breaking change: updated typescript types
  - added stopPriceBase option to create market order methods
  - fixed hashing of null fields
  - breaking change: removed reconnect RPC method
  - breaking change: upgraded to CopyFactory SDK 4.0.0
  - breaking change: upgraded to MetaStats SDK 3.0.0

16.2.1
  - added RELATIVE_PIPS trade option

16.2.0
  - expanded trade options
  - added trailing stop loss

16.1.0
  - make it possible to detect broker settings automatically (create accounts without provisioning profiles)

16.0.2
  - fixed typings return types
  - fixed export declared types in typings

16.0.1
  - added typings for public classes and objects

16.0.0
  - breaking change: fixed opening streaming connection - now it must be opened explicitly after creating a streaming connection
  - updated MetaStats SDK to 2.0.0

15.1.7
  - fixed ensuring unsubscribed for accounts with high reliability

15.1.6
  - fixed potential memory leaks
  - updated MetaStats SDK to 1.1.0

15.1.5
  - added reconnection if first connection attempt fails
  - fixed potential memory leaks

15.1.4
  - added point field to symbol specification
  - added region selection

15.1.3
  - fixed upload of provisioning profile file buffers

15.1.2
  - fix synchronization after redeploy

15.1.1
 - fixed application field in rpc connection requests

15.1.0
 - added option to keep server-side subscription when retrieving latest market data via RPC API
 - upgdated CopyFactory API to 3.1.0

15.0.1
  - currentPrice is now filled for pending orders only, not for history orders
  - fix terminal state hashing

15.0.0
  - breaking change: divided MetaApiConnection class into:
    - RpcMetaApiConnection for RPC requests
    - StreamingMetaApiConnection for real-time streaming API
  - added symbol validation for subscribeToMarketData
  - refactored terminal state storage
  - fixed historical market data HTTP requests for symbols with special characters
  - breaking change: removed updatePending, originalComment fields, added brokerComment field
  - breaking change: disabled concurrent event processing

14.3.1
  - added logging event delays

14.3.0
  - added copyFactoryResourceSlots field to make it possible specify resource slots for CopyFactory 2 application
  - improved performance of terminal state

14.2.2
  - fixed processing of subscriptions to market data
  - fixed connection close
  - fixed synchronization scheduling

14.2.1
  - fixed incremental synchronization event order

14.2.0
  - upgrade to 2.2.0 CopyFactory SDK

14.1.0
  - added support for log4js logger to use instead of console.* functions

14.0.0
  - breaking change: refactored SynchronizationListener class, namely:
   - added onPositionsSynchronized method
   - onPositionsReplaced is now invoked during synchronization only if server thinks terminal data have changed
   - added onPendingOrdersSynchronized method
   - onPendingOrdersReplaced is now invoked during synchronization only if server thinks terminal data have changed
   - onOrdersReplaced was renamed to onPendingOrdersReplaced
   - onOrderUpdated was renamed to onPendingOrderUpdated
   - onOrderCompleted was renamed to onPendingOrderCompleted
   - onOrderSynchronizationFinished was renamed to onHistoryOrdersSynchronized
   - onDealSynchronizationFinished was renamed to onDealsSynchronized
  - breaking change: enabled sequential packet processing by default
  - added incremental synchronization
  - fix sequential packet processing

13.2.9
  - fixed out of order synchronization packets came from the previous synchronizations

13.2.8
  - fixed selecting best terminal state for price and specification access

13.2.7
  - immediately process packets without sequence number

13.2.6
  - fixed waiting for prices in terminal state

13.2.5
  - fixed terminal state access during initial synchronization

13.2.1
  - fixed sequential packet processing

13.2.0
  - added options validation
  - added waitForPrice method into TerminalState class to make it possible to wait for price to arrive

13.1.0
  - added resourceSlots field to MetatraderAccount model so that user can request extra resource allocation for specific accounts for an extra fee
  - added logging URL on websocket connection
  - fixed initializing websocket connection for multiple accounts
  - remove synchronization listeners on connection close

13.0.0
  - added baseCurrency field to the MetaTraderAccount model
  - fixed history storage timestamp processing (issue #6)
  - handle TooManyRequestsError in HTTP client
  - limit max concurrent synchronizations based on the number of subscribed accounts
  - implement proper rounding for position profits and account equity
  - breaking change: refactored specifications updated events
  - implemented API to retrieve historical market data
  - upgraded CopyFactory API to 2.1.0
  - swapRollover3Days can take value of NONE for some brokers
  - increased default demo account request timeout to 240 seconds
  - added MetaStats SDK
  - fixed deal sorting in memory history store
  - make it possible to specify relative SL/TP
  - improve stability during server-side application redeployments
  - disable synchronization after connection is closed
  - added copyFactoryRoles field to MetatraderAccount entity
  - fixed synchronization queue
  - breaking change: added sequential packet processing
  - increased health status tracking interval to decrease CPU load

12.4.3
  - fix specifications synchronization bug introduced in 12.4.1

12.4.2
  - do not query specification fields until it is received in TerminalState

12.4.1
  - fix equity calculation

12.4.0
  - added clientId to query websocket url
  - bugfix for unsubscribeFromMarketData API
  - added equity curve filter to CopyFactory
  - fixed health state tracking for multiple replicas
  - extended synchronization throttler options
  - move CopyFactory trade copying API to a separate npm module
  - increase socket connection stability
  - added API for advanced market data subscriptions
  - added API to increase account reliability
  - added subscription manager to handle account subscription process
  - fixed error on socket reconnect
  - improved handling of too many requests error
  - added getSymbols RPC API

12.3.0
  - added credit account property
  - added feature to unsubscribe from market data (remove symbol from market watch)
  - removed maximum reliability value
  - fixed synchronization throttling

12.2.0
  - added retryOpts option to configure retries of certain REST/RPC requests upon failure
  - improve account connection reliability
  - added CopyFactory code example

12.1.0
  - add name and login to account information
  - add a feature to select trade scaling mode in CopyFactory (i.e. if we want the trade size to be preserved or scaled according to balance when copying)

12.0.0
  - added API to retrieve CopyFactory slave trading log
  - fixed race condition when orders are being added and completed fast
  - breaking change: changed signatures of SynchronizationListener methods
  - add reliability field
  - add symbol mapping setting to CopyFactory
  - fix quote health check logic

11.0.2
  - fix packet logger import

11.0.1
  - fixed reservoir export
  - removed packet logger import for browser version

11.0.0
  - breaking change: MetaApi options are now specified via an object
  - breaking change: CopyFactory options are now specified via an object
  - added traffic logger
  - added close by order support
  - added stop limit order support
  - bugfix MetatraderAccount.connect method to throw an error to avoid creating broken connections
  - add marginMode, tradeAllowed, investorMode fields to account information
  - breaking change: waitSynchronized to synchronize CopyFactory and RPC applications by default
  - improvements to position profit and account equity tracking on client side
  - real-time updates for margin fields in account information
  - breaking change: uptime now returns uptime measurements over several timeframes (1h, 1d, 1w)
  - do not retry synchronization after MetaApiConnection is closed
  - added option for reverse copying in CopyFactory API
  - added ConnectionHealthMonitor.serverHealthStatus API to retrieve health status of server-side applications
  - added option to specify account-wide stopout and risk limits in CopyFactory API
  - track MetaApi application latencies
  - send RPC requests via RPC application
  - increased synchronization stability
  - added extensions for accounts
  - added metadata field for accounts to store extra information together with account

10.1.1
  - bugfix synchronization failover logic

10.1.0
  - added support for portfolio strategies (i.e. the strategies which include several other member strategies) to CopyFactory API

10.0.1
  - bugfix health monitor

10.0.0
  - added incoming commissions to CopyFactory history API
  - breaking change: refactored resetStopout method in CopyFactory trading API. Changed method name, added strategyId parameter.
  - retry synchronization if synchronization attempt have failed
  - restore market data subscriptions on successful synchronization
  - added capability to monitor terminal connection health and measure terminal connection uptime
  - change packet orderer timeout from 10 seconds to 1 minute to accomodate for slower connections

9.1.0
  - added API to register MetaTrader demo accounts
  - fixed packet orderer to do not cause unnecessary resynchronization

9.0.0
  - added contractSize field to MetatraderSymbolSpecification model
  - added quoteSessions and tradeSessions to MetatraderSymbolSpecification model
  - added more fields to MetatraderSymbolSpecification model
  - breaking change: add onPositionsReplaced and onOrderReplaced events into SynchronizationListener and no longer invoke onPositionUpdated and onOrderUpdated during initial synchronization
  - removed excessive log message from subscribe API
  - breaking change: introduced synchronizationStated event to increase synchronization stability
  - fixed wrong expected sequence number of synchronization packet in the log message
  - added positionId field to CopyFactoryTransaction model

8.0.2
  - bugfix packet ordering algorithm

8.0.1
  - bugfix packet ordering algorithm

8.0.0
  - breaking change: removed the `timeConverter` field from the account, replaced it with `brokerTimezone` and `brokerDSTSwitchTimezone` fields in the provisioning profile instead
  - added originalComment and clientId fields to MetatraderPosition
  - fixed occasional fake synchronization timeouts in waitSynchronized method
  - breaking change: changed API contract of MetaApiConnection.waitSynchronized method
  - added tags for MetaApi accounts
  - minor adjustments to equity calculation algorithm
  - added method to wait for active resynchronization tasks are completed in configuration CopyFactory api
  - added the ability to set the start time for synchronization, used for tests
  - resynchronize on lost synchronization packet to ensure local terminal state consistency

7.4.0
  - added application setting to MetaApi class to make it possible to launch several MetaApi applications in parallel on the same account

7.3.1
  - renamed tradeCopyingSlippageInPercentPoints -> tradeCopyingSlippageInBasisPoints in CopyFactory history API

7.3.0
  - added latency and slippage metrics to CopyFactory trade copying API
  - added CopyFactory configuration client method retrieving active resynchronization tasks
  - improved description of CopyFactory account resynchronizing in readme
  - made it possible to use MetaApi class in interaction tests

7.2.0
  - Fix CopyFactory domain default value
  - Added time fields in broker timezone to objects
  - Added time fields to MetatraderSymbolPrice model

7.1.4
  - Adjust CopyFactory defaults

7.1.3
  - Changes to load balancing algorithm

7.1.2
  - fix CopyFactory getter undefined values
  - fix typos in the examples

7.1.1
  - fix simultaneous multiple file writes by one connection

7.1.0
  - now only one MetaApiConnection can be created per account at the same time to avoid history storage errors

7.0.0
  - Prepared for upcoming breaking change in API: added sticky session support
  - added quoteStreamingIntervalInSeconds field to account to configure quote streaming interval
  - added description field to CopyFactory strategy

6.3.2
  - fixes to package.json keywords

6.3.1
  - fixes to package.json keywords

6.3.0
  - added CopyFactory trade-copying API

6.2.0
  - added reason field to position, order and deal
  - added fillingMode field to MetaTraderOrder model
  - added order expiration time and type

6.1.0
  - added ability to select filling mode when placing a market order, in trade options
  - added ability to set expiration options when placing a pending order, in trade options

6.0.4
  - Add code sample download video to readme

6.0.3
  - fix typo in readme.md

6.0.2
  - update readme.md

6.0.1
  - update readme.md

6.0.0
  - breaking change: rename closePositionBySymbol -> closePosition**s**BySymbol
  - added pagination and more filters to getAccounts API
  - added slippage option to trades
  - added fillingModes to symbol specification
  - added executionMode to symbol specification
  - added logic to throw an error if streaming API is invoked in automatic synchronization mode
  - added code samples for created account
  - added the ability to work in web apps
  - added the ability to retrieve Metatrader account by account access token
  - added the verification access depending on the token to API
  - added websocket and http client timeouts

5.0.2
  - minor bugfix

5.0.1
  - fixed issue with missing numeric/string response code in TradeError

5.0.0
  - breaking change: moved comment and clientId arguments from MetaApiConnection trade methods to options argument
  - added magic trade option to let you specify distinct magic number (expert advisor id) on each trade
  - added manualTrades field to account model so that it is possible to configure if MetaApi should place manual trades on the account
  - prepare MetatraderAccountApi class for upcoming breaking change in the API

4.0.2
  - save history on disk

4.0.1
  - add fields to trade result to match upcoming MetaApi contract

4.0.0
  - breaking change: throw TradeError in case of trade error
  - rename trade response fields so that they are more meaningful

3.0.1
  - previous release was broken, releasing one more time

3.0.0
  - improved account connection stability
  - added platform field to MetatraderAccountInformation model
  - breaking change: changed synchronize and waitSynchronized API to allow for unique synchronization id to be able to track when the synchronization is complete in situation when other clients have also requested a concurrent synchronization on the account
  - breaking change: changed default wait interval to 1s in wait* methods
  
2.0.0
  - breaking change: removed volume as an argument from a modifyOrder function
  - mark account as disconnected if there is no status notification for a long time

1.1.5
  - increased synchronization speed

1.1.4
  - renamed github repository

1.1.3
  - minor bugfixes
  - add API to update provisioning profiles ana MT accounts
  - update current price of the pending order when current price updates
  - removed support for advanced profiles and provisioning profile type since they are no longer used

1.1.2
  - fixed magic field type in docs and code samples
  - MemoryHistoryStorage bugfixes
  - esdoc fixes

1.1.1
  - extended waitSynchronized method logic so that it can be used for accounts in automatic synchronization mode
  - Breaking change: renamed MetaApiConnection synchronized property to isSynchronized method

1.0.19
  - mentioned code examples in readme.md

1.0.18
  - added license clarifications
  - added example code based on user requests

1.0.17
  - improve stability on reconnect in user synchronization mode
  - added commission field to Metatrader position model

1.0.15
  - added clarifications to readme.md regarding SDK documentation

1.0.14
  - add MetaApiConnection.waitSynchronized API to wait until terminal state synchronization has completed. Should be used for accounts in use synchronization mode.

1.0.13
  - change websocket client subscription protocol

1.0.12
  - add MemoryHistoryStorage to exports

1.0.11
  - fixed WS API url

1.0.10
  - fixed code examples in readme.md

1.0.9
  - fixed import in index.es6
  - fixed logic of self-hosted account deletion

1.0.7
  - Initial release
