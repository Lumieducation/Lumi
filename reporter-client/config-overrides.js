module.exports = function override(config, env) {
    config.output = {
        ...config.output, // copy all settings
        filename: 'static/js/[name].js',
        chunkFilename: 'static/js/[name].chunk.js'
    };
    return config;
};
