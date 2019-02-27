import { cache } from './data.js';
import { URL } from './URL.js';
import { utils } from './utils.js';

/**
 * @namespace Network
 */
 
var network = {

	/**
	 * Used for authenticating user login
	 * @memberof Network
	 * @param  {String} uname - Username
	 * @param  {String} pword - Password
	 * @return {Promise}          
	 */
	auth: function(uname, pword){
		return this.request("POST", URL.auth_cust, undefined, {username: uname, password: pword});
	},
	
	/**
	 * fetches all user created events and currently available events within
	 * the periods specified. A period is defined as 31 days. Periods are
	 * measured from the current date. Data is stored in localstorage. "Class products"
	 * are stored in "classes", and class metadata in "classMeta".
	 * @memberof Network
	 * @param  {Number} periods - Num of periods to fetch data
	 * @return {Promise}         
	 */
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
			
			/**
			 * Checks if class products are already stored on the browser. If
			 * they are, the server is polled for updates. If there aren't, the local
			 * version is used. If there are updates, they will be pulled from the 
			 * server and stored locally.
			 */
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

	/**
	 * Calling this function returns availibility for classes. The Bookeo API
	 * can only return classes 31 days after a specified start date, so multiple
	 * calls may have to be made.
	 * @memberof Network
	 * @function getClassAvailability
	 * @param {Date} startDate - Date to begin with
	 * @return {Promise} When resolved, the promise returns the availability of Bookeo products (31 days)
	 */
	getClassMetadata: function(startDate){
		return this.request("GET", URL.get_availability, utils.generateDate(startDate));
	},

	/**
	 * Calling this function returns all available Bookeo products
	 * @memberof Network
	 * @function getAllClasses
	 * @return {Promise} When resolved, the promise will return all Bookeo products
	 */
 	getAllClasses: function(){
		return this.request("GET", URL.get_classes);
	},
	
	/**
	 * Creates a new Customer in Bookeo's database.
	 * @memberof Network
	 * @function newCustomer
	 * @param {Customer} customer Customer to be sent to Bookeo
	 * @returns {Promise}
	 */
	newCustomer: function(customer){
		return this.request("POST", URL.create_customer, undefined, customer.data);
	},
	
	/**
	 * Pings the host for any updates
	 * @function ping
	 * @param data What you intend to update (ex. classes, class metadata, etc.)
	 */
	ping: function(data){
		return this.request("POST", URL.check_update, undefined, JSON.stringify(data));
	},

	/**
 	 * Used for making HTTP requests
	 * @memberof Network
 	 * @function request
 	 * @todo Must implement verbose error descriptions
 	 * @param  {String} method - Method to use when making an HTTP request
 	 * @param  {String} url - Destination for the request
 	 * @param  {String} query - Query string to be appended to the URL (Optional)
 	 * @param  {JSON Object} - JSON data to be send along with the request (Optional)
 	 * @return {Promise} - When resolved, the promise returns the response received
 	*/
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

export { network };