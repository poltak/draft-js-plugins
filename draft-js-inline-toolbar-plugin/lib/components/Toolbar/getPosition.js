'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getToolbarPosition;
function getSingleDimension(sizeProp, positionProp) {
  return function (_ref) {
    var selection = _ref.selection,
        parent = _ref.parent,
        scroll = _ref.scroll,
        toolbar = _ref.toolbar;

    var halfSelectionSize = selection[sizeProp] / 2;
    var halfToolbarSize = toolbar[sizeProp] / 2;
    var parentPosition = parent[positionProp] + scroll[positionProp];
    var selectionPosition = selection[positionProp] + scroll[positionProp];
    var selectionMiddle = selectionPosition - parentPosition + halfSelectionSize;
    var horizontalOffset = Math.max(0, selectionMiddle + halfToolbarSize - parent[sizeProp]);

    return Math.max(0, selectionMiddle - halfToolbarSize - horizontalOffset);
  };
}

var getLeft = getSingleDimension('width', 'left');
var getTop = getSingleDimension('height', 'top');

function getToolbarPosition(params) {
  return {
    left: getLeft(params),
    top: getTop(params) - params.toolbar.height
  };
}