//TODO: Add documentation, add more functionality, and maybe add some type of caching for listings.
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
	classmeta: {}
};

server.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
  	return next();
});

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

//NOTE: network.request() automatically calls next()

//user auth, still a WIP.
server.get('/auth/user', (req, res, next)=>{
	network.authUser(req.query.username, req.query.password, next);
});

//gets customer list, a copy should be saved, but doesn't happen yet.
server.get('/get/customers', (req, res, next)=>{
	network.request({req:req, res:res, next:next}, URL.get_customers);
});

//sends class list. saves a copy as well!
server.get('/get/classes', (req, res, next)=>{
	var request = network.getApiService();
	
	request.get(URL.get_products).then(response=>{
		res.send(response.data);
		
		var updated = new Date();
		updated = updated.getTime();

		cache.classes.lastUpdated = updated;
		cache.classes.data = response.data;
		
		next();
	});
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
server.get('/get/classmeta', (req, res, next)=>{
	var request = network.getApiService();
	
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
});

server.listen(process.env.PORT, process.env.IP, ()=>{
	console.log("Server is running at:", server.url);
});