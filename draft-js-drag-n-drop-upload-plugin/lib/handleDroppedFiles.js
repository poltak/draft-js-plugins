'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = onDropFile;

var _draftJs = require('draft-js');

var _file = require('./utils/file');

var getRandomString = function getRandomString() {
  return Math.round(Math.random() * 10e10).toString(32);
};

function onDropFile(config) {
  return function onDropFileInner(selection, files, _ref) {
    var getEditorState = _ref.getEditorState,
        setEditorState = _ref.setEditorState;

    // TODO need to make sure the correct image block is added
    // TODO -> addImage must be passed in. content type matching should happen

    // TODO make sure the Form building also works fine with S3 direct upload

    // Get upload function from config or editor props
    var addPlaceholder = config.addPlaceholder,
        getPlaceholderBlock = config.getPlaceholderBlock,
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
          var file = files[key];
          file.id = getRandomString();
          if (file && file instanceof File) {
            data.formData.append('files', file);
            data.files.push(file);
          }
        }

        setEditorState(_draftJs.EditorState.acceptSelection(getEditorState(), selection));

        // Read files on client side
        (0, _file.readFiles)(data.files).then(function (filesWithContent) {
          return filesWithContent.map(function (file, index) {
            file.id = files[index].id; // eslint-disable-line no-param-reassign
            return file;
          });
        }).then(function (filesWithContent) {
          // Add blocks for each image before uploading
          var editorStateWithPlaceholders = filesWithContent.reduce(function (editorState, file) {
            return addPlaceholder(editorState, file);
          }, getEditorState());
          setEditorState(editorStateWithPlaceholders);

          // Perform upload
          handleUpload(data, function (uploadedFiles) {
            var editorStateWithImages = uploadedFiles.reduce(function (editorState, file) {
              var placeholderBlock = getPlaceholderBlock(editorState, file);

              if (!placeholderBlock) {
                return editorState;
              }

              return handleBlock(editorState, placeholderBlock, file);
            }, getEditorState());
            setEditorState(editorStateWithImages);
          }, function (err) {
            console.error(err);
            // TODO: error handling should happen
          }, function (percent) {
            // On progress, set entity data's progress field
            var editorStateWithUpdatedPlaceholders = filesWithContent.reduce(function (editorState, file) {
              var placeholderBlock = getPlaceholderBlock(editorState, file);

              if (!placeholderBlock) {
                return editorState;
              }

              return handleProgress(editorState, placeholderBlock, percent);
            }, getEditorState());
            setEditorState(editorStateWithUpdatedPlaceholders);
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