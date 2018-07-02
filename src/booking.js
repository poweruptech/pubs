function Booking(data){
	this.data = {};

	if(data !== undefined)
		this.data = Object.assign(this.data, data)
	else
		this.data = undefined;
}

Booking.prototype = {
	send: function(){
		if(this.data == undefined)
			throw new Error("There is no data to be sent");
		else{
			if(this.data.eventId == undefined)
				throw new Error("An Event ID must be specified");
			if(this.data.customer == undefined || this.data.customerId == undefined)
				throw new Error("A Customer or Customer ID must be specified");
		}
		Powerup.network.request("POST", Powerup.URL.create_booking, undefined, JSON.stringify(this.data));
	},
	setData: function(data){this.data = data;}
}