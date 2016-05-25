// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

module.exports = {
    // JSON.NET serializes enumerations to the name, even if explicit values are provided
    convertRequestValue: function (value) {
        switch(value.toLowerCase()) {
            case 'none':
                return '';
            case 'read':
                return 'r';
            case 'write':
                return 'w';
            case 'delete':
                return 'd';
            case 'list':
                return 'l';
            case 'add':
                return 'a';
            case 'create':
                return 'a';
            case 'readwrite':
                return 'rw';
            case 'all':
                return 'rwdla';
            default:
                return value;
        }
    }
}
