module['exports'] = function(options, callback) {
  var self = this;
  return callback(null, self.render(options));
};