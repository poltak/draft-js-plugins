'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _draftJs = require('draft-js');

var _DraftOffsetKey = require('draft-js/lib/DraftOffsetKey');

var _DraftOffsetKey2 = _interopRequireDefault(_DraftOffsetKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Set selection of editor to next/previous block
exports.default = function (getEditorState, setEditorState, mode, event) {
  var editorState = getEditorState();
  var content = editorState.getCurrentContent();
  var selection = editorState.getSelection();
  var anchorOffset = selection.getAnchorOffset();
  var anchorKey = selection.getAnchorKey();
  var selectedBlock = content.getBlockForKey(anchorKey);

  if (!selection.isCollapsed() || mode === 'up' && anchorOffset !== 0 || mode === 'down' && anchorOffset !== selectedBlock.getLength()) {
    return;
  }

  var newActiveBlock = mode === 'up' ? editorState.getCurrentContent().getBlockBefore(anchorKey) : editorState.getCurrentContent().getBlockAfter(anchorKey);

  if (newActiveBlock && newActiveBlock.get('key') === anchorKey) {
    return;
  }

  if (newActiveBlock) {
    // TODO verify that always a key-0-0 exists
    var offsetKey = _DraftOffsetKey2.default.encode(newActiveBlock.getKey(), 0, 0);
    var node = document.querySelectorAll('[data-offset-key="' + offsetKey + '"]')[0];
    // set the native selection to the node so the caret is not in the text and
    // the selectionState matches the native selection
    var nativeSelection = window.getSelection();
    var range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, 0);
    nativeSelection.removeAllRanges();
    nativeSelection.addRange(range);

    var offset = mode === 'up' ? newActiveBlock.getLength() : 0;
    event.preventDefault();
    setEditorState(_draftJs.EditorState.forceSelection(editorState, new _draftJs.SelectionState({
      anchorKey: newActiveBlock.getKey(),
      anchorOffset: offset,
      focusKey: newActiveBlock.getKey(),
      focusOffset: offset,
      isBackward: false
    })));
  }
};