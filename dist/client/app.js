/*global Powerup Vue*/

/**
 * fetches listings from Bookeo, processes them, and stores them locally as "listings".
 * Listings can be accessed by calling 'Powerup.cache.access("listings");'
 */
 
try{//checking whether classes are saved
    var classes = Powerup.cache.access("classes");
    
    //target to ping on server, and target's last update.
    var target = {
        target: "classes",
        lastUpdated: classes.lastUpdated
    };
    
     Powerup.network.ping(target).then(success=>{
        //you've been given the A-Okay by the server!
         
        window.app.classes = classes;
       }).catch(fail=>{
        //Server deemed your data out of date :(
        
        /** 
         * usually the server will send updated data in fail.data but if 
         * fail.data doesn't exist, something else might have gone wrong
         */
        if(fail.data == undefined)
        	console.log(fail);
        
        //don't worry, server sends the newest data if it thinks it's out of date
        Powerup.cache.save("classes", JSON.parse(fail.data));
       });
       
       app.messages.eventMessage = '';
       app.eventsLoaded = true;
}catch(err){//classes have never been saved to device
    console.log(err);
    
    //downloads class list and saves to device. Also sets up Vue 
    Powerup.network.fetch(3).then(result=>{
        var classes = Powerup.utils.process(result);
        
        Powerup.cache.save("classes", classes); //save classes to device
        
        if(app == undefined)
            console.error("Expected Vue app to be stored in a var named 'app'");
            
        app.classes = classes; //Assumes Vue app will be named app.
    }).catch(err=>{
    	app.message.eventMessage = `${err}. Trying again...`;
    });
}


Powerup.network.fetch(1).then(result=>{
	Powerup.cache.save("listings" , Powerup.utils.process(result));
	
}).catch(err=>{
	app.messages.eventMessage = `${ err }. Trying again...`;
});


//var testData = Powerup.data.processed;

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
});

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
		processed_listings: [],
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
				Vue.set(this.customer, 'data', success.data);
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