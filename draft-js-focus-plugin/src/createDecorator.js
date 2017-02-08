import React, { Component } from 'react';
import unionClassNames from 'union-class-names';

// Get a component's display name
const getDisplayName = (WrappedComponent) => {
  const component = WrappedComponent.WrappedComponent || WrappedComponent;
  return component.displayName || component.name || 'Component';
};

export default ({ theme, blockKeyStore }) => (WrappedComponent) => class BlockFocusDecorator extends Component {
  static displayName = `BlockFocus(${getDisplayName(WrappedComponent)})`;
  static WrappedComponent = WrappedComponent.WrappedComponent || WrappedComponent;

  componentWillMount() {
    blockKeyStore.add(this.props.block.getKey());
  }

  componentWillUnmount() {
    blockKeyStore.remove(this.props.block.getKey());
  }

  onClick = (evt) => {
    evt.preventDefault();
    this.focusBlock();
  }

  onMouseDown = () => {
    this.focusBlock();
  }

  onRemove = (evt) => {
    evt.preventDefault();
    this.props.blockProps.removeBlock();
  }

  focusBlock() {
    const { isFocused, setFocusToBlock } = this.props.blockProps;
    if (!isFocused) {
      setFocusToBlock();
    }
  }

  render() {
    const { blockProps, className } = this.props;
    const { isFocused } = blockProps;
    const combinedClassName = isFocused
      ? unionClassNames(className, theme.focused)
      : unionClassNames(className, theme.unfocused);
    return (
      <WrappedComponent
        {...this.props}
        onClick={this.onClick}
        omMouseDown={this.onMouseDown}
        onRemove={this.onRemove}
        className={combinedClassName}
      />
    );
  }
};
