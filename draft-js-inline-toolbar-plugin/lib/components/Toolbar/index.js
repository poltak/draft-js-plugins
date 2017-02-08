'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _draftJs = require('draft-js');

var _getPosition = require('./getPosition');

var _getPosition2 = _interopRequireDefault(_getPosition);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Toolbar = function (_Component) {
  _inherits(Toolbar, _Component);

  function Toolbar() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Toolbar);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Toolbar.__proto__ || Object.getPrototypeOf(Toolbar)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      isVisible: false,
      style: {
        transform: 'scale(0)'
      }
    }, _this.onVisibilityChanged = function (isVisible) {
      if (!isVisible) {
        _this.setState({
          style: {
            transform: 'scale(0)'
          }
        });
        return;
      }

      // NOTE: forced layout calculation!
      var prevTransform = _this.node.style.transform;
      var prevTransition = _this.node.style.transition;
      _this.node.style.transform = 'scale(1)';
      _this.node.style.transition = 'none';
      var toolbarRect = _this.node.getBoundingClientRect();
      var parentRect = _this.node.offsetParent.getBoundingClientRect();
      _this.node.style.transform = prevTransform;
      _this.node.style.transition = prevTransition;

      // need to wait a tick for window.getSelection() to be accurate
      // when focusing editor with already present selection
      setTimeout(function () {
        var selectionRect = (0, _draftJs.getVisibleSelectionRect)(window);

        var _getToolbarPosition = (0, _getPosition2.default)({
          parent: parentRect,
          selection: selectionRect,
          scroll: {
            left: window.scrollX,
            top: window.scrollY
          },
          toolbar: toolbarRect
        }),
            top = _getToolbarPosition.top,
            left = _getToolbarPosition.left;

        _this.setState({
          style: {
            left: left,
            top: top,
            transform: 'scale(1)',
            transition: 'transform 0.15s cubic-bezier(.3,1.2,.2,1)'
          }
        });
      }, 0);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Toolbar, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.props.store.subscribeToItem('isVisible', this.onVisibilityChanged);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.node = (0, _reactDom.findDOMNode)(this);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.props.store.unsubscribeFromItem('isVisible', this.onVisibilityChanged);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          store = _props.store,
          structure = _props.structure,
          theme = _props.theme;

      return _react2.default.createElement(
        'div',
        {
          className: theme.toolbarStyles.toolbar,
          style: this.state.style
        },
        structure.map(function (Element, index) {
          return _react2.default.createElement(Element, {
            key: index,
            theme: theme.buttonStyles,
            getEditorState: store.getItem('getEditorState'),
            setEditorState: store.getItem('setEditorState')
          });
        })
      );
    }
  }]);

  return Toolbar;
}(_react.Component);

Toolbar.propTypes = {
  store: _react.PropTypes.shape({
    getItem: _react.PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    subscribeToItem: _react.PropTypes.func.isRequired,
    unsubscribeFromItem: _react.PropTypes.func.isRequired
  }).isRequired,
  structure: _react.PropTypes.arrayOf(_react.PropTypes.func).isRequired,
  theme: _react.PropTypes.shape({
    buttonStyles: _react.PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
    toolbarStyles: _react.PropTypes.shape({
      toolbar: _react.PropTypes.string.isRequired }).isRequired
  }).isRequired
};
exports.default = Toolbar;