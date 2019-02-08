import { network } from "../network";
import { utils } from "../utils";
import { cache } from "../data";


if()
network.fetch(3).then(result=>{

    utils.processListings(result, {
        onlyInclude: "Minecraft Party",
        searchInLocation: "title"
    })    
})