var myModules=(function(){
    //定义模块集合
    let modules={};
    function define(name,deps,impl) {
        for(var i=0;i<deps.length;i++){
            deps[i]=modules[deps[i]];

        }
        //impl的this指向自己并且，将引用的模块以参数形式传递过去
        modules[name]=impl.apply(impl,deps)
    }
    function get(name){
        return modules[name]
    }
}())
