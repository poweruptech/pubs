//TODO: Add documentation, add more functionality
const URL = {
	check_validity: '',
	get_customers: 'customers', 
	get_products : 'settings/products',
	get_availability_slots: 'availability/slots',
	create_booking: 'bookings'
};

const restify = require('restify');
const server = restify.createServer();

const network = require('./dist/network');

var cache = {
	classes: {},
	classmeta: {},
	customers: {}
};

server.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
  	return next();
});

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

//NOTE: network.request() automatically calls next();

//TODO: Remove implicit calling of next();

server.get('/', (req, res, next)=>{
	res.send("hello world");
	next();
});

//user auth, still a WIP.
server.get('/auth/user', (req, res, next)=>{
	var server = {req:req, res:res, next:next};
	
	var lastUpdate;
	var currentDay = new Date();
	currentDay = currentDay.getDay();
	
	if(cache.customers.lastUpdated !== undefined){
		lastUpdate = new Date(cache.customers.lastUpdated);
		lastUpdate = lastUpdate.getDay();
	}else
		lastUpdate = -1;
		
	/**
	 * if customer cache is older than a day, cache is refreshed
	 * 
	 * might choose to manually update the cache, and then refresh the cache 
	 * once per week to coincide with the Bookeo database.
	 */
	if(currentDay > lastUpdate || currentDay < lastUpdate || lastUpdate == -1){
		network.updateCustomerList().then(result=>{
			cache.customer.data = result.data.data;	
		});
	}
	
	network.authUser(server, cache.customers, req.query.username, req.query.password);
});

//sends class list. saves a copy as well!
server.get('/get/classes', (req, res, next)=>{
	var request = network.getApiService();
	var lastUpdate;
	var currentDay = new Date();
	currentDay = currentDay.getDay();
	
	if(cache.classes.lastUpdated !== undefined){
		lastUpdate = new Date(cache.classes.lastUpdated);
		lastUpdate = lastUpdate.getDay();
	}else
		lastUpdate = -1; // Only equal to -1 when a cache hasn't been init yet. (ie. node startup)
	
	//if cache is older than a day, cache is refreshed
	if(currentDay > lastUpdate || currentDay < lastUpdate || lastUpdate == -1){
		request.get(URL.get_products).then(response=>{
			res.header("Access-Control-Allow-Origin", "*");
			res.send(response.data);
		
			var updated = new Date();
			updated = updated.getTime();

			cache.classes.lastUpdated = updated;
			cache.classes.data = response.data;
		
			console.log(cache.classes.lastUpdated);
		
			next();
		}).catch(err=>{
			console.log(err.data);
			res.send(404);
			next();
		});
	}else{
		res.send(200, cache.classes); // if classes are less than a day old, cached copy is sent
	}
});

//used for sales, WIP
server.get('/validate/promo', (req, res, next)=>{
	network.request({req:req, res:res, next:next}, URL.check_validity);
});

//used for creating bookings, still a WIP??
server.get('/create/booking',(req,res,next)=>{
	network.request({req:req, res:res,next:next}, URL.create_booking, req.data);
});

//customer creation is a WIP.
server.post('/create/customer', (req, res, next)=>{
	console.log(req.body);
	network.createCustomer(req.body).then(response=>{
		server.res.send(200);
		this.updateCustomerList();
		return server.next();
	}).catch(err=>{
		server.res.send(err);
        return server.next();
	});
});


//update checking!!
server.post('/ping', (req, res, next)=>{
	req = JSON.parse(req.data);
	
	if(cache[req.target] == undefined){
		res.send(406, JSON.stringify({
			status:"ERROR", 
			reason: `Target "${req.target}" does not exist.`
		}));
		next();
	}
	
	if(req.data.lastUpdated < cache[req.target].lastUpdated)
		res.send(406, JSON.stringify(cache[req.target].data));
	else
		res.send(200);
		
	next();
});

//sends class metadata, saves a copy as well!
//TODO: Maybe update the metadata once per hour rather than once per day...
//TODO: Also add manual tracking of metadata throughout the hour until data is refreshed...
server.get('/get/classmeta', (req, res, next)=>{
	var request = network.getApiService();
	var lastUpdate;
	var currentDay = new Date();
	currentDay = currentDay.getDay();
	
	if(cache.classmeta.lastUpdated !== undefined){
		lastUpdate = new Date(cache.classes.lastUpdated);
		lastUpdate = lastUpdate.getDay();
	}else
		lastUpdate = -1; // Only equal to -1 when a cache hasn't been init yet. (ie. node startup)
	
	if(currentDay > lastUpdate || currentDay < lastUpdate || currentDay == -1){
		request.get(URL.get_availability_slots, {
			params: req.query
		}).then(response=>{
			res.send(response.data);
			
			var updated = new Date();
			updated = updated.getTime();
	
			cache.classmeta.lastUpdated = updated;
			cache.classmeta.data = response.data;
			
			next();
		}).catch(err=>{
			console.log(err);
			res.send(406, err);
			next();
		});
	}else{
		res.send(200, cache.classmeta);
		next();
	}
});

server.listen(process.env.PORT, process.env.IP, ()=>{
	console.log("Server is running at:", server.url);
});