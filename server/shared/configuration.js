exports.load = function (root) {
    var fs = require('fs'),
        path = require('path'),
        filename = path.join(root, '/server/shared/localstore/configuration.txt');
    
    var config = {};

    var data = fs.readFileSync(filename, 'utf8');
    var lineSplit = data.split(/\r?\n/);
        
    for (var count = 0; count < lineSplit.length; count++) {
        var split = lineSplit[count].trim('?').split('=');
        config[split[0]] = split[1];
    }

    //static resource versioning
    config['rv'] = parseInt(Math.random() * 100000000);
    return config;
};
