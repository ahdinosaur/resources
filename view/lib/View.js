var resource = require('resource'),
    logger = resource.use('logger');

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
View.prototype.load = function (cb) {
  var self = this;

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

  if (self.viewPath) {
    return self.loadViewPath(cb);
  } else {
    return cb(null, self);
  }
};

View.prototype.getSubView = function(viewPath) {
  // synchronously get subview from given path

  var _view = this,
      parts = viewPath.split('/');

  // goes as deep as possible, doesn't error if nothing deeper exist
  // TODO make it so it tells you how far it went wrt how far it wanted to go
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
      //
      // create a new directory subview
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

      var rootSub = path.relative(self.viewPath, root),
          fileName = fileStats.name,
          filePath = root + "/" + fileName,
          ext = path.extname(fileName),
          subViewName = fileName.replace(ext, ''),
          subView,
          subViewResult;

      //
      // get subview of current path
      //
      subViewResult = self.getSubView(rootSub);
      switch (subViewResult.subsLeft.length) {

        case 0: // subview already was returned, use it
          subView = subViewResult.subView;
          break;

        case 1: // subview parent was returned, make new subview as child
          subView = subViewResult.subView[subViewName] = new View({
            name: subViewName,
            parent: _view
          });
          break;

        default: // requested subview is not accessible, so error
          // TODO: make new class of error
          return callback(new Error("subview not accessible (parent views do not exist)"));
      }

      //
      // add this file to subview
      //
      // determine what kind of fiile this is
      switch (ext) {

      case ".js": // presenter
        subView.presenterPath = filePath;
        break;

      case ".html": // template
        subView.templatePath = filePath;
        break;

      case ".css": // stylesheet
        // TODO
        break;

      default:
        logger.warn("unknown view file: ", filePath);
      }

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