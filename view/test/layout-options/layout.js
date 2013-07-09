var resource = require('resource');

module['exports'] = function (options, callback) {

  var $ = this.$;

  $('h1').html(options.data.company);

  callback(null, $.html());
};
