var resource = require('resource'),
    markdown = resource.define('template-markdown');

markdown.schema.description = "for parsing markdown";

function init(callback) {
  return callback(null, true);
}
markdown.method('init', init, {
  description: "initalizes markdown resource",
  properties: {
    callback: {
      type: 'function'
    }
  }
});

markdown.method('render', render);

function render (str) {
  var marked = require('marked');
  return marked(str);
};

markdown.dependencies = {
  "marked": "*"
};

exports['template-markdown'] = markdown;
