const http=require('http');
http.createServer((require,response)=>{
    let body=[];
    console.log("in createServer")
    require.on("error",(error)=>{
        console.log(error);
    }).
    on("data",(chunk)=>{
        body.push(chunk);
        console.log(body)
    }).on("end",()=>{

        body = Buffer.concat(body).toString()
        console.log("body:",body)
        response.writeHead(200,{'Content-Type':'text/html'});
        response.end('hello world')
    })
}).listen(8088);
console.log("server start");
