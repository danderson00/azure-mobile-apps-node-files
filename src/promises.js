var Constructor = typeof Promise === 'undefined'
    ? require('es6-promise').Promise
    : Promise;

module.exports = {
    create: function (executor) {
        return new Constructor(executor);
    }
};
