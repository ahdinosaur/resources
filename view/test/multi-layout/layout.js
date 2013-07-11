var resource = require('resource');

module['exports'] = function (options, callback) {

  var self = this,
      $ = self.$;

  $('h1').html('big');

  return callback(null, $.html());
};
