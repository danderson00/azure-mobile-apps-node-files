// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

var blobStorage = require('../src/blobStorage'),
    expect = require('chai').expect,
    configuration = { };

describe('blobStorage', function () {
    var blobClient, storage;

    beforeEach(function () {
        blobClient = mock();
        storage = blobStorage(blobClient, configuration);
    });

    it('token sets response properties from client', function () {
        return storage.token('table-1').then(function (token) {
            expect(token.ResourceUri).to.equal('url');
            expect(token.RawToken).to.equal('?token');
            expect(blobClient.current.container).to.equal('table-1');
        });
    });

    it('list returns entries from client', function () {
        return storage.list('table-1').then(function (list) {
            expect(list.entries.length).to.equal(1);
        });
    });
});

function mock() {
    var api = {
        generateSharedAccessSignature: operation('token'),
        getUrl: operation('url'),
        listBlobsSegmented: operation({ entries: [{}] }),
        deleteBlob: operation(),
        createContainerIfNotExists: operation(),
    };

    return api;

    function operation(value) {
        return function (container, blob) {
            api.current = { container: container, blob: blob };
            var callback = arguments[arguments.length - 1];
            if(typeof callback === 'function')
                callback(undefined, value);
            return value;
        };
    }
}
