var bedrock = GLOBAL.bedrock;
var expect = GLOBAL.expect;
var should = GLOBAL.should;
var describe = GLOBAL.describe;
var it = GLOBAL.it;
var uuid = require('uuid');

describe('IDP Identity Settings', function() {

  beforeEach(function() {
    console.log("BEFORE EACH BEDROCK-ANGULAR-IDENTITY");
    bedrock.pages.identity.settings.get();
  });

  it('should contain the proper fields', function() {
    var hey = [true];
    hey[0].should.be.true;
  });
});
