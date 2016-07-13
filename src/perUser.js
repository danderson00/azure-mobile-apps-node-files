// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var errors = require('azure-mobile-apps/src/utilities/errors');

module.exports = function (configuration) {
    return function (req, res, next) {
        var context = req.azureMobile,
            tableName = req.params.tableName,
            tableDefinition = configuration.tables[tableName];

        if(tableDefinition && tableDefinition.perUser) {
            context.tables(tableName).where(queryPredicate()).read().then(function (items) {
                if(items.length)
                    next();
                else
                    next(errors.notFound());
            })
        } else {
            next();
        }

        function queryPredicate() {
            var predicate = { id: req.params.id };
            predicate[configuration.userIdColumn] = context.user && context.user.id;
            return predicate;
        }
    };
};