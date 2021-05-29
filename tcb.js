var express = require("express");
var http =express();
var fs =require("fs");
var query = require("querystring")
http.listen(6500,function(){
	console.log("服务器启动成功")
})
//使用 use方法跨域
http.use(function(req,res,next){
	res.header("Access-Control-Allow-origin","*");
	next();
})
//1.城市获取只需准备好服务，然后获取json里面的数据
//2.点击注册页面注册
//首先验证手机号是否被注册过
http.get("/isrepeat",function(req,res){
	//获取手机号码
	var tel = req.query.tel;
	//读取json文件
	var bol = true;
	fs.readFile("./src/data/telList.json","utf-8",function(err,data){
		var arr = JSON.parse(data);
		for(var i =0 ;i< arr.length ; i++){
			if(tel == arr[i].tel){
				bol = false;
				res.send("0");
			}
		}
		if(bol){
			res.send("1");
		}
	})
	
})
//验证码接口
http.post("/yzm",function(req,res){
	parseInt(Math.random()*9)
	res.send(""+parseInt(Math.random()*9)+parseInt(Math.random()*9)+parseInt(Math.random()*9)+parseInt(Math.random()*9))
})
//校验码接口
http.post("/xym",function(req,res){
	var dataStr = "";
	req.on("data",function(data){
		dataStr +=data
	})
	req.on("end",function(){
		var bol = true ;
		var dataObj = query.parse(dataStr);
		var num = ""+parseInt(Math.random()*9)+parseInt(Math.random()*9)+parseInt(Math.random()*9)+parseInt(Math.random()*9+parseInt(Math.random()*9)+parseInt(Math.random()*9));
		//读取数据
		fs.readFile("./src/data/xy.json","utf-8",function(err,data){
			var arr = JSON.parse(data);
			for(var i = 0;i < arr.length;i++){
				if(arr[i].tel ==dataObj.tel) {
					arr[i].xym = num;
					arr[i].time = dataObj.time ;
					bol = false ;
					//写入更新后的数据
					fs.writeFile("./src/data/xy.json",JSON.stringify(arr),"utf-8",function(){
						//发送数据
						res.send(num);
					})
				}
			}
			//跳出循环
			if(bol) {
				dataObj.xym = num ;
				arr.push(dataObj)
				fs.writeFile("./src/data/xy.json",JSON.stringify(arr),"utf-8",function(){
					//发送数据
						res.send(num);
				})
			}
		})
		
	})
})
//注册接口
http.post("/addUser",function(req,res){
	var dataStr = "";
	//添加数据
	req.on("data",function(data){
		dataStr += data
	})
	//结束添加
	req.on("end",function(){
		var dataObj = query.parse(dataStr);
		//验证校验码是否正确
		fs.readFile("./src/data/xy.json","utf-8",function(err,data){
			var  arr =JSON.parse(data);
			for(var i = 0 ; i< arr.length ; i++){
				if(dataObj.tel == arr[i].tel){
					//获取数据的时间
					if(dataObj.time - arr[i].time >=15000){
						res.send("超时")//超时
					}else if(dataObj.xym == arr[i].xym){
//						res.send("1") //校验码相等验证成功
						//读取json文件
						fs.readFile("./src/data/telList.json","utf-8",function(err,data){
							var arr2 = JSON.parse(data);
							var obj ={
								id:dataObj.time,
								user:dataObj.tel,
								pass:dataObj.pwd
							}
							
							//推入手机号 密码 时间作为id
							arr2.push(obj)
							fs.writeFile("./src/data/telList.json",JSON.stringify(arr2),"utf-8",function(){
						//发送数据
						res.send("注册成功");
					})
						
						})
						
						
						
					}else{
						//不通过
						res.send("校验码错误")//校验码错误
					}
				}
			}
		})
	})
})

///获取所有购物信息 放在最后面避免阻塞
http.all("*",function(req,res){
	res.sendFile(__dirname+req.url);
})

