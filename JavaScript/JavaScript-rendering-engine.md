# 回流、重绘及其优化

## 渲染过程
渲染引擎通过通过网络请求接收渲染内容

1. 解析HTML抽象DOM tree
2. 抽象出Render tree
3. 布局（layout）render tree
4. 绘画render tree

### 抽象DOM tree
> 渲染引擎的第一步是解析html文档并将解析的元素转换为dom树中的实际dom节点。
![image](https://cdn-images-1.medium.com/max/800/1*ezFoXqgf91umls9FqO0HsQ.png)

### 抽象CSSOM tree
> 当浏览器解析dom的时候，遇到link标签，引用外部的css样式表，引擎会将css抽象成cssom
![image](https://cdn-images-1.medium.com/max/800/1*5YU1su2mdzHEQ5iDisKUyw.png)

### 构建渲染树
> HTML中的可视指令与来自cssom树的样式数据结合使用来创建渲染树。
![image](https://cdn-images-1.medium.com/max/800/1*WHR_08AD8APDITQ-4CFDgg.png)
为了构建渲染树，浏览器大致如下：

- 从dom树的根开始，遍历每个可见节点。某些节点不可见（例如，脚本标记，元标记等），并且由于它们未反映在呈现的输出中而被省略。display:none 也会使节点省略
- 对于每个可见节点，浏览器找到适当的匹配cssom规则并应用它们
- 它会发布带有内容和计算样式的可见节点
- 每个渲染器代表一个矩形区域，通常对应于一个节点的CSS框。
它包括几何信息，如宽度，高度和位置

### 渲染树的布局
>当渲染器被创建并添加到树中时，它没有位置和大小。计算这些值称为布局。

> html使用基于流的布局模型，这意味着大多数时候它可以一次性计算几何。坐标系相对于根渲染器。使用顶部和左侧坐标。

> 布局是一个递归过程，从根元素开始，也就是html，每个渲染器都会去计算他自己的位置和大小
### 绘制渲染树
> 在这个阶段，遍历渲染器树，调用渲染器的paint（）方法在屏幕上显示内容。

渲染分为全局渲染和增量渲染

### 处理脚本和样式表的顺序
> 当解析器到达script标记时，脚本将被立即解析并执行。
文档的解析将暂停，直到脚本执行完毕。
这意味着该过程是同步的

这也是为什么把script标签放在body结束之前

html5添加了一个选项，将脚本标记为异步，以便它可以被其他线程解析和执行。

## 回流和重绘（reflow和repaint）
- 回流： 意味着元素的内容、结构、位置或尺寸发生了变化，需要重新计算样式和渲染树；
- 重绘：意味着元素发生的改变只影响了节点的一些样式（背景色，边框颜色，文字颜色等），只需要应用新样式绘制这个元素就可以了；

### 何时触发回流和重绘
- repaint重绘：
  1. reflow回流必定引起repaint重绘，重绘可以单独触发
  2. 背景色、颜色、字体改变（注意：字体大小发生变化时，会触发回流）
- reflow回流：
  1. 页面第一次渲染（初始化）
  2. DOM树变化（如：增删节点）
  3. Render树变化（如：padding改变）
  4. 浏览器窗口resize
  5. 当你查询布局信息，包括offsetLeft、offsetTop、offsetWidth、offsetHeight、 scrollTop/Left/Width/Height、clientTop/Left/Width/Height、调用了getComputedStyle()或者IE的currentStyle时，浏览器为了返回最新值，会触发回流。
### 优化渲染性能，减少回流和重绘
**减少reflow和repaint**
- 尽量避免改变布局属性。如width, height, left, top。
- 除了transforms 或者 opacity属性都会引起重绘，做动画的时候要注意，尽量使用这两个属性；
- 使用Flexbox。
- 避免多次读取部分布局属性（同上）
- 将复杂的节点元素脱离文档流，降低回流成本

**javascript**
1. 避免使用setTimeout setInterval 来更新视图，这会在render之后提交修改需求
2. 在micro-tasks中修改dom。这会在render之前提交修改需求
![image](https://github.com/lulusir/my-blog/blob/master/images/javascript/eventloop.png)
2. 把script标签放在body结束之前，或者使用异步script(defer， async)

**CSS**
- 减少选择器的复杂性。
- 避免逐个修改节点样式，尽量一次性修改，减少style修改所影响元素的数量,使用cssText来替代要多次修改的style属性
```
// 设置单个属性
elt.style.color = "blue"; 

// 在单个语句中设置多个样式
elt.style.cssText = "color: blue; border: 1px solid black"; 

// 在单个语句中设置多个样式
elt.setAttribute("style", "color:red; border: 1px solid blue;");

```
- 通过改变类名来修改样式

**DOM**
1. 使元素脱离文档流
2. 对其应用多重修改
3. 把元素带回文档中
> 这个过程会触发两次回流，第一步和第三步。把会触发多次回流的步骤放在第二步

三种基本方法：
- display:none，然后修改样式，然后在恢复
- 使用文档片段（document fragment）在当前dom树之外构建一个子树，再把他拷贝回文档。
```javascript
var fragment = document.createDocumentFragment()
... 在这里进行dom操作，可以减少回流和重绘的次数
document.getElementById('#app').appendChild(fragment)
```
- 将原始元素拷贝到一个脱离文档的节点中，修改副本，完成后替换原始元素
```javascript
var old = document.getElementById('#app')
var clone = old.cloneNode(true)
... 在这里进行dom操作，可以减少回流和重绘的次数
old.parentNode.replaceChild(clone, old)
```

**缓存布局信息**
> 前面提到在查询布局信息（offsetLeft...）的时候也会引起回流，我们在使用的时候可以把布局信息缓存起来，减少回流次数

这里贴上<<高性能javascript>>中的例子：把myElement元素沿对角线移动，每次移动一个像素，从100*100的位置开始，到500*500的位置结束。在timeout循环体中你可以使用下面的方法
```javascript
// 低效的
myElement.style.left = 1 + myElement.offsetLeft + 'px'
myElement.style.top = 1 + myElement.offsetTop + 'px'
if (myElement.offsetTop >= 500) {
  stopAnimation();
}
```
```javascript
// 优化
// 在循环外层获取初始值
var current = myElement.offsetLeft
.
.
.
// 直接使用current变量，不再查询偏移量
current++
myElement.style.left = current + 'px'
myElement.style.top = current + 'px'
if (current >= 500) {
  stopAnimation();
}
```

**使元素进行动画效果的时候脱离文档流**
在元素发生动画效果的时候，会引起底部元素的回流，这个影响可能很大，也可能很小，取决于元素在文档流的位置
1. 动画元素使用绝对定位，使其脱离文档流
2. 这里再进行旋转，跳跃，都不会影响到整个页面的回流 
3. 在动画结束时恢复定位，从而只会下移一次文档的其他元素。

参考[DOM操作成本到底高在哪儿](http://palmer.arkstack.cn/2018/03/DOM%E6%93%8D%E4%BD%9C%E6%88%90%E6%9C%AC%E5%88%B0%E5%BA%95%E9%AB%98%E5%9C%A8%E5%93%AA%E5%84%BF/)  
参考[高性能javascript](https://book.douban.com/subject/26599677/)  
参考[How JavaScript works: the rendering engine and tips to optimize its performance](https://blog.sessionstack.com/how-javascript-works-the-rendering-engine-and-tips-to-optimize-its-performance-7b95553baeda)