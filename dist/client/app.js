Powerup.network.fetch(2).then(resolve=>{
	let eventProducts = Powerup.data.unprocessed.eventProducts;
	let eventData = Powerup.data.unprocessed.eventData;
	let processed = [];//Powerup.data.processed;

	for(var data = 0; data < eventData.length; data++){
		for(var product = 0; product < eventProducts.length; product++){
			if(eventProducts[product].productId === eventData[data].productId){
				processed.push(Object.assign(eventProducts[product], eventData[data]));
				break;
			}
		}
	}
	var tmpDate = new Date();
	for(var listing = 0; listing < processed.length; listing++){
		var tmpListing = processed[listing];
		tmpListing.price = `$${tmpListing.defaultRates[0].price.amount}`;
		//tmpListing.startDate = tmpDate.toDateString(tmpListing.courseSchedule.events[0].startTime);
		//tmpListing.endDate = tmpDate.toDateString(tmpListing.courseSchedule.events[tmpListing.courseSchedule.length - 1].startTime);

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