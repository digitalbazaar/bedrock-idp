var bedrock = GLOBAL.bedrock;

bedrock.pages = require('./pages');
bedrock.selectors = require('./selectors');

// logs in via the navbar
bedrock.login = function(identifier, password) {
  this.pages.navbar.login(identifier, password);
  return this;
};

// logs out via navbar
bedrock.logout = function() {
  this.pages.navbar.logout();
  return this;
};
