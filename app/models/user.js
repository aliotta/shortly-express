var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users', 
  defaults: {
    loggedIn: 0
  },

  
  // initialize: function(){
  //   //generate the salt for the user's password
  //   bcrypt.genSalt(10, function(err, salt){
  //     if(err){
  //       return console.log(err); 
  //     } else {
  //       bcrypt.hash(users.password, salt, function(err, hash){
  //         if(err) {
  //           return console.log(err);
  //         }else
  //         console.log(hash); 
  //         bcrypt.compare(user.password, hash, function(err, isMatch){
  //           if(err){
  //             return console.log(err); 
  //           }
  //           console.log("Do they match? ", isMatch);
  //         });
  //       });
  //     }
  //   });
  // }
});


module.exports = User;

/*
Bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(err) {
                return console.error(err);
        }

        Bcrypt.hash(pass, salt, function(err, hash) {
                if(err) {
                        return console.error(err);
                }

                console.log(hash);

                Bcrypt.compare(pass, hash, function(err, isMatch) {
                        if(err) {
                                return console.error(err);
                        }

                        console.log('do they match?', isMatch);
                });

        });
});
*/