### react 高阶组件

#### 前言
我们都知道高阶函数是什么, 高阶组件其实是差不多的用法，只不过传入的参数变成了react组件，并返回一个新的组件.

高阶组件是react应用中很重要的一部分，最大的特点就是重用组件逻辑。它并不是由React API定义出来的功能，而是由React的组合特性衍生出来的一种设计模式。

#### 引入
先来一个简单的高阶组件

```
import React, { Component } from 'react';
import simpleHoc from './simple-hoc';

class Usual extends Component {
  render() {
    console.log(this.props, 'props');
    return (
      <div>
        Usual
      </div>
    )
  }
}
export default simpleHoc(Usual);
```
```
import React, { Component } from 'react';

const simpleHoc = WrappedComponent => {
  console.log('simpleHoc');
  return class extends Component {
    render() {
      return <WrappedComponent {...this.props}/>
    }
  }
}
export default simpleHoc;
```
组件Usual通过simpleHoc的包装，打了一个log... 那么形如simpleHoc就是一个高阶组件了，通过接收一个组件class Usual，并返回一个组件class。 其实我们可以看到，在这个函数里，我们可以做很多操作。 而且return的组件同样有自己的生命周期，function，另外，我们看到也可以把props传给WrappedComponent(被包装的组件)。
#### 装饰器模式

高阶组件可以看做是装饰器模式(Decorator Pattern)在React的实现。即允许向一个现有的对象添加新的功能，同时又不改变其结构，属于包装模式(Wrapper Pattern)的一种.

ES7中添加了一个decorator的属性，使用@符表示，可以更精简的书写。那上面的例子就可以改成：

```
import React, { Component } from 'react';
import simpleHoc from './simple-hoc';

@simpleHoc
export default class Usual extends Component {
  render() {
    return (
      <div>
        Usual
      </div>
    )
  }
}
```
是同样的效果。当然兼容性是存在问题的，通常都是通过babel去编译的。
### 两种形式
引入里我们写的最简单的形式，就是属性代理(Props Proxy)的形式。通过hoc包装wrappedComponent，也就是例子中的Usual，本来传给Usual的props，都在hoc中接受到了，也就是props proxy。 由此我们可以做一些操作。

+ 操作props

  最直观的就是接受到props，我们可以做任何读取，编辑，删除的很多自定义操作。包括hoc中定义的自定义事件，都可以通过props再传下去。
    ```angular2
    import React, { Component } from 'react';
    
    const propsProxyHoc = WrappedComponent => class extends Component {
    
      handleClick() {
        console.log('click');
      }
    
      render() {
        return (<WrappedComponent
          {...this.props}
          handleClick={this.handleClick}
        />);
      }
    };
    export default propsProxyHoc;
    ```
  然后我们的Usual组件render的时候, console.log(this.props) 会得到handleClick.

+ refs获取组件实例

  当我们包装Usual的时候，想获取到它的实例怎么办，可以通过引用(ref),在Usual组件挂载的时候，会执行ref的回调函数，在hoc中取到组件的实例。通过打印，可以看到它的props， state，都是可以取到的。
  
  ```
  import React, { Component } from 'react';
  
  const refHoc = WrappedComponent => class extends Component {
  
    componentDidMount() {
      console.log(this.instanceComponent, 'instanceComponent');
    }
  
    render() {
      return (<WrappedComponent
        {...this.props}
        ref={instanceComponent => this.instanceComponent = instanceComponent}
      />);
    }
  };
  
  export default refHoc;
  ```
