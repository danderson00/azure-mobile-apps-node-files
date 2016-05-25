// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var permissions = require('./permissions'),
    utilities = require('./utilities');

module.exports = {
    construct: function(configuration, storage, operationName, defaultOperation) {
        return function (req, res, next) {
            var api = constructFilesApi(req.params.tableName, req.params.id),
                table = utilities.caseInsensitiveProperty(configuration.tables, req.params.tableName);

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
        };

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

        function returnResults(res) {
            return function (results) {
                res.status(200).json(results);
            };
        }
    }
};
