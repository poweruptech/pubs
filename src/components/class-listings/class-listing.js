import { network } from '../../network';
import { cache } from '../../data';
import { utils } from '../../utils';

/*global Vue*/
/*global app*/
try{
    var classes = cache.access("classes");
}catch(err){
    console.log(err);
    
    network.fetch(3).then(result=>{
        classes = utils.process(result);
        
        if(window.app == undefined)
            console.error("Expected Vue app to be stored in a var named 'app'");
            
        window.app.classes = classes; //Assumes Vue app will be named app.
    });
}

var classListings = Vue.component('class-listings',{
    props: {
        listing: Object
    },
    
    template: 
    `<table>
        <thead>
            <tr>
                <th>Class</th>
                <th>Date</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="class in classes">
                <td> {{ class.title }} </td>
                <td> {{ class.startDate }} - {{class.endDate }} </td>
                <td> {{ class.price }} </td>
            </tr>
        </tbody>
    </table>`
});

export { classListings };