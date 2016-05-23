# azure-mobile-apps-node-files

This is a plugin for the Azure Mobile Apps Node.js server that adds simple
file storage capabilities. It is intended to be used with the file storage
plugin for the Azure Mobile Apps client SDKs.

For more information, see https://azure.microsoft.com/en-us/blog/file-management-with-azure-mobile-apps/.

## Installation

    npm i --save azure-mobile-apps-files

The azure-mobile-apps server detects the presence of the file
management plugin and loads it automatically.

## Usage

File management can be added to a table by simply adding a files property to
a table definition:

``` javascript
var app = require('express')(),
    mobileApp = require('azure-mobile-apps')({
        storage: {
            account: 'xxx',
            key: 'xxx'
        }
    })

mobileApp.tables.add('todoitem', { files: true })
app.use(mobileApp)
app.listen(process.env.PORT || 3000)
```

However, this leaves access to the file storage completely open and unauthenticated.
It is recommended to add validation to requests:

``` javascript
var table = module.exports = require('azure-mobile-apps').table()
table.access = 'authenticated';
table.files = {
    token: function (storage, context) {
        // give the admin user full permission, read for all other authenticated users
        var permission = context.user.id === 'admin' ? 'all' : 'read';
        return storage.token(permission)
    },
    // allow any authenticated user to list files
    // list: function (storage, context) {    
    //     return storage.list()
    // },
    delete: function (storage, context) {
        if(context.user.id === 'admin')
            return storage.delete(context.req.params.blobName)

        context.res.status(401).send("Only the administrator can delete files")
    }    
}
```

For more information on using file management on the client, see
https://azure.microsoft.com/en-us/blog/file-management-with-azure-mobile-apps/

## Running Tests

    git clone https://github.com/Azure/azure-mobile-apps-node-files.git
    cd azure-mobile-apps-node-files
    npm i
    npm test
