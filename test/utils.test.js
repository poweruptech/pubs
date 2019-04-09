/*global expect*/

//import * as utils from '../src/utils.js';

var exampleClassListings = {
    data:[]
}

test('returns a class which ...', ()=>{
    var options = {
        
    };
    
    expect(utils.search(exampleClassListings.data, options)).toEqual(expect.arrayContaining());
})