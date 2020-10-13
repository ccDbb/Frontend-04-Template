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
console.log(match("ababcdefjjjjg"))
function start(c){
  if(c==='a'){
      return findB;
  }else{
      return start(c);
  }
}
function findB(c){
    if(c==='b'){
        return findC;
    }else{
        return start(c);
    }
}
function findC(c){
    if(c==='c'){
        return findD;
    }else{
        return start(c);
    }
}
function findD(c){
    if(c==='d'){
        return findE;
    }else{
        return start(c);
    }
}
function findE(c){
    if(c==='e'){
        return findF;
    }else{
        return start(c);
    }
}
function findF(c){
    if(c==='f'){
        return end;
    }else{
        return start(c);
    }
}
function end(c){
    return end;
}
