// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

module.exports = function (configuration) {
    return function (req, res, next) {
        var table = configuration.tables[req.params.tableName];

        if((specifiesAuthorization(table) || specifiesAuthorization(table.files)) && !authenticated())
            res.status(401).send('You must be logged in to use this application');
        else
            next();

        function authenticated() {
            return req.azureMobile && req.azureMobile.user;
        }

        function specifiesAuthorization(target) {
            return target && (target.access === 'authenticated' || target.authorize);
        }
    }
};