+ 抽离state
  
  这里不是通过ref获取state， 而是通过 { props, 回调函数 } 传递给wrappedComponent组件，通过回调函数获取state。这里用的比较多的就是react处理表单的时候。通常react在处理表单的时候，一般使用的是受控组件，即把input都做成受控的，改变value的时候，用onChange事件同步到state中。当然这种操作通过Container组件也可以做到，具体的区别放到后面去比较。看一下代码就知道怎么回事了：
  
  ```
    // 普通组件Login
    import React, { Component } from 'react';
    import formCreate from './form-create';
      
    @formCreate
    export default class Login extends Component {
      render() {
        return (
          <div>
            <div>
              <label id="username">
                账户
              </label>
              <input name="username" {...this.props.getField('username')}/>
            </div>
            <div>
              <label id="password">
                密码
              </label>
              <input name="password" {...this.props.getField('password')}/>
            </div>
            <div onClick={this.props.handleSubmit}>提交</div>
            <div>other content</div>
          </div>
        )
      }
    }
  ```
  ```
    //HOC
    import React, { Component } from 'react';
    
    const formCreate = WrappedComponent => class extends Component {
    
      constructor() {
        super();
        this.state = {
          fields: {},
        }
      }
    
      onChange = key => e => {
        this.setState({
          fields: {
            ...this.state.fields,
            [key]: e.target.value,
          }
        })
      }
    
      handleSubmit = () => {
        console.log(this.state.fields);
      }
    
      getField = fieldName => {
        return {
          onChange: this.onChange(fieldName),
        }
      }
    
      render() {
        const props = {
          ...this.props,
          handleSubmit: this.handleSubmit,
          getField: this.getField,
        }
    
        return (<WrappedComponent
          {...props}
        />);
      }
    };
    export default formCreate;
   ```
   这里我们把state，onChange等方法都放到HOC里，其实是遵从的react组件的一种规范，子组件简单，傻瓜，负责展示，逻辑与操作放到Container。比如说我们在HOC获取到用户名密码之后，再去做其他操作，就方便多了，而state，处理函数放到Form组件里，只会让Form更加笨重，承担了本不属于它的工作，这样我们可能其他地方也需要用到这个组件，但是处理方式稍微不同，就很麻烦了。
   
### 反向继承
反向继承(Inheritance Inversion)，简称II，本来我是叫继承反转的...因为有个模式叫控制反转嘛...
跟属性代理的方式不同的是，II采用通过 去继承WrappedComponent，本来是一种嵌套的关系，结果II返回的组件却继承了WrappedComponent，这看起来是一种反转的关系。
通过继承WrappedComponent，除了一些静态方法，包括生命周期，state，各种function，我们都可以得到。上栗子：
   
```
 // usual
import React, { Component } from 'react';
import iiHoc from './ii-hoc';

@iiHoc
export default class Usual extends Component {
  
  constructor() {
    super();
    this.state = {
      usual: 'usual',
    }
  }

  componentDidMount() {
    console.log('didMount')
  }

  render() {
    return (
      <div>
        Usual
      </div>
    )
  }
}
```
```
//IIHOC
import React from 'react';

const iiHoc = WrappedComponent => class extends WrappedComponent {
    render() {
      console.log(this.state, 'state');
      return super.render();
    }
}

export default iiHoc;
```
iiHoc return的组件通过继承，拥有了Usual的生命周期及属性，所以didMount会打印，state也通过constructor执行，得到state.usual。
其实，你还可以通过II：

### 渲染劫持

这里HOC里定义的组件继承了WrappedComponent的render(渲染)，我们可以以此进行hijack(劫持)，也就是控制它的render函数。栗子：

```
//hijack-hoc
import React from 'react';

const hijackRenderHoc = config => WrappedComponent => class extends WrappedComponent {
  render() {
    const { style = {} } = config;
    const elementsTree = super.render();
    console.log(elementsTree, 'elementsTree');
    if (config.type === 'add-style') {
      return <div style={{...style}}>
        {elementsTree}
      </div>;
    }
    return elementsTree;
  }
};

export default hijackRenderHoc;
```
```
//usual
@hijackRenderHoc({type: 'add-style', style: { color: 'red'}})
class Usual extends Component {
  ...
}
```
### 注意点
+ 最重要的原则就是，注意高阶组件不会修改子组件，也不拷贝子组件的行为。高阶组件只是通过组合的方式将子组件包装在容器组件中，是一个无副作用的纯函数

+ 要给hoc添加class名，便于debugger。我上面的好多栗子组件都没写class 名，请不要学我，因为我实在想不出叫什么名了... 当我们在chrome里应用React-Developer-Tools的时候，组件结构可以一目了然，所以DisplayName最好还是加上。

+ 静态方法要复制

  无论PP还是II的方式，WrappedComponent的静态方法都不会复制，如果要用需要我们单独复制。
  
+ refs不会传递。 意思就是HOC里指定的ref，并不会传递到子组件，如果你要使用最好写回调函数通过props传下去。

+ 不要在render方法内部使用高阶组件。简单来说react的差分算法会去比较 NowElement === OldElement, 来决定要不要替换这个elementTree。也就是如果你每次返回的结果都不是一个引用，react以为发生了变化，去更替这个组件会导致之前组件的状态丢失。

```
 // HOC不要放到render函数里面
 
 class WrappedUsual extends Component {

  render() {
    const WrappenComponent = addStyle(addFunc(Usual));

    console.log(this.props, 'props');
    return (<div>
      <WrappedComponent />
    </div>);
  }
}
```
### 总结

 高阶组件最大的好处就是解耦和灵活性，在react的开发中还是很有用的。