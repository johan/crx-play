var global = this, apis;
window.addEventListener('DOMContentLoaded', init, true);

function init() {
  //  => history, extension, popup, bookmarkManager
  "a,b,li,ul".split(/,/g).forEach(function (name) {
    global[name.toUpperCase()] = maketag.bind(null, name);
  });
  try { $.getJSON($('#api-specs').attr('href'), got_apis); } catch(e) {
    document.body.innerHTML = e.message;
  }
}

function got_apis(json) { try {
  apis = json;
  var $apis = $('#apis');
  for (var i = 0; i < apis.length; i++) {
    var spec = apis[i];
    var api = getAPI(spec.namespace);
    var li = LI();
    var a = spec.namespace;
    if (api) {
      a = A({ href: '#' }, spec.namespace);
      $(a).one('click', show_branch.bind(a, spec, api, li));
    } else {
      li.style.textDecoration = 'line-through';
    }
    li.appendChild(makenode(a));
    $apis.append(li);
  }
  } catch(e) { show(e.message); }
}

function show_branch(spec, api, li) {
  var $a = $(this), list = [];
  var ns = spec.namespace;
  $a.parent().html($a.html());
  // FIXME: process spec.properties and .functions here
  li.appendChild(UL(null, list));
}

function getAPI(name) {
  var api = chrome;
  name.split(/\./g).forEach(function index(module) {
    api = api && api[module];
  });
  return api;
}

function show(x) {
  document.body.innerHTML += "<br/>" + x;
}

function maketag(name, props, content) {
  var node = document.createElement(name);
  props = props || {};
  for (var p in props)
    node.setAttribute(p, props[p]);
  if (content)
    node.appendChild(makenode(content));
  return node;
}

function makenode(x) {
  switch (typeof x) {
    case 'object':
      if (!x.length) return x;
      var frag = document.createFragment();
      x.map(makenode).forEach(function(node) { frag.appendChild(node); });
      return frag;

    default:
      return document.createTextNode(x);
  }
}

function keys(o)   { var l = []; for (var p in o) l.push(p);    return l; }
function values(o) { var l = []; for (var p in o) l.push(o[p]); return l; }

Function.prototype.bind = function bind(object) {
  var fn = this;
  // Special case: No args or object being bound - just return this function
  if (arguments.length < 2 && arguments[0] === undefined) return this;

  if (arguments.length == 1) {
    // Special case: No args are being bound - don't bother creating a new
    // args structure
    return function bound_no_args() {
      return fn.apply(object, arguments);
    };
  }

  // General case: Do (more or less) what the native Prototype
  // implementation does, but be as as efficient as possible, and make it
  // trivial to step through in a debugger.
  var args = [].slice.call(arguments, 0), l = args.length - 1;
  args.shift();
  return function bound() {
    var ll = arguments.length; args.length = l + ll;
    while (ll--) args[l+ll] = arguments[ll];
    return fn.apply(object, args);
  };
};
