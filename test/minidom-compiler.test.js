var should = require('should');
var compiler = require('../');
var readdir = require('fs').readdirSync;
var read = require('fs').readFileSync;

describe('minidom compiler', function() {
  var templates = __dirname + '/templates';
  readdir(templates).forEach(function(file) {
    it(file, function() {
      var template = read(templates + '/' + file, 'UTF8');
      var expected = require(__dirname + '/expected/' + file.replace('.html', '.json'));
      compiler(template).should.eql(expected);
    });
  });
});
