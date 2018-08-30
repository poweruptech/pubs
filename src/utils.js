var utils = {

	/**
	 * Formats a date into the desired string format 
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
	 * @function parseDate
	 * @param {String} dateStr - Date string to parse (DMY)
	 * @return {Date}
	 */
	 
	parseDate: function(dateStr){
		var date = dateStr.split('-');
		return new Date(date[0], date[1] - 1, date[2]);
	}
};

export { utils };