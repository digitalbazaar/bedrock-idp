var pages = {
  dashboard: require('./dashboard'),
  join: require('./join'),
  navbar: require('./navbar'),
  settings: require('./settings')
};
module.exports = GLOBAL.bedrock.pages = pages;
