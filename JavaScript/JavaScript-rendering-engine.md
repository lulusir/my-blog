# javascript如何工作：渲染引擎​​和优化其性能的技巧

## 浏览器的组成
- User interface：地址栏...除了页面主体的部分
- Browser engine: 处理user interface 和rendering engine 的交互
- Rendering engine：渲染页面
- Networking：网络调用
- UI backend：绘画一些核心ui例如弹窗。
- JavaScript engine：解释js脚本
- Data persistence：本地缓存数据localStorage, indexDB, WebSQL and FileSystem.

### 本文主要关注rendering engine 渲染引擎是如何工作的
#### 渲染引擎
- Gecko — Firefox
- WebKit — Safari
- Blink — Chrome, Opera (from version 15 onwards)

#### 渲染过程
渲染引擎通过通过网络请求接收渲染内容

1. 解析HTML抽象DOM tree
2. 抽象出Render tree
3. 布局（layout）render tree
4. 绘画render tree

##### 抽象DOM tree
> 渲染引擎的第一步是解析html文档并将解析的元素转换为dom树中的实际dom节点。
![image](https://cdn-images-1.medium.com/max/800/1*ezFoXqgf91umls9FqO0HsQ.png)

##### 抽象CSSOM tree
> 当浏览器解析dom的时候，遇到link标签，引用外部的css样式表，引擎会将css抽象成cssom
![image](https://cdn-images-1.medium.com/max/800/1*5YU1su2mdzHEQ5iDisKUyw.png)
为啥CSSOM也会是树结构？因为子节点会继承父节点的样式。
##### 构建渲染树
> HTML中的可视指令与来自cssom树的样式数据结合使用来创建渲染树。
![image](https://cdn-images-1.medium.com/max/800/1*WHR_08AD8APDITQ-4CFDgg.png)
为了构建渲染树，浏览器大致如下：

- 从dom树的根开始，遍历每个可见节点。某些节点不可见（例如，脚本标记，元标记等），并且由于它们未反映在呈现的输出中而被省略。display:none 也会使节点省略
- 对于每个可见节点，浏览器找到适当的匹配cssom规则并应用它们
- 它会发布带有内容和计算样式的可见节点
- 每个渲染器代表一个矩形区域，通常对应于一个节点的CSS框。
它包括几何信息，如宽度，高度和位置

##### 渲染树的布局
>当渲染器被创建并添加到树中时，它没有位置和大小。计算这些值称为布局。

> html使用基于流的布局模型，这意味着大多数时候它可以一次性计算几何。坐标系相对于根渲染器。使用顶部和左侧坐标。

> 布局是一个递归过程，从根元素开始，也就是html，每个渲染器都会去计算他自己的位置和大小
##### 绘制渲染树
> 在这个阶段，遍历渲染器树，调用渲染器的paint（）方法在屏幕上显示内容。

渲染分为全局渲染和增量渲染

##### 处理脚本和样式表的顺序
> 当解析器到达script标记时，脚本将被立即解析并执行。
文档的解析将暂停，直到脚本执行完毕。
这意味着该过程是同步的

这也是为什么把script标签放在body结束之前

html5添加了一个选项，将脚本标记为异步，以便它可以被其他线程解析和执行。

##### 优化渲染性能

**javascript**
1. 避免使用setTimeout setInterval 来更新视图，因为回调触发的时间不好掌控
2. 使用异步js，把js放在body结束前
2. 把密集计算移动到Web Workers

**CSS**
- 减少选择器的复杂性。与构造样式本身的其余工作相比，选择器复杂度可能需要计算元素样式所需时间的50％以上。
- 减少style修改所影响元素的数量，就是不要用打炮打蚊子

**减少reflow和repaint**
- 尽可能减少布局的数量。当您更改样式时，浏览器会检查是否有任何更改要求重新计算布局。对宽度，高度，左侧，顶部等属性的更改以及与几何图形相关的属性的更改都需要布局。所以，尽量避免改变它们。
- 尽可能在较早的布局模型上使用Flexbox。
- 避免逐个修改节点样式，尽量一次性修改
- 使用DocumentFragment将需要多次修改的DOM元素缓存，最后一次性append到真实DOM中渲染
- 可以将需要多次修改的DOM元素设置display: none，操作完再显示。（因为隐藏元素不在render树内，因此修改隐藏元素不会触发回流重绘）
- 避免多次读取某些属性
- 将复杂的节点元素脱离文档流，降低回流成本（这些属性包括offsetLeft、offsetTop、offsetWidth、offsetHeight、 scrollTop/Left/Width/Height、clientTop/Left/Width/Height、调用了getComputedStyle()或者IE的currentStyle）

本文翻译自，[How JavaScript works: the rendering engine and tips to optimize its performance](https://blog.sessionstack.com/how-javascript-works-the-rendering-engine-and-tips-to-optimize-its-performance-7b95553baeda)

参考[DOM操作成本到底高在哪儿](http://palmer.arkstack.cn/2018/03/DOM%E6%93%8D%E4%BD%9C%E6%88%90%E6%9C%AC%E5%88%B0%E5%BA%95%E9%AB%98%E5%9C%A8%E5%93%AA%E5%84%BF/)