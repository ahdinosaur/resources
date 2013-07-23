var resource = require('resource'),
    async = require('async');

module['exports'] = function (options, callback) {
  options = options || {};

  // all never needs additional data and always posts
  options.action = 'post';
  options.data = { __submit: 'all' };

  // call method view
  this.parent.method.present(options, callback);
};