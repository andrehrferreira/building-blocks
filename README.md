# Building blocks

[![npmpackage](https://nodei.co/npm/building-blocks.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/building-blocks/)

The concept is relatively simple, to encapsulate blocks of HTML, CSS and Javascript as if it were a component, these blocks will be organized and assembled by schemas that can be static pages, dynamic pages, or simply dependencies that can be called on several pages any change in the block reflects all the schemas you use.

To use just call as project dependency:
```bash
$ npm install building-blocks
```

Recommend reading all documentation for internal library configuration and call!

# Blocks

The idea is to create small blocks of scripts that can be reused inside the templates, using EJS to keep dynamic the parameterization, so it is possible to load several times the same block with different parameters and add to several pages as dependency.

The block code is basically HTML with all CSS and Javascript capabilities for frontend and interaction with the backend via EJS, and it may be possible to use other template manipulation frameworks through implementation in the project.

```js
<% if(typeof src != 'undefined'){ %>
    <script type="text/javascript" src="<%= src %>"></script>
<% } %>
```

In the above example a simple block template for Javascript call, later it will be possible to verify use of template creation schemas using the example block.

# Schemas

The schemas are JSON files that will contain the assembly data of the blocks, concept very similar to Docker, below follows the Hello Worl of the schema to contextualize

```json
{
    "id": "index",
    "type": "page",
    "block": "blocks/page.block",
    "dependencies": ["header"],
    "plugins": ["express"],
    "actions": [
        {"start": {"plugin": "express",
			       "func": "render",
			       "params": ["get", "/", "index"]}}
    ],
    "data": {
        "title": "Hello World",
        "output": "index.html",
        "main": [
            {
                "index": 2,
                "block": "helloworld"
            }
        ]
    }
}
```

Let's understand each of the parameters:

 * **id:** Internal identification of the schema for later use
 * **type:** Type of schema to be interpreted by the system, currently the possible values are (page, dependency and plugin)
 * **block:** Block skeleton, in case of pages it works as a base where other blocks will be mounted
 * **dependencies:** List of dependent schemas, so it is possible to include various configurations such as Javascript call, CSS, standard blocks and plugins
 * **plugins:** List of plugins required to load the schema
 * **actions:** List of actions to be performed in plugins or internal server functions for schema operation
 * **data:** Information that will be used to assemble the page
	* **title:** Page title
	* **output:** Output file
	 * **main:** Blocks to be called to compose a page
 * **meta:** List of goals to be added in the page, can be used in schemas type page or dependency
 * **stylesheet:** List of CSS to be called in the template, can be used in schemas type page or dependency
 * **script:** List of Javascripts to be called in the template, can be used in schemas type page or dependency
 * **args:** Parameters to be sent when starting a plugin

# Main blocks

Schemas of the page type and it is possible to add a list of blocks to assemble the template that will be exported, here is an example page:

```json
"main": [
    {
        "index": 2,
        "block": "helloworld"
    }
]
```

In the example so called helloworld block to be displayed in position 2, and in the example the header will be called in position 1 to load Javascript first, the block call parameters are:

* **index:** Position of the block, serves basically to order the blocks according to the need
* **block:** Block to be called
* **data:** Information that can be passed dynamically to the template as internationalized variables, data in JSON, parameters to be passed to stop the block.

Follows an example of block with dynamic information:

```json
"main": [
    {
        "index": 1,
        "block": "navbar",
        "data": {
            "itens": [
                {"label": "Item 1", "href": "#"}
                {"label": "Item 2", "href": "#"}
            ]
        }
    }
]
```

Below would be the block code:

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
    <% if(typeof brand != "undefined") { %><a class="navbar-brand" href="#"><%= brand %></a><% } %>

    <div class="collapse navbar-collapse">
        <ul class="navbar-nav mr-auto">
        <% itens.forEach(function(item){ %>
            <li class="nav-item"><a class="nav-link" href="<%= item.href %>"><%= item.label %></a></li>
        <% }); %>
        </ul>
    </div>
</nav>
```

# Custom blocks
To create custom blocks, just set up a directory where they will be kept in the call, then basically just use HTML, CSS, Javascript and EJS standard for dynamic information or sub-blocking, EJS standard documentation is available at https://code.google.com/archive/p/embeddedjavascript/wikis.

**customblock.block**
```html
<ul>
<% users.forEach(function(user){ %>
    <li><%= user.name %>: <%= user.email %></li>
<% }); %>
</ul>
```
**customblock.json (schema)**
```json
"main": [
    {
        "index": 1,
        "block": "customblock",
        "data": {
            "users": [
                {"name": "User 1", "email": "user1@test.com"}
                {"name": "User 2", "email": "user2@test.com"}
            ]
        }
    }
]
```
**output.html**
```html
<ul>
	<li>User 1: user1@test.com</li>
	<li>User 2: user2@test.com</li>
</ul>
```
## Custom Style
Basically the style can be individually included in each block to facilitate the maintenance, or everything can be organized in a CSS file, in the future the library will have functionality to auto concatenate the styles in a file that will be generated in the build:

**customblock.block (class)**

```html
<style type="text/css">
	.blackBackground{ background-color: #000; }
	.whiteColor{ color: #FFF; }
</style>
<ul class="blackBackground">
<% users.forEach(function(user){ %>
    <li class="whiteColor"><%= user.name %>: <%= user.email %></li>
<% }); %>
</ul>
```
**customblock.block (inline)**

```html
<ul style="background-color: #000">
<% users.forEach(function(user){ %>
    <li style="color: #FFF"><%= user.name %>: <%= user.email %></li>
<% }); %>
</ul>
```

**customblock.block (dynamic)**

```html
<style type="text/css">
	.defaultBackgound{ background-color: <%= defaultBackground %>; }
	.defaultColor{ color: <%= defaultColor %>; }
</style>

<ul class="defaultBackgound">
<% users.forEach(function(user){ %>
    <li class="defaultColor"><%= user.name %>: <%= user.email %></li>
<% }); %>
</ul>
```
```js
"main": [
    {
        "block": "customblock",
        "data": {
            "defaultBackground": "#000",
            "defaultColor": "#FFF"
        }
    }
]
```
# Plugins
The plugins are essentially implementations for integration with the blocks, in the example follows a simple implementation model of [Express](http://expressjs.com/) for route management, the interaction is done through the parameter 'actions' where it is possible to call a method passing parameters, or even can be methods custom created, below is the basic skeleton of a plugin, and the Express plugin:

```js
module.exports = function(settings){
    return {
        id: "express",
        __init: function(callback){
        }
	};
};
```

**sample/plugins/express.js**
```js
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
```
The standard format of the module and return a constructor where it receives configurations informed in the schema, the mandatory parameters for existence of the plugin are id (string), __init (functon).

Now let's go to the schema of this plugin:

**sample/schemas/express.json**
```json
{
    "id": "express",
    "type": "plugin",
    "script": "express",
    "args": {
        "port": 5655
    }
}
```
Now to use the plugin just call as dependency, see:

```json
{
    "id": "sample",
    "type": "page",
    "block": "blocks/page.block",
    "plugins": ["express"],
    "actions": [
        {"start": {"plugin": "express", "func": "render", "params": ["get", "/", "sample"]}}
    ],
    "data": {
        "title": "Sample"
    }
}
```

In the above example will be creating a route in the expression in / sample that will be called the schema, which originates in the page.block block, only a change will be made in the title of the page for "Sample".

# Dependency control
The internal control of dependencies of both blocks and plugins is done using the [Organized](https://www.npmjs.com/package/organized) library, obviously there are several other interesting features to be developed that can be managed directly with dependency control directly via API.

To create custom modules for Organized, define a directory in the 'map' parameter for files when starting the application:

```js
require("building-blocks").runtime({
    ...
    map: `${__dirname}/src/*.js` ,
    ...
});
```

**sample/src/mongodb.js**
```js
'use strict'

const mongodb = require("mongodb").MongoClient;

module.exports = (_this, express) => {
    if(!_this.mongodb){
        mongodb.connect("mongodb://localhost:27017", (err, client) => {
            if(err) console.log("Error to start MongoDB: " + err);
            else console.log("Start MongoDB");

            const db = client.db("blocks");
            _this.set("mongodb", db);
        });
    }

    express.app.get("/users", (req, res) => {
        _this.mongodb.collection("user").find({}).toArray((err, docs) => {
            if(err){
                console.log(err);
                res.status(404);
            }
            else{
                res.send(docs);
            }
        })
    });
}
```

# Build
Basically when the system is started in runtime or development mode, pre-compiled files in EJS format will be generated, and driver files in case of schemas that use plugins, these files are stored in the **/build** directory separately in the **/app** directory and **/public**.

Below is an example of files after the build process:

sample/build/app/index.js
```js
module.exports = (_this, bind, plugins, express) => {
    bind(_this, {
        "start": {
            "plugin": "express",
            "func": "render",
            "params": ["get", "/", "index"]
        }
    });
};
```

sample/build/app/index.ejs
```js
<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <title>Hello World</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#fff" />
    <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Roboto:300,400,500,700" />
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" />
  </head>
  <body>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
    <div class="container">
      <div class="jumbotron">
        <h1 class="display-4">
            Hello, world!
        </h1>
      </div>
    </div>
  </body>
</html>

```

# Developer mode
The system has a development mode that uses [Browser Sync](https://browsersync.io) to automatically synchronize any changes in the blocks and schemas, makes it easy to observe the results, to start application in developer mode just start the code:

sample/devmode.js
```js
require("building-blocks").devMode({
    schemas: [`${__dirname}/schemas/*.json`],
    blocks: [`${__dirname}/blocks/*.block`],
    plugins: [`${__dirname}/plugins/*.js`],
    build: `${__dirname}/build`,
    map: `${__dirname}/src/*.js` ,
    cwd: __dirname,
    devmode: {
        proxy: "localhost:5655"
    }
});
```

notice that configuration parameters are being passed that can be observed at this link https://browsersync.io/docs

# Production mode
After all the project is configured and time to go up to production, for this we recommend not to use the developer mode, there is the option of runtime, below follows the implementation example using cluster:

**sample/runtime.js**
```js
'use strict'

const cluster = require('cluster');

if (cluster.isMaster) {
   for (let i = 0; i < require('os').cpus().length; i++)
       cluster.fork();

   cluster.on('exit', function(deadWorker, code, signal) {
       cluster.fork();
   });
} else {
    require("building-blocks").runtime({
        schemas: [`${__dirname}/schemas/*.json`],
        blocks: [`${__dirname}/blocks/*.block`],
        plugins: [`${__dirname}/plugins/*.js`],
        build: `${__dirname}/build`,
        map: `${__dirname}/src/*.js` ,
        cwd: __dirname
    });
}
```
