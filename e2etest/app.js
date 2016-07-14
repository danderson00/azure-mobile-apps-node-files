// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

var app = require('express')(),
    mobileApp = require('azure-mobile-apps')({
        auth: { azureSigningKey: "949799574C0A6422943C8C873819C03633740F49433BFC1FB5E65869F458E49F" }
    })

mobileApp.tables.add('DataEntity', { files: true });
mobileApp.tables.add('PerUserDataEntity', { files: true, perUser: true });
app.use(mobileApp);
app.listen(3000);
