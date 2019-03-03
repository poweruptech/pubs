import { network } from "../network";
import { utils } from "../utils";

var classes;

network.fetch(3).then(result=>{
    var options = {
        include: {
            at: 'title',
            terms: ['minecraft', 'party']
        }
    };
    
    classes = utils.process(result, options);
});
