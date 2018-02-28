module.exports = function(settings){
    return {
        id: "express",

        app: null,

        __init: function(callback){
            if(settings.port){
                let express = require("express");

                this.app = express();
                this.app.set('views', './build/public');
                this.app.set('view engine', 'ejs');
                this.app.listen(settings.port, () => { console.log("localhost:", settings.port); });

                if(typeof callback == "function")
                    callback();
            }
            else{
                throw "Error to load plugin Express: The application port has not been defined";
            }
        },

        get: function(){
            return this.app;
        },

        render: function(method, path, template){
            if(typeof this.app[method] == "function"){
                this.app[method](path, (req, res) => {
                    res.render(template);
                });
            }
            else{
                throw "Invalid plugin method: " + this.id + ".app." + method + "();";
            }
        }
    }
};
