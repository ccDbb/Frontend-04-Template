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
    //定义交叉轴对其方式stretch，如果元素未设置高度则铺满高度
    if(!style.alignItems || style.alignItems === 'auto'){
        style.alignItems='stretch'
    }
    //定义主轴对其方式，flex-start左对齐
    if(!style.justifyContent || style.justifyContent === 'auto'){
        style.justifyContent='flex-start'
    }
    //定义如果主轴排不下如何换行nowrap默认不换行
    if(!style.flexWrap || style.flexWrap === 'auto'){
        style.flexWrap='nowrap'
    }
    //定义多个交叉轴时对其方式。stretch默认
    if(!style.alignContent || style.alignContent === 'auto'){
        style.alignContent='stretch'
    }

    var mainSize,mainStart,mainEnd,mainSign,mainBase,
        crossSize,crossStart,crossEnd,crossSign,crossBase;
    if(style.flexDirection === 'row'){
        mainSize='width';
        mainStart='left';
        mainEnd='right';
        mainSign=+1;

        crossSign='height';
        crossStart='top';
        crossEnd='bottom';
    }
    if(style.flexDirection === 'row-reverse'){
        mainSize='width';
        mainStart='right';
        mainEnd='left';
        mainSign=-1;

        crossSign='height';
        crossStart='top';
        crossEnd='bottom';
    }
    if(style.flexDirection === 'column'){
        mainSize='height';
        mainStart='top';
        mainEnd='bottom';
        mainSign=+1;

        crossSign='width';
        crossStart='lef';
        crossEnd='right';
    }
    if(style.flexDirection === 'column-reverse'){
        mainSize='height';
        mainStart='bottom';
        mainEnd='top';
        mainSign=-1;

        crossSign='width';
        crossStart='lef';
        crossEnd='right';
    }
    if(style.flexWrap == 'wrap-reverse'){
        var tmp=crossStart;
        crossStart=crossEnd;
        crossEnd=tmp;
        crossSign=-1
    }else{
        crossBase=0;
        crossSign=1;
    }

    //如果父类主轴尺寸为auto，则，所有子元素都能放入一行，父元素宽度为所有子元素宽度的和
    var isAutoMainSize=false;
    if(!style[mainSize]){//auto size
        elementStyle[mainSize]=0;
        for(let i=0;i<items.length;i++){
            var item=items[i];
            var itemStyle=getStyle(item);
            if(itemStyle[mainSize]!=null || itemStyle[mainSize] !== (void 0))
            elementStyle[mainSize]+=itemStyle[mainSize];
        }
        isAutoMainSize=true;
    }

    //行
    let flexLine=[];
    var flexLines=[flexLine];

    var mainSpace=elementStyle[mainSize]
    var crossSpace=0;

    //把每个子元素放入行
    for(var i=0;i<items.length;i++){
        var item=items[i];
        var itemStyle=getStyle(item);
        if(itemStyle[mainSize] === null){
            itemStyle[mainSize]=0
        }

        if(itemStyle.flex){
            flexLine.push(items)
        }else if(style.flexWrap === 'nowrap' && isAutoMainSize){//没太搞明白，上边明明判断过了为何这还要判断一遍
            mainSpace-=itemStyle[mainSize];
            if(itemStyle[crossSize]!=null && itemStyle[crossSize]!==(void 0))
                crossSpace=Math.max(crossSpace,itemStyle[crossSize]);
            flexLine.push(items)

        }else{
            if(itemStyle[mainSize]>style[mainSize]){
                itemStyle[mainSize]=style[mainSize]
            }
            if(itemStyle[mainSize] < mainSpace){
                flexLine.push(item);
            }else{
                flexLine.mainSpace=mainSpace;
                flexLine.crossSpace=crossSpace;

                flexLine=[]
                flexLines.push(flexLine);
                flexLine.push(item);
                crossSpace=0;
            }
            if(itemStyle[crossSize]!==null && itemStyle[crossSize] !==(void 0))
                crossSpace=Math.max(crossSpace,itemStyle[crossSpace])
            mainSpace-=itemStyle[mainSize]
        }
    }
    flexLine.mainSpace=mainSpace;

    if(style.flexWrap == 'nowrap' || isAutoMainSize){
        flexLine.crossSpace=(style[crossSize] !== undefined) ? style[crossSize]:crossSpace;
    }
    console.log("-----items-----")
    console.log(items)

    //计算主轴item上尺寸

    if(mainSpace<0){//在一行的情况下-----我的理解
        var scalar=style[mainSize] / (style[mainSize]-mainSpace)
        var currentMain=mainBase;
        for( var i=0; i<items.length;i++){
            var item=items[i];
            var itemStyle=getStyle(item);

            if(itemStyle.flex){
                itemStyle[mainSize]=0;
            }

            itemStyle[mainSize]=itemStyle[mainSize]*scalar;
            itemStyle[mainStart]=currentMain;
            itemStyle[mainEnd]=currentMain+itemStyle[mainSize]*mainSign;
            currentMain=itemStyle[mainEnd]
        }
    }else{
        flexLines.forEach((items)=>{
            var mainSpace=items.mainSpace;
            var flexTotal=0;
            for(var i=0;i<items.length;i++){
                let item=items[i];
                let itemStyle=getStyle(item);

                if(itemStyle.flex !==null && (itemStyle.flex !== (void 0))){
                    flexTotal+=itemStyle.flex;
                    continue;
                }
            }

            //如果有flex属性，那么flex属性对应的值将撑满整个主轴
            if(flexTotal>0){
                var currentMain=mainBase;
                for(var i=0;i<items.length;i++){
                    let item=items[i];
                    let itemStyle=getStyle(item);

                    if(itemStyle.flex){
                        itemStyle[mainSign]=itemStyle.flex * (mainSpace / flexTotal);
                    }

                    itemStyle[mainStart]=currentMain;
                    itemStyle[mainEnd]=currentMain+itemStyle[mainSize]*mainSign;
                    currentMain=itemStyle[mainEnd]
                }
            }else{//没有flex属性，需要判断对其方式了
                let currenMain=mainBase;
                let step=0;
                if(style.justifyContent === 'flex-start' ){

                }
                if(style.justifyContent === 'flex-end'){
                    currentMain=mainSpace *mainSign +mainBase;
                }
                if(style.justifyContent === 'center'){
                    currentMain=(mainSpace / 2) * mainSign + mainBase
                }
                if(style.justifyContent === 'space-between'){
                    currentMain = mainBase;
                    step=mainSpace / (items.length-1) * mainSign;
                }
                if(style.justifyContent === 'space-around'){
                    step=mainSpace / items.length * mainSign;
                    currentMain = step / 2 +mainBase;
                }

                for(var i=0;i<items.length; i++){
                    let item=items[i];
                    let itemStyle=getStyle(item);

                    itemStyle[mainStart]=currentMain;
                    itemStyle[mainEnd]=currentMain+itemStyle[mainSize]*mainSign;
                    currentMain=itemStyle[mainEnd]+step

                }



            }

        })

    }




}
module.exports={
    layout
}
