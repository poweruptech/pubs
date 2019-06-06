(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.Powerup = {}));
}(this, function (exports) { 'use strict';

	function formatDate(date, format){
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
	}
	 function formatParameters(obj){
		let tempString = "?";
		for(var key in obj){
			tempString += (key + "=" + obj[key]);
			tempString += "&";
		}
		return tempString.substring(0, tempString.length - 1);
	}
	function generateDate(startDate){
		let endDate = new Date(startDate);
		endDate.setDate(endDate.getDate() + 31);
		let time = {
			startTime: startDate.toISOString(),
			endTime: endDate.toISOString(),
		};
		return formatParameters(time);
	}
	function parseDate(dateStr){
		var date = dateStr.split('-');
		return new Date(date[0], date[1] - 1, date[2]);
	}
	 function process(_data, options){
		if(_data.classes == undefined || _data.classMeta == undefined)
			throw Error("Insufficient data provided for processing class listings");
		var classes = _data.classes;
		var classMeta = _data.classMeta;
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
				tmpListing.startDate = formatDate(strDate, 'md');
				tmpListing.endDate = formatDate(endDate, 'md');
			}else{
				let strDate = new Date(tmpListing.startTime);
				let endDate = new Date(tmpListing.endTime);
				tmpListing.startDate = formatDate(strDate, 'md');
				tmpListing.endDate = formatDate(endDate, 'md');
			}
			tmpListing.options = {
				text: [],
				choice: []
			};
			if(tmpListing.textOptions){
				for(let option = 0; option < tmpListing.textOptions.length; option++){
					if(tmpListing.textOptions[option].enabled && tmpListing.textOptions[option].shownToCustomers){
						tmpListing.options.text.push(tmpListing.textOptions[option]);
					}
				}
				delete tmpListing.textOptions;
			}
			if(tmpListing.choiceOptions){
				for(let option = 0; option < tmpListing.choiceOptions.length; option++){
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
			return search(completeClasses, options);
		return completeClasses;
	}
	function search(arr, options){
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

	var utils = /*#__PURE__*/Object.freeze({
		formatDate: formatDate,
		formatParameters: formatParameters,
		generateDate: generateDate,
		parseDate: parseDate,
		process: process,
		search: search
	});

	var $base = "https://poweruptaservices.com/";
	var URL = {
		$base: "https://poweruptaservices.com/",
		auth_cust: $base + "auth/cust",
		create_booking: $base + "create/booking",
		create_customer: $base + "create/customer",
		create_hold: $base + "create/hold",
		delete_hold: $base + "delete/hold",
		get_booking: $base + "get/booking",
		get_availability: $base + "get/classmeta",
		get_classes: $base + "get/classes",
		get_class_meta: $base + "get/classmeta",
		get_customers: $base + "get/customers",
		test_url: $base + "test"
	};
	Object.freeze(URL);

	function auth(uname, pword){
		return request("POST", URL.auth_cust, {data: {username: uname, password: pword}});
	}
	function fetch(periods){
		if(periods == 0)
			throw Error("Period not defined");
		return new Promise((resolve, reject)=>{
			var dataToRetrieve = [];
			var classes = [], classMeta = [];
			for(var i = 0; i < periods; i++){
				let startDate = new Date();
				startDate.setDate(startDate.getDate() + (31 * i));
				dataToRetrieve.push(getClassMetadata(startDate));
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
				resolve({classes: classes, metadata: classMeta});
			}).catch(err=>{
				reject(err);
			});
		});
	}
	function getClassMetadata(startDate){
		return request("GET", URL.get_availability, {params: generateDate(startDate)});
	}
	function getAllClasses(){
		return request("GET", URL.get_classes);
	}
	function newCustomer(customer){
		return request("POST", URL.create_customer, {data: customer.data});
	}
	function ping(target){
		return request("POST", URL.check_update, undefined, JSON.stringify(target));
	}
	function request(method, url, options){
		return new Promise((resolve, reject)=>{
			let xmlrequest = new XMLHttpRequest();
			options.query = options.query == undefined ? "" : options.query;
			xmlrequest.open(method, (url + options.query), true);
			xmlrequest.responseType = "json";
			xmlrequest.onload = function(){
				if(xmlrequest.status >= 200 && xmlrequest.status < 400)
					resolve(xmlrequest.response);
				else
					reject(xmlrequest.response);
			};
			xmlrequest.onerror = function(err){
				reject(err);
			};
			if(options.data !== undefined)
				xmlrequest.send(options.data);
			else
				xmlrequest.send();
		});
	}

	var network = /*#__PURE__*/Object.freeze({
		auth: auth,
		fetch: fetch,
		getClassMetadata: getClassMetadata,
		getAllClasses: getAllClasses,
		newCustomer: newCustomer,
		ping: ping,
		request: request
	});

	exports.URL = URL;
	exports.cache = network;
	exports.network = network;
	exports.utils = utils;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
