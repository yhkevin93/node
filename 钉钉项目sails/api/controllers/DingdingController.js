/**
 * DingdingController
 *
 * @description :: Server-side logic for managing dingdings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var https = require("https");
var url = require('url');
var crypto = require('crypto');
var querystring = require('querystring');

const OAPI_HOST = 'https://oapi.dingtalk.com';
const corpId = '';
const secret = '';

module.exports = {
     //显示首页，与钉钉对接
		login: function(req, res) {
			var nonceStr = 'abcdefg';
			var timeStamp = new Date().getTime();
			var signedUrl = 'http://139.224.190.183:3000/'
				//var signedUrl = decodeURIComponent(req.host+req.url);
			console.log(signedUrl)

			invoke('/gettoken', {
				corpid: corpId,
				corpsecret: secret
			}, function(result) {
				var accessToken = result.access_token

				invoke('/get_jsapi_ticket', {
					type: 'jsapi',
					access_token: accessToken
				}, function(result) {
					var ticket = result.ticket;

					var signature = sign({
						nonceStr: nonceStr,
						timeStamp: timeStamp,
						url: signedUrl,
						ticket: ticket
					})

					return res.view('index', {
						title: 'Here we go...',
						config: JSON.stringify({
							signature: signature,
							nonceStr: nonceStr,
							timeStamp: timeStamp,
							corpId: corpId
						})
					})
				});
			});

		},
		//获取员工信息
		userinfo: function(req, res) {
			var code = req.param('code');

			console.log("code=" + code)
			invoke('/gettoken', {
				corpid: corpId,
				corpsecret: secret
			}, function(result) {
				var accesstoken = result.access_token;
				invoke('/user/getuserinfo', {
					access_token: accesstoken,
					code: code
				}, function(result) {
					console.log(result);
					var sys_level = result.sys_level;
					var userid = result.userid;
					console.log("userid=" + userid + "sys_level=" + sys_level + "级别，0：非管理员 1：超级管理员（主管理员） 2：普通管理员（子管理员） 100：老板")
					
					Employee.findOrCreate({
						userid:userid,
						sys_level:sys_level
					}).exec(function findorcreate(err,employee){
						
						Employee.findOne({userid:userid}).populate('missions').populate('create').exec(function(err,employeeMission){
							
							return res.json(employeeMission);
						})
						
					})
					
          
				})
			});

		},
		add:function(req,res){
			var nonceStr = 'abcdefg';
			var timeStamp = new Date().getTime();
			var signedUrl = 'http://139.224.190.183:3000/add'
				//var signedUrl = decodeURIComponent(req.host+req.url);
			console.log(signedUrl)

			invoke('/gettoken', {
				corpid: corpId,
				corpsecret: secret
			}, function(result) {
				var accessToken = result.access_token

				invoke('/get_jsapi_ticket', {
					type: 'jsapi',
					access_token: accessToken
				}, function(result) {
					var ticket = result.ticket;

					var signature = sign({
						nonceStr: nonceStr,
						timeStamp: timeStamp,
						url: signedUrl,
						ticket: ticket
					})

					return res.view('add', {
						title: 'Here we go...',
						config: JSON.stringify({
							signature: signature,
							nonceStr: nonceStr,
							timeStamp: timeStamp,
							corpId: corpId
						})
					})
				});
			});
		},		addUser:function(req,res){
			var nonceStr = 'abcdefg';
			var timeStamp = new Date().getTime();
			var signedUrl = 'http://139.224.190.183:3000/addUser'
				//var signedUrl = decodeURIComponent(req.host+req.url);
			console.log(signedUrl)

			invoke('/gettoken', {
				corpid: corpId,
				corpsecret: secret
			}, function(result) {
				var accessToken = result.access_token

				invoke('/get_jsapi_ticket', {
					type: 'jsapi',
					access_token: accessToken
				}, function(result) {
					var ticket = result.ticket;

					var signature = sign({
						nonceStr: nonceStr,
						timeStamp: timeStamp,
						url: signedUrl,
						ticket: ticket
					})

					return res.view('addUser', {
						title: 'Here we go...',
						config: JSON.stringify({
							signature: signature,
							nonceStr: nonceStr,
							timeStamp: timeStamp,
							corpId: corpId
						})
					})
				});
			});
		},		myMission:function(req,res){
			var nonceStr = 'abcdefg';
			var timeStamp = new Date().getTime();
			var signedUrl = 'http://139.224.190.183:3000/myMission'
				//var signedUrl = decodeURIComponent(req.host+req.url);
			console.log(signedUrl)

			invoke('/gettoken', {
				corpid: corpId,
				corpsecret: secret
			}, function(result) {
				var accessToken = result.access_token

				invoke('/get_jsapi_ticket', {
					type: 'jsapi',
					access_token: accessToken
				}, function(result) {
					var ticket = result.ticket;

					var signature = sign({
						nonceStr: nonceStr,
						timeStamp: timeStamp,
						url: signedUrl,
						ticket: ticket
					})

					return res.view('myMission', {
						title: 'Here we go...',
						config: JSON.stringify({
							signature: signature,
							nonceStr: nonceStr,
							timeStamp: timeStamp,
							corpId: corpId
						})
					})
				});
			});
		}
	}
	//生成签名
function sign(params) {
	var origUrl = params.url;
	var origUrlObj = url.parse(origUrl);
	delete origUrlObj['hash'];
	var newUrl = url.format(origUrlObj);
	var plain = 'jsapi_ticket=' + params.ticket +
		'&noncestr=' + params.nonceStr +
		'&timestamp=' + params.timeStamp +
		'&url=' + newUrl;

	console.log(plain);
	var sha1 = crypto.createHash('sha1');
	sha1.update(plain, 'utf8');
	var signature = sha1.digest('hex');
	console.log('signature: ' + signature);
	return signature;
}

//http请求方法
function invoke(path, params, cb) {
	https.get(OAPI_HOST + path + '?' + querystring.stringify(params), function(res) {
		if(res.statusCode === 200) {
			var body = '';
			res.on('data', function(data) {
				body += data;
			}).on('end', function() {
				var result = JSON.parse(body);
				if(result && 0 === result.errcode) {
					cb(result)
				} else {
					return result;
				}
			});
		} else {
			return result;
		}
	}).on('error', function(e) {
		return result;
	});

}