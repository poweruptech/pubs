import { network } from './network.js';

var data = {
	booking: {},
	customer: {},
	childParticipants: [],
	processed: {
		type: {
			private: [],
			course: []
		}
	},
	
	queue: {
		eventProducts: [],
		eventData: []
	},
	
	unprocessed: {
		eventProducts: [],
		eventData: []
	}

};


var cache = {
	
	/**
	 * @func
	 * @param { String } key Name of data item to access
	 * @returns { String } Data stored under key
	 * @throws 
	 */
	 
	access: function(key){
		if(window.localStorage.getItem(key)){
			console.error(`No cached copy of ${ key } available`);
			throw new Error("");
		}else{
			var data = window.localStorage.getItem(key);
			
			if(3600000 < (new Date().getTime() - data.dateSaved)) //If data stored in key is 1 hr < old, it's considered outdated.
				console.log("Cached copy is out of date, consider updating it");

			return data;
		}
	},
	
	clearAll: function(){
		window.localStorage.clear();	
	},
	
	/**
	 * @function save
	 * @param { String } key Key used for saving data
	 * @param { Object } data Data to save onto local computer
	 */
	save: function(key, data){
		data.dateSaved = new Date().getTime();
		window.localStorage.setItem(key, JSON.stringify(data));
	},
	
	update: function(key, newData){
		if(window.localStorage.getItem(key) !== null){
			/**
			 * Saved data in key will be compared to newData and any discrepencies
			 * between the two data sets will be corrected. This is done to ensure that 
			 * only relevant information is updated as updating the entire dataset might
			 * be inefficient in cases where the dataset is of considerable size.
			 */
			 
		}else
			throw Error(`Cannot update ${ key } as it does not exist`);
	}
	 
};

export { cache, data };