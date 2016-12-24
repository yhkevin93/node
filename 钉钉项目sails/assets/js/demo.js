;
(function() {
	var hash;
	var isShow = true;
	var t = 0;
	var pullDtd;

	/*
	 level1：完成
	 level2：正在做
	 level3：没人
	 
	 state1：需要完成
	 state2：已经完成
	 * 
	 * 
	 * */
	//模拟数据
	dd.config({
		agentId: '54989834',
		corpId: _config.corpId,
		timeStamp: _config.timeStamp,
		nonceStr: _config.nonceStr,
		signature: _config.signature,
		jsApiList: ['device.notification.confirm',
			'device.notification.alert',
			'device.notification.prompt',
			'biz.chat.chooseConversation',
			'biz.ding.post', 'biz.util.open', 'biz.user.get', 'biz.contact.choose'
		]
	});

	dd.error(function(error) {
		/**
		 
		    message:"错误信息",//message信息会展示出钉钉服务端生成签名使用的参数，请和您生成签名的参数作对比，找出错误的参数
		    errorCode:"错误码"
		 }
		**/
		alert('dd error: ' + JSON.stringify(err));
	});

	dd.ready(function() {

		dd.biz.user.get({
        onSuccess: function (info) {
            alert('fuck');
        },
        onFail: function (err) {
           alert('userGet fail: ' + JSON.stringify(err));
        }
    });

		//  dd.device.notification.alert({
		//      message: 'dd.device.notification.alert',
		//      title: 'This is title',
		//      buttonName: 'button',
		//      onSuccess: function(data) {
		//          alert('标签: ' + _config.signature);
		//      },
		//      onFail: function(err) {
		//          alert('fail: ' + JSON.stringify(err));
		//      }
		//  });
	});

	var data = {
		res: [{
			taskId: 6,
			taskName: '经营许可证办理',
			startDate: "2015-11-11",
			endDate: "2015-11-12",
			level: 2,
			state: 1
		}, {
			taskId: 5,
			taskName: '资质认证',
			startDate: "2015-11-11",
			endDate: "2015-11-12",
			level: 3,
			state: 1
		}, {
			taskId: 6,
			taskName: '商标注册',
			startDate: "2015-11-11",
			endDate: "2015-11-12",
			level: 2,
			state: 1
		}, {
			taskId: 1,
			taskName: '贷款',
			startDate: "2015-11-11",
			endDate: "2015-11-12",
			level: 1,
			state: 2
		}, {
			taskId: 2,
			taskName: '网站设计',
			startDate: "2015-11-11",
			endDate: "2015-11-12",
			level: 1,
			state: 2
		}]
	};

	//直接把模拟数据导入本地储存
	//	if(!localStorage.getItem('taskData')){
	localStorage.setItem('taskData', JSON.stringify(data));
	//	}
	var Util = {
		getQuery: function(param) {
			var url = window.location.href;
			var searchIndex = url.indexOf('?');
			var searchParams = url.slice(searchIndex + 1).split('&');
			for(var i = 0; i < searchParams.length; i++) {
				var items = searchParams[i].split('=');
				if(items[0].trim() == param) {
					return items[1].trim();
				}
			}
		},
		getTargetUrl: function(replaceUrl, targetUrl) {
			var protocol = location.protocol;
			var host = location.host;
			var pathname = location.pathname.replace(replaceUrl, targetUrl);
			return protocol + '//' + host + pathname;
		}

	};

	var Page = {
		init: function() {
			var that = this;
			//防止300毫秒点击延迟
			FastClick.attach(document.body);
			this.initData();
			//绑定事件
			this.bind();
			//初始化导航的title,采用事件的方式实现解耦
			$('body').trigger('navigation.title.change', [{
				"title": "我的任务"
			}]);
			//初始化导航的右上角,采用事件的方式实现解耦
			$('body').trigger('navigation.rightButton.change', [{
				"text": "新增",
				"show": true,
				"callback": function() {
					//					that.go('add');
					dd.device.notification.alert({
						message: "测试",
						title: "提示", //可传空
						buttonName: "收到",
						onSuccess: function() {
							//onSuccess将在点击button之后回调
							/*回调*/
						},
						onFail: function(err) {}
					});
				}
			}]);
			//绑定下拉事件
			dd.ui.pullToRefresh.enable({
				onSuccess: function() {
					setTimeout(function() {
						//todo 相关数据更新操作
						dd.ui.pullToRefresh.stop();
					}, 2000);
				},
				onFail: function() {}
			});
			//绑定每个任务的点击事件，事件采用代理的方式
			$('.doc').on('click', '.item', function() {
				var _this = $(this);
				_this.addClass('active');
				//				setTimeout(function(){
				//					that.go('detail',_this.data('taskid'),_this.data('task-type'));
				//					_this.removeClass('active');
				//				},100);
				//				alert(_this.data('task-type'));
				dd.device.notification.actionSheet({
					title: "项目进度", //标题
					cancelButton: '取消', //取消按钮文本
					otherButtons: ["开始做", "已完成", "任务错误", "测试功能"],
					onSuccess: function(result) {
						switch(result.buttonIndex) {
							case 0:
								dd.device.notification.alert({
									message: "任务开始进行",
									title: "", //可传空
									buttonName: "收到",
									onSuccess: function() {
										//onSuccess将在点击button之后回调
										/*回调*/
									},
									onFail: function(err) {}
								});
								break;
							case 1:
									$.ajax({
  type: 'GET',
  url: 'http://139.224.190.183:3000/getcookie',
  success: function(data){
	alert(JSON.stringify(data))
  }
});
								break;
							case 2:
								$.ajax({
  type: 'GET',
  url: 'http://139.224.190.183:3000/setcookie',
  success: function(data){
	alert(JSON.stringify(data))
  }
});
								break;
							case 3:
								dd.biz.contact.choose({
  startWithDepartmentId: Number, //-1表示打开的通讯录从自己所在部门开始展示, 0表示从企业最上层开始，(其他数字表示从该部门开始:暂时不支持)
  multiple: false, //是否多选： true多选 false单选； 默认true
  users: [], //默认选中的用户列表，userid；成功回调中应包含该信息
  disabledUsers:[],// 不能选中的用户列表，员工userid
  corpId: _config.corpId, //企业id
  max: 15, //人数限制，当multiple为true才生效，可选范围1-1500
  limitTips:"超过15人", //超过人数限制的提示语可以用这个字段自定义
  isNeedSearch:true, // 是否需要搜索功能
  title : "联系人", // 如果你需要修改选人页面的title，可以在这里赋值 
  local:false, // 是否显示本地联系人，默认false
  onSuccess: function(data) {
  
  dd.runtime.permission.requestAuthCode({
    corpId: _config.corpId,
    onSuccess: function(result) {
    var code = result.code
  

	$.ajax({
  type: 'POST',
  url: 'http://139.224.190.183:3000/userinfo',
  data: {
  	code:code
  },
  success: function(data){
	alert(JSON.stringify(data))
  }
});

    
    },
    onFail : function(err) {}
 
})
   
 
 
  },
  onFail : function(err) {}
});
 

								break;
						}

						//onSuccess将在点击button之后回调
						/*{
						    buttonIndex: 0 //被点击按钮的索引值，Number，从0开始, 取消按钮为-1
						}*/
					},
					onFail: function(err) {}
				})

			});

			var t3 = localStorage.getItem('_t_');
			//
			if(!t3) {
				localStorage.setItem('_t_', t);
			} else {
				t = t3;
			}
			document.addEventListener('resume', function(e) {
				e.preventDefault();
				//判断是否有数据更新
				var t2 = localStorage.getItem('_t_');
				if(t2 != t) {
					t = t2;
					that.initData();
				}
			}, false);
		},
		test: function() {
			alert(11);
		},
		initData: function() {
			var toDoHtml = [];
			var doneHtml = [];
			var that = this;
			var data = localStorage.getItem('taskData');
			data = JSON.parse(data);
			var todoCount = 0;
			var doneCount = 0;
			for(var i = 0; i < data.res.length; i++) {
				if(data.res[i].state == 1) {
					todoCount++;
					toDoHtml.push(that.renderItem(data.res[i], 'todo'));
				}
			}
			//先清空现有数据
			$('#todolist .bd').html('');
			$('<ol/>').html(toDoHtml.join('')).appendTo($('#todolist .bd'));

			$('#todolist .hd span').text('（' + todoCount + '）');

			for(var i = 0; i < data.res.length; i++) {
				if(data.res[i].state == 2) {
					doneCount++;
					doneHtml.push(that.renderItem(data.res[i], 'done'));
				}
			}
			//先清空现有数据
			$('#donelist .bd').html('');
			$('<ol/>').html(doneHtml.join('')).appendTo($('#donelist .bd'));
			$('#donelist .hd span').text('（' + doneCount + '）');
		},
		renderItem: function(item, type) {
			var html = '';
			var levelName = '';
			switch(parseInt(item.level)) {
				case 1:
					levelName = '完成';
					break;
				case 2:
					levelName = '正在做';
					break;
				case 3:
					levelName = '没人';
					break;
			}
			html = '<li class="item" data-taskid="' + item.taskId + '" data-task-type="' + type + '"><div class="wrap"><h3>' + item.taskName + '<i class="p' + item.level + '">' + levelName + '</i></h3></div></li>';
			return html;
		},
		bind: function() {
			//采用事件监听的方式是为了能够在统一一个地方设置导航的Title
			$('body').on('navigation.title.change', function(e, res) {
				dd.biz.navigation.setTitle({
					title: res.title
				});
			});
			//采用事件监听的方式是为了能够在统一一个地方设置导航的右上角按钮文案及点击事件
			$('body').on('navigation.rightButton.change', function(e, res) {
				dd.biz.navigation.setRight({
					show: res.show, //控制按钮显示， true 显示， false 隐藏， 默认true
					control: true, //是否控制点击事件，true 控制，false 不控制， 默认false
					showIcon: true, //是否显示icon，true 显示， false 不显示，默认true； 注：具体UI以客户端为准
					text: res.text,
					onSuccess: function() {
						res.callback && res.callback();
					}
				});
			});
		},
		getLevelName: function(level) {
			var levelName = '';
			switch(level) {
				case 1:
					levelName = '非常紧急';
					break;
				case 2:
					levelName = '紧急';
					break;
				case 3:
					levelName = '一般';
					break;
			}
			return levelName;
		},
		go: function(page, taskId, taskType) {
			var that = this;
			if(page == 'add') {
				//这里替换为对应的页面url
				dd.biz.util.openLink({
					url: Util.getTargetUrl('index.html', 'add.html')
				});
				return;

			} else if(page == 'detail') {
				dd.biz.util.openLink({
					url: Util.getTargetUrl('index.html', 'detail.html') + '?taskId=' + taskId + '&taskType=' + taskType
				});
				return;
			}
		}
	};
	if(dd.version) {
		dd.ready(function() {
			Page.init();
		});
	} else {
		Page.init();
	}
})();