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
                body div{
                display: flex;
                }
                    body div #myid{
                        width: 100px;
                        background-color: red;
                    }
                    body div img{
                        width: 30px;
                        background-color: #ff1111;
                    }
                </style>
            </head>
            <body>
                <div>
                    <img id="myid"/>
                    <img />
                </div>
            </body>
         </html>`)
    })
}).listen(8088);
console.log("server start");
