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

	app.eventsLoaded = true;
}).catch(reject=>{
	//TODO: Show error screen when error happens
	throw new Error(reject);
})

var app = new Vue({
	el: '#app',
	data: {
		childParticipants: [],
		customer: new Powerup.factory.customer(),
		eventsLoaded: false,
		processed_listings: Powerup.data.processed,
		signInVisible: false,
		visible: true
	},
	methods: {
		addChildParticipant: function(){
			if(this.childParticipants.length < 3){
				let index = this.childParticipants.push(new Powerup.factory.childParticipant());
				this.childParticipants[index - 1].key = index;
			}else{
				//TODO: Alert user that no more participants are allowed
			}
		},

		authenticateUser: function(){
			/*
			Powerup.network.auth(this.customer.username, this.customer.password).then(success=>{
				Vue.set(customer, 'data', success.data);
			}).catch(failure=>{
				//Display error message: Incorrect username or password
			})


			 */
		},

		deleteChildParticipant: function(index){
			Vue.delete(this.childParticipants, index);

			for(var i = 0; i < this.childParticipants.length; i++){
				Vue.set(this.childParticipants[i], 'key', i + 1);
			}
		},

		toggleSignIn: function(){
			this.signInVisible = this.signInVisible ? false: true;
		}
	}
});

Vue.component('product-listing', {
	methods:{
		getEventId: function(){
			return this.listing.eventId;
		}
	},

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