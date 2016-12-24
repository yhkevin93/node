/**
 * EmployeeController
 *
 * @description :: Server-side logic for managing employees
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	/*
	 
	 * @描述   ：管理员任务
	 * 
	 * 
	 * */

	/*
	 * 创建用户(限制管理员使用)
	 * @name string 用户名
	 */
	createUser: function(req, res) {
		var userName = req.param('name')
		User.create({
			name: userName,
		}).exec(function(err, user) {
			if(err) {
				return res.serverError(err);
			}
			sails.log('用户id:' + user.id + '用户姓名：' + user.name);
			return res.json({
				msg: 'register success',
				user: user
			})
		})
	},
	/*
	 *创建任务（绑定到用户
	 * @name string 任务名
	 * @description string 任务描述
	 * @owner string 任务拥有者
	 * @work string 任务分配人员（可选
	 * @state string 任务状态（初始为未分配 ，如果有分配人员初始为未完成
	 * @createdby string 由谁创建
	 */
	createMission: function(req, res) {
		var name = req.param('name');
		var description = req.param('description');
		var owner = req.param('owner')
		var work = req.param('work')
		var createdby = req.param('createdby')
		sails.log(name + description + owner + work + createdby)
		var state;
		if(!work) {
			state = '未分配'
		} else {
			state = '未开始'
		}
		User.findOne({
			name: owner
		}).exec(function(err, user) {
			if(err) {
				return res.serverError(err);
			}
			if(!user) {
				return res.json({
					err: '没有这个用户'
				});
			}
			var userid = user.id;
			
			Employee.findOne({
				userid: createdby
			}).exec(function(err, employee) {
				if(err) {
					sails.log("err")
					return res.severError(err);
				}
				if(!employee) {
					sails.log("没有创建者")
					return res.json({
						err: '没有这个员工'
					})
				}

				var createdbyid = employee.id
				sails.log(createdbyid)
				if(!work) {
					//任务创建
				
					Mission.create({
						name: name,
						description: description,
						owner: userid,
						createdby: createdbyid,
						state: state

					}).exec(function(err, mission) {
						if(err) {
							return res.serverError(err);
						}
						sails.log('任务id:' + mission.id + '任务名字：' + mission.name + '任务描述：' + mission.description + '任务属于:' + mission.owner + '任务交给:未指定，任务状态：' + mission.state);

						return res.json({
							msg: 'mission create success!',
							mission: mission
						})
					})
				} else {
					
					Employee.findOne({
						userid: work
					}).exec(function(err, employee) {
						if(err) {
							return res.severError(err);
						}
						if(!employee) {	
							sails.log("没有员工")
							return res.json({
								err: '没有这个员工'
							})
						}
						var workid = employee.id;
						//任务创建
						Mission.create({
							name: name,
							description: description,
							owner: userid,
							work: workid,
							createdby: createdbyid,
							state: state

						}).exec(function(err, mission) {
							if(err) {
								return res.serverError(err);
							}
							sails.log('任务id:' + mission.id + '任务名字：' + mission.name + '任务描述：' + mission.description + '任务属于:' + mission.owner + '任务交给:' + mission.work + '任务状态：' + mission.state);

							return res.json({
								msg: 'mission create success!',
								mission: mission
							})
						})

					})
				}

			})

		})

	},
	/*
	 *分配任务（绑定到用户
	 * @id num 任务id
	 * @employeeid num 分配员工id
	 */
	giveMission: function(req, res) {
		//发布的任务关联了任务号
		var missionId = req.param('id');
		//员工id
		var employeeId = req.param('employeeid');
		Employee.findOne({userid:employeeId}).exec(function(err, employee) {
			
			if(!employee){
				return  res.json({err:'没有这个员工'})
			}
			
			employee.missions.add(missionId);

			sails.log('员工:' + employeeId + '接到了' + missionId + '任务')
            
			employee.save(function(err) {})
			
			Mission.findOne(missionId).exec(function(err,mission){
				mission.state = '未开始';
				mission.save(function(err){})
			})
			return res.json({
				msg: '员工:' + employeeId + '接到了' + missionId + '任务'
			})

		})
	},

	/*
	 
	 * @描述   ：员工任务状态修改
	 * @id num 任务号
	 * @state string 任务状态
	 * 
	 * */
	changeMission: function(req, res) {
		var missionId = req.param('id');
		var missionState = req.param('state');

		Mission.findOne(missionId).exec(function(err, mission) {
			if(!mission){
				return res.json({err:'任务错误'})
			}
			mission.state = missionState;
			sails.log('任务:' + missionId + '现在:' + missionState);

			mission.save(function(err) {})
			return res.json({
				msg: '任务:' + missionId + '现在:' + missionState
			})
		})
	},
	/*
	 
	 * @描述   ：查看自己的任务
	 * @id num 任务号
	 * @state string 任务状态
	 * 
	 * */
	checkMission: function(req, res) {
		var userid = req.param('id');

		Employee.findOne({
			userid: userid
		}).populate('missions').populate('create').exec(function(err, employee) {
			
			return res.json(employee)
		})
	},

	deleteEmployee: function(req, res) {
		var id = req.param('id');
		Employee.destroy({
			id: id
		}).exec(function(err) {
			if(err) {
				return res.negotiate(err);
			}
			sails.log('Deleted employee with `id:' + id + ', if it existed.');
			return res.ok();
		});
	},
	deleteUser: function(req, res) {
		var id = req.param('id');
		User.destroy({
			id: id
		}).exec(function(err) {
			if(err) {
				return res.negotiate(err);
			}
			sails.log('Deleted user with `id:' + id + ', if it existed.');
			return res.ok();
		});
	},
	deleteMission: function(req, res) {
		var id = req.param('id');
		Mission.destroy({
			id: id
		}).exec(function(err) {
			if(err) {
				return res.negotiate(err);
			}
			sails.log('Deleted mission with `id:' + id + ', if it existed.');
			return res.ok();
		});
	},

};