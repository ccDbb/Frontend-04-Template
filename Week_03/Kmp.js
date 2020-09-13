//常规算法
function con(source,pattern){
    for(let i=0,len=source.length;i<len;i++){
        let souStr=source[i].inde;
    }
}
function kpm(source,pattern){
    let table=new Array(pattern.length).fill(0);
    {
       let i=1,j=0;
       while (i<pattern.length){
           //元素相等时设置table为j的值，j值可以体现为重复的次数
           if(pattern[i]===pattern[j]){
               ++j,++i;
               table[i]=j;
           }else{
               //不相等时，i指针继续往后走，j设置为table[j]中值
               if(j>0){
                   j=table[j];
               }else
                   ++i;
           }
       }
    }
    console.log(table)
    {
        let i=0,j=0;
        while(i<source.length){
            if(source[i]===pattern[j]){
                ++i;++j;
            }else{
                if(j>0)
                    j=table[j];
                else
                    ++i;
            }
            if(j>=pattern.length){
                return true
            }
        }
        return false
    }


}
console.log(kpm("hell","ll"));
