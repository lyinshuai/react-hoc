import React, { Component } from 'react';
import simpleHoc from './simple-hoc';
import propsProxyHoc from './props-proxy-hoc';
import refHoc from './ref-hoc';
import { compose } from '../../utils';

// 注意我这里写的顺序。
@simpleHoc
@propsProxyHoc
@refHoc
export default class Usual extends Component {
  
  constructor() {
    super();
    this.state = {
      usual: 'usual',
    }
  }

  render() {
    console.log('props', this.props);
    console.log('state', this.state);
    return (
      <div>
        Usual
      </div>
    )
  }
}

// export default compose(simpleHoc, propsProxyHoc, refHoc)(Usual);