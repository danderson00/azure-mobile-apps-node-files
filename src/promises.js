// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

// we should use the promise constructor in configuration
var Constructor = typeof Promise === 'undefined'
    ? require('es6-promise').Promise
    : Promise;

module.exports = {
    create: function (executor) {
        return new Constructor(executor);
    }
};
