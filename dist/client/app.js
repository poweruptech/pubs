/**
 * Fetches 2 periods of data (62 days) from the bookeo API and processes it. Once processed
 * it can be found in Powerup.data.processed[].
 */
Powerup.network.fetch(2).then(resolve=>{
	let eventProducts = Powerup.data.unprocessed.eventProducts; //all events created by owner
	let eventData = Powerup.data.unprocessed.eventData; //actual events to be booked
	let processed = []; //processed listings

	for(var data = 0; data < eventData.length; data++){
		for(var product = 0; product < eventProducts.length; product++){
			if(eventProducts[product].productId === eventData[data].productId){
				//if the two are referring to the same event, they are merged and pushed onto the processed array
				processed.push(Object.assign({}, eventProducts[product], eventData[data]));
				break;
			}
		}
	}

	for(var listing = 0; listing < processed.length; listing++){
		var tmpListing = processed[listing];
		tmpListing.listing_key = listing; //listing key = current index
		tmpListing.price = `$${tmpListing.defaultRates[0].price.amount}`;

		//not all bookable events have a courseSchedule with them, so this is required
		if(tmpListing.courseSchedule !== undefined){
			let strDate = new Date(tmpListing.courseSchedule.events[0].startTime);
			let endDate = new Date(tmpListing.courseSchedule.events[tmpListing.courseSchedule.events.length - 1].startTime);
			tmpListing.startDate = Powerup.utils.formatDate(strDate, 'md');
			tmpListing.endDate = Powerup.utils.formatDate(endDate, 'md');
		}else{
			let strDate = new Date(tmpListing.startTime);
			let endDate = new Date(tmpListing.endTime);
			tmpListing.startDate = Powerup.utils.formatDate(strDate, 'md');
			tmpListing.endDate = Powerup.utils.formatDate(endDate, 'md');
		}
	}

	//when processing is done, the listings are pushed onto the Powerup object
	for(var listing = 0; listing < processed.length; listing++){
		Powerup.data.processed.push(processed[listing]);
	}
}).catch(reject=>{
	throw new Error(reject);
})

var app = new Vue({
	el: '#app',
	data: {
		processed_listings: Powerup.data.processed,
		visible: function(){
			return true;
		}
	},
	methods: {
		addChildParticipant: function(){
			this.childParticipants.push(new Powerup.factory.childParticipant());
		},

		deleteChildParticipant: function(index){
			Vue.delete(this.childParticipants, index);
		}
	}
});

Vue.component('product-listing', {
	methods:{
		getEventId: function(){
			return this.listing.eventId;
		}
	}

	props: {
		listing: Object,
		visible: Boolean
	},

	template: `<tr @click='visible = !visible'>
				<td v-if='visible'>{{listing.name}}</td>
				<td v-if='visible'>{{listing.startDate}} - {{listing.endDate}}</td>
				<td v-if='visible'>{{listing.price}}</td>
				<td v-if='!visible' colspan = 3
				v-html='listing.description' id='description'></td>
				<td><button>Book<button></td>
			</tr>`
});

/*
Vue.component('child-participant', {
	template: `<form><fieldset><legend>Child</legend><table><tbody><tr><td>First Name: 
	<input type="text" name="" required/>Last Name: <input type="text" name="" required/>
	</td></tr><tr><td>Gender: <select><option value="male">Male</option><option value="female">
	Female</option><option value="unspecified">--</option></select></td></tr><tr><td>Date of Birth: 
	<input type="date" name="" required></td></tr><tr><td>Current Grade:<select required>
	<option value="unspecified">--Please Select an Option--</option><option value="first">1st
	</option><option value="second">2nd</option><option value="third">3rd</option><option value="fourth">
	4th</option><option value="fifth">5th</option><option value="sixth">6th</option>
	<option value="seventh">7th</option><option value="eighth">8th</option><option value="kinder">K</option>
	</select></td></tr><tr><td>School: <input type="text" name="" required></td></tr></tbody></table></fieldset></form>`
})*/