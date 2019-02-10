(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('data')) :
	typeof define === 'function' && define.amd ? define(['exports', 'data'], factory) :
	(global = global || self, factory(global.Powerup = {}, global.data));
}(this, function (exports, data) { 'use strict';

	var data$1 = {
		booking: {},
		customer: {},
		childParticipants: [],
		processed: {
			type: {
				private: [],
				course: []
			}
		},
		queue: {
			eventProducts: [],
			eventData: []
		},
		unprocessed: {
			eventProducts: [],
			eventData: []
		}
	};
	var cache = {
		access: function(key){
			if(window.localStorage.getItem(key)){
				console.error(`No cached copy of ${ key } available`);
				throw new Error("");
			}else{
				var data$$1 = window.localStorage.getItem(key);
				if(3600000 < (new Date().getTime() - data$$1.dateSaved))
					console.log("Cached copy is out of date, consider updating it");
				return data$$1;
			}
		},
		clearAll: function(){
			window.localStorage.clear();
		},
		save: function(key, data$$1){
			data$$1.dateSaved = new Date().getTime();
			window.localStorage.setItem(key, JSON.stringify(data$$1));
		},
		update: function(key, newData){
			if(window.localStorage.getItem(key) !== null);else
				throw Error(`Cannot update ${ key } as it does not exist`);
		}
	};

	var URL = {
		$base: "https://powerupnode.fwd.wf/",
		auth_cust: "https://powerupnode.fwd.wf/auth/cust",
		create_booking: "https://powerupnode.fwd.wf/create/booking",
		create_customer: "https://powerupnode.fwd.wf/create/customer",
		create_hold: "https://powerupnode.fwd.wf/create/hold",
		delete_hold: "https://powerupnode.fwd.wf/delete/hold",
		get_booking: "https://powerupnode.fwd.wf/get/booking",
		get_availability: "https://powerupnode.fwd.wf/get/availability",
		get_classes: "https://powerupnode.fwd.wf/get/classes",
		get_customers: "https://powerupnode.fwd.wf/get/customers",
		test_url: "https://powerupnode.fwd.wf/test"
	};

	var utils = {
		formatDate: function(date, format){
			let day = date.getDate();
			let month = date.getMonth();
			let year = date.getFullYear();
			let monthStr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			format = format.toLowerCase();
			month = monthStr[month];
			let dateStr = '';
			for(var i = 0; i < format.length; i++){
				switch(format[i]){
					case 'd':
						dateStr += day;
						break;
					case 'm':
						dateStr += month;
						break;
					case 'y':
						dateStr += year;
						break;
					default:
						throw new Error(`${format[i]} is not one of the required format letters ('d', 'm' , 'y')`);
				}
				dateStr += ' ';
			}
			return dateStr.substring(0, dateStr.length - 1);
		},
		formatParameters: function(obj){
			let tempString = "?";
			for(var key in obj){
				tempString += (key + "=" + obj[key]);
				tempString += "&";
			}
			return tempString.substring(0, tempString.length - 1);
		},
		generateDate: function(startDate){
			let endDate = new Date(startDate);
			endDate.setDate(endDate.getDate() + 31);
			let time = {
				startTime: startDate.toISOString(),
				endTime: endDate.toISOString(),
			};
			return this.formatParameters(time);
		},
		parseDate: function(dateStr){
			var date = dateStr.split('-');
			return new Date(date[0], date[1] - 1, date[2]);
		},
		processListings: function(data$$1, options){
			let eventProducts = data.data.unprocessed.eventProducts;
			let eventData = data.data.unprocessed.eventData;
			let processed = [];
			for(var data$$1 = 0; data$$1 < eventData.length; data$$1++){
				for(var product = 0; product < eventProducts.length; product++){
					if(eventProducts[product].productId === eventData[data$$1].productId){
						processed.push(Object.assign({}, eventProducts[product], eventData[data$$1]));
						break;
					}
				}
			}
			if(options.include.includes('courses'));
			if(options.include.includes('private'));
			if(options.include.includes('all'));
			for(var listing = 0; listing < processed.length; listing++){
				var tmpListing = processed[listing];
				if(!tmpListing.apiBookingsAllowed)
					continue;
				tmpListing.price = `$${tmpListing.defaultRates[0].price.amount}`;
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
				tmpListing.options = {
					text: [],
					choice: []
				};
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
			for(var listing = 0; listing < processed.length; listing++){
				if(processed[listing].apiBookingsAllowed == true){
					processed[listing].key = listing;
					data.data.processed.push(processed[listing]);
				}
			}
			app.messages.eventMessage = '';
			app.eventsLoaded = true;
		},
		search: function(dataset, term, type){
			var len = dataset.length;
		}
	};

	var network = {
		auth: function(uname, pword){
			return this.request("POST", URL.auth_cust, undefined, {username: uname, password: pword});
		},
		fetch: function(periods){
			if(periods == 0){
				return;
			}
			return new Promise((resolve, reject)=>{
				let dataToRetrieve = [];
				for(var i = 0; i < periods; i++){
					let startDate = new Date();
					startDate.setDate(startDate.getDate() + (31 * i));
					dataToRetrieve.push(this.getEventAvailability(startDate));
				}
				dataToRetrieve.push(this.getAllEvents());
				Promise.all(dataToRetrieve).then(completed=>{
					let eventList = completed.pop();
					for(var evnt = 0; evnt < eventList.data.length; evnt++){
						data$1.unprocessed.eventProducts.push(eventList.data[evnt]);
					}
					for(var dataBlock = 0; dataBlock < completed.length; dataBlock++){
						for(var evntInstance = 0; evntInstance < completed[dataBlock].data.length; evntInstance++){
							let evnts = completed[dataBlock].data;
							data$1.unprocessed.eventData.push(evnts[evntInstance]);
						}
					}
					resolve(data$1.unprocessed.eventData);
				}).catch(err=>{
					reject(err);
				});
			});
		},
		getEventAvailability: function(startDate){
			return this.request("GET", URL.get_availability, utils.generateDate(startDate));
		},
	 	getAllEvents: function(){
			return this.request("GET", URL.get_classes);
		},
		newCustomer: function(customer){
			return this.request("POST", URL.create_customer, undefined, customer.data);
		},
		ping: function(){
			this.request("GET", URL.check_update, undefined, localStorage.getItem(cache.$key)).then(res=>{
				if(res.reply);
			});
		},
		request: function(method, url, query, data$$1){
			return new Promise((resolve, reject) => {
				let xmlrequest = new XMLHttpRequest();
				if(query !== undefined)
					xmlrequest.open(method, (url + query));
				else
					xmlrequest.open(method, url);
				xmlrequest.responseType = "json";
				xmlrequest.onload = function(){
					if(xmlrequest.status >= 200 && xmlrequest.status < 400)
						resolve(xmlrequest.response);
					else
						reject(xmlrequest.response);
				};
				xmlrequest.onerror = function(){
					reject("Unable to retrieve data");
				};
				if(data$$1 !== undefined)
					xmlrequest.send(data$$1);
				else
					xmlrequest.send();
			});
		}
	};

	function Hold(listing){
	    this.listing = listing;
	}
	Hold.prototype = {
	    create: function(listing){
	        if(this.listing !== undefined){
	            if(this.listing.eventId !== listing.eventId)
	                this.delete();
	            else
	                return Promise.reject(new Error("Hold already present"));
	        }
	        this.listing = listing;
	        return new Promise((resolve, reject)=>{
	            network.request("POST", URL.create_hold, undefined, listing.data)
	            .then(complete=>{
	                Object.assign(this, complete);
	                resolve();
	            }).catch(err=>{
	                reject(err);
	            });
	        });
	    },
	    delete: function(){
	        return new Promise((resolve, reject)=>{
	            network.request("DELETE", URL.delete_hold, undefined, this.id)
	            .then(complete=>{
	                resolve("Successfully deleted!");
	            }).catch(err=>{
	                reject(err);
	            });
	        });
	    }
	};

	function Booking(data$$1){
		this.data = {};
		this.hold = new Hold();
		if(data$$1 !== undefined)
			this.data = data$$1;
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
			network.request("POST", URL.create_booking, undefined, JSON.stringify(this.data));
		},
		setData: function(data$$1){this.data = data$$1;}
	};

	function Customer(data$$1){
		this.auth = {
			username: '',
			password: ''
		};
		this.data = {
			firstName: '',
			lastName: '',
			emailAddress: '',
			phoneNumbers: [{
				number: '',
				type: ''
			}]
		};
		this.status = {
			errors: [],
			fail: true
		};
		if(data$$1 !== undefined)
			Object.assign(this.data, data$$1);
	}
	Customer.prototype = {
		assign: function(data$$1){
			Object.assign(this.data, data$$1);
		},
		validate: function(){
			this.status.errors = [];
			let err = this.status.errors;
			switch(0){
				case this.data.firstName.length:
					err.push("First Name is required");
				case this.data.lastName.length:
					err.push("Last Name is required");
				case this.data.emailAddress.length:
					err.push("Email Address is required");
			}
			if(!err.length)
				this.status.fail = false;
			else
				this.status.fail = true;
		}
	};

	function ChildParticipant(){
		this.key = 0;
		this.data = {
			firstName: '',
			lastName: '',
			gender: 'unknown',
			dateOfBirth: '',
			customFields: []
		};
		this.status = {
			errors: [],
			fail: true
		};
		this.categoryIndex;
		this.personId = 'PUNKNOWN';
	}
	ChildParticipant.prototype = {
		validate: function(){
			this.status.errors = [];
			let err = this.status.errors;
			switch(0){
				case this.data.firstName.length:
					err.push("First Name is required");
				case this.data.lastName.length:
					err.push("Last Name is required");
				case this.data.dateOfBirth.length:
					err.push("Date of Birth is required");
			}
			if(!err.length)
				this.status.fail = false;
			else
				this.status.fail = true;
		}
	};

	var factory = {
		booking: Booking,
		customer: Customer,
		childParticipant: ChildParticipant
	};

	exports.factory = factory;
	exports.data = data$1;
	exports.URL = URL;
	exports.network = network;
	exports.utils = utils;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
