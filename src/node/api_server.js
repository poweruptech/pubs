//TODO: Add documentation, add more functionality, and maybe add some type of caching for listings.

const API_KEY = "API KEY HERE";
const SECRET_KEY = "SECRET KEY HERE";
const URL = {
	check_validity: '',
	get_customers: 'customers', 
	get_products : 'settings/products',
	get_availability_slots: 'availability/slots',
	create_booking: 'bookings'
}
const axios = require('axios');
const restify = require('restify');
const server = restify.createServer();
const bookeo = axios.create({
	baseURL: 'https://api.bookeo.com/v2/',
	responseType: 'json',
	headers: {
		'Content-Type' : 'application/json',
		'X-Bookeo-apiKey' : API_KEY,
		'X-Bookeo-secretKey' : SECRET_KEY
	}
});

server.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
  return next();
});

server.use(restify.plugins.queryParser());

function apiCall(req, res, next, url, parameters){
	
	if(parameters == undefined){
		bookeo.get(url).then((response)=>{
			classListings = response.data;
			res.send(response.data);
			return next();
		}).catch((error)=>{
			console.error(error);
			return next();
		})
	}else{
		bookeo.get(url, {
			params: parameters
		}).then((response)=>{
			res.send(response.data);
			return next();
		}).catch((error)=>{
			console.log(error);
			return next();
		})
	}
}

server.get('/get/customers', (req, res, next)=>{
	apiCall(req, res, next, URL.get_customers);
	return next();
})
server.get('/get/classes', (req, res, next)=>{
	apiCall(req, res, next, URL.get_products);
	return next();
});

server.get('/validate/promo', (req, res, next)=>{
	apiCall(req, res, next, URL.check_validity);
	return next();
})

server.get('/create/booking',(req,res,next)=>{
	apiCall(req,res,next, URL.create_booking, req.data);
	return next();
})
server.get('/get/availability', (req, res, next)=>{
	console.log(req.query);
	apiCall(req, res, next, URL.get_availability_slots, req.query);
	return next();
});

server.listen(3000, ()=>{
	console.log("Server is running at:", server.url);
})
