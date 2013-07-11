// view connect middleware

var resource = require('resource');

module['exports'] = function (options) {

  options.prefix = options.prefix || '';

  return function (req, res, next) {
    if (options.view) {
      //
      // If the view was mounted with a prefix and that prefix was 
      // not found in the incoming url, do not attempt to use that view
      //
      // helper function for 'quoting' / 'escaping' regex strings
      var quote = function (str) {
        return str.replace(/(?=[\/\\^$*+?.()|{}[\]])/g, "\\");
      };
      // clean given prefix of any start or end slashes
      var prefix = options.prefix.replace(/\/$/, "").replace(/^\//, "");
      if (prefix.length > 0 && req.url.search("^/?" + quote(prefix)) === -1) {
        return next();
      }
      var _view = options.view;

      // get path from url
      var path = require('url').parse(req.url).pathname;
      // remove prefix from path
      var pathWithoutPrefix = path.replace(prefix, '');

      // get subview corresponding to path, if necessary
      var subViewResult = _view.getSubView(pathWithoutPrefix);
      // if such a subview does not exist
      if (subViewResult.subsLeft.length !== 0) {
        // pass on to the next in the middleware stack
        return next();
      }
      // or if such a subview does exist, use it
      else {
        _view = subViewResult.subView;
      }

      // if view has an index, use it
      if (_view && _view['index']) {
        _view = _view['index'];
      }

      // if we don't have a sufficient view
      if(typeof _view === "undefined" ||
        (typeof _view.template === "undefined" &&
        typeof _view.presenter === "undefined")) {
        // pass on to the next in the middleware stack
        return next();
      }

      // create function to finish after _view.present
      var finish = function(err, html) {
        // if there is a layout, view the layout too
        if (resource.layout) {
          _view.$ = _view.querySelector = _view.$.load(html);
          _view.layout(
            resource.layout.view,
            {
              request: req,
              response: res,
              data: req.resource.params,
              err: err
            }, function(err, result) {
            if (err) { return next(err); }
            // return result html from layout
            res.end(result);
          });
        }
        // or if no layout, return html we have
        else {
          if (err) { return next(err); }
          res.end(html);
        }
      };

      // use a domain to catch errors
      var d = require('domain').create();

      // safety net for uncaught errors
      d.on('error', function(err) {
        return finish(err, "");
      });

      // present the target view
      d.run(function() {
        _view.present({
          request: req,
          response: res,
          data: req.resource.params
        }, finish);
      });
    } else {
      //
      // No view was found, do not use middleware
      //
      return next();
    }
  };

};