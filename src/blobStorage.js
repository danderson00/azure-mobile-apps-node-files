// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

var permissions = require('./permissions'),
    promises = require('azure-mobile-apps/src/utilities/promises');

module.exports = function (blobClient, configuration) {
    return {
        token: function (containerName, permission, blobName) {
            return executeBlobOperation(containerName, function () {
                var token = blobClient.generateSharedAccessSignature(containerName, blobName, {
                    AccessPolicy: {
                        Permissions: permissions.convertRequestValue(permission || 'read'),
                        Expiry: new Date(Date.now() + 1000 * 60 * (configuration.expiry || 60))
                    }
                });

                return {
                    RawToken: "?" + token,
                    ResourceUri: blobClient.getUrl(containerName, blobName),
                    Permissions: permission,
                    Scope: blobName ? 1 : 0
                };
            });
        },
        list: function (containerName) {
            return executeBlobOperation(containerName, function (callback) {
                blobClient.listBlobsSegmented(containerName, null, function (error, results) {
                    if(error)
                        callback(error);
                    else
                        callback(null, results);
                });
            });
        },
        delete: function (containerName, name, callback) {
            return executeBlobOperation(containerName, function (callback) {
                blobClient.deleteBlob(containerName, name, callback);
            });
        }
    };

    function executeBlobOperation(containerName, operation) {
        return promises.create(function (resolve, reject) {
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
