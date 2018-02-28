const build = require("./build"),
      fs = require("fs"),
      bs = require("browser-sync").create();

module.exports = function(options){
    build(options, (onchange) => {
        bs.init(options.devmode);
        bs.watch("*.html").on("change", bs.reload);
        bs.watch("*.css").on("change", bs.reload);
        bs.watch("*.js").on("change", bs.reload);

        options.blocks.forEach(function(elem, index, arr){
            fs.watch(elem, function(event, filename) {
                if(event == "change")
                    onchange(bs.reload);
            });
        });

        options.schemas.forEach(function(elem, index, arr){
            fs.watch(elem, function(event, filename) {
                if(event == "change")
                    onchange(bs.reload);
            });
        });
    });
};
