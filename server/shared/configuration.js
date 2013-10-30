exports.load = function (root) {
    var fs = require('fs'),
        path = require('path'),
        filename = path.join(root, '/server/shared/localstore/configuration.txt');
    
    var config = {};

    var data = fs.readFileSync(filename, 'utf8');
    var lineSplit = data.split(/\r?\n/);
        
    for (var count = 0; count < lineSplit.length; count++) {
        var split = lineSplit[count].trim('?').split(':=');
        if(split[0] === '') continue;
        config[split[0]] = split[1];
    }

    //static resource versioning
    config['private'] = ['rv', 'environment', 'root', 'private'];
    config['root'] = root;
    config['rv'] = parseInt(Math.random() * 100000000);
    return config;
};

exports.save = function (config) {
    var fs = require('fs'),
        path = require('path'),
        data = '',
        filename = path.join(process.config.root, '/server/shared/localstore/configuration.txt');
    var privateKeys = process.config.private;
    for (var key in config) {
        if (privateKeys.indexOf(key) != -1) continue;
        data += key + ':=' + config[key] + '\r\n';
    }
    try{
        fs.writeFileSync(filename, data, 'utf8');
    } catch (ex) {
        return false;
    }
    return true;
};