/**
 * Fetches 2 periods of data (62 days) from the bookeo API and processes it. Once processed
 * it can be found in Powerup.data.processed[].
 */
Powerup.network.fetch(2).then(resolve=>{
	let eventProducts = Powerup.data.unprocessed.eventProducts; //all events created by owner
	let eventData = Powerup.data.unprocessed.eventData; //actual events to be booked
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

	for(var listing = 0; listing < processed.length; listing++){
		var tmpListing = processed[listing];
		tmpListing.listing_key = listing; //listing key = current index
		tmpListing.price = `$${tmpListing.defaultRates[0].price.amount}`;

		//not all bookable events have a courseSchedule with them, so this is required
		if(tmpListing.courseSchedule !== undefined){
			let strDate = new Date(tmpListing.courseSchedule.events[0].startTime);
			let endDate = new Date(tmpListing.courseSchedule.events[tmpListing.courseSchedule.events.length - 1].startTime);
			tmpListing.startDate = strDate.toDateString();
			tmpListing.endDate = endDate.toDateString();
		}else{
			let strDate = new Date(tmpListing.startTime);
			let endDate = new Date(tmpListing.endTime);
			tmpListing.startDate = strDate.toDateString();
			tmpListing.endDate = endDate.toDateString();
		}
	}

	//when processing is done, the listings are pushed onto the Powerup object
	for(var listing = 0; listing < processed.length; listing++){
		Powerup.data.processed.push(processed[listing]);
	}
}).catch(reject=>{
	throw new Error(reject);
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