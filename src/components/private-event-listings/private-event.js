import { network } from '../../network'
import { utils } from '../../utils'

network.fetch(3).then(resolve=>{
    utils.processListings(resolve, {
        include: ['private']
    });   
}).catch(err=>{

    powerup.promptChoice("An error has occurred, would you like to retry?");
    //retry, or just give up...
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