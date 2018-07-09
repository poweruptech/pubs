function Customer(data){
	this.data = {};
	if(data !== undefined)
		this.data = Object.assign(this.data, data);
	else
		this.data = undefined;
}

Customer.prototype = {
	setName: function(fullName){
		this.data.firstName = fullName.firstName;
		this.data.middleName = fullName.middleName;
		this.data.lastName = fullName.lastName;
		return this;
	}
}