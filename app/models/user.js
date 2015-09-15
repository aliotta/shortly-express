var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'consumers', 
  defaults: {
    loggedIn: 0
  },

  initialize: function() {
    
  }
});


module.exports = User;