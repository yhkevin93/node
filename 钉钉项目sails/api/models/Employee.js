	/**
 * Employee.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	userid:{
          	type:'string'
          },
          sys_level:{
          	type:'string'
          },
          create:{
          	collection:'mission',
          	via:'createdby'
          },
      missions: {
			collection: 'mission',
			via:'work'
		}
  }
};

