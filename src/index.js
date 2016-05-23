var blobStorage = require('./blobStorage'),
    filesRouter = require('./router'),
    bodyParser = require('body-parser');

module.exports = function (configuration) {
    var storage = blobStorage(configuration.storage),
        router = filesRouter(configuration, storage);

    return [
        bodyParser.json(),
        router
    ];
};
