// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var errors = require('azure-mobile-apps/src/utilities/errors');

module.exports = function (configuration) {
    return function (req, res, next) {
        var tableDefinition = configuration.tables[req.params.tableName];
        if(tableDefinition && tableDefinition.perUser) {
            var context = req.azureMobile,
                id = req.params.id,
                userId = context.user && context.user.id,
                table = context.tables(req.params.tableName);

            table.where({ id: id }).read().then(function (items) {
                if(items.length === 1 && userId === items[0][configuration.userIdColumn])
                    next();
                else
                    next(errors.notFound());
            })
        } else {
            next();
        }
    };
};