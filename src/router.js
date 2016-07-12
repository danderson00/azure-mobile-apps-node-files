// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

var authenticateModule = require('azure-mobile-apps/src/express/middleware/authenticate'),
    authorizeModule = require('./authorize'),
    perUserModule = require('./perUser'),
    middleware = require('./middleware'),
    bodyParser = require('body-parser'),
    express = require('express'),
    format = require('util').format;

module.exports = function (configuration, storage, logger) {
    var router = express.Router(),
        authenticate = authenticateModule(configuration),
        authorize = authorizeModule(configuration),
        perUser = perUserModule(configuration);

    router.post(route('StorageToken'), constructMiddleware('token', function (api, req) {
        logger.silly(format('Generating SAS token for %s (%s)', req.params.tableName.toLowerCase(), req.params.id));
        // the .NET implementation returns a container level token by default, omit passing the name here to maintain the behavior
        return api.token(req.body && req.body.Permissions);
    }));

    router.get(route('MobileServiceFiles'), constructMiddleware('list', function (api, req) {
        logger.silly(format('Listing files for %s (%s)', req.params.tableName.toLowerCase(), req.params.id));
        return api.list();
    }));

    router.delete(route('MobileServiceFiles/:blobName'), constructMiddleware('delete', function (api, req) {
        logger.silly(format('Deleting %s from %s (%s)', req.params.blobName, req.params.tableName.toLowerCase(), req.params.id));
        return api.delete(req.params.blobName);
    }));

    return router;

    function route(source) {
        return configuration.tableRootPath + '/:tableName/:id/' + source;
    }

    function constructMiddleware(operationName, defaultOperation) {
        return [
            authenticate,
            authorize,
            perUser,
            bodyParser.json(),
            middleware.construct(configuration, storage, operationName, defaultOperation)
        ];
    }
};
