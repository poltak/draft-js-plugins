import { SelectionState, EditorState } from 'draft-js';
import DraftOffsetKey from 'draft-js/lib/DraftOffsetKey';

// Set selection of editor to next/previous block
export default (getEditorState, setEditorState, mode, event) => {
  const editorState = getEditorState();
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const anchorOffset = selection.getAnchorOffset();
  const anchorKey = selection.getAnchorKey();
  const selectedBlock = content.getBlockForKey(anchorKey);

  if (
    !selection.isCollapsed() ||
    ((mode === 'up') && (anchorOffset !== 0)) ||
    ((mode === 'down') && (anchorOffset !== selectedBlock.getLength()))
  ) {
    return;
  }

  const newActiveBlock = mode === 'up'
    ? editorState.getCurrentContent().getBlockBefore(anchorKey)
    : editorState.getCurrentContent().getBlockAfter(anchorKey);

  if (newActiveBlock && newActiveBlock.get('key') === anchorKey) {
    return;
  }

  if (newActiveBlock) {
    // TODO verify that always a key-0-0 exists
    const offsetKey = DraftOffsetKey.encode(newActiveBlock.getKey(), 0, 0);
    const node = document.querySelectorAll(`[data-offset-key="${offsetKey}"]`)[0];
    // set the native selection to the node so the caret is not in the text and
    // the selectionState matches the native selection
    const nativeSelection = window.getSelection();
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, 0);
    nativeSelection.removeAllRanges();
    nativeSelection.addRange(range);

    const offset = mode === 'up' ? newActiveBlock.getLength() : 0;
    event.preventDefault();
    setEditorState(EditorState.forceSelection(editorState, new SelectionState({
      anchorKey: newActiveBlock.getKey(),
      anchorOffset: offset,
      focusKey: newActiveBlock.getKey(),
      focusOffset: offset,
      isBackward: false,
    })));
  }
};
