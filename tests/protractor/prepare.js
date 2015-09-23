/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = GLOBAL.bedrock;
var by = GLOBAL.by;

bedrock.pages = require('./pages');

bedrock.on('init', function() {
  // locate stackable trigger elements
  by.addLocator('trigger', function(model, parent) {
    var using = parent || document;
    return using.querySelectorAll("[stackable-trigger^='" + model + "']");
  });

  // locate br-headline menu trigger elements
  by.addLocator('brHeadlineMenu', function(title, parent) {
    var using = parent || document;
    return using.querySelectorAll(
      "br-headline[br-title^='" + title + "'] [stackable-trigger='menu']");
  });

  // locate the top-level action menu
  by.addLocator('brActionMenu', function() {
    return document.querySelectorAll('dialog[stackable="menu"]');
  });

  // locate menu items with the given text
  by.addLocator('menuItem', function(value, parent) {
    value = value.trim();
    var using = parent || document;
    var items = using.querySelectorAll('.stackable-menu > li > a');
    return Array.prototype.filter.call(items, function(item) {
      return item.textContent.trim() === value;
    });
  });
});
