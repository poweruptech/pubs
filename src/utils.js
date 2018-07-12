import { network } from './network.js';
import { URL } from './URL.js';

var utils = {

	/**
	 * Used for authenticating user login
	 * @param  {String} uname - Username
	 * @param  {String} pword - Password
	 * @return {Promise}          
	 */
	auth: function(uname, pword){
		return network.request("POST", URL.auth_cust, undefined, {username: uname, password: pword})
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
		}
		return this.formatParameters(time);
	}
}

export { utils }