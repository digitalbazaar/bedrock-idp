var pages = GLOBAL.bedrock.pages || {};

pages.home = require('./home');
pages.idp = require('./idp');
pages.join = require('./join');

module.exports = GLOBAL.bedrock.pages = pages;
