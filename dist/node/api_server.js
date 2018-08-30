//TODO: Add documentation, add more functionality, and maybe add some type of caching for listings.

const API_KEY = "API KEY HERE";
const SECRET_KEY = "SECRET KEY HERE";
const URL = {
	check_validity: '',
	get_customers: 'customers', 
	get_products : 'settings/products',
	get_availability_slots: 'availability/slots',
	create_booking: 'bookings'
};

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

var customers;

function auth(username, password){
	bookeo.get(URL.get_customers).then((response)=>{
		customers = response.data;
		
		for(let customer in customers.data){
			if(customer.emailAddress === username){
				bookeo.get(`customers/{customer.id}/auth`, {
					params: password
				}).then(response =>{
					res.send(customer);
				}).catch(err=>{
					res.send(403);
				});
			}
		}
	}).catch(err=>{
		res.send(403);
	});
}

function apiCall(server, url, params){
	bookeo.get(url, {
		params: params
	}).then((response)=>{
		server.res.send(response.data);
		return next();
	}).catch(err=>{
		server.res.send('Error has occurred');
		console.error(err);
		return next();
	});
}

server.get('/get/customers', (req, res, next)=>{
	apiCall({req:req, res: res, next: next}, URL.get_customers);
})
server.get('/get/classes', (req, res, next)=>{
	apiCall({req:req, res: res, next: next}, URL.get_products);
});

server.get('/validate/promo', (req, res, next)=>{
	apiCall({req:req, res: res, next: next}, URL.check_validity);
})

server.get('/create/booking',(req,res,next)=>{
	apiCall({req:req, res: res, next: next}, URL.create_booking, req.data);

})
server.get('/get/availability', (req, res, next)=>{
	console.log(req.query);
	apiCall({req:req, res: res, next: next}, URL.get_availability_slots, req.query);
});

server.listen(3000, ()=>{
	console.log("Server is running at:", server.url);
})
