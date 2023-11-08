## Tracking latencies
You can track latencies uring MetaApi.latencyMonitor API. Client-side latencies include network communication delays, thus the lowest client-side latencies are achieved if you host your app in AWS Ohio region.
```javascript
let api = new MetaApi('token', {enableLatencyMonitor: true});
let monitor = api.latencyMonitor;
// retrieve trade latecy stats
console.log(monitor.tradeLatencies);
// retrieve update streaming latency stats
console.log(monitor.updateLatencies);
// retrieve quote streaming latency stats
console.log(monitor.priceLatencies);
// retrieve request latency stats
console.log(monitor.requestLatencies);
```
