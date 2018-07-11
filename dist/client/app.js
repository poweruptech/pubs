Powerup.network.fetch(2).then(resolve=>{
	let eventProducts = Powerup.data.unprocessed.eventProducts;
	let eventData = Powerup.data.unprocessed.eventData;
	let processed = [];

	for(var data = 0; data < eventData.length; data++){
		for(var product = 0; product < eventProducts.length; product++){
			if(eventProducts[product].productId === eventData[data].productId){
				processed.push(Object.assign(eventProducts[product], eventData[data]));
				break;
			}
		}
	}

	for(var listing = 0; listing < processed.length; listing++){
		var tmpListing = processed[listing];
		tmpListing.listing_key = listing;
		tmpListing.price = `$${tmpListing.defaultRates[0].price.amount}`;

		if(tmpListing.courseSchedule !== undefined){
			let strDate = new Date(tmpListing.courseSchedule.events[0].startTime);
			let endDate = new Date(tmpListing.courseSchedule.events[tmpListing.courseSchedule0.events.length - 1].startTime);
			tmpListing.startDate = strDate.toDateString();
			tmpListing.endDate = endDate.toDateString();
		}else{
			let strDate = new Date(tmpListing.startTime);
			let endDate = new Date(tmpListing.endTime);
			tmpListing.startDate = strDate.toDateString();
			tmpListing.endDate = endDate.toDateString();
		}

		Powerup.data.processed.push(tmpListing);
	}
}).catch(reject=>{
	throw Error(reject);
})

var app = new Vue({
	el: '#app',
	data: {
		processed_listings: Powerup.data.processed,
		visible: function(){
			return true;
		}
	}
});

Vue.component('product-listing', {

	data: function(){
			return {
					visible: true
				}
		},

	props: ['product'],

	template: `<tr @click='visible = !visible'>
				<td v-if='visible'>{{ product.name }}</td>
				<td v-if='visible'>{{ product.startTime }}</td>
				<td v-if='visible'>{{ product.price }}</td>
				<td v-if='!visible'
				v-html='product.description'></td>
			</tr>`
});