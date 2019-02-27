import { network } from "../network";
import { utils } from "../utils";
import { cache } from "../data";

if(cache.upToDate()){
    network.fetch(3).then(result=>{
        utils.processListings(result, {
            onlyInclude: "Minecraft Party",
            searchInLocation: "title"
        });
        
    });
}
else{
    cache.update().then(result=>{
        utils.processListings(result);
    });
}