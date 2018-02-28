'use strict'

/*const cluster = require('cluster');

if (cluster.isMaster) {
   for (let i = 0; i < require('os').cpus().length; i++)
       cluster.fork();

   cluster.on('exit', function(deadWorker, code, signal) {
       cluster.fork();
   });
} else {*/
    require("../index.js").runtime({
        schemas: [`${__dirname}/schemas/*.json`],
        blocks: [`${__dirname}/blocks/*.block`],
        plugins: [`${__dirname}/plugins/*.js`],
        build: `${__dirname}/build`,
        map: `${__dirname}/src/*.js` ,
        cwd: __dirname,
    });
//}
