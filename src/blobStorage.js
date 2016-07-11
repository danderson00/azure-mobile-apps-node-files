// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

var fileData = require('./fileData'),
    permissions = require('./permissions'),
    promises = require('azure-mobile-apps/src/utilities/promises'),
    format = require('util').format;

module.exports = function (blobClient, configuration) {
    return {
        token: function (tableName, id, permission, blobName) {
            return executeBlobOperation(tableName, id, function () {
                var token = blobClient.generateSharedAccessSignature(getContainerName(tableName, id), blobName, {
                    AccessPolicy: {
                        Permissions: permissions.convertRequestValue(permission || 'read'),
                        Expiry: new Date(Date.now() + 1000 * 60 * (configuration.expiry || 60))
                    }
                });

                return {
                    RawToken: "?" + token,
                    ResourceUri: blobClient.getUrl(getContainerName(tableName, id), blobName),
                    Permissions: permission,
                    Scope: blobName ? 1 : 0
                };
            });
        },
        list: function (tableName, id) {
            return executeBlobOperation(tableName, id, function (callback) {
                blobClient.listBlobsSegmented(getContainerName(tableName, id), null, function (error, results) {
                    if(error)
                        callback(error);
                    else
                        callback(null, results.entries.map(fileData.mapBlobItem(tableName, id)));
                });
            });
        },
        delete: function (tableName, id, name, callback) {
            return executeBlobOperation(tableName, id, function (callback) {
                blobClient.deleteBlob(getContainerName(tableName, id), name, callback);
            });
        }
    };

    function getContainerName(tableName, id) {
        if(configuration.containerResolver && typeof configuration.containerResolver === 'function')
            return configuration.containerResolver(tableName, id);
        return format("%s-%s", tableName, id).toLowerCase();
    }

    function executeBlobOperation(tableName, id, operation) {
        return promises.create(function (resolve, reject) {
            var containerName = getContainerName(tableName, id);
            // ensure the container exists before attempting any operations
            blobClient.createContainerIfNotExists(containerName, function (error) {
                if(error) {
                    reject(error);
                } else {
                    // pass in a default callback to pass to the BlobService that converts the callback style to promises
                    var result = operation(function (error, result) {
                        if(error)
                            reject(error);
                        else
                            resolve(result);
                    });

                    // if we were simply returned a result, resolve our promise with it
                    if(result)
                        resolve(result);
                }
            });
        });
    }
};
