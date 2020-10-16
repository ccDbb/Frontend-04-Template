const net=require("net")
class Request {
    constructor(option){
        this.method=option.method||"GET";
        this.host=option.host;
        this.port=option.port || "80";
        this.path=option.path || "/";
        this.headers=option.headers || {};
        this.body=option.body||{}
        if(!this.headers["Content-Type"]){
            this.headers["Content-Type"]="application/x-www-form-urlencoded";
        }
        if(this.headers["Content-Type"]==="application/json"){
            this.bodyText=JSON.stringify(this.body);
        }else if(this.headers["Content-Type"]==="application/x-www-form-urlencoded"){
            this.bodyText=Object.keys(this.body).map(key=>
                `${key}=${encodeURIComponent(this.body[key])}`
            ).join('&');
        }
        this.headers["Content-Length"]=this.bodyText.length;
    }
    //显示发送投的所有信息，这里的信息必须符合http规范，如果不合法会返回400
    toString(){
        let headerStr=Object.keys(this.headers).map(key=>`${key}:${this.headers[key]}`).join('\r\n')
        return `${this.method} ${this.path} HTTP/1.1\r\n${headerStr}\r\n\r\n${this.bodyText}`
    }

    //给服务器端发送消息，返回值为promise，调用返回值得到的response的返回值。
    send(connection){
        return new Promise((resolve ,reject)=>{
            //处理接收到的response参数
            let parser=new ResponseParser();
            //判断链接是否建立，如果没有建立重新建立链接
            if(connection){
                connection.write(this.toString())
            }else{
                //创建链接
                connection=net.createConnection({
                    host:"127.0.0.1",
                    port:"8088"
                },()=>{
                    console.log(this.toString())
                    connection.write(this.toString());
                })
            }
            //添加connection链接的监听
            //接收到服务端发送过来的数据
            connection.on('data',(data)=>{
                console.log("respond==",data.toString())
                parser.receive(data.toString());
                if(parser.isFinished){
                    resolve(parser.response);
                    connection.end()
                }

            })
            //链接错误，抛出错误，关闭链接
            connection.on("error",err=>{
                reject(err);
                connection.end();
            })


        })
    }
}
class ResponseParser{
    constructor() {
        this.WAITING_STATUS_LINE=0;
        this.WAITING_STATUS_LINE_END=1;
        this.WAITING_HEADER_NAME=2;
        this.WAITING_HEADER_SPACE=3;
        this.WAITING_HEADER_VALUE=4;
        this.WAITING_HEADER_LINE_END=5;
        this.WAITING_HEADER_BLOCK_END=6;
        this.WAITING_BODY=7;

        this.current=this.WAITING_STATUS_LINE;
        this.statusLine="";
        this.headers={};
        this.headerName="";
        this.headerValue="";
        this.bodyParser=null;

        this.isFinished=false;
        this.response="";
    }
    receive(string){
        for(let i=0;i<string.length;i++){
            this.receiveChat(string.charAt(i));
        }
    }
    receiveChat(chat){
        if(this.current==this.WAITING_STATUS_LINE){
            if(chat==="\r"){
                this.current=this.WAITING_STATUS_LINE_END;
            }else{
                this.statusLine=this.statusLine+chat;
            }
        }else if(this.current==this.WAITING_STATUS_LINE_END){
            if(chat==="\n"){

            }
        }

    }
}
void async function(){
    let request=new Request({
        method:"POST",
        host:"127.0.0.1",
        port:"8088",
        path:"/",
        headers:{
           // ["X-Foo2"]:"customed"
        },
        body:{
            "name":"winter"
        }
    })
    try{
        let response=await request.send();
        console.log(response);
    }catch (e) {
        console.log("调用时报错",e)
    }

}()
