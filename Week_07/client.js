const net=require("net")
const parser =require("./parser")
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
                    connection.write(this.toString());
                })
            }
            //添加connection链接的监听
            //接收到服务端发送过来的数据
            connection.on('data',(data)=>{
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
        this.statusLine="";//返回头第一行内容
        this.headers={};
        this.headerName="";
        this.headerValue="";
        this.bodyParser=null;

    }
    get isFinished(){
        return this.bodyParser && this.bodyParser.isFinished;
    }
    get response(){
        this.statusLine.match(/HTTP\/1\.1 ([0-9]+) ([\s\S]+)/)
        return {
            statusCode:RegExp.$1,
            statusText:RegExp.$2,
            headers:this.headers,
            body:this.bodyParser.content.join("")
        }

    }

    receive(string){
        for(let i=0;i<string.length;i++){
            this.receiveChat(string.charAt(i));
        }
        // console.log("-------this.bodyParser start------\n",this.bodyParser,"\n-------this.bodyParser end------");
    }
    receiveChat(chat){
        //匹配返回头第一行，以\r\n结束。HTTP/1.1 200 OK
        if(this.current==this.WAITING_STATUS_LINE){
            if(chat==="\r"){
                this.current=this.WAITING_STATUS_LINE_END;
            }else{
                this.statusLine=this.statusLine+chat;
            }
            //返回头第一行结束，开始接收header内容。如下
            //Content-Type: text/html
            //Date: Mon, 19 Oct 2020 13:25:51 GMT
            //Connection: keep-alive
        }else if(this.current==this.WAITING_STATUS_LINE_END){
            if(chat==="\n"){
                this.current=this.WAITING_HEADER_NAME;
            }
            //开始接收header name
        }else if(this.current==this.WAITING_HEADER_NAME){
            if(chat===":"){
                this.current=this.WAITING_HEADER_VALUE;
            }else if(chat==="\r"){
                //如果以换行开始，证明是两个换行，开始接收body
                this.current=this.WAITING_HEADER_BLOCK_END;
                if(this.headers['Transfer-Encoding']==='chunked'){
                    this.bodyParser=new TrunkedBodyParser();
                }

            }else {
                this.headerName+=chat;
            }
            //接收header value
        }else if(this.current==this.WAITING_HEADER_VALUE){
            if(chat===" "){

            }else if(chat=="\r"){
                this.headers[this.headerName]=this.headerValue;
                this.headerName="";
                this.headerValue="";
                //header头值的结束
                this.current=this.WAITING_HEADER_LINE_END;
            }else{
                this.headerValue+=chat;
            }
        //header一行的结束
        }else if(this.current==this.WAITING_HEADER_LINE_END){
            if(chat=="\n"){
                this.current=this.WAITING_HEADER_NAME;
            }

        }else if(this.current==this.WAITING_HEADER_BLOCK_END){
            //如果两个\r\n证明进入body
            if(chat==="\n"){
                this.current=this.WAITING_BODY;
            }
        }else if(this.current==this.WAITING_BODY){//接收body里的值
            this.bodyParser.receiveChar(chat);

        }

    }



}
class TrunkedBodyParser{
    constructor(){
        this.WAITING_LENGTH=0;
        this.WAITING_LENGTH_LINE_END=1;
        this.READING_TRUNK=2;
        this.WAITING_NEW_LINE=3;
        this.WAITING_NEW_LINE_END=4;
        this.length=0;
        this.content=[];
        this.current=this.WAITING_LENGTH;
        this.isFinished=false

    }
    //解析body里值
    //b
   // hello world
   // 0
    receiveChar(char){
        if(this.current===this.WAITING_LENGTH){
            if(char==="\r"){
                if(this.length===0){
                    this.isFinished=true;
                    return;
                }
                this.current=this.WAITING_LENGTH_LINE_END;
            }else{
                this.length=this.length*16
                this.length+=parseInt(char,16);
            }
        }else if(this.current===this.WAITING_LENGTH_LINE_END){
            if(char==="\n"){//首行结束，
                this.current=this.READING_TRUNK;
            }
        }else if(this.current===this.READING_TRUNK){//正式进入内容

            this.content.push(char);
            this.length--;
            if(this.length==0){
                this.current=this.WAITING_NEW_LINE;
            }

        }else if(this.current==this.WAITING_NEW_LINE){
            if(char=="\r"){
                this.current=this.WAITING_NEW_LINE_END;
            }
        }else if(this.current==this.WAITING_NEW_LINE_END){
            if(char=="\n"){
                this.current=this.WAITING_LENGTH;
            }
        }else if(this.isFinished){

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
        console.log("response==",response)
        parser.parserHTML(response)

    }catch (e) {
        console.log("调用时报错",e)
    }

}()
