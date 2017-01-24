'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = onDropFile;

var _draftJs = require('draft-js');

var _modifyBlockData = require('./modifiers/modifyBlockData');

var _modifyBlockData2 = _interopRequireDefault(_modifyBlockData);

var _replaceBlock = require('./modifiers/replaceBlock');

var _replaceBlock2 = _interopRequireDefault(_replaceBlock);

var _block = require('./utils/block');

var _file = require('./utils/file');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function defaultHandleBlock(state, selection, data, blockType) {
  return addBlock(state, selection, blockType, data);
}

var defaultBlockType = 'UNSTYLED';

function onDropFile(config) {
  return function onDropFileInner(selection, files, _ref) {
    var getEditorState = _ref.getEditorState,
        setEditorState = _ref.setEditorState;

    // TODO need to make sure the correct image block is added
    // TODO -> addImage must be passed in. content type matching should happen

    // TODO make sure the Form building also works fine with S3 direct upload

    // Get upload function from config or editor props
    var addImage = config.addImage,
        handleBlock = config.handleBlock,
        handleProgress = config.handleProgress,
        handleUpload = config.handleUpload;


    if (handleUpload) {
      var _ret = function () {
        var formData = new FormData();

        // Set data {files: [Array of files], formData: FormData}
        var data = { files: [], formData: formData };
        for (var key in files) {
          // eslint-disable-line no-restricted-syntax
          if (files[key] && files[key] instanceof File) {
            data.formData.append('files', files[key]);
            data.files.push(files[key]);
          }
        }

        setEditorState(_draftJs.EditorState.acceptSelection(getEditorState(), selection));

        // Read files on client side
        (0, _file.readFiles)(data.files).then(function (placeholders) {
          // Add blocks for each image before uploading
          var editorStateWithPlaceholders = placeholders.reduce(function (editorState, placeholder) {
            return addImage(editorState, placeholder.src);
          }, getEditorState());
          setEditorState(editorStateWithPlaceholders);

          // Perform upload
          handleUpload(data, function (uploadedFiles, _ref2) {
            var retainSrc = _ref2.retainSrc;

            // Success, remove 'progress' and 'src'
            var editorStateWithImages = uploadedFiles.reduce(function (editorState, file) {
              var blocks = (0, _block.getBlocksWhereEntityData)(editorState, function (block) {
                return block.src === file.src && block.progress !== undefined;
              });

              if (blocks.size) {
                var _newEditorStateOrBlockType = handleBlock ? handleBlock(editorState, editorState.getSelection(), file) : defaultBlockType;

                return (0, _replaceBlock2.default)((0, _modifyBlockData2.default)(editorState, blocks.first().get('key'), retainSrc ? { progress: undefined } : { progress: undefined, src: undefined }), blocks.first().get('key'), _newEditorStateOrBlockType);
              }

              var newEditorStateOrBlockType = handleBlock ? handleBlock(editorState, editorState.getSelection(), file) : defaultHandleBlock(editorState, editorState.getSelection(), file, defaultBlockType);

              if (!newEditorStateOrBlockType) {
                return defaultHandleBlock(editorState, selection, file, defaultBlockType);
              } else if (typeof newEditorStateOrBlockType === 'string') {
                return defaultHandleBlock(editorState, selection, file, newEditorStateOrBlockType);
              }

              return newEditorStateOrBlockType;
            }, getEditorState());

            // Propagate progress
            if (handleProgress) handleProgress(null);
            setEditorState(editorStateWithImages);
          }, function (err) {
            console.error(err);
          }, function (percent) {
            // On progress, set entity data's progress field
            var editorStateWithUpdatedPlaceholders = placeholders.reduce(function (editorState, placeholder) {
              var blocks = (0, _block.getBlocksWhereEntityData)(editorState, function (p) {
                return p.src === placeholder.src && p.progress !== undefined;
              });

              if (blocks.size) {
                return (0, _modifyBlockData2.default)(editorState, blocks.first().get('key'), { progress: percent });
              }

              return editorState;
            }, getEditorState());
            setEditorState(editorStateWithUpdatedPlaceholders);

            // Propagate progress
            if (handleProgress) {
              handleProgress(percent);
            }
          });
        });

        // draft-js-plugin-editor requires true
        return {
          v: true
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }

    return undefined;
  };
}