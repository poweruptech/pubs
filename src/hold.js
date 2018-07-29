import { network } from './network.js';
import { URL } from './URL.js';

function Hold(booking){
    this.create(booking).then(resolve=>{
        this.data = resolve;
    }).catch(err=>{
       throw err; 
    });
}

Hold.prototype = {
    create: function(booking){
        return new Promise((resolve, reject)=>{
            network.request("POST", URL.create_hold, undefined, booking.data)
            .then(complete=>{
                resolve(complete);
            }).catch(err=>{
                reject(err);
            });
        });
    },
    delete: function(){
        return new Promise((resolve, reject)=>{
            network.request("DELETE", URL.delete_hold, undefined, this.id)
            .then(complete=>{
                resolve();
            }).catch(err=>{
                reject(err);
            }); 
        });
    }
};
export { Hold };