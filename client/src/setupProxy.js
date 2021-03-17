const proxy = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(
        '/api',
        proxy({
            changeOrigin: true,
            target: 'http://localhost:8080'
        })
    );
    app.use(
        '/h5p',
        proxy({
            changeOrigin: true,
            target: 'http://localhost:8080'
        })
    );
    app.use(
        '/socket.io',
        proxy({
            changeOrigin: true,
            target: 'http://localhost:8080'
        })
    );
    app.use(
        '/locales',
        proxy({
            changeOrigin: true,
            target: 'http://localhost:8080'
        })
    );
};
