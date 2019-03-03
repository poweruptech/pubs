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

/**
 * Stores all network related functions and data.
 * @module Network
 */
var network = {
    data: {
        customers: []
    },

    status: {

    },
    
    /**
     * @memberof Network
     * @function authUser
     * @param {String} username
     * @param {String} password
     * @param {Function} next
     */
    authUser: function(server, username, password){
        for(let customer of this.data.customers){
            if(customer.emailAddress == username){
                bookeo.get(`customers/{customer.id}/auth`, {
					params: password
				}).then(response =>{
                    if(response.status == 200){
                        server.res.send(customer);
                        server.next();
                    }
                    else{
                        server.res.send(403);
                        server.next();
                    }
				}).catch(err=>{
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
     * @param {String} params
     * @param {String} data
     */

    request: function(server, url, params, data){
        bookeo.get(url, {
            params: params,
            data: data
        }).then((response)=>{
            server.res.send(response.data);
            return server.next();
        }).catch(err=>{
            server.res.send(err.response.data);
            console.error(err);
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
        bookeo.get('customers').then(response=>{
            this.data.customers = response.data.data;
        }).catch(err=>{
           console.log(err.response.data);
        });
    }
};

module.exports = network;