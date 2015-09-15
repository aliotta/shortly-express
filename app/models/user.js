var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users', 
  defaults: {
    salt: "tablesalt",
    loggedIn: 0
  }, 

});


module.exports = User;