(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Powerup = {})));
}(this, (function (exports) { 'use strict';

	var data = {
		booking: {},
		customer: {},
		childParticipants: [],
		processed: [],
			unprocessed: {
				eventProducts: [],
				eventData: []
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
						data.unprocessed.eventProducts.push(eventList.data[evnt]);
					}
					for(var dataBlock = 0; dataBlock < completed.length; dataBlock++){
						for(var evntInstance = 0; evntInstance < completed[dataBlock].data.length; evntInstance++){
							let evnts = completed[dataBlock].data;
							data.unprocessed.eventData.push(evnts[evntInstance]);
						}
					}
					resolve("Data retrieval successful!");
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

	function Booking(data){
		this.data = {};
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
		this.data = {
			firstName: '',
			lastName: '',
			emailAddress: '',
			phoneNumbers: [{
				number: '',
				type: ''
			}]
		};
		this.auth = {
			username: '',
			password: ''
		};
		if(data !== undefined)
			Object.assign(this.data, data);
	}
	Customer.prototype = {
		assign: function(data){
			Object.assign(this.data, data);
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
		this.categoryIndex;
		this.personId = 'PUNKNOWN';
	}

	var factory = {
		booking: Booking,
		customer: Customer,
		childParticipant: ChildParticipant
	};

	exports.factory = factory;
	exports.data = data;
	exports.URL = URL;
	exports.network = network;
	exports.utils = utils;

	Object.defineProperty(exports, '__esModule', { value: true });

})));