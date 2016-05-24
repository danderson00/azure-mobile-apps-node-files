// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

var fileData = require('./fileData'),
    permissions = require('./permissions'),
    promises = require('./promises'),
    storage = require('azure-storage'),
    format = require('util').format;

module.exports = function (configuration) {
    var blobs = storage.createBlobService(configuration.account, configuration.key);

    return {
        token: function (tableName, id, permission, blobName) {
            return executeBlobOperation(tableName, id, function () {
                var token = blobs.generateSharedAccessSignature(getContainerName(tableName, id), blobName, {
                    AccessPolicy: {
                        Permissions: permissions.convertRequestValue(permission),
                        Expiry: new Date(Date.now() + 1000 * 60 * 60)
                    }
                });

                return {
                    RawToken: "?" + token,
                    ResourceUri: getResourceUri(tableName, id),
                    Permissions: permission,
                    Scope: blobName ? 1 : 0
                };
            });
        },
        list: function (tableName, id) {
            return executeBlobOperation(tableName, id, function (callback) {
                blobs.listBlobsSegmented(getContainerName(tableName, id), null, function (error, results) {
                    if(error)
                        callback(error);
                    else
                        callback(null, results.entries.map(fileData.mapBlobItem(tableName, id)));
                });
            });
        },
        delete: function (tableName, id, name, callback) {
            return executeBlobOperation(tableName, id, function (callback) {
                blobs.deleteBlob(getContainerName(tableName, id), name, callback);
            });
        }
    };

    function getContainerName(tableName, id) {
        return format("%s-%s", tableName, id).toLowerCase();
    }

    function getResourceUri(tableName, id) {
        return format("https://%s.blob.core.windows.net/%s", configuration.account, getContainerName(tableName, id));
    }

    function executeBlobOperation(tableName, id, operation) {
        return promises.create(function (resolve, reject) {
            var containerName = getContainerName(tableName, id);
            // ensure the container exists before attempting any operations
            blobs.createContainerIfNotExists(containerName, function (error) {
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
