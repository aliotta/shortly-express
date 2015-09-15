var db = require('../config');
var Click = require('./click');
var crypto = require('crypto');

var Link = db.Model.extend({
  tableName: 'urls',
  defaults: {
    visits: 0
  },
  hasTimestamps: true,
  clicks: function() {
    return this.hasMany(Click);
  },
  initialize: function(){
    this.on('creating', function(model, attrs, options){
      var shasum = crypto.createHash('sha1');
      shasum.update(model.get('url'));
      model.set('code', shasum.digest('hex').slice(0, 5));
    });
  }
});

module.exports = Link;
