/*
 * Copyright (c) 2012-2016 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = require('bedrock');

var schema = {
  required: true,
  title: 'Password',
  description: 'A secure phrase used to protect information.',
  type: 'string',
  minLength: 6,
  maxLength: 500,
  errors: {
    invalid: 'The password must be between 6 and 500 characters in length.',
    missing: 'Please enter a password.',
    mask: true
  }
};

module.exports = function(extend) {
  if(extend) {
    return bedrock.util.extend(true, bedrock.util.clone(schema), extend);
  }
  return schema;
};
