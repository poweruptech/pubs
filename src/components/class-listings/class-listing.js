import { network } from '../../network'
import { utils} from '../../utils'

var classListings = Vue.component('class-listings',{
    template: ``
})

network.fetch(3).then(resolve =>{ 
    utils.processListings(resolve, {
        include: ['courses']
    });
}).catch(err=>{
    //retry, or just give up...
});

export { classListings };