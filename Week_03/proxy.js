let obj={
    a:1,
    b:3
}
let po=new Proxy(obj,{
    set(target,prop,receiver){
        console.log(target,prop,receiver);
    }
})

