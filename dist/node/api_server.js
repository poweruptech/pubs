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

var data = {
	classes: [],
	classmeta: []
};

//network.updateCustomerList();

server.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
  	return next();
});

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get('/auth/user', (req, res, next)=>{
	network.authUser(req.query.username, req.query.password, next);
});

server.get('/get/customers', (req, res, next)=>{
	network.request({req:req, res:res, next:next}, URL.get_customers);
});

server.get('/get/classes', (req, res, next)=>{
	//TODO: Save a copy into the cache
	
	network.request({req:req, res:res, next:next}, URL.get_products);
});

server.get('/validate/promo', (req, res, next)=>{
	network.request({req:req, res:res, next:next}, URL.check_validity);
});

server.get('/create/booking',(req,res,next)=>{
	network.request({req:req, res:res,next:next}, URL.create_booking, req.data);
});

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

server.post('/ping', (req, res, next)=>{
	req = JSON.parse(req);
	
	req.data.target;
	
	if(data[req.target] == undefined){
		res.send(406, JSON.stringify({
			status:"ERROR", 
			reason: `Target "${req.target}" does not exist.`
		}));
		next();
	}
	
	if(req.data.lastUpdated < data[req.target].lastUpdated)
		res.send(406, JSON.stringify(data[req.target]));
	else
		res.send(200);
});

server.get('/get/availability', (req, res, next)=>{
	network.request({req:req, res:res, next:next}, URL.get_availability_slots, req.query);
});

server.listen(process.env.PORT, process.env.IP, ()=>{
	console.log("Server is running at:", server.url);
});
