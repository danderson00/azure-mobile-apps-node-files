var expect = require('chai').expect,
    config = {
        account: '',
        key: ''
    };

if(config.account && config.key)
    describe('blobStorage', function () {
        var storage = require('../src/blobStorage')(config);

        it('token returns SAS for container', function () {
            return storage.token('table', 1).then(function (token) {
                expect(token.ResourceUri).to.be.a('string');
            });
        });

        it('list returns all blobs in a container', function () {
            return storage.list('table', 1).then(function (list) {
                expect(list).to.an('array');
            });
        });

        // it('delete removes blob from container', function () {
        //     storage.token('table', 1, null, null, function (error, token) {
        //         console.dir(token)
        //         done(error)
        //     });
        // });
    });
