/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = require('bedrock');
var brPassport = require('bedrock-passport');
var rest = require('bedrock-rest');

var ensureAuthenticated = brPassport.ensureAuthenticated;

// add routes
bedrock.events.on('bedrock-express.configure.routes', addRoutes);

function addRoutes(app) {
  var idPath = bedrock.config.idp.identityBasePath + '/:identity';
  app.get(idPath + '/credentials',
    ensureAuthenticated,
    rest.makeResourceHandler());
}
