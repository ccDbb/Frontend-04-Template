function match(str){
    let state=start;
    for(let c of str){
        state=state(c);
    }
    if(state==end){
        return true;
    }else{
        return false;
    }
}
console.log(match("abababx"))
function start(c){
    if(c==='a'){
        return findB;
    }else{
        return start(c);
    }
}
function findB(c) {
    if(c==='b'){
        return findA1()
    }else{
        return start(c);
    }

}
function findA1(c){
    if(c==='a'){
        return findB;
    }else{
        return start(c);
    }
}
