class Sorted{
    constructor(list,compara) {
        this.list=list?list:new Array();
        this.compara=compara?compara:(a,b)=>{return (a-b)>0?true:false};
        this.length=this.list?this.list.length:0;
    }
    push(value){
        let isHas=this.list.filter(item=>{
            return item[0]==value[0] && item[1]==value[1];
        })
        if(isHas.length>0)return;
        this.list.push(value);
        this.length=this.list.length;
    }
    take(){
        if(!this.list || this.list.length<=0){
            return;
        }
        let min=this.list[0],data=this.list,indexc=0;
        for(let i=0,len=data.length;i<len;i++){
            if(this.compara(min,data[i])){
                min=data[i];
                indexc=i;
            }

        }
        data[indexc]=data[data.length-1];
        data.pop();
        this.length=data.length;
        return min;
    }
    get data(){
        return this.list;
    }



}
