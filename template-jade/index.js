var resource = require('resource'),
    jade = resource.define('template-jade');

jade.schema.description = "for rendering jade";

function init(callback) {
  return callback(null, true);
}
jade.method('init', init, {
  description: "initalizes jade resource",
  properties: {
    callback: {
      type: 'function'
    }
  }
});

function render (str, data, options) {
  var _jade = require('jade'),
      html = _jade.compile(str, options)(data);
  return html;
}
jade.method('render', render, {
  description: "renders the jade template",
  properties: {
    str: {
      description: "jade template",
      type: 'string'
    },
    data: {
      description: "data to embed",
      type: 'object'
    },
    options: {
      description: "compiler options",
      type: 'object',
      properties: {
        self: {
          description: "use a self namespace to hold the locals",
          type: 'boolean',
          default: 'false'
        },
        locals: {
          description: "local variable object",
          type: 'object'
        },
        filename: {
          description: "used in exceptions, and required when using includes",
          type: 'string'
        },
        debug: {
          description: "outputs tokens and function body generated"
        },
        compiler: {
          description: "compiler to replace jade's default"
        },
        compileDebug: {
          description: "when false no debug instrumentation is compiled",
          type: 'boolean'
        },
        pretty: {
          description: 'add pretty-indentation whitespace to output',
          type: 'boolean',
          default: 'false'
        }
      }
    }
  }
});

jade.dependencies = {
  "jade": "*"
};

exports['template-jade'] = jade;
