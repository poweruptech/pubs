/**
 * @namespace Utils
 */
 
 /*global Powerup*/

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
	 * 	include (Object): only include given objects
	 * 	locationToSearch (String): Where to search for string at (ie. description, title, anywhere). Defaults to anywhere
	 * }
	 * 
	 * @param { Object } storage (Optional) Location to store processed listings
	 * 
	 * @return { Array } Processed listings
	 */
	process: function(data, options){
		if(data.classes == undefined || data.classMeta == undefined)
			throw Error("Insufficient data provided for processing class listings");
		
		var classes = data.classes; //class listings to process
		var classMeta = data.classMeta; //class metadata to merge with the classes
		var completeClasses = []; //processed class listings
		
		for(var data = 0; data < classMeta.length; data++){
			for(var product = 0; product < classes.length; product++){
				if(classes[product].productId === classMeta[data].productId){
					//if the two are referring to the same event, they are merged and pushed onto the processed array
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
		for(var listing = 0; listing < completeClasses.length; listing++){
			if(completeClasses[listing].apiBookingsAllowed == true){
				completeClasses[listing].key = listing;
				//storage.completeClasses.push(completeClasses[listing]);
			}
		}
		
		if(options != undefined)
			return this.search(completeClasses, options);
		
		return completeClasses;
	},
	
	/**
	 * @func search
	 * @param { Array } arr Array of class listings
	 * @param { Object } options Criteria used when searching within class listings
	 * @return { Array } Results of the search
	 */
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
		
		/** 
		 * TODO: Add exclusion search; basically streamline include and exclude search.
		 * Making them both possible within a single for loop block would be very nice.
		 */
		 
		// if(options.include && options.exclude)
		//	throw Error("Cannot perform an exclusion and inclusion search at the same time"); 
			// Exclude/Include search shouldn't be run at the same time for reasons...

		for(var listing of arr){
			for(var term = 0; term < options.terms.length; term++){
				for(var at = 0; at < options.at.length; at++){
					if(listing[options.at[at]] == undefined){
						//on some occasions search term will not exist in a listing for whatever reason.
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

export { utils };