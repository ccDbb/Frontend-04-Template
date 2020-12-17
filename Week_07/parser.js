let EOF=Symbol("EOF");//结束标志
let currentToken=null,currentAttribute=null,currentTextNode=null
let stack=[{type:"document",children:[]}]
let css =require('css');
let rules=[]
const {layout} =require("../Week_08/layout")
//添加css规则
function addCssRules(text){
    var ast=css.parse(text);
    // console.log(JSON.stringify(ast,null, ' '));
    rules.push(...ast.stylesheet.rules);

}
function specificity(selector){
    let p=[0,0,0,0];
    let selectParts=selector.split(" ");
    for(let part of selectParts){
        if(part.charAt(0)=="#"){
            p[1]+=1;
        }else if(part.charAt(0)=="."){
            p[2]+=1;
        }else{
            p[3]+=1;
        }
    }
    return p;

}
//比较选择器优先级
function compare(sp1,sp2){
    if(sp1[0]-sp2[0]){
        return sp1[0]-sp2[0]
    }else if(sp1[1]-sp2[1]){
        return sp1[1]-sp2[1]
    }else if(sp1[2]-sp2[2]){
        return sp1[2]-sp2[2]
    }else{
        return sp1[3]-sp2[3]
    }

}
//判断css是否匹配当前elemnet
function computesCSS(element){
    var elements=stack.slice().reverse();
    if(!element.computedStyle){
        element.computedStyle={};
    }
    for(let rule of rules){//处理每一条css rules
        //每条选择器处理为单个简单选择器，并倒叙排列-这样当前最新的选择器处于第一位
        let selectorParts=rule.selectors[0].split(" ").reverse();
        //判断第一个选择器是否和当前元素匹配
        if(!match(element,selectorParts[0])){
            continue;
        }
        let matched=false;
        let j=1;
        for(let i=0;i<elements.length;i++){
            if(match(elements[i],selectorParts[j])){
                j++;
            }
        }
        if(j>=selectorParts.length){
            matched=true;
        }
        //匹配了当前元素
        if(matched){
            let sp=specificity(rule.selectors[0]);
            var computedStyle=element.computedStyle;
            for(let declaration of rule.declarations){
                if(!computedStyle[declaration.property]) {
                    computedStyle[declaration.property] = {};
                }
                if(!computedStyle[declaration.property].specificity ||
                    compare(computedStyle[declaration.property].specificity,sp)<0
                ){
                    computedStyle[declaration.property].value=declaration.value;
                    computedStyle[declaration.property].specificity=sp;
                }


            }
            // console.log(element.computedStyle)
        }
    }
}
//判断当前元素是否匹配
//假设selector都是简单选择器，也就是# . 或者tagname
function match(element,selector){
    if(!element || !element.attributes || !selector){
        return false;
    }
    if(selector.charAt(0)=="#"){
        var attr=element.attributes.filter(attr=>attr.name=='id')[0];
        if(attr && attr.value === selector.replace("#","")){
            return true;
        }
    }else if(selector.charAt(0)=="."){
        var attr=element.attributes.filter(attr=>attr.name=='class')[0];
        if(attr && attr.value === selector.replace(".","")){
            return true;
        }
    }else{
        if(element.tagName == selector){
            return true;
        }
    }
    return false;
}
function emit(token){

   let top=stack[stack.length-1];
   if(token.type=="startTag"){//是开始标签
       let element={
           type:'element',
           attributes:[],
           children:[]
       }

       element.tagName=token.tagName;
       for(let p in token){
           if(p!='tagName' && p!='type'){
               element.attributes.push({
                   name:p,
                   value:token[p]
               })
           }
       }
       top.children.push(element)
      // element.parent=top;
       computesCSS(element);
       if(!token.isSelfClosing){
           stack.push(element);
       }
       currentTextNode=null
   }else if(token.type=="endTag"){
       if(top.tagName != token.tagName){
           throw new Error("Tag start end not match")
       }else{
           if(token.tagName=="style"){
               addCssRules(top.children[0].content)
           }
           layout(top);
           stack.pop();
       }
       currentTextNode=null

   }else if(token.type==="text"){
        if(currentTextNode==null){
            currentTextNode={
                type:'text',
                content:""
            }
            top.children.push(currentTextNode)
        }
       currentTextNode.content+=token.content;
    }

}

