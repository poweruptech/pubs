Powerup.network.fetch(3).then(resolve=>{
	let eventProducts = Powerup.data.unprocessed.eventProducts;
	let eventData = Powerup.data.unprocessed.eventData;
	let processed = Powerup.data.processed;

	for(var data = 0; data < eventData.length; data++){
		for(var product = 0; product < eventProducts.length; product++){
			if(eventProducts[product].productId === eventData[data].productId){
				processed.push(Object.assign(eventProducts[product], eventData[data]));
			}
		}
	}	
}).catch(reject=>{
	throw Error(reject);
})

var app = new Vue({
	el: '#app',
	data: {
		message: "hello",
		processed_listings: []
	}
});