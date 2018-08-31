import { network } from './network.js';
import { URL } from './URL.js';

/**
 * @class Hold
 * @param {} listing 
 */
function Hold(listing){
    this.listing = listing;
}

Hold.prototype = {
    /**
     * Creates a hold for a given listing/event
     * @memberof Hold
     * @function create
     * @param {Object} listing Listing/event which will be placed on hold
     * @returns {Promise}
     */
    create: function(listing){
        if(this.listing !== undefined){
            if(this.listing.eventId !== listing.eventId)
                this.delete();
            else
                return Promise.reject(new Error("Hold already present"));
        }
            
        this.listing = listing;
        return new Promise((resolve, reject)=>{
            network.request("POST", URL.create_hold, undefined, listing.data)
            .then(complete=>{
                Object.assign(this, complete);
                resolve();
            }).catch(err=>{
                reject(err);
            });
        });
    },
    
    /**
     * Removes the hold from the listing/event
     * @memberof Hold
     * @function delete
     * @returns {Promise}
     */
    delete: function(){
        return new Promise((resolve, reject)=>{
            network.request("DELETE", URL.delete_hold, undefined, this.id)
            .then(complete=>{
                resolve("Successfully deleted!");
            }).catch(err=>{
                reject(err);
            }); 
        });
    }
};
export { Hold };