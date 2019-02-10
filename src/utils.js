/**
 * @namespace Utils
 */

 import { data as storage } from 'data'

var utils = {
	/**
	 * Formats a date into the desired string format
	 * @memberof Utils 
	 * @function formatDate
	 * @param  {Date} date - Date object to format
	 * @param  {String} format - format of date
	 * @return {String}
	 */
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

	/**
	 * Converts the provided JSON object into a query string
	 * @memberof Utils
	 * @function formatParameters
	 * @param  {Object} obj -  JSON object intended to be formatted into a JSON query string (key:val pairs)
	 * @return {String} Query string
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
	 * @memberof Utils
	 * @param {Date} startDate - Starting date to use
	 * @return {String} Formatted query string
	 */
	generateDate: function(startDate){
		let endDate = new Date(startDate);
		endDate.setDate(endDate.getDate() + 31);
		let time = {
			startTime: startDate.toISOString(),
			endTime: endDate.toISOString(),
		};
		return this.formatParameters(time);
	},
	
	/**
	 * Parses a date
	 * @memberof Utils
	 * @function parseDate
	 * @param {String} dateStr - Date string to parse (DMY)
	 * @return {Date}
	 */
	 
	parseDate: function(dateStr){
		var date = dateStr.split('-');
		return new Date(date[0], date[1] - 1, date[2]);
	},

	/**
	 * @function processListings
	 * @param { Object } data Listings to process
	 * @param { Object } options Settings for the listing processor
	 * 
	 * Options Schema
	 * {
	 * 	type (String): Type of class (Defaults to 'fixed')
	 * 	onlyInclude (String): Classes which have the given title will be the only ones included
	 * 	exclude (String): Excludes classes with the given title
	 * 	locationToSearch (String): Where to search for string at (ie. description, title, anywhere). Defaults to anywhere
	 * }
	 * 
	 * @param { Object } storage (Optional) Location to store processed listings
	 * 
	 * @return { Array } Processed listings
	 */
	process: function(data, options){
		//let eventProducts = [];
		//let eventData = [];
		//let processed = [];

		let eventProducts = storage.unprocessed.eventProducts; //all events created by owner
		let eventData = storage.unprocessed.eventData; //actual events to be booked
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

		if(options.include.includes('courses')){

		}

		if(options.include.includes('private')){

		}

		if(options.include.includes('all')){

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
				storage.processed.push(processed[listing]);
			}
		}
	},

/**
 * @function Search
 * @param {JSON} dataset JSON object where term will be searched in (most likely Bookeo dataset)
 * @param {String} term Term to search for in data set
 * @param {String} type Where to search term in (ie. description, title, all)
 * @returns {Array} Array will contain all instances where the term showed up. If none are found, array will be empty
 */
	search: function(dataset, term, type){
		var len = dataset.length;

		switch(type){
			case "description":
			case "":
		}
	}
};

export { utils };