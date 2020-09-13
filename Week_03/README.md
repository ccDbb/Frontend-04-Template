学习笔记
## 一，对字符串数据结构的了解
### 1，String.fromCharCode()

String.fromCharCode()是一个String类上的静态方法。

输入：UTf-16的字符码

返回UTf-16的字符码对应的值

```
console.log(String.fromCharCode(98)) //b
console.log(String.fromCharCode(65)) //A
console.log(String.fromCharCode(65,95,78,65,95,78))//A_NA_N
String.fromCharCode(0x404);//Є
```

### 2，String.fromCodePoint(); 

此方法和formCharCode用法一样，唯一区别是当String.fromCharCode不能返回补充字符对应的值（i.e. code points `0x010000` – `0x10FFFF`）。

但是fromCodePoint可以返回四个字节补充字符如下

```
console.log(String.fromCodePoint(0x2F804));//"你"
console.log(String.fromCharCode(0x2F804));//不知道怎么打出来，请自行在浏览器测试
```

下面试官网原文对这两个方法对比的的描述

> [`String.fromCharCode()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode) cannot return supplementary characters (i.e. code points `0x010000` – `0x10FFFF`) by specifying their code point. Instead, it requires the UTF-16 surrogate pair in order to return a supplementary character:

### 3，String.prototype.charCodeAt()

charCodeAt()是字符串对象的方法，

输入：是字符串中某个字符的所在的索引(从0开始)。

返回值：此索引对应的字符以介于0-65535中间的整数来表示的UTF-16码

拿一个官方例子

```
const sentence = 'The quick brown fox jumps over the lazy dog.';

const index = 4;

console.log(`The character code ${sentence.charCodeAt(index)} is equal to ${sentence.charAt(index)}`);
// "The character code 113 is equal to q"

```

上诉例子sentence.charCodeAt(index)返回的是字符串sentence索引为4的位置的字符，也就是'q'所对应的UTF-16编码113(可以用String.fromCharCode(113)来验证)。

### 4，String.prototype.charAt()

charAt()是字符串对象上的方法。

输入：字符串中某个字符的索引（比如第四个字符，输入3，从0开始）

输出：此索引对应的字符

```
const sentence = 'testcc';

const index = 4;

console.log(` ${sentence.charAt(index)}`);
// c
console.log(sentence.chartAt())//t 
```

如果输入的index超出了当前字符串的长度，则返回空字符串“”

如果不输入index则默认传入的参数是0，返回字符串第一个字符

### 5，String.prototupe.codePointAt()

感觉这个方法和String.prototype.charCodeAt()一样的作用，用法也一样，唯一区别是传入一个大于字符串长度的index时返回值，一个是undefined一个是NAN。

## 二、trie字典树

取字符串每个字符形成字典树，解决查找重复字符串的问题。
对象是赋值是地址赋值，并不是值赋值，所以才可以递归调用，修改指针指向下一个节点。形成数。


