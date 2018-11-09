# 如何学习一门计算机编程语言  

## 序言  
计算机编程是一个实践性很强的“游戏”，对于新入门者，好多人都在想，哪一门编程语言最好，我该从哪开始呢？我的回答是：语言不重要，理解编程思想才是最关键的！所有编程语言都支持的那一部分语言特性（核心子集）才是最核心的部分。所以从实际情况出发，选一门你看着顺眼，目前比较贴近你要做的工作或学习计划的计算机语言，开始你的编程之旅吧。 

### 观点阐述

### 语言的核心子集包括哪些部分

- 基本数据类型及运算符，这包括常量、变量、数组（所有的语言都支持一种基本数据结构）的定义与使用；数学运算符与逻辑运行符等知识。
- 分支与循环，这是一门语言中的流程控制部分。
- 基本库函数的使用，编程不可能从零开始，每门语言都有一个基本函数库，帮我们处理基本输入输出、文件读写等能用操作。

业界有一个二八规律，其实编程也一样，大家回头看看，我们写了那么多代码，是不是大部分都属于这门语言的核心子集部分？也就是说，我们只要掌握了一门语言的核心子集，就可以开始工作了。

### 常用编程范式
- 面向过程编程（最早的范式，即命令式）
- 面向对象编程（设计模式的概念是从它的实践活动中总结出来的）
- 函数式编程（以纯函数基础，可以任意组合函数，实现集合到集合的流式数据处理）
- 声明式编程（以数据结构的形式来表达程序执行的逻辑）
- 事件驱动编程（其分布式异步事件模式，常用来设计大规模并发应用程序）
- 面向切面编程（避免重复，分离关注点）

我们要尽量多的了解不同的编程范式，这样能拓展我们的思路。学习语言的时候，有时可以同时学时两门编程语言，对比学习两门语言的同一概念，让我们能够更容易且深入的理解它。我学习javascript的闭包时，开始怎么也理解不了；我就找了本python书，对比着学，才慢慢的理解了。

### 编程语言分类
- 编译型语言 VS 解释型语言
    - 编译型：C、C++、Pascal、Object-C、swift
    - 解释型：JavaScript、Python、Erlang、PHP、Perl、Ruby
    - 混合型：java、C#，C#，javascript（基于V8）
- 动态结构语言 VS 静态结构语言
    - 动态语言：Python、Ruby、Erlang、JavaScript、swift、PHP、SQL、Perl
    - 静态语言：C、C++、C#、Java、Object-C
- 强类型语言 VS 弱类型语言
    - 强类型：Java、C#、Python、Object-C、Ruby
    - 弱类型：JavaScript、PHP、C、C++（有争议，介于强弱之间）
    
各种类型的语言，我们都要有所了解，这样才能够全面的理解编程语言中的各种特性，在面对特定的问题时，才能做出正确的选择。

## 通过实际项目来学习语言（以Typescript为例）
项目需求：统一处理不同图形（圆形、长方形、矩形等）的面积计算。
### 面向对象三大原则 
1.Circle类讲解数据封装概念，将半径与名称封装在类内部，并提供访问方法
```
export default class Circle {
    private r: number
    private name: string
    constructor(r: number) {
        this.r = r
        this.name = 'Circle'
    }
    getName(): string {
        return this.name
    }
    area(): number {
        return Math.pow(this.r, 2) * PI
    }
}
```
2.长方形与矩形讲解继承概念
```
//rectangle.ts
export default class Rectangle {
    private a: number
    private b: number
    private name: string
    constructor(a: number, b: number, name?: string) {
        this.a = a
        this.b = b
        if (name === undefined)
            this.name = 'Rectangle'
        else
            this.name = name
    }
    getName(): string {
        return this.name
    }
    area(): number {
        return this.a * this.b
    }
}
//square.ts
export default class Square extends Rectangle {
    constructor(a: number) {
        super(a, a, 'Square')
    }
}
```
3.实例统一处理不同的形状一起计算面积，讲解多态概念
```
let shapes = Array<any>()
shapes.push(new Circle(2))
shapes.push(new Rectangle(5, 4))
shapes.push(new Square(3))
shapes.forEach((element) => {
    console.log(`shape name: ${element.getName()}; shape area: ${element.area()}`)
})
```
### 接口概念阐述
加入接口，规范形状对外部分操作要求，让错误提早到编译阶段被发现
```
export default interface IShape {
    getName(): string;
    area(): number
}
```
### 函数式编程讲解
用实例来说明怎样理解函数是一等公民，去掉我们习以为常的函数外层包裹
```
let printData = function(err: any, data: string): void {
    if (err)
        console.log(err)
    else
        console.log(data)
}
let doAjax = function (data: string, callback: Function): void {
    callback(null, data)
}
//我们习以为常的使用方式
doAjax('hello', function(err, result){
    printData(null, result)
})
//真正理解了函数是一等公民后，你会这样用
doAjax('hello', printData)
``` 
### 异步处理中的经验分享
在实践过程，处理异步调用容易误解的一个重要概念，异步函数执行的具体流程是什么样的？
```
let pf = function(data: string, n: number, callback: Function) {
    console.log(`begin run ${data}`)
    setTimeout(() => {
        console.log(`end run ${data}`)
        callback(null, data)
    }, n)
}
let p = Promise.promisify(pf);

(async () => {
    let ps = Array<any>()
    ps.push(p('1111', 2000))
    ps.push(p('2222', 1000))
    ps.push(p('3333', 3000))
    await Promise.all(ps)
})()
```

## 视频课程地址

以上是《运用typescript进行node.js后端开发精要》视频课程的概要，有兴趣的童鞋可以去观看视频。  
传送门： [快来学习Typescript，加入会编程、能编程、乐编程的行列吧！][1]

## 资源地址
https://github.com/zhoutk/sifou


  [1]: https://segmentfault.com/l/1500000016954243?r=bPcCat
