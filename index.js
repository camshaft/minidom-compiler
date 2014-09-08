/**
 * Module dependencies
 */

var htmlparser = require('htmlparser');
var TAGS = require('minidom-tags');

module.exports = parse;

var handler = new htmlparser.DefaultHandler(function(err, dom) {
  if (err) throw err;
  return transform(dom);
}, {
  ignoreWhitespace: true
});

var parser = new htmlparser.Parser(handler);

function parse(html, opts) {
  parser.parseComplete(html);
  return minify(handler.dom, opts || {});
}

function transform(dom) {
  if (Array.isArray(dom)) return dom.map(transform);

  var transforms = dom.transforms = [];
  var attrs = dom.attribs || {};
  Object.keys(attrs).forEach(function(attr) {
    transforms.push({key: attr, value: attrs[attr]});
  });

  dom.children = transform(dom.children || []);

  dom.name = dom.name;
  dom.type = dom.type;

  return dom;
}

function minify(dom, opts) {
  if (Array.isArray(dom)) return dom.map(function(child) {
    return minify(child, opts);
  }).filter(function(val) {
    return val !== false;
  });

  if (dom.type === 'text') return dom.data;

  if (dom.type === 'comment' && opts.removeComments) return false;
  if (dom.type === 'comment') return [0, dom.data.trim()];

  var el = [];

  var attrs = [];
  dom.transforms.forEach(function(attr) {
    attr.value = parseNumber(attr.value);

    if (attr.key.indexOf('data-') === 0) attr.key = [attr.key.replace('data-', '')];
    attrs.push(attr.key, attr.value);
  });
  el.push(attrs);

  var children = minify(dom.children || [], opts);
  if (children.length !== 0) el.push(children);

  if (dom.name === 'div' || !dom.name) return el;
  var i = TAGS.indexOf(dom.name);
  el.push(i !== -1 ? i : dom.name);

  return el;
}

function parseNumber(value) {
  var val = parseInt(value, 10);
  if (!Number.isNaN(val)) return val;
  val = parseFloat(value, 10);
  if (!Number.isNaN(val)) return val;
  return value;
}
