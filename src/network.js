import { data as p_date } from './data.js'
import { URL } from './URL.js'
import { utils } from './utils.js'

var network = {
	fetch: function(periods){
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
					p_data.unprocessed.eventProducts.push(eventList.data[evnt])
				}

				for(var dataBlock = 0; dataBlock < completed.length; dataBlock++){
					for(var evntInstance = 0; evntInstance < completed[dataBlock].data.length; evntInstance++){
						let evnts = completed[dataBlock].data;
						p_data.unprocessed.eventData.push(evnts[evntInstance]);
					}
				}

				resolve("Data retrieval successful!");
			}).catch(err=>{
				reject(err);
			})
		})
	},


	/**
	 * Calling this function returns availibility for classes. The Bookeo API
	 * can only return classes 31 days after a specified start date, so multiple
	 * calls may have to be made.
	 * @function getClassAvailability
	 * @param {Date} startDate - Date to begin with
	 * @return {Promise} When resolved, the promise returns the availability of Bookeo products (31 days)
	 */
	getEventAvailability: function(startDate){
		return this.request("GET", URL.get_availability, utils.generateDate(startDate));
	},

	/**
	 * Calling this function returns all available Bookeo products
	 * @function getAllClasses
	 * @return {Promise} When resolved, the promise will return all Bookeo products
	 */
 	getAllEvents: function(){
		return this.request("GET", URL.get_classes);
	},

	/**
 	 * Used for making HTTP requests
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
				resolve(xmlrequest.response);
			}
			xmlrequest.onerror = function(){
				reject("Error has occurred");
			}
			if(data !== undefined)
				xmlrequest.send(data);
			else
				xmlrequest.send();
		});
	}
}

export { network }