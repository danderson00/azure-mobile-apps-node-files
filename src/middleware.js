// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var permissions = require('./permissions'),
    utilities = require('./utilities'),
    fileData = require('./fileData'),
    format = require('util').format;

module.exports = {
    construct: function(configuration, storage, operationName, defaultOperation) {
        return function (req, res, next) {
            var tableName = req.params.tableName,
                id = req.params.id,
                api = constructFilesApi(),
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
                    result.then(returnResults()).catch(next);
                else
                    returnResults()(result);
            }

            // we can expose an api that doesn't require the user to specify the table name or id, we can pick these up from the route
            function constructFilesApi() {
                return {
                    token: function (permission, blobName) {
                        return storage.token(getContainerName(), permission, blobName);
                    },
                    list: function () {
                        return storage.list(getContainerName());
                    },
                    delete: function (blobName) {
                        return storage.delete(getContainerName(), blobName);
                    },
                    permissions: permissions
                };

                function getContainerName() {
                    if(configuration.containerResolver && typeof configuration.containerResolver === 'function')
                        return configuration.containerResolver(tableName, id);
                    return format("%s-%s", tableName, id).toLowerCase();
                }
            }

            function returnResults() {
                return function (results) {
                    res.status(200).json(results && results.constructor === Array 
                        ? results.map(fileData.mapBlobItem(tableName, id))
                        : results);
                };
            }
        };
    }
};
