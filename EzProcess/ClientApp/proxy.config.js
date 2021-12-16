const Agent = require('agentkeepalive');

module.exports = {
  '/api/*': {
    target: 'http://localhost:4200',
    secure: false,
    logLevel: 'debug',
    auth: 'LOGIN:PASS',
    agent: new Agent({
      maxSockets: 100,
      keepAlive: true,
      maxFreeSockets: 10,
      keepAliveMsecs: 100000,
      timeout: 6000000,
      freeSocketTimeout: 30000, // keepalive for 30 seconds
    }),
    onProxyRes: proxyRes => {
      let key = 'www-authenticate';
      proxyRes.headers[key] = proxyRes.headers[key] && proxyRes.headers[key].split(',');
    }
  }
};
