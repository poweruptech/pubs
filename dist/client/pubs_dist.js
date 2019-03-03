(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.Powerup = {}));
}(this, function (exports) { 'use strict';

	var cache = {
		access: function(key){
			if(window.localStorage.getItem(key) == null)
				throw new Error(`Item "${ key }" does not exist`);
			var data = window.localStorage.getItem(key);
			if(data.dateSaved && data.type=="listings"){
				if(3600000 < (new Date().getTime() - data.dateSaved))
					console.log("Cached copy is out of date, consider updating it");
			}
			return JSON.parse(data);
		},
		clear: function(key){
			window.localStorage.removeItem(key);
		},
		clearAll: function(){
			window.localStorage.clear();
		},
		exists: function(key){
			if(window.localStorage.getItem(key) == null)
				return false;
			return true;
		},
		save: function(key, data, type){
			if(type == "listing")
				data.dateSaved = new Date().getTime();
			window.localStorage.setItem(key, JSON.stringify(data));
		},
		update: function(key, newData){
			if(window.localStorage.getItem(key) !== null){
				 var dataToUpdate = window.localStorage.getItem(key);
			}else
				throw Error(`Cannot update "${ key }"" as it does not exist`);
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
		get_availability: "https://powerupnode.fwd.wf/get/classmeta",
		get_classes: "https://powerupnode.fwd.wf/get/classes",
		get_class_meta: "https:powerupnode.fwd.wf/get/classmeta",
		get_customers: "https://powerupnode.fwd.wf/get/customers",
		test_url: "https://powerupnode.fwd.wf/test"
	};
	Object.freeze(URL);

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
		process: function(data, options){
			if(data.classes == undefined || data.classMeta == undefined)
				throw Error("Insufficient data provided for processing class listings");
			var classes = data.classes;
			var classMeta = data.classMeta;
			var completeClasses = [];
			for(var data = 0; data < classMeta.length; data++){
				for(var product = 0; product < classes.length; product++){
					if(classes[product].productId === classMeta[data].productId){
						completeClasses.push(Object.assign({}, classes[product], classMeta[data]));
						break;
					}
				}
			}
			for(var listing = 0; listing < completeClasses.length; listing++){
				var tmpListing = completeClasses[listing];
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
			for(var listing = 0; listing < completeClasses.length; listing++){
				if(completeClasses[listing].apiBookingsAllowed == true){
					completeClasses[listing].key = listing;
				}
			}
			if(options != undefined)
				return this.search(completeClasses, options);
			return completeClasses;
		},
		search: function(arr, options){
			if(options.type == undefined)
				throw Error(`No search type has been indicated`);
			if(options.type !== 'include' && options.type !== 'exclude')
				throw Error(`Non-compatible search type ${options.type} found`);
			if(options.terms.length == 0 || options.at.length == 0)
				return [];
			var results = [];
			for(let i = 0; i < options.terms.length; i++){
				options.terms[i] = options.terms[i].toLowerCase();
			}
			for(let i = 0; i < options.at.length; i++){
				options.at[i] = options.at[i].toLowerCase();
			}
			for(var listing of arr){
				for(var term = 0; term < options.terms.length; term++){
					for(var at = 0; at < options.at.length; at++){
						if(listing[options.at[at]] == undefined){
							console.log(`option "${options.at[at]}" does not exist for listing`);
							continue;
						}
						if(listing[options.at[at]].toLowerCase().includes(options.terms[term])){
							if(options.type == 'include')
								results.push(listing);
						}
					}
				}
			}
			if(options.type == 'exclude')
				return arr;
			return results;
		}
	};

	var network = {
		auth: function(uname, pword){
			return this.request("POST", URL.auth_cust, undefined, {username: uname, password: pword});
		},
		fetch: function(periods){
			if(periods == 0)
				throw Error("Period not defined");
			return new Promise((resolve, reject)=>{
				var dataToRetrieve = [];
				var classes = [], classMeta = [];
				for(var i = 0; i < periods; i++){
					let startDate = new Date();
					startDate.setDate(startDate.getDate() + (31 * i));
					dataToRetrieve.push(this.getClassMetadata(startDate));
				}
				if(!cache.exists("classes"))
					dataToRetrieve.push(this.getAllClasses());
				else{
					network.ping({
						target: ['classes'],
						lastUpdated: classes.lastUpdated
					}).then(result=>{
						classes = JSON.parse(cache.access("classes"));
					}).catch(err=>{
						if(err.status == "OK")
							dataToRetrieve.push(this.getAllClasses());
						else
							throw new Error(err.reason);
					});
				}
				Promise.all(dataToRetrieve).then(completed=>{
					var eventList = completed.pop();
					var lastUpdatedTime = new Date();
					lastUpdatedTime = lastUpdatedTime.getTime();
					for(var evnt = 0; evnt < eventList.data.length; evnt++){
						classes.push(eventList.data[evnt]);
					}
					for(var dataBlock = 0; dataBlock < completed.length; dataBlock++){
						for(var evntInstance = 0; evntInstance < completed[dataBlock].data.length; evntInstance++){
							let evnts = completed[dataBlock].data;
							classMeta.push(evnts[evntInstance]);
						}
					}
					cache.save("classes", {classes: classes, lastUpdated:lastUpdatedTime});
					cache.save("classmeta", {metadata: classMeta, lastUpdated:lastUpdatedTime});
					resolve({classes: classes, metadata: classMeta});
				}).catch(err=>{
					reject(err);
				});
			});
		},
		getClassMetadata: function(startDate){
			return this.request("GET", URL.get_availability, utils.generateDate(startDate));
		},
	 	getAllClasses: function(){
			return this.request("GET", URL.get_classes);
		},
		newCustomer: function(customer){
			return this.request("POST", URL.create_customer, undefined, customer.data);
		},
		ping: function(data){
			return this.request("POST", URL.check_update, undefined, JSON.stringify(data));
		},
		request: function(method, url, query, data){
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
				if(data !== undefined)
					xmlrequest.send(data);
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

	function Booking(data){
		this.data = {};
		this.hold = new Hold();
		if(data !== undefined)
			this.data = data;
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
		setData: function(data){this.data = data;}
	};

	function Customer(data){
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
		if(data !== undefined)
			Object.assign(this.data, data);
	}
	Customer.prototype = {
		assign: function(data){
			Object.assign(this.data, data);
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
	exports.cache = cache;
	exports.URL = URL;
	exports.network = network;
	exports.utils = utils;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
