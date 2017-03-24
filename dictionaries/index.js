'use strict';

var fs = require('fs');
var path = require('path');

var dictionariesRootPath = path.dirname(fs.realpathSync(__filename));

module.exports = {
    load: load,
};

function load(dict) {
    return fs.readFileSync(path.join(dictionariesRootPath, dict));
}
