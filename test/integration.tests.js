// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

var expect = require('chai').expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    files = require('..'),
    mobileApps = require('azure-mobile-apps/test/appFactory'),
    authModule = require('azure-mobile-apps/src/auth'),
    logger = require('azure-mobile-apps/src/logger'),
    
    app, mobileApp;

describe('integration', function () {
    beforeEach(function () {
        app = express();
        mobileApp = mobileApps({ storage: { account: 'asd', key: 'YXNk' } });
        mobileApp.use(files(mobileApp.configuration, logger));
        mobileApp.tables.add('integration', { files: { token: operation('token') } });
        app.use(mobileApp);
    });

    afterEach(mobileApps.cleanUp(mobileApps.configuration()).testTable({ name: 'integration' }));

    it('returns 200 for configured route', function () {
        mobileApp.use(files(mobileApp.configuration, logger));
        mobileApp.tables.add('integration', { files: { token: operation('token') } });
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration/1/StorageToken') 
            .expect(200, '"token"');
    });    

    it('sets container name from containerResolver option', function () {
        mobileApp.configuration.storage.containerResolver = function () {
            return 'containerName';
        };
        mobileApp.use(files(mobileApp.configuration, logger));
        mobileApp.tables.add('integration', { files: { token: checkContainerName('containerName') } });
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration/1/StorageToken') 
            .expect(200);
    });

    it('passes user object to containerResolver', function () {
        mobileApp.configuration.storage.containerResolver = function (table, id, user) {
            return user.id;
        };
        mobileApp.use(files(mobileApp.configuration, logger));
        mobileApp.tables.add('integration', { files: { token: checkContainerName('username') } });
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration/1/StorageToken') 
            .set('x-zumo-auth', getToken('username'))
            .expect(200);
    })

    function getToken(userId) {
        var auth = authModule(mobileApp.configuration.auth);
        return auth.sign({ sub: userId });
    }

    function checkContainerName(name) {
        return function (api) {
            expect(api.containerName).to.equal(name);
        }
    }

    function operation(result) {
        return function () {
            return result;
        };
    }
});
