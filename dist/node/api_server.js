//TODO: Add documentation, add more functionality
const URL = {
	check_validity: '',
	get_customers: 'customers', 
	get_products : 'settings/products',
	get_availability_slots: 'availability/slots',
	create_booking: 'bookings'
};

//const {google} = require("googleapis");
const fs = require('fs');
const restify = require('restify');
const server = restify.createServer({name:"Power-Up Services"});
const network = require('./dist/network');

const admin_credentials = {
	username: 'tamasin',
	password: 'powerupta'
};

//var sheets;

var cache = {
	classes: {},
	classmeta: {},
	customers: {}
};

fs.open('user_contact.csv', 'a', (err, fd)=>{
    if(err)
    	console.log(err);
});

server.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
  	return next();
});

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.gzipResponse());

//NOTE: network.request() automatically calls next();

//TODO: Remove implicit calling of next();

server.get('/', (req, res, next)=>{
	res.send("hello world");
	return next();
});


//experimental admin login panel
//for now, it'll only return a CSV file containing contact info
server.get('/admin', (req, res, next)=>{
	let file = fs.createReadStream('./html/admin.html');
	res.setHeader('Content-type', 'text/html');
	file.pipe(res);
	return next();
});

server.get('/contactinfo', (req, res, next)=>{
	let file = fs.createReadStream('user_contact.csv');
	res.setHeader('Content-disposition', 'attachment; filename=user_contact.csv');
	res.setHeader('Content-type', 'text/csv');
	res.writeHead(206);
	file.pipe(res);
	
	file.on('end', ()=>{
		console.log('pipe completed');
		return next();
	})
})

//Used for authenication of admin login
server.post('/login', (req, res, next)=>{
    req.body = JSON.parse(req.body);
	if(req.body.username == undefined || req.body.password == undefined){
		res.send(401);
		return next();
	}
	if(req.body.username == admin_credentials.username && req.body.password == admin_credentials.password){
		let file = fs.createReadStream('user_contact.csv');
		res.setHeader('Content-disposition', 'attachment; filename=user_contact.csv');
		res.setHeader('Content-type', 'text/csv');
		res.writeHead(206);
		file.pipe(res);
		
		file.on('end', ()=>{
			console.log("pipe completed");
			return next();
		});
	}else{
		res.send(401);
		return next();
	}
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
	
	for(var customer of cache.customers.data){
		if(customer){
			
		}
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
		
			return next();
		}).catch(err=>{
			console.log(err.data);
			res.send(404);
			return next();
		});
	}else{
		console.log("Classes are still fresh!");
		res.cache({maxAge: 86400});
		res.send(200, cache.classes); // if classes are less than a day old, cached copy is sent
	}
});

//used for sales, WIP
server.get('/validate/promo', (req, res, next)=>{
	network.request({req:req, res:res, next:next}, URL.check_validity);
});

//Booking creation
//TODO: Track available seating
server.post('/create/booking',(req,res,next)=>{
	
	let classmeta;
	for(let i = 0; i < cache.classmeta.length; i++){
		if(req.data.eventId == cache.classmeta[i].eventId){
			classmeta = cache.classmeta[i];
			break;
		}
	}
	
	
	classmeta.numSeatsAvailable -= 1;
	network.request({req:req, res:res, next:next}, URL.create_booking, {data: req.body});
});

//customer creation is a WIP.
server.post('/create/customer', (req, res, next)=>{
	console.log(req.body);
	network.createCustomer(req.body).then(response=>{
		server.res.send(200);
		//update customer list manually...
		return next();
	}).catch(err=>{
		server.res.send(err);
        return next();
	});
});

server.post('/post/contactinfo', (req,res,next)=>{
	try{
		console.log("Before JSON parse...\n");
		console.log(req.body);
		
		console.log("After JSON parse...\n");
		req.body = JSON.parse(req.body);
		
		var data = req.body.name + ',' + req.body.phone + ',' + req.body.email + req.body.comments + '\n';
		fs.appendFile('user_contact.csv', data, err=>{
		    if(err)
		        console.log(err);
		});
		
		res.send(200);
		
		return next();
	}catch(err){
		res.send(404);
		console.error(err);
		return next();
	}
	/*
	let reqdata = JSON.parse(req.data);
	let spreadsheetId = '1SifK3uPXL3l7pbUyuq2hsd6xbCfK8PTACjBlmUrComQ';
	
	if(sheets == undefined)
		sheets = google.sheets({version: 'v4', auth: ''});
		
		sheets.spreadsheets.values.append({
			spreadsheetId,
			range: 'Sheet1!A1:C',
			valueInputOption: 'USER_ENTERED',
			requestBody: {
				values: [[reqdata.f_name, reqdata.l_name, reqdata.email]]
			}
		}).then(result=>{
			res.send(200);
		}).catch(err=>{
			res.send(404);
		});*/
});


//update checking!!
server.post('/ping', (req, res, next)=>{
	req.data = JSON.parse(req.data);
	
	if(cache[req.target] == undefined){
		res.send(406, JSON.stringify({
			status:"ERROR", 
			reason: `Target "${req.target}" does not exist.`
		}));
		return next();
	}
	
	if(req.data.lastUpdated < cache[req.target].lastUpdated)
		res.send(406, JSON.stringify(cache[req.target].data));
	else
		res.send(200);
		
	return next();
});

//sends class metadata, saves a copy as well!
//TODO: Maybe update the metadata once per hour rather than once per day...
//TODO: Also add manual tracking of metadata throughout the hour until data is refreshed...
server.get('/get/classmeta', (req, res, next)=>{
	if(req.query == undefined){
		res.send(406);
		return next();
	}
	
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
			res.send(406, err.response);
			next();
		});
	}else{
		res.send(200, cache.classmeta);
		next();
	}
});

/*
function init(){
	var net = network.getApiService();

	net.get(URL.get_customers).then(res=>{
		var updated = new Date();
		updated = updated.getDate();
		cache.customers.data = res.data.data;
		cache.customers.lastUpdated = updated;
	});
	
	net.get(URL.get_products).then(res=>{
		var updated = new Date();
		updated = updated.getTime();
		cache.classes.data = res.data.data;
		cache.classes.lastUpdated = updated;
	});
}

init();*/
//A2 Hosting
server.listen(40000, "127.0.0.1", ()=>{
	console.log("Server is running at:", server.url);
});