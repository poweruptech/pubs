import { network } from '../../network';
import { utils } from '../../utils';

/*global Vue*/

network.fetch(3).then(resolve=>{
    utils.processListings(resolve, {
        type: 'private'
    });   
}).catch(err=>{
    console.log(err);
});

var privateEvent = Vue.component('private-event', {
    template: 
    `<select v-model="class">
        <option v-for="class in classes">
        {{ class.startDate }}
        </option>
    </select>`
});

export { privateEvent };