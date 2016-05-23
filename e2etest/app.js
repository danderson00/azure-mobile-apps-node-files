var app = require('express')(),
    mobileApp = require('azure-mobile-apps')({
        storage: {
            account: '',
            key: ''
        }
    })

mobileApp.tables.add('DataEntity', { files: true });
app.use(mobileApp);
app.listen(3000);
