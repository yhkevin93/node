;
(function() {
	var hash;
	var isShow = true;
	var t = 0;
	var pullDtd;

	/*
	 * 
	 * 
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
			'biz.ding.post', 'biz.util.open', 'biz.user.get', 'biz.contact.choose', 'biz.navigation.setMenu','device.notification.toast'
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

		dd.runtime.permission.requestAuthCode({
			corpId: _config.corpId,
			onSuccess: function(result) {
				var code = result.code

				$.ajax({
					type: 'POST',
					url: 'http://139.224.190.183:3000/userinfo',
					data: {
						code: code
					},
					success: function(data) {
						//初始化导航的title,采用事件的方式实现解耦
						$('body').trigger('navigation.title.change', [{
							"title": "任务列表"
						}]);
						localStorage.setItem('taskData', JSON.stringify(data));
						Page.init();
					}
				});
			},
			onFail: function(err) {}

		})

	})

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

			//			$('body').trigger('navigation.rightButton.change', [{
			//				"text": "新增任务",
			//				"show": true,
			//				"callback": function() {
			//					that.go('add');
			//					
			//				}
			//			}]);
			//绑定下拉事件
			dd.ui.pullToRefresh.enable({
				onSuccess: function() {
					setTimeout(function() {

						that.refresh()

						dd.ui.pullToRefresh.stop();
					}, 2000);
				},
				onFail: function() {}
			});
			//绑定每个任务的点击事件，事件采用代理的方式
			$('.doc').on('click', '.item', function() {
				var _this = $(this);
				_this.addClass('active');
				setTimeout(function() {
					_this.removeClass('active');
				}, 500);

				//任务号
				var missionId = _this.data('task-id')
					//任务状态
				var state;

				dd.device.notification.actionSheet({
					title: "任务分配", //标题
					cancelButton: '取消', //取消按钮文本
					otherButtons: ["分配人员", "删除任务"],
					onSuccess: function(result) {
						switch(result.buttonIndex) {
							case 0:
								dd.biz.contact.choose({
									startWithDepartmentId: -1, //-1表示打开的通讯录从自己所在部门开始展示, 0表示从企业最上层开始，(其他数字表示从该部门开始:暂时不支持)
									multiple: false, //是否多选： true多选 false单选； 默认true
									users: [], //默认选中的用户列表，userid；成功回调中应包含该信息
									disabledUsers: [], // 不能选中的用户列表，员工userid
									corpId: _config.corpId, //企业id
									max: 1, //人数限制，当multiple为true才生效，可选范围1-1500
									limitTips: "只能选择一位", //超过人数限制的提示语可以用这个字段自定义
									isNeedSearch: true, // 是否需要搜索功能
									title: "选择派遣人员", // 如果你需要修改选人页面的title，可以在这里赋值 
									local: "true", // 是否显示本地联系人，默认false
									onSuccess: function(data) {
										var id = data[0].emplId;
										$.ajax({
											type: 'POST',
											url: 'http://139.224.190.183:3000/giveMission',
											data: {
												id: missionId,
												employeeid: id
											},
											success: function(data) {
												if(data.err) {
													alert(data.err)
												} else {

													that.refresh()
													that.toast('任务已经分配')
												}

											}
										});

									},
									onFail: function(err) {}
								});
								break;
							case 1:
								$.ajax({
									type: 'POST',
									url: 'http://139.224.190.183:3000/deleteMission',
									data: {
										id: missionId,
									},
									success: function(data) {
										that.refresh()
										that.toast('任务已删除')
									}
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

		},

		initData: function() {
			var noworkHtml = [];
			var notodoHtml = [];
			var toDoHtml = [];
			var doneHtml = [];
			var that = this;
			var data = localStorage.getItem('taskData');

			data = JSON.parse(data);

			var noworkCount = 0;
			var notodoCount = 0
			var todoCount = 0;
			var doneCount = 0;

			for(var i = 0; i < data.create.length; i++) {
				if(data.create[i].state == '未分配') {
					noworkCount++;
					noworkHtml.push(that.renderItem(data.create[i], 'nowork'));
				}
			}
			//先清空现有数据
			$('#noworklist .bd').html('');
			$('<ol/>').html(noworkHtml.join('')).appendTo($('#noworklist .bd'));
			$('#noworklist .hd span').text('（' + noworkCount + '）');

			for(var i = 0; i < data.create.length; i++) {
				if(data.create[i].state == '未开始') {
					notodoCount++;
					notodoHtml.push(that.renderItem(data.create[i], 'notodo'));
				}
			}
			//先清空现有数据
			$('#notodolist .bd').html('');
			$('<ol/>').html(notodoHtml.join('')).appendTo($('#notodolist .bd'));
			$('#notodolist .hd span').text('（' + notodoCount + '）');

			for(var i = 0; i < data.create.length; i++) {
				if(data.create[i].state == '正在进行') {
					todoCount++;
					toDoHtml.push(that.renderItem(data.create[i], 'todo'));
				}
			}
			//先清空现有数据
			$('#todolist .bd').html('');
			$('<ol/>').html(toDoHtml.join('')).appendTo($('#todolist .bd'));
			$('#todolist .hd span').text('（' + todoCount + '）');

			for(var i = 0; i < data.create.length; i++) {
				if(data.create[i].state == '已完成') {
					doneCount++;
					doneHtml.push(that.renderItem(data.create[i], 'done'));
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
			switch(item.state) {
				case '未分配':
					levelName = 1;
					break;
				case '未开始':
					levelName = 1;
					break;
				case '正在进行':
					levelName = 2;
					break;
				case '已完成':
					levelName = 3;
					break;

			}

			html = '<li class="item" data-task-id="' + item.id + '" data-task-type="' + type + '"><div class="wrap"><h3>' + item.name + '<i class="p' + levelName + '">' + item.state + '</i></h3></div></li>';
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
		go: function(page, id, taskType) {
			var that = this;
			var url = 'http://139.224.190.183:3000/' + page

			//这里替换为对应的页面url
			dd.biz.util.openLink({
				url: url
			});
			return;
		},
		getMission: function(cb) {
			dd.biz.user.get({
				onSuccess: function(info) {
					cb(info.emplId)

				},
				onFail: function(err) {
					logger.e('userGet fail: ' + JSON.stringify(err));
				}
			});
		},
		refresh: function() {
			var that = this

			that.getMission(function(userid) {
				$.ajax({
					type: 'POST',
					url: 'http://139.224.190.183:3000/checkMission',
					data: {
						id: userid,
					},
					success: function(data) {
						localStorage.setItem('taskData', JSON.stringify(data));
						Page.initData();
					}
				});
			})
		},
		toast: function(msg) {
			dd.device.notification.toast({
				icon: '', //icon样式，有success和error，默认为空 0.0.2
				text: msg, //提示信息
				duration: 1, //显示持续时间，单位秒，默认按系统规范[android只有两种(<=2s >2s)]
				delay: 0, //延迟显示，单位秒，默认0
				onSuccess: function(result) {
					/*{}*/
				},
				onFail: function(err) {}
			})
		}
	};
	//	if(dd.version) {
	//		dd.ready(function() {
	//			Page.init();
	//		});
	//	} else {
	//		Page.init();
	//	}

})();