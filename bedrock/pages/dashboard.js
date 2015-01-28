var bedrock = GLOBAL.bedrock;

var api = {};
module.exports = api;

var expect = GLOBAL.expect;
var ptor = GLOBAL.protractor.getInstance();

api.get = function(slug) {
  var url = '/i/' + slug + '/dashboard';
  bedrock.get(url);
  expect(ptor.getCurrentUrl()).to.eventually.equal(bedrock.baseUrl + url);
  return api;
};
