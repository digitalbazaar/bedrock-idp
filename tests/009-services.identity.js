/*
 * Copyright (c) 2014-2015 Digital Bazaar, Inc. All rights reserved.
 */

'use strict';

var bedrock = require('bedrock');
var request = require('request');
var jar = request.jar();
request = request.defaults({jar: jar, json: true});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

describe('bedrock-idp services.identity', function() {
  it('should allow an unauthenticated request to /i/:id', function(done) {
    var testIdentity = 'dev';
    var idPath = bedrock.config.server.baseUri +
      bedrock.config.idp.identityBasePath + '/' + testIdentity;
    // console.log('IDPATH', idPath);
    var testService = idPath;
    request.get(
      testService,
      function(err, res, body) {
        res.headers['set-cookie'].should.exist;
        res.statusCode.should.equal(200);
        res.body.should.have.property('@context');
        res.body.should.have.property('id');
        res.body.should.have.property('type');
        res.body.id.should.equal(idPath);
        res.body.type.should.equal('Identity');
        done(err);
      }
    );
  });
});
