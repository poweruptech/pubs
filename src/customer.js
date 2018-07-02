function Customer(data){
	this.data = {};
	if(data !== undefined)
		this.data = Object.assign(this.data, data);
	else
		this.data = undefined;
}