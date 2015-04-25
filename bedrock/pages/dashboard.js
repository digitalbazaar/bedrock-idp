var bedrock = GLOBAL.bedrock;
var browser = GLOBAL.browser;
var expect = GLOBAL.expect;

var api = {};
module.exports = api;

api.get = function(slug) {
  var url = '/i/' + slug + '/dashboard';
  bedrock.get(url);
  expect(browser.getCurrentUrl()).to.eventually.equal(bedrock.baseUrl + url);
  return api;
};
