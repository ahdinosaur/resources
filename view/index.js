var resource = require('resource'),
    view = resource.define('view'),
    View = require('./lib/View'),
    errors = require('./lib/errors');

//
// Export the View class for convenience
//
exports.View = View;
view.View = View;
view.errors = errors;

view.schema.description = "for managing views";

view.property("path", {
  "type": "string",
  "description": "the path to the view",
  "format": "uri"
});

view.property("template", {
  "type": "string",
  "description": "the string template of the view"
});

view.property("templatePath", {
  "type": "string",
  "description": "the path to the template of the view",
  "format": "uri"
});

view.property("presenter", {
  "type": "function",
  "description:": "the presenter function of the view"
});

view.property("presenterPath", {
  "type": "string",
  "description": "the path to the presenter of the view",
  "format": "uri"
});

view.method('create', create, {
  "description": "creates a new view",
  "properties": {
    "options": {
      "type": "object",
      "properties": view.schema.properties
    },
    "callback": {
      "type": "function",
      "required": true
    }
  }
});

function create (options, callback) {
  options = options || {};

  var _view = new View(options);

  return _view.load(callback);
}

//
// View middleware
// Creates a view from a folder and automatically route
// all urls to paths in that folder
//
view.middle = require('./middle');

view.dependencies = {
  "async": "*",
  "walk": "*",
  "cheerio": "*"
};

exports.view = view;