//<html></html> </>
//html标签总共分为三类：开始标签(例如：<a>)，结束标签(例如：</a>)，自封闭标签(例如：<br/>)，
function data(c){
    if(c=='<'){//开始标签
        return tagOpen;
    }else if(c==EOF){//文本结束
        emit({type:"EOF"})
        return
    }else{//如果不是开始标签，继续调用data函数，直到找到<
        emit({
            type:'text',
            content:c
        })
        return data;
    }

}
//开始标签内容</div>
function tagOpen(c){
    if(c==='/'){//结束标签
        return endTagOpen;
    }else if(c.match(/^[a-zA-A]$/)){//<后边有一个字符就会进入tagName状态
        currentToken={
            type:'startTag',
            tagName:""
        }
        return tagName(c);//标签的tagname

    }else{

    }
}
//结束标签
function endTagOpen(c){
    if(c===">"){

    }else if(c.match(/^[a-zA-Z]$/)){
        currentToken={
            type:"endTag",
            tagName:""
        }
        return tagName(c);

    }else if(c===EOF){
        emit({type:"EOF"})
    }
}
//开始标签之后的内容 -标签名称 <html data=ss >
function tagName(c){
    if(c.match(/^[\t\n\f ]$/)){//空格时开始解析属性名
        return beforeAttributeName;
    }else if(c==="/"){//自封闭标签结束标签
        return selfClosingStartTag;

    }else if(c.match(/^[a-zA-Z]$/)){//标签名称
        currentToken.tagName+=c//.toLowerCase();
        return tagName;
    }else if(c===">"){//标签的名称结束了
        emit(currentToken);
        return data

    }else{
        return tagName;
    }

}
//标签名称之后是空格，开始解析属性。
function beforeAttributeName(c){
    if(c.match(/^[\t\n\f ]$/)){

        return beforeAttributeName;

    }else if(c==">" || c=="/" || c==EOF){//所有的属性结束

        return afterAttributeName(c);
    }else{
        currentAttribute={
            name:"",
            value:""
        }
        return attrbuteName(c);
    }

}
//获取属性名<html meat>
function attrbuteName(c){
    if(c.match(/^[\t\n\f ]$/) || c=="/" || c==">" || c==EOF){//新属性的开始
        return afterAttributeName(c)
    }else if(c=="="){//有等号的时候进入属性值阶段
        return beforAttrbuteValue;

    }else if(c=="\"" || c=="'" || c==="<"){

    }else if(c=="\u0000"){

    }else{
        currentAttribute.name+=c;
        return attrbuteName;
    }

}
//获取属性值<html mead= />
function beforAttrbuteValue(c){
    if(c.match(/^[\t\n\f ]$/) || c=="/" || c==">" || c==EOF){

      return  beforAttrbuteValue
    }else if(c=="\""){//双引号
        return doubleQuotedAttrbuteValue;

    }else if(c=="'"){//单引号
        return singleQuotedAttrbuteValue;

    }else{

        return UnQuotedAtrrbuteValue(c);
    }

}
//双引号值 <htm s="s">
function doubleQuotedAttrbuteValue(c){
    if(c=="\""){//属性值结束
        currentToken[currentAttribute.name]=currentAttribute.value;
        return afterQuoteAttrbuteValue;
    }else if(c=="\u0000"){

    }else if(c==EOF){

    }else {
        currentAttribute.value+=c;
        return doubleQuotedAttrbuteValue
    }

}
//单引号值 <htm s="s">
function singleQuotedAttrbuteValue(c){
    if(c=="\""){//属性值结束
        currentToken[currentAttribute.name]=currentAttribute.value;
        return afterQuoteAttrbuteValue;
    }else if(c=="\u0000"){

    }else if(c==EOF){

    }else {
        currentAttribute.value+=c;
        return singleQuotedAttrbuteValue
    }

}
//单引号值 <htm s="s">
function UnQuotedAtrrbuteValue(c){
    if(c.match(/^[\f\n\t ]$/)){//属性值结束
        currentToken[currentAttribute.name]=currentAttribute.value;
        return afterQuoteAttrbuteValue;
    }else if(c==">"){//整个标签结束
        currentToken[currentAttribute.name]=currentAttribute.value;
        emit(currentToken);
        return data
    }else if(c=="/"){//自封闭标签
        currentToken[currentAttribute.name]=currentAttribute.value;
        return selfClosingStartTag

    }else if(c=="\"" || c=="'" || c=="<" || c=="=" || c=="`"){

    }else if(c==EOF){

    }else{
        currentAttribute.value+=c;
        return UnQuotedAtrrbuteValue
    }

}
//获取属性值结束<img id="myid"/>
function afterQuoteAttrbuteValue(c){
    if(c.match(/^[\f\n\t ]$/)){
        return beforeAttributeName
    }else if(c=="/"){
        return selfClosingStartTag

    }else if(c==">"){
        currentToken[currentAttribute.name]=currentAttribute.value
        emit(currentToken)
        return data
    }else if(c==EOF){

    }else{
        currentAttribute.value+=c;
        return doubleQuotedAttrbuteValue

    }
}
//获取属性结束
function afterAttributeName(c){
    if(c.match(/^[\t\n\f ]$/)){
       return afterAttributeName
    }else if(c=="/"){
        return selfClosingStartTag
    }else if(c==">"){
        currentToken[currentAttribute.name]=currentAttribute.value;
        emit(currentToken);
        return data
    }else if(c=="="){
        return beforAttrbuteValue
    }else if(c=="EOF"){

    }else{
        currentToken[currentAttribute.name]=currentAttribute.value;
        currentAttribute={
            name:"",
            value:""
        }
        return attrbuteName(c)
    }

}
//自封闭标签 <br/>
function selfClosingStartTag(c){
    if(c==">"){//自封闭标签结束
        currentToken.isSelfClosing=true;
        emit(currentToken)
        return data;

    }else if(c==EOF){//自封闭标签的属性名称

    }else{

    }
}

function parserHTML(html) {
    // console.log(html);
    let state=data;
    for(let c of html){
        state=state(c);
    }
    state=state(EOF);
    return stack[0];
    // console.dir(stack)
}
module.exports= {
    parserHTML
}
