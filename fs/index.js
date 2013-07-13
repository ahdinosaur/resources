var resource = require('resource'),
    fs = resource.define('fs');

fs.schema.description = "adds file-system persistence";

resource.use('persistence');

fs.method('start', function (cb) {
  cb(null, true);
});

fs.method('enable', resource.use('jugglingdb').enable);

fs.dependencies = {
  "mkdirp": "*"
};

exports.fs = fs;