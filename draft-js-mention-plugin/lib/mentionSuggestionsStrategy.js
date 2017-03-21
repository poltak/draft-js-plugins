'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _escapeRegExp = require('lodash/escapeRegExp');

var _escapeRegExp2 = _interopRequireDefault(_escapeRegExp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var findWithRegex = function findWithRegex(regex, contentBlock, callback) {
  var contentBlockText = contentBlock.getText();

  // exclude entities, when matching
  contentBlock.findEntityRanges(function (character) {
    return !character.getEntity();
  }, function (nonEntityStart, nonEntityEnd) {
    var text = contentBlockText.slice(nonEntityStart, nonEntityEnd);
    var matchArr = void 0;
    var start = void 0;

    // Go through all matches in the text and return the indices to the callback
    while ((matchArr = regex.exec(text)) !== null) {
      // eslint-disable-line
      start = nonEntityStart + matchArr.index;
      callback(start, start + matchArr[0].length);
    }
  });
};

exports.default = function (trigger, regExp, supportWhiteSpace, maxSuggestionsCharacters) {
  var MENTION_REGEX = supportWhiteSpace ? new RegExp((0, _escapeRegExp2.default)(trigger) + '[\\w\\s]{0,' + maxSuggestionsCharacters + '}', 'g') : new RegExp('(\\s|^)' + (0, _escapeRegExp2.default)(trigger) + regExp, 'g');

  return function (contentBlock, callback) {
    findWithRegex(MENTION_REGEX, contentBlock, callback);
  };
};