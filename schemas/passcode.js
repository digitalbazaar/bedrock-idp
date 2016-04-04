/*
 * Copyright (c) 2012-2016 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = require('bedrock');

var schema = {
  required: true,
  title: 'Passcode',
  description: 'An auto-generated security code.',
  type: 'string',
  minLength: 8,
  maxLength: 8,
  errors: {
    invalid: 'The passcode must be 8 characters in length.',
    missing: 'Please enter a passcode.',
    masked: true
  }
};

module.exports = function(extend) {
  if(extend) {
    return bedrock.util.extend(true, bedrock.util.clone(schema), extend);
  }
  return schema;
};
