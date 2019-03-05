import { fetch as n_fetch} from "../network.js"; //prevents conflicts with window.fetch()
import { process } from "../utils.js";

n_fetch(3).then(result=>{
    var options = {
        type: 'include',
        at: ['title'],
        terms: ['minecraft party']
    };
    
    var classes = process(result, options);
    
    var data = [{
        "minecraft parties": []
    }];
    
    for(var i = 0; i < classes.length; i++){
        data[0]["minecraft parties"].push(classes[i].startDate);    
    }
    
    window.data = data;
});
