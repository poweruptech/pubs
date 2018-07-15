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
	if(data !== undefined)
		this.data = Object.assign(this.data, data);
}

Customer.prototype = {
}

export { Customer }