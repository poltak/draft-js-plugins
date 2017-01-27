'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (editorState, newBlock, oldBlock) {
  var content = editorState.getCurrentContent();
  var blockKey = oldBlock.getKey();

  var targetRange = new _draftJs.SelectionState({
    anchorKey: blockKey,
    anchorOffset: 0,
    focusKey: blockKey,
    focusOffset: 1
  });

  var contentWithReplacedBlock = _draftJs.Modifier.replaceWithFragment(content, targetRange, _draftJs.BlockMapBuilder.createFromArray([newBlock]));

  var newState = _draftJs.EditorState.push(editorState, contentWithReplacedBlock, 'modify-block');

  // restore selection
  return _draftJs.EditorState.forceSelection(newState, editorState.getSelection());
};

var _draftJs = require('draft-js');