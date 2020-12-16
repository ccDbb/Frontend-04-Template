//处理元素属性
function getStyle(element){
    if(!element.style)element.style={};

    console.log("getStyle",element.computedStyle)

    for(let prop in element.computedStyle){

        let pval=element.computedStyle[prop].value;
        element.style[prop]=element.computedStyle[prop].value;

        if(pval.toString().match(/px$/)){
            element.style[prop]=parseInt(pval);
        }
        if(pval.toString().match(/[0-9\.]+$/)){
            element.style[prop]=parseInt(pval);
        }

    }

    return element.style;

}


function layout(element){
    if(!element.computedStyle)return false;

    let elementStyle=getStyle(element);

    if(elementStyle.display!=='flex')return ;

    let items=element.children.filter(e=>e.type=='element')

    items.sort((a,b)=>{
        return (a.order || 0) - ( b.order || 0 );
    })

    var style=elementStyle;

    ['width','height'].forEach((size)=>{
        if(element.size==='auto' || element.size === ''){
            element.size=null;
        }
    })

    if(!style.flexDirection || style.flexDirection === 'auto'){
        style.flexDirection='row';
    }
    if(!style.alignItems || style.alignItems === 'auto'){
        style.alignItems='stretch'
    }
    if(!style.justifyContent || style.justifyContent === 'auto'){
        style.justifyContent='flex-start'
    }

    if(!style.flexWrap || style.flexWrap === 'auto'){
        style.flexWrap='nowrap'
    }
    if(!style.alignContent || style.alignContent === 'auto'){
        style.alignContent='stretch'
    }

    var mainSize,mainStart,mainEnd,mainSign,mainBase,//主轴属性
        crossSize,crossStart,crossEnd,crossSign,crossBase;//交叉轴属性

    if(style.flexDirection=='row'){//x轴正向排列

        mainSize='width';
        mainStart='left';
        mainEnd='right';
        mainSign=+1;
        mainBase=0;

        crossSize='height';
        crossStart='top'
        crossEnd='bottom'

    }
    if(style.flexDirection=='row-reverse'){

        mainSize='width';
        mainStart='right';
        mainEnd='end';
        mainSign=-1;
        mainBase=style.width;

        crossSize='height';
        crossStart='top'
        crossEnd='bottom'
    }
    if(style.flexDirection=='column'){

        mainSize='height';
        mainStart='top';
        mainEnd='bottom';
        mainSign=+1;
        mainBase=0;

        crossSize='width';
        crossStart='left'
        crossEnd='right'
    }
    if(style.flexDirection=='column-reverse'){

        mainSize='height';
        mainStart='bottom';
        mainEnd='top';
        mainSign=-1;
        mainBase=style.height;

        crossSize='width';
        crossStart='left'
        crossEnd='right'
    }

    if(style.flexWarp=='warp-reverse'){
        var tmp =crossStart;
        crossStart=crossEnd;
        crossEnd=tmp;
        crossSign=-1;

    }else {
        crossBase=0;
        crossSign=1;
    }



}
module.exports={
    layout
}
