var blobStorage = require('./blobStorage'),
    filesRouter = require('./router');

module.exports = function (configuration) {
    var storage = blobStorage(configuration.storage),
        router = filesRouter(configuration, storage);

    return router;
};
