/**
 * Global object used to interact with the API
 * @type {Object}
 */

//TODO: Implement functionality to place holds and bookings
var Powerup = {
	URL : {
		create_booking: "https://powerupnode.fwd.wf/create/booking",
		get_booking: "https://powerupnode.fwd.wf/get/booking",
		get_availability: "https://powerupnode.fwd.wf/get/availability",
		get_classes: "https://powerupnode.fwd.wf/get/classes",
		get_customers: "https://powerupnode.fwd.wf/get/customers",
		test_url: "https://powerupnode.fwd.wf/test"
	},

	data: {
		processed: [],
		unprocessed: {
			eventProducts: [],
			eventData: []
		}
	},

	network: {
		fetch: function(periods){
			return new Promise((resolve, reject)=>{
				let dataToRetrieve = [];

				for(var i = 0; i < periods; i++){
					let startDate = new Date();
					startDate.setDate(startDate.getDate() + (31 * i));
					dataToRetrieve.push(Powerup.network.getEventAvailability(startDate));
				}

				dataToRetrieve.push(Powerup.network.getAllEvents());

				Promise.all(dataToRetrieve).then(completed=>{
					let eventList = completed.pop();

					for(var evnt = 0; evnt < eventList.data.length; evnt++){
						Powerup.data.unprocessed.eventProducts.push(eventList.data[evnt])
					}

					for(var dataBlock = 0; dataBlock < completed.length; dataBlock++){
						for(var evntInstance = 0; evntInstance < completed[dataBlock].data.length; evntInstance++){
							let evnts = completed[dataBlock].data;
							Powerup.data.unprocessed.eventData.push(evnts[evntInstance]);
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
			return Powerup.network.request("GET", Powerup.URL.get_availability, Powerup.utils.generateDate(startDate));
		},

		/**
		 * Calling this function returns all available Bookeo products
		 * @function getAllClasses
		 * @return {Promise} When resolved, the promise will return all Bookeo products
		 */
	 	getAllEvents: function(){
			return Powerup.network.request("GET", Powerup.URL.get_classes);
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
	},

	utils: {	
		/**
		 * Converts the provided JSON object into a query string
		 * @function formatParameters
		 * @param  {JSON Object} obj - Simple JSON object (key:val pairs)
		 * @return {String} Formatted query string
		 */
		formatParameters: function(obj){
			let tempString = "?";
			for(var key in obj){
				tempString += (key + "=" + obj[key]);
				tempString += "&";
			}
			return tempString.substring(0, tempString.length - 1);
		},

		/**
		 * Generates a start + end time in ISO format and returns it as a query string
		 * @param {Date} startDate - Starting date to use
		 * @return {String} Formatted query string
		 */
		generateDate: function(startDate){
			let endDate = new Date(startDate);
			endDate.setDate(endDate.getDate() + 31);
			let time = {
				startTime: startDate.toISOString(),
				endTime: endDate.toISOString(),
			}
			return Powerup.utils.formatParameters(time);
		}
	},
}