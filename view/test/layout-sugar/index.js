var resource = require('resource');

module['exports'] = function (options, callback) {

  var self = this,
      $ = self.$;

  $('.user > .name').html('Bob');
  $('.user > .email').html('bob@bob.com');

  self.layout(self.parent.layout, options, callback);
};
