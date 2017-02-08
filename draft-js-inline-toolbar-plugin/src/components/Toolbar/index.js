import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { getVisibleSelectionRect } from 'draft-js';

import getToolbarPosition from './getPosition';


export default class Toolbar extends Component {
  static propTypes = {
    store: PropTypes.shape({
      getItem: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
      subscribeToItem: PropTypes.func.isRequired,
      unsubscribeFromItem: PropTypes.func.isRequired,
    }).isRequired,
    structure: PropTypes.arrayOf(PropTypes.func).isRequired,
    theme: PropTypes.shape({
      buttonStyles: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
      toolbarStyles: PropTypes.shape({
        toolbar: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
      }).isRequired,
    }).isRequired,
  }

  state = {
    isVisible: false,
    style: {
      transform: 'scale(0)',
    },
  }

  componentWillMount() {
    this.props.store.subscribeToItem('isVisible', this.onVisibilityChanged);
  }

  componentDidMount() {
    this.node = findDOMNode(this);
  }

  componentWillUnmount() {
    this.props.store.unsubscribeFromItem('isVisible', this.onVisibilityChanged);
  }

  onVisibilityChanged = (isVisible) => {
    if (!isVisible) {
      this.setState({
        style: {
          transform: 'scale(0)',
        },
      });
      return;
    }

    // NOTE: forced layout calculation!
    const prevTransform = this.node.style.transform;
    const prevTransition = this.node.style.transition;
    this.node.style.transform = 'scale(1)';
    this.node.style.transition = 'none';
    const toolbarRect = this.node.getBoundingClientRect();
    const parentRect = this.node.offsetParent.getBoundingClientRect();
    this.node.style.transform = prevTransform;
    this.node.style.transition = prevTransition;

    // need to wait a tick for window.getSelection() to be accurate
    // when focusing editor with already present selection
    setTimeout(() => {
      const selectionRect = getVisibleSelectionRect(window);
      const { top, left } = getToolbarPosition({
        parent: parentRect,
        selection: selectionRect,
        scroll: {
          left: window.scrollX,
          top: window.scrollY,
        },
        toolbar: toolbarRect,
      });

      this.setState({
        style: {
          left,
          top,
          transform: 'scale(1)',
          transition: 'transform 0.15s cubic-bezier(.3,1.2,.2,1)',
        },
      });
    }, 0);
  }

  render() {
    const { store, structure, theme } = this.props;
    return (<div
      className={theme.toolbarStyles.toolbar}
      style={this.state.style}
    >{structure.map((Element, index) => (<Element
      key={index}
      theme={theme.buttonStyles}
      getEditorState={store.getItem('getEditorState')}
      setEditorState={store.getItem('setEditorState')}
    />))}</div>);
  }
}
