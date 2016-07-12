// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

var blobStorage = require('./blobStorage'),
    filesRouter = require('./router'),
    azureStorage = require('azure-storage');

module.exports = function (configuration, logger) {
    var storageConfiguration = configuration.storage || {};

    if(!(storageConfiguration.connectionString || (storageConfiguration.account && storageConfiguration.key)))
        throw new Error('No Azure storage account information was provided. Please configure a Data Connection or configure manually. See http://azure.github.io/azure-mobile-apps-node/module-azure-mobile-apps_src_storageConfiguration_Environment.html for more information.');

    var blobClient = azureStorage.createBlobService(storageConfiguration.connectionString || storageConfiguration.account, storageConfiguration.key),
        storage = blobStorage(blobClient, storageConfiguration),
        router = filesRouter(configuration, storage, logger);

    return router;
};
