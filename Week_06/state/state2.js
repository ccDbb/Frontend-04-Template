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
let bNum=0;
console.log(match("abcabxhhh"))

function start(c){
    if(c==='a'){
        return findB;
    }else{
        return start(c);
    }
}
function findB(c){
    if(c==='b'){
        if(bNum<=0){
            bNum++;
            return findC;
        }else{
            return findX;
        }


    }else{
        return start(c);
    }
}
function findC(c){
    if(c==='c'){
        return start;
    }else{
        return start(c);
    }
}
function findX(c){
    if(c==='x'){
        return end;
    }else{
        return start(c);
    }
}

function end(c){
    return end;
}
