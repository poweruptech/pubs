var axios = require('axios');

const API_KEY = '';
const SECRET_KEY = '';

const bookeo = axios.create({
	baseURL: 'https://api.bookeo.com/v2/',
	responseType: 'json',
	headers: {
		'Content-Type' : 'application/json',
		'X-Bookeo-apiKey' : API_KEY,
		'X-Bookeo-secretKey' : SECRET_KEY
	}
});

//TODO: Remove implicit calling of server.next();

/**
 * Stores all network related functions
 * @module Network
 */
var network = {
    /**
     * @memberof Network
     * @function authUser
     * @param {Object} server
     * @param {Array}  list
     * @param {String} username
     * @param {String} password
     */
    authUser: function(server, list, username, password){
        for(let customer of list.customers){
            if(customer.emailAddress == username){
                bookeo.get(`customers/{customer.id}/auth`, {
					params: password
				}).then(response =>{
                    if(response.status == 200){
                        server.res.send(JSON.stringify(customer));
                        server.next();
                    }
                    else{
                        server.res.send(403);
                        server.next();
                    }
				}).catch(err=>{
				    console.log(err.response.data);
                    server.res.send(403);
                    server.next();
				});
            }
        }
    },

    /**
     * @memberof Network
     * @function createBooking
     */
    createBooking: function(server, booking){
        bookeo.post('bookings', {
            data: booking
        }).then(response=>{
            //Do booking shit here
            server.res.send(200);
            return server.next();
        }).catch(err=>{
            console.log(err.response);
            server.res.send(400);
            return server.next();
        });
    },

    /**
     * @memberof Network
     * @function createCustomer
     * @param {Customer} customer
     * @returns {Promise}
     */
    createCustomer: function(customer){
        return bookeo.post('customers', {
            data: customer
        });
    },
    
    /**
     * Basically returns the axios object
     * Used in cases when network.request isn't enough
     */
    getApiService: function(){
      return bookeo;  
    },

    /**
     * @memberof Network
     * @function request
     * @param {Object} server
     * @param {String} url
     * @param {Object} options
     * @param {String} options.params
     * @param {String} options.data
     */

    request: function(server, url, options){
        bookeo.get(url, {
            params: options.params,
            data: options.data
        }).then((response)=>{
            server.res.send(response.data);
            return server.next();
        }).catch(err=>{
            server.res.send(err.response.data);
            console.error(err.response.data);
            return server.next();
        });
    },

    /**
     * Updates the customer list. Use when updating the customer 
     * roster so that changes are reflected locally.
     * @memberof Network
     * @function updateCustomerList
     */
    updateCustomerList: function(){
        return bookeo.get('customers');
    }
};

module.exports = network;