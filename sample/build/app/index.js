module.exports = (_this, bind, plugins, express) => {
    bind(_this, {
        "start": {
            "plugin": "express",
            "func": "render",
            "params": ["get", "/", "index"]
        }
    });

};