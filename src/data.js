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
	 * @function saveToCache
	 * @param {Object} data Data to save onto local computer
	 */
	saveToCache: function(data){
		data.dateSaved = new Date().getTime();

	},

	accessCachedCopy: function(){
		if(!data){
			console.error("No cached copy of listings available");
			return false;
		}

		if(data.dateSaved)
			console.log("Cached copy is out of date, consider updating it");

		return 
	}
}
export { cache, data };