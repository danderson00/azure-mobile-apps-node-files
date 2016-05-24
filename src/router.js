// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

var authenticateModule = require('azure-mobile-apps/src/express/middleware/authenticate'),
    authorizeModule = require('./authorize'),
    permissions = require('./permissions'),
    bodyParser = require('body-parser'),
    express = require('express');

module.exports = function (configuration, storage) {
    var router = express.Router(),
        authenticate = authenticateModule(configuration),
        authorize = authorizeModule(configuration);

    router.post(route('StorageToken'), constructMiddleware('token', function (api, req) {
        // the .NET implementation returns a container level token by default, omit passing the name here to maintain the behavior
        return api.token(req.body && req.body.Permissions);
    }));

    router.get(route('MobileServiceFiles'), constructMiddleware('list', function (api, req) {
        return api.list();
    }));

    router.delete(route('MobileServiceFiles/:blobName'), constructMiddleware('delete', function (api, req) {
        return api.delete(req.params.blobName);
    }));

    return router;

    function constructMiddleware(operationName, defaultOperation) {
        return [
            authenticate,
            authorize,
            bodyParser.json(),
            function (req, res, next) {
                var api = constructFilesApi(req.params.tableName, req.params.id),
                    table = configuration.tables[req.params.tableName];

                if (!table || !table.files) {
                    next();
                } else {
                    var configuredOperation = table.files[operationName],
                        result;

                    // if the table has an operation configured, use that, otherwise, use the default
                    if(configuredOperation)
                        result = configuredOperation(api, req.azureMobile);
                    else
                        result = defaultOperation(api, req);

                    // if we were returned a promise, await the results, otherwise just return the results
                    if(result && result.then && result.then.constructor === Function)
                        result.then(returnResults(res)).catch(next);
                    else
                        returnResults(res)(result);
                }
            }
        ];
    }

    // we can expose an api that doesn't require the user to specify the table name or id, we can pick these up from the route
    function constructFilesApi(tableName, id) {
        return {
            token: function (permission, blobName) {
                return storage.token(tableName, id, permission, blobName);
            },
            list: function () {
                return storage.list(tableName, id);
            },
            delete: function (blobName) {
                return storage.delete(tableName, id, blobName);
            },
            permissions: permissions
        }
    }

    function route(source) {
        return configuration.tableRootPath + '/:tableName/:id/' + source;
    }

    function returnResults(res) {
        return function (results) {
            res.status(200).json(results);
        };
    }
};
