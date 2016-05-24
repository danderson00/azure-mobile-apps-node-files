// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

var router = require('../src/router'),
    sinon = require('sinon'),
    express = require('express'),
    supertest = require('supertest-as-promised');

describe('router', function () {
    it('configures routes for configured tables', function () {
        var configuration = {
                tableRootPath: '/tables',
                tables: { todoitem: { files: true } }
            },
            app = getApp(configuration, getBlobStorageMock());

        return supertest(app)
            .post('/tables/todoitem/1/StorageToken')
            .expect(200)
            .then(function () {
                return supertest(app)
                    .get('/tables/todoitem/1/MobileServiceFiles')
                    .expect(200);
            })
            .then(function () {
                return supertest(app)
                    .delete('/tables/todoitem/1/MobileServiceFiles/filename')
                    .expect(200);
            });
    });

    it('does not configure routes for unconfigured tables', function () {
        var configuration = {
                tableRootPath: '/tables',
                tables: { todoitem: { } }
            },
            app = getApp(configuration, getBlobStorageMock());

        return supertest(app)
            .post('/tables/todoitem/1/StorageToken')
            .expect(404);
    });

    it('executes functions configured on table', function () {
        var configuration = {
                tableRootPath: '/tables',
                tables: { todoitem: {
                    files: {
                        token: sinon.stub().returns('token'),
                        list: sinon.stub().returns('list'),
                        delete: sinon.stub().returns('delete')
                    }
                } }
            },
            app = getApp(configuration, getBlobStorageMock());

        return supertest(app)
            .post('/tables/todoitem/1/StorageToken')
            .expect(200, '"token"')
            .then(function () {
                return supertest(app)
                    .get('/tables/todoitem/1/MobileServiceFiles')
                    .expect(200, '"list"');
            })
            .then(function () {
                return supertest(app)
                    .delete('/tables/todoitem/1/MobileServiceFiles/filename')
                    .expect(200, '"delete"');
            });
    });

    function getBlobStorageMock() {
        return {
            token: sinon.spy(),
            list: sinon.spy(),
            delete: sinon.spy()
        }
    }

    function getApp(configuration, storage) {
        var app = express();
        app.use(router(configuration, storage));
        return app;
    }
});
