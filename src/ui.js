var ui = {
    prompt: function(message){
        var window = new Message(message);
        return new Promise((resolve, reject)=>{
            if(this.prompt.accept)
                resolve();
            else if(this.prompt.reject)
                reject();
        });
    }
};