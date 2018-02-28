const fs = require("fs"),
      path = require("path"),
      define = require("organized").load,
      Glob = require("glob-fs"),
      ejs = require("ejs"),
      cheerio = require("cheerio"),
      htmlBeautify = require("./htmlBeautifier.js"),
      jsBeautify = require('js-beautify').js_beautify;

module.exports = function(options, callback){
    var Maps = (typeof options.map == "string") ? [options.map] : options.map;

    if(typeof Maps !== "object")
        Maps = [`${options.cwd}/${options.build}/app/*.js`];
    else
        Maps.push(`${options.cwd}/${options.build}/app/*.js`);

    var Build = {
        Schemas: {},
        Blocks: {},

        init: function(callback){
            define({
                blocks: () => {//Loading blocks
                    if(typeof options.blocks == "object"){
                        var BuildBlocks = [];

                        options.blocks.forEach(function(elem, index, arr){
                            let Blocks = new Glob();
                            Blocks = Blocks.readdirSync(elem.replace(options.cwd, ""));

                            for(let key in Blocks){
                                var buffer = fs.readFileSync(Blocks[key]);
                                var name = path.basename(Blocks[key]).replace(/(\..*?)$/i, "");
                                BuildBlocks[name] = Build.Blocks[name] = buffer.toString();
                            }
                        });

                        return BuildBlocks;
                    }
                    else{
                        throw "Error";
                    }
                },
                plugins: (blocks) => {//Loading plugins
                    if(typeof options.blocks == "object"){
                        var BuildPlugins = [];

                        options.plugins.forEach(function(elem, index, arr){
                            let Plugins = new Glob();
                            Plugins = Plugins.readdirSync(elem.replace(options.cwd, ""));

                            for(let key in Plugins){
                                var name = path.basename(Plugins[key]).replace(/(\..*?)$/i, "");
                                BuildPlugins[name] = require(options.cwd + "/" + Plugins[key]);
                            }
                        });

                        return BuildPlugins;
                    }
                    else{
                        throw "Error";
                    }
                },
                schemas: (blocks, plugins) => {//Loading schemas
                    if(typeof options.blocks == "object"){
                        var BuildSchemas = [];

                        options.schemas.forEach(function(elem, index, arr){
                            let Schemas = new Glob();
                            Schemas = Schemas.readdirSync(elem.replace(options.cwd, ""));

                            for(let key in Schemas){
                                try{
                                    var buffer = fs.readFileSync(Schemas[key]);
                                    var tmpSchema = JSON.parse(buffer.toString());

                                    BuildSchemas[tmpSchema.id] = Build.Schemas[tmpSchema.id] = tmpSchema;

                                    //Create schemas controller
                                    if(tmpSchema.actions || tmpSchema.plugins){
                                        if(tmpSchema.plugins)
                                            var sControler = "module.exports = (_this, bind, plugins," + tmpSchema.plugins.join(",") + ") => {\n";
                                        else
                                            var sControler = "module.exports = (_this, bind, plugins) => {\n";

                                        if(tmpSchema.actions){
                                            tmpSchema.actions.forEach((elem, index, arr) => {
                                                sControler += "bind(_this, " + JSON.stringify(elem) + ");\n\n";
                                            });
                                        }

                                        sControler += "};";

                                        fs.writeFileSync(options.build + "/app/"+ tmpSchema.id + ".js", jsBeautify(sControler));
                                    }
                                }
                                catch(e){ throw Schemas[key] + ": " + e.message; }
                            }
                        });

                        return BuildSchemas;
                    }
                    else{
                        throw "Error";
                    }
                },
                bind: () => { return require("./bind.js"); }
            }, {
                provider: (_this, blocks, schemas, plugins) => {
                    for(let key in schemas){
                        if(schemas[key].type === "plugin"){
                            if(Build.keyArrExists(schemas[key].script, plugins)){
                                var tmpConstructor = plugins[schemas[key].script];
                                var tmpPlugin = new tmpConstructor(schemas[key].args);

                                try{
                                    if(typeof tmpPlugin.__init == "function"){
                                        tmpPlugin.__init(() => {
                                            _this.set(schemas[key].id, tmpPlugin);
                                        });
                                    }
                                    else{
                                        _this.set(schemas[key].id, tmpPlugin);
                                    }
                                }
                                catch(e){
                                    throw "Erro to start plugin " + schemas[key].script + " : " + e.message;
                                }
                            }
                            else{
                                throw "Error to create plugin: " + schemas[key].script + " not found";
                            }
                        }
                    }
                },
                map: Maps,
                scope: (_this, schemas) => {
                    //Build
                    for(let key in schemas){
                        var Schema = schemas[key];

                        if(Schema.type === "page"){
                            var $ = cheerio.load(fs.readFileSync(Schema.block).toString());

                            if(Schema.dependencies)
                                Schema.dependencies.forEach(function(elem, index, arr){ $ = Build.loadDependency($, elem, Schema.id, key); });

                            if(Schema.data){
                                for(let keyData in Schema.data){
                                    switch(keyData){
                                        case "title": $("title").html(Schema.data[keyData]); break;
                                        case "main":
                                            Schema.data[keyData].forEach(function(elem, index, arr){
                                                $("body").append(Build.parseBlock(elem, Schema.id, key));
                                            });
                                        break;
                                    }
                                }
                            }

                            fs.writeFileSync(options.build + "/public/" + ((options.build[options.build.length - 1] == "/") ? "" : "/") + key + ".ejs", htmlBeautify($.html()));
                        }
                    }

                    //Call callback function
                    if(typeof callback == "function"){
                        callback(function(callback){
                            Build.init();
                            callback();
                        });
                    }
                }
            }, { require: require })
        },

        loadDependency: function($, elem, owner, file){
            if(Build.keyArrExists(elem, Build.Schemas)){
                if(Build.Schemas[elem].data){
                    for(let key in Build.Schemas[elem].data){
                        switch(key){
                            case "meta":
                                Build.Schemas[elem].data[key].forEach(function(elem, index, arr){
                                    $("head").append(Build.loadBlock("meta", elem));
                                });
                            break;
                            case "stylesheet":
                                Build.Schemas[elem].data[key].forEach(function(elem, index, arr){
                                    $("head").append(Build.loadBlock("stylesheet", {src: elem}));
                                });
                            break;
                            case "script":
                                Build.Schemas[elem].data[key].forEach(function(elem, index, arr){
                                    $("body").append(Build.loadBlock("script", {src: elem}));
                                });
                            break;
                            case "main":
                                Build.Schemas[elem].data[key].forEach(function(elem, index, arr){
                                    $("body").append(Build.parseBlock(elem, elem.name, file));
                                });
                            break;
                        }
                    }
                }
            }
            else{
                $("body").append(Build.returnError("Dependency not found: " + elem + " | " + file));
            }

            return $;
        },

        parseBlock: function(elem, owner, file){
            elem.block = elem.block.replace(/(\..*?)$/i, ""); //Fix to remove extension

            if(Build.keyArrExists(elem.block, Build.Blocks))
                return ejs.render(Build.Blocks[elem.block], elem.data || {});
            else
                return Build.returnError("Block not found: " + elem.block + " | " + owner + " | " + file);
        },

        loadBlock: function(name, data){
            if(Build.keyArrExists(name, Build.Blocks))
                return ejs.render(Build.Blocks[name], data || {});
            else
                return "File not found: " + name
        },

        returnError: function(msg){
            return Build.loadBlock("error", {msg: msg});
        },

        keyArrExists: function(key, arr){
            for(let keyArr in arr){
                if(keyArr == key)
                    return true;
            }

            return false;
        }
    };

    Build.init(callback);
}
