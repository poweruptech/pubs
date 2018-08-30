/**
 * Container for Customer
 * @function Customer
 * @param {Object} data 
 */
function Customer(data){
	this.data = {
		firstName: '',
		lastName: '',
		emailAddress: '',
		phoneNumbers: [{
			number: '',
			type: ''
		}]
	};
	
	this.auth = {
		username: '',
		password: ''
	};
	
	if(data !== undefined)
		Object.assign(this.data, data);
}

Customer.prototype = {
	assign: function(data){
		Object.assign(this.data, data);
	}
};

export { Customer };