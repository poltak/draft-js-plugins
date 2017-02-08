function getSingleDimension(sizeProp, positionProp) {
  return ({ selection, parent, scroll, toolbar }) => {
    const halfSelectionSize = selection[sizeProp] / 2;
    const halfToolbarSize = toolbar[sizeProp] / 2;
    const parentPosition = parent[positionProp] + scroll[positionProp];
    const selectionPosition = selection[positionProp] + scroll[positionProp];
    const selectionMiddle = (selectionPosition - parentPosition) + halfSelectionSize;
    const horizontalOffset = Math.max(0, (selectionMiddle + halfToolbarSize) - parent[sizeProp]);

    return Math.max(0, selectionMiddle - halfToolbarSize - horizontalOffset);
  };
}

const getLeft = getSingleDimension('width', 'left');
const getTop = getSingleDimension('height', 'top');

export default function getToolbarPosition(params) {
  return {
    left: getLeft(params),
    top: getTop(params) - params.toolbar.height,
  };
}
