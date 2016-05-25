// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

module.exports = {
    caseInsensitiveProperty: function (target, name) {
        var result;
        Object.keys(target).some(function (property) {
            if(name.toLowerCase() === property.toLowerCase()) {
                result = target[property];
                return true;
            }
        });
        return result;
    }
}
