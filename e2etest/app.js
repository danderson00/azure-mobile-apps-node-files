// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

var app = require('express')(),
    mobileApp = require('azure-mobile-apps')()

mobileApp.tables.add('DataEntity', { files: true });
app.use(mobileApp);
app.listen(3000);
