var resource = require('resource'),
    swig = resource.define('template-swig');

swig.schema.description = "for parsing swig";

function init(options, callback) {
  if (typeof options === "function" &&
    typeof callback === "undefined") {
    return callback(null, true);
  }
  var _swig = require('swig');
  return callback(null, _swig.init(options));
}
swig.method('init', init, {
  description: "initalizes swig resource",
  properties: {
    options: {
      description: "all options are optional (unless you are using Express), however it is recommended to at least set the root key when running Swig from node.js.",
      properties: {
        allowErrors: {
          description: "keeping this off will render all template parsing and compiling errors straight to the template output. if true, errors will be thrown straight to the Node.js process, potentially crashing your application.",
          type: 'boolean',
          default: false
        },
        autoescape: {
          description: "automatically escape all variable output. it is highly recommended to leave this on. for character conversion tables, see the [escape filter](http://paularmstrong.github.io/swig/docs/#filters-escape).",
          type: 'any',
          enum: [true, false, 'js'],
          default: true
        },
        cache: {
          description: "changing this to false will re-compile the template files for each request. it is recommended to leave this as true for production use.",
          type: 'boolean',
          default: true
        },
        encoding: {
          description: "the character encoding for template files.",
          type: 'string'
        },
        filters: {
          description: "use this to set any custom filters and/or override any of the built-in filters. for more information on writing your own filters, see the [custom filters guide](http://paularmstrong.github.io/swig/docs/#filters-custom)."
        },
        root: {
          description: "the directory to search for templates. if a template passed to swig.compileFile is an absolute path (starts with /), Swig will not look in the template root. if passed an array, templates will be used by first-match per array index order."
        },
        tags: {
          description: "use this to set any custom tags and/or override any of the built-in tags. for more information on writing your own tags, see the [custom tags guide](http://paularmstrong.github.io/swig/docs/#tags-custom)."
        },
        extensions: {
          description: "add library extensions that will be available to compiled templates. For more information, see the [custom tags guide](http://paularmstrong.github.io/swig/docs/#tags-custom) on third party extensions."
        },
        tzOffset: {
          description: "sets a default timezone offset, in minutes from GMT. setting this will make the [date filter](http://paularmstrong.github.io/swig/docs/#filters-date) automatically convert dates parsed through the date filter to the appropriate timezone offset."
        }
      }
    },
    callback: {
      type: 'function'
    }
  }
});

function render (str, data) {
  var _swig = require('swig'),
      html = _swig.compile(str)(data);
  return html;
}
swig.method('render', render, {
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

swig.dependencies = {
  "swig": "*"
};

exports['template-swig'] = swig;
