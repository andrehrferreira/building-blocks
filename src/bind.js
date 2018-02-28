const async = require("async");

module.exports = function(_this, actions){
    var Bind = {
        parse: function(){
            if(typeof actions == "object"){
                if(actions.start){//Use plugin
                    if(typeof _this[actions.start.plugin] == "object"){
                        if(typeof _this[actions.start.plugin][actions.start.func] == "function"){
                            if(actions.start.call)
                                actions.start.params.push(Bind.stringToFunction(actions[actions.start.call], actions))

                            if(actions.start.params)
                                _this[actions.start.plugin][actions.start.func].apply(_this[actions.start.plugin], actions.start.params);
                            else
                                _this[actions.start.plugin][actions.start.func].call(_this[actions.start.plugin]);
                        }
                        else{

                        }
                    }
                    else if(typeof _this[actions.start.arguments] == "object"){

                    }
                }

            }
            else{
                throw "Error";
            }
        },

        stringToFunction: function(funcParams, actions){
            if(funcParams.arguments){
                if(funcParams.plugin){
                    if(funcParams.call)
                        var callback = this.stringToFunction(actions[funcParams.call], actions)

                    var pluginParams = funcParams.params || [];
                    pluginParams.push(tmpFunc);
                    _this[funcParams.plugin].get()[funcParams.func].apply(_this[funcParams.plugin].get(), pluginParams);
                }
                else{
                    if(funcParams.call)
                        var callback = this.stringToFunction(actions[funcParams.call], actions)

                    if(typeof funcParams.params == "string")
                        var args = "'" + funcParams.params + "'";
                    else if(typeof funcParams.params == "object")
                        var args = JSON.stringify(funcParams.params);
                    else
                        var args = "";

                    if(funcParams.use)
                        var functionBody = funcParams.use + "." + funcParams.func + "(" + args + ");\n";
                    else
                        var functionBody = funcParams.func + "(" + args + ");\n";

                    if(callback)
                        functionBody += "(function(" + functionBody.arguments + "){" + callback.toString() + "})(" + functionBody.arguments + ");"

                    return new Function(funcParams.arguments.split(","), functionBody);
                }
            }
            else if(funcParams.plugin){
                if(typeof _this[funcParams.plugin][funcParams.func] == "function")
                    return _this[funcParams.plugin][funcParams.func];
                else
                    return null;
            }
        }
    }

    Bind.parse();
};
