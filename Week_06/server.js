const http=require('http');
http.createServer((require,response)=>{
    let body=[];
    console.log("in createServer")
    require.on("error",(error)=>{
        console.log(error);
    }).
    on("data",(chunk)=>{
        body.push(chunk.toString());
    }).on("end",()=>{
        console.log("end")
        body=Buffer.connect(body).toString();
        console.log("body:",body)
        response.writeHead(200,{'Content-Type':'text/html'});
        response.end(' hello world')
    })
}).listen(8088);
console.log("server start");
