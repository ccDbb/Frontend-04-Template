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
        // console.log("body:",body)
        response.writeHead(200,{'Content-Type':'text/html'});
        response.end(
       `<html mea=a>
            <head>
                <style>
                #container{
                width: 500px;
                height: 300px;
                display: flex;
                background-color: rgb(247,49,49)
                }
                    #container #myid{
                        width: 200px;
                        height: 100px;
                        background-color: rgb(247,255,49)
                        
                    }
                    #container .c1{
                        flex:1;
                        background-color: rgb(247,0,255)
                    }
                </style>
            </head>
            <body>
                <div id="container">
                    <div id="myid"></div>
                    <div class="c1"></div>
                </div>
            </body>
         </html>`)
    })
}).listen(8088);
console.log("server start");
