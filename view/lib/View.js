var resource = require('resource');

var path = require('path'),
    fs = require('fs');

var query = require('./query'),
    render = require('./render');

var View = function (options) {
  var self = this;

  options = options || {};
  self.viewPath = options.path;

  // set this view's name
  if (options.name) {
    self.name = options.name;
  } else {
    self.name = "";
  }

  // load in the provided parent
  if (options.parent) {
    self.parent = options.parent;
  }

  //
  // template stuff
  //
  // if template path but no template, load template from path
  if (options.templatePath) {
    self.templatePath = options.templatePath;
  }

  // load in the provided template
  if (options.template) {
    self.template = options.template;
    // Remark: If we have been passed in a template as a string,
    // the querySelectorAll context needs to be updated
    self.$ = self.querySelector = query(self.template);
  }

  //
  // presenter stuff
  //
  // if presenter path but no presenter, load presenter from path
  if (options.presenterPath) {
    self.presenterPath = options.presenterPath;
  }

  // load in the provided presenter
  if (options.presenter) {
    self.presenter = options.presenter;
  }

  return self;
};

//
// Loads a template file or directory by path
//
View.prototype.load = function (viewPath, cb) {
  var self = this;

  //
  // TODO: better currying of args
  //
  if(typeof cb !== 'function' && typeof viewPath === 'function') {
    cb = viewPath;
  }

  if (self.templatePath && !self.template) {
    // TODO: make this async and error check this?
    self.template = fs.readFileSync(self.templatePath);
    // Remark: If we have been passed in a template as a string,
    // the querySelectorAll context needs to be updated
    self.$ = self.querySelector = query(self.template);
  }

  if (self.presenterPath && !self.presenter) {
    // TODO: make this async and error check this?
    self.presenter = require(self.presenterPath);
  }

  if(typeof viewPath === "string") {
    self.viewPath = viewPath;
  }

  if (typeof cb !== 'function') {
    throw new Error("callback is required");
  }

  if (self.viewPath) {
    return self.loadViewPath(cb);
  } else {
    return cb(null, self);
  }
};

View.prototype.getSubView = function(viewPath) {
  // synchronously get subview given path

  var _view = this,
      parts = viewPath.split('/');

  // goes as deep as possible, doesn't error if nothing deeper exist
  // TODO make it error or do something useful
  parts.forEach(function(part) {
    if(part.length > 0 && typeof _view !== 'undefined') {
      _view = _view[part];
    }
  });

  return _view;
};

View.prototype.loadViewPath = function (callback) {

  var self = this;

  (function() {
    var walk = require("walk");

    var walker = walk.walk(self.viewPath, {});

    walker.on("directory", function(root, dirStats, next) {
      //console.log(root, dirStats);
      //
      // create a new subview
      //
      var rootSub = path.relative(self.viewPath, root),
          _view = self.getSubView(rootSub),
          subViewName = dirStats.name;

      _view[subViewName] = new View({
        name: subViewName,
        path: root,
        parent: _view
      });

      next();
    });

    walker.on("file", function(root, fileStats, next) {
      //console.log(root, fileStats);
      //
      // create a new subview
      //
      var rootSub = path.relative(self.viewPath, root),
          _view = self.getSubView(rootSub),
          name = fileStats.name,
          ext = path.extname(name),
          subViewName = name.replace(ext, '');

      // determine if file is template or presenter ( presenters end in .js and are node modules )
      if (ext === ".js") {
        next();
        // don't do anything
      } else {

        //
        // load the file as the current template
        //
        fs.readFile(root + '/' + name, function(err, result) {
          if (err) {
            throw err;
          }
          result = result.toString();
          var presenter, template;
          //
          // determine if file is template or presenter
          //
          template = result;

          //
          // get presenter, if it exists
          //
          var presenterPath = root +  '/' + name.replace(ext, '.js');

          //
          // Determine if presenter file exists first before attempting to require it
          //
          // TODO: replace with async stat
          var exists = false;
          try {
            var stat = fs.statSync(presenterPath);
            exists = true;
          } catch (err) {
            exists = false;
          }

          if (exists) {
            presenterPath = presenterPath.replace('.js', '');
            presenter = require(presenterPath);
          }

          _view[subViewName] = new View({
            name: subViewName,
            template: template,
            presenter: presenter,
            parent: _view
          });

          next();
        });
      }
    });

    walker.on('end', function() {
      return callback(null, self);
    });

  })();

};

// export query
View.prototype.query = query;

// export layout
View.prototype.layout = require('./layout');

View.prototype.present = function(options, callback) {

  // TODO: turn self into this
  // load query into self
  var self = this;
  self.$ = self.querySelector = query(self.template);

  // if we have presenter, use it,
  // otherwise fallback to default presenter
  return (self.presenter || render).call(self, options, callback);
};

//
// TODO: Detects view type based on current path
//
View.prototype.detect = function (p) {
  return path.extname(p);
};

View.prototype.breadcrumb = function () {
  if (typeof this.parent === "undefined") {
    return this.name;
  }
  return this.parent.breadcrumb() + '/' + this.name;
};

module['exports'] = View;