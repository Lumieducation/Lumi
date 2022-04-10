const proxy = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(
        '/api',
        proxy.createProxyMiddleware({
            changeOrigin: true,
            target: 'http://localhost:8080'
        })
    );
    app.use(
        '/h5p',
        proxy.createProxyMiddleware({
            changeOrigin: true,
            target: 'http://localhost:8080'
        })
    );
    app.use(
        '/socket.io',
        proxy.createProxyMiddleware({
            changeOrigin: true,
            target: 'http://localhost:8080'
        })
    );
    app.use(
        '/locales',
        proxy.createProxyMiddleware({
            changeOrigin: true,
            target: 'http://localhost:8080'
        })
    );
};
