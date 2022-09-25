const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/perms',
    createProxyMiddleware({
      target: 'http://192.168.1.128:5109/api/perms/',
      changeOrigin: true,
    })
  );
};