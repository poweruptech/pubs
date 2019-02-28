import { Booking } from './booking.js';
import { Customer } from './customer.js';
import { ChildParticipant } from './childParticipant.js';

var factory = {
	booking: Booking,
	customer: Customer,
	childParticipant: ChildParticipant
};

var cache = {
	update: function(){
		
	}
}

export { factory };