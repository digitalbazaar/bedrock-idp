var pages = GLOBAL.bedrock.pages || {};

pages.dashboard = require('./dashboard');
pages.join = require('./join');
pages.navbar = require('./navbar');
pages.settings = require('./settings');

module.exports = GLOBAL.bedrock.pages = pages;
