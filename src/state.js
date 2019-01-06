
/**
 * Manages the current state of the app
 */
var state = {
    completedTasks: [],
    messages : []
};


//state functions

function set(src, destination, val){
    if(this.src === undefined)
        throw new Error('Source is undefined');
    Vue.set(src, destination, val);
}

function sdelete(src, destination, val){
    Vue
}