var jsZip = require('jszip');
var fs = require('fs');
var logger = require('./logger')
var configManager = require('./config-manager');
var mimes = configManager.read('mimes');
var serverCfg = configManager.read('server');
var archive = new jsZip();
var path = require('path');

archive.loadAsync(fs.readFileSync('clients/' + serverCfg.client + '.zip', 'binary')).then(e => {
    logger.log('Client loaded!');
});

module.exports = function fileHandler(req, res) {
    function tryURL(_url, stopTrying) {
        var url = new URL(`http://${req.host + _url}`)
        var x = decodeURIComponent(url.pathname).slice(1);
        var y = x == '' ? 'index.html' : x;
        var file = archive.file(y);
        var folder = archive.folder(y)
        if(file) {
            res.set('Content-Type', mimes[path.extname(y).slice(1)] || 'text/plain')
            file.async('uint8array').then(function(str) {
                res.send(str);
            });
            return true
        } else if(folder && !stopTrying) {
            folder = null;
            file = null;
            tryURL('/' + y + '/index.html', true)
            return;
        } else {
            res.send('404!')
            return false
        }
    }

    tryURL(req.originalUrl)
}