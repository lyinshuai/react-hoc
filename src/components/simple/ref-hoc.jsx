import React, { Component } from 'react';

const refHoc = WrappedComponent => class extends Component {
  
  componentDidMount() {
    console.log('instanceComponent', this.instanceComponent);
  }

  render() {
    return (<WrappedComponent
      {...this.props}
      ref={instanceComponent => this.instanceComponent = instanceComponent}
    />);
  }
};
export default refHoc;
