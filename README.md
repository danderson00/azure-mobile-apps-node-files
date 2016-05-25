# azure-mobile-apps-files

This is a plugin for the Azure Mobile Apps Node.js server that adds simple
yet powerful file storage capabilities. It is intended to be used with the
file management plugin for the Azure Mobile Apps client SDKs.

For more information, see https://azure.microsoft.com/en-us/blog/file-management-with-azure-mobile-apps/.

## Installation

    npm i --save azure-mobile-apps-files

The azure-mobile-apps server detects the presence of the file
management plugin and loads it automatically.

## Usage

First, add a storage account data connection using the Data Connections section
of the portal.

File management can then be added to a table by simply adding a files property
to a table definition:

``` javascript
var app = require('express')(),
    mobileApp = require('azure-mobile-apps')()

mobileApp.tables.add('todoitem', { files: true })
app.use(mobileApp)
app.listen(process.env.PORT || 3000)
```

However, this leaves access to the file storage completely open and
unauthenticated. It is recommended to add some sort of validation to requests.
A simple, contrived example:

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

## API

The `storage` parameter that is passed to each function in the above example
has the following structure:

``` javascript
var storage = {
    token: function (permission, blobName) {
        // permission is one of 'read', 'write', 'readwrite', 'create', 'delete', 'list' or 'all'
        // alternatively, any permission understood by the Azure Storage REST API, any of 'rwdla'
        // blobName is optional, if omitted, the token is for the container
    },
    list: function () {
        // list all files in the container
    },
    delete: function (blobName) {
        // delete the specified blob from the container
    }
}
```

By default, there is one container per table row.

The `context` parameter is the normal azure-mobile-apps context object,
described at http://azure.github.io/azure-mobile-apps-node/global.html#context.

## Running Tests

    git clone https://github.com/Azure/azure-mobile-apps-node-files.git
    cd azure-mobile-apps-node-files
    npm i
    npm test

## More Information

For more information on using file management on the client, see
https://azure.microsoft.com/en-us/blog/file-management-with-azure-mobile-apps/

## License

MIT
