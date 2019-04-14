import { request } from './network.js';
import { URL } from './URL.js';
import { Hold } from './hold';

/**
 * A barebones container for a Booking.
 * @class Booking
 * @param {Object} data Data to be sent with the Booking. Required data is 
 * specified in the Bookeo API.
 */
function Booking(data){
	this.data = {};
	this.hold = new Hold();

	if(data !== undefined)
		this.data = data;
}

Booking.prototype = {
	/**
	 * Sends the booking and data to Bookeo.
	 * @memberof Booking
	 * @function send
	 * @returns {Promise}
	 * @throws {Error} If an eventID and customer, or customerId are not 
	 * specified, the Booking will not be completed.
	 */
	send: function(){
		if(this.data == undefined)
			throw new Error("There is no data to be sent. Booking cannot be created");
		else{
			if(this.data.eventId == undefined)
				throw new Error("An Event ID must be specified");
			if(this.data.customer == undefined || this.data.customerId == undefined)
				throw new Error("A Customer or Customer ID must be specified");
		}
		
		return request("POST", URL.create_booking,{data: JSON.stringify(this.data)});
	},
	/**
	 * Sets data for the booking.
	 * @memberof Booking
	 * @function setData
	 */
	setData: function(data){this.data = data;}
};

export { Booking };