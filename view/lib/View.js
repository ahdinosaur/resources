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

  var subView = this,
      parts = viewPath.split('/');

  // goes as deep as possible, doesn't error if nothing deeper exist
  // TODO make it so it tells you how far it went wrt how far it wanted to go
  while (true) {
    if (parts.length === 0) {
      return {subView: subView, subsLeft: parts};
    }

    var part = parts.shift();
    if (part.length === 0) {
      continue;
    }
    else if (typeof subView !== 'undefined' &&
      typeof subView[part] !== 'undefined' &&
      subView[part].name === part) {
      subView = subView[part];
      continue;
    }
    else {
      parts.unshift(part);
      return {subView: subView, subsLeft: parts};
    }
  }
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
      var subRoot = path.relative(self.viewPath, root),
          subViewName = dirStats.name,
          subPath = subRoot + "/" + subViewName,
          subView,
          subViewResult;

      subViewResult = self.getSubView(subPath);
      switch (subViewResult.subsLeft.length) {

        case 0: // subview already was returned, use it
          // this case should not be reached, error/warn if reached?
          subView = subViewResult.subView;
          break;

        case 1: // subview parent was returned, make new subview as child
          subView = subViewResult.subView[subViewName] = new View({
            name: subViewName,
            path: root,
            parent: subViewResult.subView
          });
          break;

        default: // requested subview is not accessible, so error
          // TODO: make new class of error
          return callback(new Error("subview not accessible (parent views do not exist)"));
        }

      return next();
    });

    walker.on("file", function(root, fileStats, next) {

      var subRoot = path.relative(self.viewPath, root),
          fileName = fileStats.name,
          filePath = root + "/" + fileName,
          ext = path.extname(fileName),
          subViewName = fileName.replace(ext, ''),
          subPath = subRoot + "/" + subViewName,
          subView,
          subViewResult;

      //
      // get subview of current path
      //
      subViewResult = self.getSubView(subPath);
      switch (subViewResult.subsLeft.length) {

        case 0: // subview already was returned, use it
          subView = subViewResult.subView;
          break;

        case 1: // subview parent was returned, make new subview as child
          subView = subViewResult.subView[subViewName] = new View({
            name: subViewName,
            parent: subViewResult.subView
          });
          break;

        default: // requested subview is not accessible, so error
          // TODO: make new class of error
          return callback(new Error("subview not accessible (parent views do not exist)"));
      }

      //
      // add this file to subview
      //
      // determine what kind of file this is
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

      subView.load(function(err) {
        // TODO can we async return error?
        // https://github.com/coolaj86/node-walk/issues/12
        if (err) { return callback(err); }
        return next();
      });
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