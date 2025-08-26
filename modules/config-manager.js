var fs = require('fs');

module.exports = {
    write: function(config, json) {
        fs.writeFileSync(`configs/${config}.json`, JSON.stringify(json), 'utf8');
    },
    read: function(config) {
        return JSON.parse(fs.readFileSync(`configs/${config}.json`, 'utf8'));
    },
    exists: function(config) {
        return fs.existsSync(`configs/${config}.json`);
    },
    validate: function(config) {
        var isValidJSON = fs.existsSync(`configs/${config}.json`);
        try {
            JSON.parse(fs.readFileSync(`configs/${config}.json`, 'utf8'))
            isValidJSON &&= true
        } catch {
            isValidJSON &&= false
        }
        return fs.existsSync(`configs/${config}.json`) && isValidJSON
    },
    getAllConfigs: function() {
        return fs.readdirSync('configs')
                .filter(e => e.endsWith('json'))
                .map(e => e.slice(0 - '.json'.length));
    }
}