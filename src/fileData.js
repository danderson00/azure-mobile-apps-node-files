// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

// this corresponds with MobileServiceFile from the .NET implementation
module.exports = {
    fromBlobItem: function (item, tableName, id) {
        return {
            Id: item.name,
            Name: item.name,
            TableName: tableName,
            ParentId: id,
            Length: item.contentLength,
            ContentMD5: item.contentSettings && item.contentSettings.contentMD5,
            LastModified: new Date(item.lastModified),
            Metadata: item.contentSettings
        };
    },
    mapBlobItem: function (tableName, id) {
        return function (item) {
            return module.exports.fromBlobItem(item, tableName, id);
        };
    }
};
