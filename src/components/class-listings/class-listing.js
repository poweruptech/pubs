import { network } from '../../network';
import { cache } from '../../data';
import { utils } from '../../utils';

/*global Vue*/
/*global app*/

try{//checking whether classes are saved
    var classes = cache.access("classes");
    
     network.ping(classes).then(success=>{
        //you've been given the A-Okay by the server!
         
        window.app.classes = classes;
       }).catch(fail=>{
        //Server deemed your data out of date :(
   
        //download new data using network.update() or something.
       });
}catch(err){//classes have never been saved to device
    console.log(err);
    
    //downloads class list and saves to device. Also sets up Vue 
    network.fetch(3).then(result=>{
        classes = utils.process(result);
        
        cache.save("classes", classes); //save classes to device
        
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