const proxy = require('http-proxy-middleware')
 
module.exports = function(app: any) {
  app.use(proxy('/api', 
    {
        "target": "http://im.loheagn.com:8004",
        "changeOrigin": true
    }))
}