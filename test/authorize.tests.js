// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

var router = require('../src/router'),
    sinon = require('sinon'),
    express = require('express'),
    supertest = require('supertest-as-promised'),
    authModule = require('azure-mobile-apps/src/auth');

// these are integration tests of router with authorization settings applied to tables
describe('authorize', function () {
    it('rejects request when unauthenticated and authenticated access is specified on table', function () {
        var app = getApp({ todoitem: { access: 'authenticated', files: true } });

        return supertest(app)
            .post('/tables/todoitem/1/StorageToken')
            .expect(401);
    });

    it('rejects request when unauthenticated and authenticated access is specified on files', function () {
        var app = getApp({ todoitem: { files: { access: 'authenticated' } } });

        return supertest(app)
            .post('/tables/todoitem/1/StorageToken')
            .expect(401);
    });

    it('rejects request when token is malformed and authenticated access is specified on table', function () {
        var app = getApp({ todoitem: { access: 'authenticated', files: true } });

        return supertest(app)
            .post('/tables/todoitem/1/StorageToken')
            .set('x-zumo-auth', 'notatoken')
            .expect(401);
    });

    it('allows request when authenticated and authenticated access is specified on table', function () {
        var app = getApp({ todoitem: { access: 'authenticated', files: true } });

        return supertest(app)
            .post('/tables/todoitem/1/StorageToken')
            .set('x-zumo-auth', getToken())
            .expect(200);
    });

    it('allows request when authenticated and authenticated access is specified on files', function () {
        var app = getApp({ todoitem: { files: { access: 'authenticated' } } });

        return supertest(app)
            .post('/tables/todoitem/1/StorageToken')
            .set('x-zumo-auth', getToken())
            .expect(200);
    });

    function getApp(tables) {
        var app = express(),
            configuration = {
                tableRootPath: '/tables',
                auth: { secret: '0000' },
                tables: tables
            };
        app.use(router(configuration, getBlobStorageMock(), { silly: sinon.spy() }));
        return app;
    }

    function getToken() {
        var auth = authModule({ secret: '0000' });
        return auth.sign({ sub: 'userid' });
    }

    function getBlobStorageMock() {
        return {
            token: sinon.spy(),
            list: sinon.spy(),
            delete: sinon.spy()
        }
    }
});
