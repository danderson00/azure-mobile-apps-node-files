// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

var blobStorage = require('./blobStorage'),
    filesRouter = require('./router');

module.exports = function (configuration, logger) {
    if(!(configuration.storage && (configuration.storage.connectionString || (configuration.storage.account && configuration.storage.key))))
        throw new Error('No Azure storage account information was provided. Please configure a Data Connection or configure manually. See http://azure.github.io/azure-mobile-apps-node/module-azure-mobile-apps_src_configuration_Environment.html for more information.')

    var storage = blobStorage(configuration.storage),
        router = filesRouter(configuration, storage, logger);

    return router;
};
