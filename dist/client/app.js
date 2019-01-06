
/**
 * Fetches 2 periods of data (62 days) from the bookeo API and processes it. Once processed
 * it can be found in Powerup.data.processed[].
 */


Powerup.network.fetch(1).then(resolve=>{
	app.messages.eventMessage = "Loading...";
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
		
		if(!tmpListing.apiBookingsAllowed)
			continue;
		
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
		
		
		//Might be able to defer this processing until it's actually needed
		
		//Available options for a listing (Text <input> or choice <radio>)
		tmpListing.options = {
			text: [],
			choice: []
		};
		
		//If listings have text or choice options and are supposed to be shown,
		//they're pushed onto their respective array in the listing's options
		//object
		
		if(tmpListing.textOptions){
			for(var option = 0; option < tmpListing.textOptions.length; option++){
				if(tmpListing.textOptions[option].enabled && tmpListing.textOptions[option].shownToCustomers){
					tmpListing.options.text.push(tmpListing.textOptions[option]);
				}		
			}
			delete tmpListing.textOptions;
		}
		
		if(tmpListing.choiceOptions){
			for(var option = 0; option < tmpListing.choiceOptions.length; option++){
				if(tmpListing.choiceOptions[option].enabled && tmpListing.choiceOptions[option].shownToCustomers){
					tmpListing.options.choice.push(tmpListing.choiceOptions[option]);
				}
			}
			delete tmpListing.choiceOptions;
		}
	}

	//when processing is done, the listings are pushed onto the Powerup object
	for(var listing = 0; listing < processed.length; listing++){
		if(processed[listing].apiBookingsAllowed == true){
			processed[listing].key = listing;
			Powerup.data.processed.push(processed[listing]);
		}
	}
	
	app.messages.eventMessage = '';

	app.eventsLoaded = true;
}).catch(reject=>{
	//TODO: Show error screen when error happens
	app.messages.eventMessage = `${ reject }. Trying again...`;
	console.error(`Network error: ${ reject }`);
});


var testData = Powerup.data.processed;

/*
for(var i = 0; i < 10; i++){
	testData.push({
		name: 'Placeholder class',
		startDate: new Date(),
		endDate: new Date(),
		description: '<p> This is my class</p> <br> <p> Testing description </p>',
		price: 100
	});
}

*/

var product = Vue.component('product-listing', {
	data: function(){
		return {
			visible: true
		};
	},
	methods:{
		getEventId: function(){
			return this.listing.eventId;
		}
	},

	props: {
		listing: Object
	},

	template: `<tr @click='visible = !visible'>
				<td v-if='visible'>{{listing.name}}</td>
				<td v-if='visible'>{{listing.startDate}} - {{listing.endDate}}</td>
				<td v-if='visible'>{{listing.price}}</td>
				<td v-if='!visible' colspan='2'
				v-html='listing.description' class='pdescription'>
				</td>
				<td v-if='!visible'>
					<button @click="$emit('set-booking', listing)"> Book </button>
				</td>
			</tr>`
});

var appView = Vue.component('app-view', {
	name: 'app-view',
	props: ['window'],
	template: `<transition name='slide-in'>
	<div class='window' v-if='window == this.$parent.status._current_window'><slot></slot></div>
	</transition>`
})

var app = new Vue({
	el: '#app',
	components: {
		appView: appView,
		productListing: product
	},
	data: {
		booking: new Powerup.factory.booking(),
		childParticipants: [],
		currentListing: {},
		customer: new Powerup.factory.customer(),
		loadingmessage: 'Loading...',
		processed_listings: Powerup.data.processed,
		pickupAuths: [],
		
		messages: {
			eventMessage: ''
		},
		
		status:{
			_current_window: 0,
			classDetailsActive: false,
			eventsLoaded: false,
			eventSuccess: false,
			eventFailure: false,
			signInActive: false,
			validErr: {
				child: [],
				customer: {}
			}
		}
	},
	methods: {
		addChildParticipant: function(){
			if(this.childParticipants.length < 3){
				let index = this.childParticipants.push(new Powerup.factory.childParticipant());
				this.childParticipants[index - 1].key = index;
			}
		},

		authUser: function(){
			this.status.eventFailure = false;
			this.status.eventSuccess = false;
			
			this.messages.eventMessage = "Logging in...";
			
			Powerup.network.auth(this.customer.auth.username, this.customer.auth.password).then(success=>{
				Vue.set(customer, 'data', success.data);
				this.messages.eventMessage = "Login successful!";
				
				setTimeout(()=>{
					app.toggleActive('signInActive');
				}, 1000);
				
			}).catch(failure=>{
				this.status.eventFailure = true;
				this.messages.eventMessage = 'Incorrect Username/Password';
			});
		},

		changeWindow: function(i){
			this.status._current_window += i;
			if(this.status._current_window < 0 )
				this.status._current_window = 0;
			else if(this.status._current_window > 2)
				this.status._current_window = 2;
		},

		deleteChildParticipant: function(index){
			if(this.childParticipants.length > 1){
				Vue.delete(this.childParticipants, index);
	
				for(var i = 0; i < this.childParticipants.length; i++){
					Vue.set(this.childParticipants[i], 'key', i + 1);
				}
			}
		},

		formValidation: function(){
			this.status.validErr.child = [];
			this.status.validErr.customer = {};
			
			this.customer.validate();

			if(this.customer.status.fail){
				this.status.validErr.customer = {
					owner: 'Customer',
					errors: this.customer.status.errors
				};
			}

			for(let child of this.childParticipants){
				child.validate();

				if(child.status.fail){
					this.status.validErr.child.push({
						owner: `Child ${child.key}`,
						errors: child.status.errors
					});
				}
			}


			if(!this.status.validErr.child.length && !this.status.validErr.customer.length)
				this.changeWindow(1);
		},

		setCurrentListing: function(listing){
			this.currentListing = listing;
			this.booking.data.eventId = listing.eventId;
			
			/**
			 * if(this.hold){
			 *		delete currentHold();
			 *		create new Hold();
			 *	}	
			 *
			 */
			
			if(listing.choiceOptions || listing.textOptions){
				this.status.classDetailsActive = true;
			}
			
			this.status._current_window++;
			
		},

		toggleActive: function(activeEl){
		this.status[activeEl] = !this.status[activeEl];
		this.messages.eventMessage = '';
		}
	}
});

app.addChildParticipant();

// vvvv used for debugging purposes vvvv //
app.status.eventsLoaded = true;