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

describe('perUser', function () {
    beforeEach(function () {
        app = express();
        mobileApp = mobileApps({ storage: { account: 'asd', key: 'YXNk' } });
        mobileApp.use(files(mobileApp.configuration, logger));
        mobileApp.tables.add('perUser', { files: { token: noop }, perUser: true });
        app.use(mobileApp);
    });

    afterEach(mobileApps.cleanUp(mobileApps.configuration()).testTable({ name: 'perUser' }));

    it('returns 200 when user id matches record user id', function () {
        return supertest(app)
            .post('/tables/perUser')
            .send({ id: '1' })
            .set('x-zumo-auth', getToken('userid'))
            .expect(201)
            .then(function () {
                return supertest(app)
                    .post('/tables/perUser/1/StorageToken')
                    .set('x-zumo-auth', getToken('userid'))
                    .expect(200);
            });
    });    

    it('returns 404 when user id does not match record user id', function () {
        return supertest(app)
            .post('/tables/perUser')
            .send({ id: '1' })
            .set('x-zumo-auth', getToken('userid'))
            .expect(201)
            .then(function () {
                return supertest(app)
                    .post('/tables/perUser/1/StorageToken')
                    .set('x-zumo-auth', getToken('userid2'))
                    .expect(404);
            });
    });    

    function getToken(userId) {
        var auth = authModule(mobileApp.configuration.auth);
        return auth.sign({ sub: userId });
    }

    function noop() {
        return '';
    }
});
