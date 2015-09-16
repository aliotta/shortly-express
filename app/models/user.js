var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users', 
  defaults: {
    loggedIn: 0
  },

  
  initialize: function(){
    //generate the salt for the user's password
    console.log("IS IT PARTY TIME??????????????");
    this.on('creating', function(model, attrs, options){
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(model.get('password'), salt);
      model.set('password', hash);
      model.set('salt', salt);
    });
  }
});


module.exports = User;

/*
bcrypt.genSaltSync(10, function(err, salt){
        console.log("HEREEEREEREE");
        if(err){
          return console.log(err); 
        } else {
          bcrypt.hashSync(model.password, salt, null, function(err, hash){
            if(err) {
              return console.log(err);
            } else {
              console.log("hash" , hash)
              model.set("password",hash);
            } 
          });
        }
      });
*/