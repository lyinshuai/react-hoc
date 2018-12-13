import React, { Component } from 'react';

const simpleHoc = (key) => WrappedComponent => {
  return class extends Component {
    render() {
    console.log('key', key);
      return <WrappedComponent {...this.props}/>
    }
  }
}
export default simpleHoc;