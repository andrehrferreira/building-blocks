require("../index.js").devMode({
    schemas: [`${__dirname}/schemas`],
    blocks: [`${__dirname}/blocks`],
    plugins: [`${__dirname}/plugins`],
    build: `${__dirname}/build`,
    map: `${__dirname}/src/*.js` ,
    cwd: __dirname,
    devmode: {
        proxy: "localhost:5655"
    }
});
