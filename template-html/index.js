var resource = require('resource'),
    html = resource.define('template-html');

html.schema.description = "for rendering html";

function init(callback) {
  return callback(null, true);
}
html.method('init', init, {
  description: "initalizes html resource",
  properties: {
    callback: {
      type: 'function'
    }
  }
});

function render (str, data) {
  var _html = require('html-lang');
  return _html.render(data, str);
}
html.method('render', render, {
  description: "renders the html template",
  properties: {
    str: {
      description: "html template",
      type: 'string',
      required: 'true'
    },
    data: {
      description: "data to embed",
      type: 'object',
      default: {}
    }
  }
});

html.dependencies = {
  "html-lang": "*"
};

exports['template-html'] = html;
