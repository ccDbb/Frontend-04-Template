class Sorted{
    constructor(list,compara) {
        this.list=list?list:new Array();
        this.compara=compara?compara:(a,b)=>{return (a-b)>0?true:false};
    }
    push(value){
        //如果已经有元素，不再重复添加
        let isHas=this.list.filter(item=>{
            return item[0]==value[0] && item[1]==value[1];
        })
        if(isHas.length>0)return;
        //新节点放到list最后
        this.list.push(value);
        let childIndex=this.list.length-1;
        while(childIndex>0){
            //找到父节点index
            let parentIndex=Math.floor((childIndex-1)/2),tem=this.list[parentIndex];
            //父节点和当前节点对比，如果父节点小于当前节点，退出。
            if(!this.compara(this.list[parentIndex],value))break;
            //如果父大，交换父子值。
            this.list[parentIndex]=value;
            this.list[childIndex]=tem;
            //修改当前节点指针，继续向上层比较。
            childIndex=parentIndex;
        }

    }
    take(){
        if(this.list.length<=0)return;
        //取顶节点值
        let result=this.list[0];
        this.remove(0);
        return result;
    }
    remove(index){
        //将最后一个节点赋值给首节点，之后依次下沉比较大的值
        this.list[index]=this.list[this.list.length-1];
        //删除最后一个元素
        this.list.pop();
        //如果当前指针小于数组长度，进入循环
        while (index<this.list.length){
            let listLength=this.list.length;
            let child1Index=2*index+1,
            child2Index=2*index+2,
                minIndex=child1Index;
            //如果没有子节点，证明当前父节点一定是最小的。
            if(child1Index>=listLength){
                break;
            }
            //取左右子节点中最小的节点
           if(child2Index<listLength && this.compara(this.list[child1Index],this.list[child2Index])){
               minIndex=child2Index;
           }

            //比较当前父节点与子节点最小的值，如果比子大，交换。如果父节点最小，那么退出当前循环。
            if(this.compara(this.list[index],this.list[minIndex])){
                let tem=this.list[index];
                this.list[index]=this.list[minIndex];
                this.list[minIndex]=tem;
                index=minIndex;

            }else{
                break;
            }

        }


    }
    get data(){
        return this.list;
    }
    get length(){
        return this.list.length;
    }

}
