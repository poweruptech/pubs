function access(key){
	if(window.localStorage.getItem(key) == null)
		throw new Error(`Item "${ key }" does not exist`);
		
	var data = window.localStorage.getItem(key);
		
	if(data.dateSaved && data.type=="listings"){
		if(3600000 < (new Date().getTime() - data.dateSaved)) //If data stored in key is 1 hr < old, it's considered outdated.
			console.log("Cached copy is out of date, consider updating it");
	}
	
	return JSON.parse(data);
}

function clear(key){
	window.localStorage.removeItem(key);
}
	
function clearAll(){
	window.localStorage.clear();	
}
	
function exists(key){
	if(window.localStorage.getItem(key) == null)
		return false;
	return true;
}
	
	/**
	 * @function save
	 * @param { String } key Key used for saving data
	 * @param { Object } data Data to save onto local computer
	 */
function save(key, data, type){
	
	if(type == "listing")
		data.dateSaved = new Date().getTime();
		
	window.localStorage.setItem(key, JSON.stringify(data));
}

function update(key, newData){
	if(window.localStorage.getItem(key) !== null){
		/**
		 * Saved data in key will be compared to newData and any discrepencies
		 * between the two data sets will be corrected. This is done to ensure that 
		 * only relevant information is updated as updating the entire dataset might
		 * be inefficient in cases where the dataset is of considerable size.
		 * 
		 * Debating on whether to replace data when in String format, or just 
		 * through JSON format.
		 */
		 
		 //JSON format
		 
		 var dataToUpdate = window.localStorage.getItem(key);
		 
		 for(var oldObjKey in dataToUpdate){
		 	for(var newKey in newData){
		 		
		 		/*
		 		Look through object to find new stuff
		 		*/
		 		
		 		
		 		
		 		
		 		
		 	}
		 }
	}else
		throw Error(`Cannot update "${ key }"" as it does not exist`);
}

export { access, clear, clearAll, exists, save, update};