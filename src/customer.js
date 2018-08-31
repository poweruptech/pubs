/**
 * Container for Customer
 * @class Customer
 * @param {Object} data 
 */
function Customer(data){
	this.auth = {
		username: '',
		password: ''
	};
	
	this.data = {
		firstName: '',
		lastName: '',
		emailAddress: '',
		phoneNumbers: [{
			number: '',
			type: ''
		}]
	};

	this.status = {
		errors: [],
		fail: true
	};

	if(data !== undefined)
		Object.assign(this.data, data);
}

Customer.prototype = {
	assign: function(data){
		Object.assign(this.data, data);
	},

	/**
	 * Validates Customer's info on form submission
	 * @memberof Customer
	 * @function validate
	 */
	validate: function(){
		this.status.errors = [];
		let err = this.status.errors;

		switch(0){
			case this.data.firstName.length:
				err.push("First Name is required");
			case this.data.lastName.length:
				err.push("Last Name is required");
			case this.data.emailAddress.length:
				err.push("Email Address is required");
		}

		if(!err.length)
			this.status.fail = false;
		else
			this.status.fail = true;
	}
};

export { Customer };