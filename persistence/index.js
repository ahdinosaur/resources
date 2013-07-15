var resource = require('resource'),
    persistence = resource.define('persistence');

persistence.schema.description = "enables persistence for resources";

persistence.method('enable', enable);

function enable (r, datasource) {

  if (!datasource) {
    datasource = r.config.datasource;
  }
  else if(typeof datasource === "string") {
    datasource = {
      type: datasource
    };
  }

  //
  // Map uuid library to persistence resource
  //
  persistence.uuid = require('node-uuid');

  resource.use(datasource.type);
  resource.resources[datasource.type].start(function() {
    return resource.resources[datasource.type].enable(r, datasource);
  });
}

persistence.dependencies = {
  "node-uuid": "*"
};

exports.persistence = persistence;