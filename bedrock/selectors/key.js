var bedrock = GLOBAL.bedrock;
var selector = bedrock.selector;

var by = GLOBAL.by;
var element = GLOBAL.element;

var api = selector.create({add: add});
module.exports = api;

function add() {
  var modal = element(by.modal());
  modal.element(by.partialButtonText('Generate Key')).click();
  bedrock.waitForModalTransition();
  var save = modal.element(by.partialButtonText('Save'));
  bedrock.waitForElementToShow(save);
  save.click();
  bedrock.waitForModalTransition();
}
