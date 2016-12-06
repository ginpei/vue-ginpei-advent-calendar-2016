(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
var Vue // late bind
var map = window.__VUE_HOT_MAP__ = Object.create(null)
var installed = false
var isBrowserify = false
var initHookName = 'beforeCreate'

exports.install = function (vue, browserify) {
  if (installed) return
  installed = true

  Vue = vue
  isBrowserify = browserify

  // compat with < 2.0.0-alpha.7
  if (Vue.config._lifecycleHooks.indexOf('init') > -1) {
    initHookName = 'init'
  }

  exports.compatible = Number(Vue.version.split('.')[0]) >= 2
  if (!exports.compatible) {
    console.warn(
      '[HMR] You are using a version of vue-hot-reload-api that is ' +
      'only compatible with Vue.js core ^2.0.0.'
    )
    return
  }
}

/**
 * Create a record for a hot module, which keeps track of its constructor
 * and instances
 *
 * @param {String} id
 * @param {Object} options
 */

exports.createRecord = function (id, options) {
  var Ctor = null
  if (typeof options === 'function') {
    Ctor = options
    options = Ctor.options
  }
  makeOptionsHot(id, options)
  map[id] = {
    Ctor: Vue.extend(options),
    instances: []
  }
}

/**
 * Make a Component options object hot.
 *
 * @param {String} id
 * @param {Object} options
 */

function makeOptionsHot (id, options) {
  injectHook(options, initHookName, function () {
    map[id].instances.push(this)
  })
  injectHook(options, 'beforeDestroy', function () {
    var instances = map[id].instances
    instances.splice(instances.indexOf(this), 1)
  })
}

/**
 * Inject a hook to a hot reloadable component so that
 * we can keep track of it.
 *
 * @param {Object} options
 * @param {String} name
 * @param {Function} hook
 */

function injectHook (options, name, hook) {
  var existing = options[name]
  options[name] = existing
    ? Array.isArray(existing)
      ? existing.concat(hook)
      : [existing, hook]
    : [hook]
}

function tryWrap (fn) {
  return function (id, arg) {
    try { fn(id, arg) } catch (e) {
      console.error(e)
      console.warn('Something went wrong during Vue component hot-reload. Full reload required.')
    }
  }
}

exports.rerender = tryWrap(function (id, fns) {
  var record = map[id]
  record.Ctor.options.render = fns.render
  record.Ctor.options.staticRenderFns = fns.staticRenderFns
  record.instances.slice().forEach(function (instance) {
    instance.$options.render = fns.render
    instance.$options.staticRenderFns = fns.staticRenderFns
    instance._staticTrees = [] // reset static trees
    instance.$forceUpdate()
  })
})

exports.reload = tryWrap(function (id, options) {
  makeOptionsHot(id, options)
  var record = map[id]
  record.Ctor.extendOptions = options
  var newCtor = Vue.extend(options)
  record.Ctor.options = newCtor.options
  record.Ctor.cid = newCtor.cid
  if (newCtor.release) {
    // temporary global mixin strategy used in < 2.0.0-alpha.6
    newCtor.release()
  }
  record.instances.slice().forEach(function (instance) {
    if (instance.$parent) {
      instance.$parent.$forceUpdate()
    } else {
      console.warn('Root or manually mounted instance modified. Full reload required.')
    }
  })
})

},{}],3:[function(require,module,exports){
(function (process,global){
/*!
 * Vue.js v2.1.4
 * (c) 2014-2016 Evan You
 * Released under the MIT License.
 */
'use strict';

/*  */

/**
 * Convert a value to a string that is actually rendered.
 */
function _toString (val) {
  return val == null
    ? ''
    : typeof val === 'object'
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 */
function toNumber (val) {
  var n = parseFloat(val, 10);
  return (n || n === 0) ? n : val
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
}

/**
 * Check if a tag is a built-in tag.
 */
var isBuiltInTag = makeMap('slot,component', true);

/**
 * Remove an item from an array
 */
function remove$1 (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether the object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Check if value is primitive
 */
function isPrimitive (value) {
  return typeof value === 'string' || typeof value === 'number'
}

/**
 * Create a cached version of a pure function.
 */
function cached (fn) {
  var cache = Object.create(null);
  return function cachedFn (str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str))
  }
}

/**
 * Camelize a hyphen-delmited string.
 */
var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
});

/**
 * Capitalize a string.
 */
var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
});

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE = /([^-])([A-Z])/g;
var hyphenate = cached(function (str) {
  return str
    .replace(hyphenateRE, '$1-$2')
    .replace(hyphenateRE, '$1-$2')
    .toLowerCase()
});

/**
 * Simple bind, faster than native
 */
function bind$1 (fn, ctx) {
  function boundFn (a) {
    var l = arguments.length;
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
  // record original fn length
  boundFn._length = fn.length;
  return boundFn
}

/**
 * Convert an Array-like object to a real Array.
 */
function toArray (list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret
}

/**
 * Mix properties into target object.
 */
function extend (to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }
  return to
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';
function isPlainObject (obj) {
  return toString.call(obj) === OBJECT_STRING
}

/**
 * Merge an Array of Objects into a single Object.
 */
function toObject (arr) {
  var res = {};
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res
}

/**
 * Perform no operation.
 */
function noop () {}

/**
 * Always return false.
 */
var no = function () { return false; };

/**
 * Generate a static keys string from compiler modules.
 */
function genStaticKeys (modules) {
  return modules.reduce(function (keys, m) {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
function looseEqual (a, b) {
  /* eslint-disable eqeqeq */
  return a == b || (
    isObject(a) && isObject(b)
      ? JSON.stringify(a) === JSON.stringify(b)
      : false
  )
  /* eslint-enable eqeqeq */
}

function looseIndexOf (arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) { return i }
  }
  return -1
}

/*  */

var config = {
  /**
   * Option merge strategies (used in core/util/options)
   */
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Whether to enable devtools
   */
  devtools: process.env.NODE_ENV !== 'production',

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: null,

  /**
   * Custom user key aliases for v-on
   */
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * List of asset types that a component can own.
   */
  _assetTypes: [
    'component',
    'directive',
    'filter'
  ],

  /**
   * List of lifecycle hooks.
   */
  _lifecycleHooks: [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated'
  ],

  /**
   * Max circular updates allowed in a scheduler flush cycle.
   */
  _maxUpdateCount: 100
};

/*  */

/**
 * Check if a string starts with $ or _
 */
function isReserved (str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 */
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Parse simple path.
 */
var bailRE = /[^\w.$]/;
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  } else {
    var segments = path.split('.');
    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]];
      }
      return obj
    }
  }
}

/*  */
/* globals MutationObserver */

// can we use __proto__?
var hasProto = '__proto__' in {};

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined';
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = UA && UA.indexOf('android') > 0;
var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
var _isServer;
var isServerRendering = function () {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && typeof global !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = global['process'].env.VUE_ENV === 'server';
    } else {
      _isServer = false;
    }
  }
  return _isServer
};

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

/* istanbul ignore next */
function isNative (Ctor) {
  return /native code/.test(Ctor.toString())
}

/**
 * Defer a task to execute it asynchronously.
 */
var nextTick = (function () {
  var callbacks = [];
  var pending = false;
  var timerFunc;

  function nextTickHandler () {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  // the nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore if */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve();
    var logError = function (err) { console.error(err); };
    timerFunc = function () {
      p.then(nextTickHandler).catch(logError);
      // in problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) { setTimeout(noop); }
    };
  } else if (typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) {
    // use MutationObserver where native Promise is not available,
    // e.g. PhantomJS IE11, iOS7, Android 4.4
    var counter = 1;
    var observer = new MutationObserver(nextTickHandler);
    var textNode = document.createTextNode(String(counter));
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
  } else {
    // fallback to setTimeout
    /* istanbul ignore next */
    timerFunc = function () {
      setTimeout(nextTickHandler, 0);
    };
  }

  return function queueNextTick (cb, ctx) {
    var _resolve;
    callbacks.push(function () {
      if (cb) { cb.call(ctx); }
      if (_resolve) { _resolve(ctx); }
    });
    if (!pending) {
      pending = true;
      timerFunc();
    }
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve) {
        _resolve = resolve;
      })
    }
  }
})();

var _Set;
/* istanbul ignore if */
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = (function () {
    function Set () {
      this.set = Object.create(null);
    }
    Set.prototype.has = function has (key) {
      return this.set[key] !== undefined
    };
    Set.prototype.add = function add (key) {
      this.set[key] = 1;
    };
    Set.prototype.clear = function clear () {
      this.set = Object.create(null);
    };

    return Set;
  }());
}

var warn = noop;
var formatComponentName;

if (process.env.NODE_ENV !== 'production') {
  var hasConsole = typeof console !== 'undefined';

  warn = function (msg, vm) {
    if (hasConsole && (!config.silent)) {
      console.error("[Vue warn]: " + msg + " " + (
        vm ? formatLocation(formatComponentName(vm)) : ''
      ));
    }
  };

  formatComponentName = function (vm) {
    if (vm.$root === vm) {
      return 'root instance'
    }
    var name = vm._isVue
      ? vm.$options.name || vm.$options._componentTag
      : vm.name;
    return (
      (name ? ("component <" + name + ">") : "anonymous component") +
      (vm._isVue && vm.$options.__file ? (" at " + (vm.$options.__file)) : '')
    )
  };

  var formatLocation = function (str) {
    if (str === 'anonymous component') {
      str += " - use the \"name\" option for better debugging messages.";
    }
    return ("\n(found in " + str + ")")
  };
}

/*  */


var uid$1 = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
var Dep = function Dep () {
  this.id = uid$1++;
  this.subs = [];
};

Dep.prototype.addSub = function addSub (sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function removeSub (sub) {
  remove$1(this.subs, sub);
};

Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function notify () {
  // stablize the subscriber list first
  var subs = this.subs.slice();
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;
var targetStack = [];

function pushTarget (_target) {
  if (Dep.target) { targetStack.push(Dep.target); }
  Dep.target = _target;
}

function popTarget () {
  Dep.target = targetStack.pop();
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator () {
    var arguments$1 = arguments;

    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length;
    var args = new Array(i);
    while (i--) {
      args[i] = arguments$1[i];
    }
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
        inserted = args;
        break
      case 'unshift':
        inserted = args;
        break
      case 'splice':
        inserted = args.slice(2);
        break
    }
    if (inserted) { ob.observeArray(inserted); }
    // notify change
    ob.dep.notify();
    return result
  });
});

/*  */

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
var observerState = {
  shouldConvert: true,
  isSettingProps: false
};

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
var Observer = function Observer (value) {
  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  def(value, '__ob__', this);
  if (Array.isArray(value)) {
    var augment = hasProto
      ? protoAugment
      : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
};

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
Observer.prototype.walk = function walk (obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive$$1(obj, keys[i], obj[keys[i]]);
  }
};

/**
 * Observe a list of Array items.
 */
Observer.prototype.observeArray = function observeArray (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * istanbul ignore next
 */
function copyAugment (target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe (value) {
  if (!isObject(value)) {
    return
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    observerState.shouldConvert &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
function defineReactive$$1 (
  obj,
  key,
  val,
  customSetter
) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;

  var childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        if (Array.isArray(value)) {
          dependArray(value);
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter();
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = observe(newVal);
      dep.notify();
    }
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set$1 (obj, key, val) {
  if (Array.isArray(obj)) {
    obj.length = Math.max(obj.length, key);
    obj.splice(key, 1, val);
    return val
  }
  if (hasOwn(obj, key)) {
    obj[key] = val;
    return
  }
  var ob = obj.__ob__;
  if (obj._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    );
    return
  }
  if (!ob) {
    obj[key] = val;
    return
  }
  defineReactive$$1(ob.value, key, val);
  ob.dep.notify();
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
function del (obj, key) {
  var ob = obj.__ob__;
  if (obj._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    );
    return
  }
  if (!hasOwn(obj, key)) {
    return
  }
  delete obj[key];
  if (!ob) {
    return
  }
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value) {
  for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
var strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
if (process.env.NODE_ENV !== 'production') {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        "option \"" + key + "\" can only be used during instance " +
        'creation with the `new` keyword.'
      );
    }
    return defaultStrat(parent, child)
  };
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData (to, from) {
  if (!from) { return to }
  var key, toVal, fromVal;
  var keys = Object.keys(from);
  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set$1(to, key, fromVal);
    } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to
}

/**
 * Data
 */
strats.data = function (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      );
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        childVal.call(this),
        parentVal.call(this)
      )
    }
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn () {
      // instance merge
      var instanceData = typeof childVal === 'function'
        ? childVal.call(vm)
        : childVal;
      var defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm)
        : undefined;
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
};

/**
 * Hooks and param attributes are merged as arrays.
 */
function mergeHook (
  parentVal,
  childVal
) {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

config._lifecycleHooks.forEach(function (hook) {
  strats[hook] = mergeHook;
});

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (parentVal, childVal) {
  var res = Object.create(parentVal || null);
  return childVal
    ? extend(res, childVal)
    : res
}

config._assetTypes.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (parentVal, childVal) {
  /* istanbul ignore if */
  if (!childVal) { return parentVal }
  if (!parentVal) { return childVal }
  var ret = {};
  extend(ret, parentVal);
  for (var key in childVal) {
    var parent = ret[key];
    var child = childVal[key];
    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent
      ? parent.concat(child)
      : [child];
  }
  return ret
};

/**
 * Other object hashes.
 */
strats.props =
strats.methods =
strats.computed = function (parentVal, childVal) {
  if (!childVal) { return parentVal }
  if (!parentVal) { return childVal }
  var ret = Object.create(null);
  extend(ret, parentVal);
  extend(ret, childVal);
  return ret
};

/**
 * Default strategy.
 */
var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
};

/**
 * Validate component names
 */
function checkComponents (options) {
  for (var key in options.components) {
    var lower = key.toLowerCase();
    if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
      warn(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + key
      );
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options) {
  var props = options.props;
  if (!props) { return }
  var res = {};
  var i, val, name;
  if (Array.isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = { type: null };
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    for (var key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val)
        ? val
        : { type: val };
    }
  }
  options.props = res;
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options) {
  var dirs = options.directives;
  if (dirs) {
    for (var key in dirs) {
      var def = dirs[key];
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def };
      }
    }
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
function mergeOptions (
  parent,
  child,
  vm
) {
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child);
  }
  normalizeProps(child);
  normalizeDirectives(child);
  var extendsFrom = child.extends;
  if (extendsFrom) {
    parent = typeof extendsFrom === 'function'
      ? mergeOptions(parent, extendsFrom.options, vm)
      : mergeOptions(parent, extendsFrom, vm);
  }
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      var mixin = child.mixins[i];
      if (mixin.prototype instanceof Vue$2) {
        mixin = mixin.options;
      }
      parent = mergeOptions(parent, mixin, vm);
    }
  }
  var options = {};
  var key;
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField (key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
function resolveAsset (
  options,
  type,
  id,
  warnMissing
) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  var assets = options[type];
  var res = assets[id] ||
    // camelCase ID
    assets[camelize(id)] ||
    // Pascal Case ID
    assets[capitalize(camelize(id))];
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    );
  }
  return res
}

/*  */

function validateProp (
  key,
  propOptions,
  propsData,
  vm
) {
  var prop = propOptions[key];
  var absent = !hasOwn(propsData, key);
  var value = propsData[key];
  // handle boolean props
  if (isBooleanType(prop.type)) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (value === '' || value === hyphenate(key)) {
      value = true;
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    var prevShouldConvert = observerState.shouldConvert;
    observerState.shouldConvert = true;
    observe(value);
    observerState.shouldConvert = prevShouldConvert;
  }
  if (process.env.NODE_ENV !== 'production') {
    assertProp(prop, key, value, vm, absent);
  }
  return value
}

/**
 * Get the default value of a prop.
 */
function getPropDefaultValue (vm, prop, key) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  var def = prop.default;
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Invalid default value for prop "' + key + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    );
  }
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm[key] !== undefined) {
    return vm[key]
  }
  // call factory function for non-Function types
  return typeof def === 'function' && prop.type !== Function
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 */
function assertProp (
  prop,
  name,
  value,
  vm,
  absent
) {
  if (prop.required && absent) {
    warn(
      'Missing required prop: "' + name + '"',
      vm
    );
    return
  }
  if (value == null && !prop.required) {
    return
  }
  var type = prop.type;
  var valid = !type || type === true;
  var expectedTypes = [];
  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType);
      valid = assertedType.valid;
    }
  }
  if (!valid) {
    warn(
      'Invalid prop: type check failed for prop "' + name + '".' +
      ' Expected ' + expectedTypes.map(capitalize).join(', ') +
      ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.',
      vm
    );
    return
  }
  var validator = prop.validator;
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      );
    }
  }
}

/**
 * Assert the type of a value
 */
function assertType (value, type) {
  var valid;
  var expectedType = getType(type);
  if (expectedType === 'String') {
    valid = typeof value === (expectedType = 'string');
  } else if (expectedType === 'Number') {
    valid = typeof value === (expectedType = 'number');
  } else if (expectedType === 'Boolean') {
    valid = typeof value === (expectedType = 'boolean');
  } else if (expectedType === 'Function') {
    valid = typeof value === (expectedType = 'function');
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value);
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid: valid,
    expectedType: expectedType
  }
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
function getType (fn) {
  var match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match && match[1]
}

function isBooleanType (fn) {
  if (!Array.isArray(fn)) {
    return getType(fn) === 'Boolean'
  }
  for (var i = 0, len = fn.length; i < len; i++) {
    if (getType(fn[i]) === 'Boolean') {
      return true
    }
  }
  /* istanbul ignore next */
  return false
}



var util = Object.freeze({
	defineReactive: defineReactive$$1,
	_toString: _toString,
	toNumber: toNumber,
	makeMap: makeMap,
	isBuiltInTag: isBuiltInTag,
	remove: remove$1,
	hasOwn: hasOwn,
	isPrimitive: isPrimitive,
	cached: cached,
	camelize: camelize,
	capitalize: capitalize,
	hyphenate: hyphenate,
	bind: bind$1,
	toArray: toArray,
	extend: extend,
	isObject: isObject,
	isPlainObject: isPlainObject,
	toObject: toObject,
	noop: noop,
	no: no,
	genStaticKeys: genStaticKeys,
	looseEqual: looseEqual,
	looseIndexOf: looseIndexOf,
	isReserved: isReserved,
	def: def,
	parsePath: parsePath,
	hasProto: hasProto,
	inBrowser: inBrowser,
	UA: UA,
	isIE: isIE,
	isIE9: isIE9,
	isEdge: isEdge,
	isAndroid: isAndroid,
	isIOS: isIOS,
	isServerRendering: isServerRendering,
	devtools: devtools,
	nextTick: nextTick,
	get _Set () { return _Set; },
	mergeOptions: mergeOptions,
	resolveAsset: resolveAsset,
	get warn () { return warn; },
	get formatComponentName () { return formatComponentName; },
	validateProp: validateProp
});

/* not type checking this file because flow doesn't play well with Proxy */

var initProxy;

if (process.env.NODE_ENV !== 'production') {
  var allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  );

  var warnNonPresent = function (target, key) {
    warn(
      "Property or method \"" + key + "\" is not defined on the instance but " +
      "referenced during render. Make sure to declare reactive data " +
      "properties in the data option.",
      target
    );
  };

  var hasProxy =
    typeof Proxy !== 'undefined' &&
    Proxy.toString().match(/native code/);

  if (hasProxy) {
    var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta');
    config.keyCodes = new Proxy(config.keyCodes, {
      set: function set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
          return false
        } else {
          target[key] = value;
          return true
        }
      }
    });
  }

  var hasHandler = {
    has: function has (target, key) {
      var has = key in target;
      var isAllowed = allowedGlobals(key) || key.charAt(0) === '_';
      if (!has && !isAllowed) {
        warnNonPresent(target, key);
      }
      return has || !isAllowed
    }
  };

  var getHandler = {
    get: function get (target, key) {
      if (typeof key === 'string' && !(key in target)) {
        warnNonPresent(target, key);
      }
      return target[key]
    }
  };

  initProxy = function initProxy (vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      var options = vm.$options;
      var handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler;
      vm._renderProxy = new Proxy(vm, handlers);
    } else {
      vm._renderProxy = vm;
    }
  };
}

/*  */


var queue = [];
var has$1 = {};
var circular = {};
var waiting = false;
var flushing = false;
var index = 0;

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  queue.length = 0;
  has$1 = {};
  if (process.env.NODE_ENV !== 'production') {
    circular = {};
  }
  waiting = flushing = false;
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue () {
  flushing = true;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) { return a.id - b.id; });

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    var watcher = queue[index];
    var id = watcher.id;
    has$1[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has$1[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > config._maxUpdateCount) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? ("in watcher with expression \"" + (watcher.expression) + "\"")
              : "in a component render function."
          ),
          watcher.vm
        );
        break
      }
    }
  }

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush');
  }

  resetSchedulerState();
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher (watcher) {
  var id = watcher.id;
  if (has$1[id] == null) {
    has$1[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;
      while (i >= 0 && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(Math.max(i, index) + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}

/*  */

var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
var Watcher = function Watcher (
  vm,
  expOrFn,
  cb,
  options
) {
  if ( options === void 0 ) options = {};

  this.vm = vm;
  vm._watchers.push(this);
  // options
  this.deep = !!options.deep;
  this.user = !!options.user;
  this.lazy = !!options.lazy;
  this.sync = !!options.sync;
  this.expression = expOrFn.toString();
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = function () {};
      process.env.NODE_ENV !== 'production' && warn(
        "Failed watching path: \"" + expOrFn + "\" " +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      );
    }
  }
  this.value = this.lazy
    ? undefined
    : this.get();
};

/**
 * Evaluate the getter, and re-collect dependencies.
 */
Watcher.prototype.get = function get () {
  pushTarget(this);
  var value = this.getter.call(this.vm, this.vm);
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value);
  }
  popTarget();
  this.cleanupDeps();
  return value
};

/**
 * Add a dependency to this directive.
 */
Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 */
Watcher.prototype.cleanupDeps = function cleanupDeps () {
    var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    var dep = this$1.deps[i];
    if (!this$1.newDepIds.has(dep.id)) {
      dep.removeSub(this$1);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
Watcher.prototype.run = function run () {
  if (this.active) {
    var value = this.get();
      if (
        value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          /* istanbul ignore else */
          if (config.errorHandler) {
            config.errorHandler.call(null, e, this.vm);
          } else {
            process.env.NODE_ENV !== 'production' && warn(
              ("Error in watcher \"" + (this.expression) + "\""),
              this.vm
            );
            throw e
          }
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get();
  this.dirty = false;
};

/**
 * Depend on all deps collected by this watcher.
 */
Watcher.prototype.depend = function depend () {
    var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    this$1.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subscriber list.
 */
Watcher.prototype.teardown = function teardown () {
    var this$1 = this;

  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed or is performing a v-for
    // re-render (the watcher list is then filtered by v-for).
    if (!this.vm._isBeingDestroyed && !this.vm._vForRemoving) {
      remove$1(this.vm._watchers, this);
    }
    var i = this.deps.length;
    while (i--) {
      this$1.deps[i].removeSub(this$1);
    }
    this.active = false;
  }
};

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
var seenObjects = new _Set();
function traverse (val) {
  seenObjects.clear();
  _traverse(val, seenObjects);
}

function _traverse (val, seen) {
  var i, keys;
  var isA = Array.isArray(val);
  if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
    return
  }
  if (val.__ob__) {
    var depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) { _traverse(val[i], seen); }
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) { _traverse(val[keys[i]], seen); }
  }
}

/*  */

function initState (vm) {
  vm._watchers = [];
  initProps(vm);
  initMethods(vm);
  initData(vm);
  initComputed(vm);
  initWatch(vm);
}

var isReservedProp = { key: 1, ref: 1, slot: 1 };

function initProps (vm) {
  var props = vm.$options.props;
  if (props) {
    var propsData = vm.$options.propsData || {};
    var keys = vm.$options._propKeys = Object.keys(props);
    var isRoot = !vm.$parent;
    // root instance props should be converted
    observerState.shouldConvert = isRoot;
    var loop = function ( i ) {
      var key = keys[i];
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        if (isReservedProp[key]) {
          warn(
            ("\"" + key + "\" is a reserved attribute and cannot be used as component prop."),
            vm
          );
        }
        defineReactive$$1(vm, key, validateProp(key, props, propsData, vm), function () {
          if (vm.$parent && !observerState.isSettingProps) {
            warn(
              "Avoid mutating a prop directly since the value will be " +
              "overwritten whenever the parent component re-renders. " +
              "Instead, use a data or computed property based on the prop's " +
              "value. Prop being mutated: \"" + key + "\"",
              vm
            );
          }
        });
      } else {
        defineReactive$$1(vm, key, validateProp(key, props, propsData, vm));
      }
    };

    for (var i = 0; i < keys.length; i++) loop( i );
    observerState.shouldConvert = true;
  }
}

function initData (vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? data.call(vm)
    : data || {};
  if (!isPlainObject(data)) {
    data = {};
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object.',
      vm
    );
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var i = keys.length;
  while (i--) {
    if (props && hasOwn(props, keys[i])) {
      process.env.NODE_ENV !== 'production' && warn(
        "The data property \"" + (keys[i]) + "\" is already declared as a prop. " +
        "Use prop default value instead.",
        vm
      );
    } else {
      proxy(vm, keys[i]);
    }
  }
  // observe data
  observe(data);
  data.__ob__ && data.__ob__.vmCount++;
}

var computedSharedDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function initComputed (vm) {
  var computed = vm.$options.computed;
  if (computed) {
    for (var key in computed) {
      var userDef = computed[key];
      if (typeof userDef === 'function') {
        computedSharedDefinition.get = makeComputedGetter(userDef, vm);
        computedSharedDefinition.set = noop;
      } else {
        computedSharedDefinition.get = userDef.get
          ? userDef.cache !== false
            ? makeComputedGetter(userDef.get, vm)
            : bind$1(userDef.get, vm)
          : noop;
        computedSharedDefinition.set = userDef.set
          ? bind$1(userDef.set, vm)
          : noop;
      }
      Object.defineProperty(vm, key, computedSharedDefinition);
    }
  }
}

function makeComputedGetter (getter, owner) {
  var watcher = new Watcher(owner, getter, noop, {
    lazy: true
  });
  return function computedGetter () {
    if (watcher.dirty) {
      watcher.evaluate();
    }
    if (Dep.target) {
      watcher.depend();
    }
    return watcher.value
  }
}

function initMethods (vm) {
  var methods = vm.$options.methods;
  if (methods) {
    for (var key in methods) {
      vm[key] = methods[key] == null ? noop : bind$1(methods[key], vm);
      if (process.env.NODE_ENV !== 'production' && methods[key] == null) {
        warn(
          "method \"" + key + "\" has an undefined value in the component definition. " +
          "Did you reference the function correctly?",
          vm
        );
      }
    }
  }
}

function initWatch (vm) {
  var watch = vm.$options.watch;
  if (watch) {
    for (var key in watch) {
      var handler = watch[key];
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }
}

function createWatcher (vm, key, handler) {
  var options;
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  vm.$watch(key, handler, options);
}

function stateMixin (Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {};
  dataDef.get = function () {
    return this._data
  };
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function (newData) {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      );
    };
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef);

  Vue.prototype.$set = set$1;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function (
    expOrFn,
    cb,
    options
  ) {
    var vm = this;
    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn () {
      watcher.teardown();
    }
  };
}

function proxy (vm, key) {
  if (!isReserved(key)) {
    Object.defineProperty(vm, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter () {
        return vm._data[key]
      },
      set: function proxySetter (val) {
        vm._data[key] = val;
      }
    });
  }
}

/*  */

var VNode = function VNode (
  tag,
  data,
  children,
  text,
  elm,
  ns,
  context,
  componentOptions
) {
  this.tag = tag;
  this.data = data;
  this.children = children;
  this.text = text;
  this.elm = elm;
  this.ns = ns;
  this.context = context;
  this.functionalContext = undefined;
  this.key = data && data.key;
  this.componentOptions = componentOptions;
  this.child = undefined;
  this.parent = undefined;
  this.raw = false;
  this.isStatic = false;
  this.isRootInsert = true;
  this.isComment = false;
  this.isCloned = false;
  this.isOnce = false;
};

var emptyVNode = function () {
  var node = new VNode();
  node.text = '';
  node.isComment = true;
  return node
};

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
function cloneVNode (vnode) {
  var cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.ns,
    vnode.context,
    vnode.componentOptions
  );
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isCloned = true;
  return cloned
}

function cloneVNodes (vnodes) {
  var res = new Array(vnodes.length);
  for (var i = 0; i < vnodes.length; i++) {
    res[i] = cloneVNode(vnodes[i]);
  }
  return res
}

/*  */

function mergeVNodeHook (def, hookKey, hook, key) {
  key = key + hookKey;
  var injectedHash = def.__injected || (def.__injected = {});
  if (!injectedHash[key]) {
    injectedHash[key] = true;
    var oldHook = def[hookKey];
    if (oldHook) {
      def[hookKey] = function () {
        oldHook.apply(this, arguments);
        hook.apply(this, arguments);
      };
    } else {
      def[hookKey] = hook;
    }
  }
}

/*  */

function updateListeners (
  on,
  oldOn,
  add,
  remove$$1,
  vm
) {
  var name, cur, old, fn, event, capture, once;
  for (name in on) {
    cur = on[name];
    old = oldOn[name];
    if (!cur) {
      process.env.NODE_ENV !== 'production' && warn(
        "Invalid handler for event \"" + name + "\": got " + String(cur),
        vm
      );
    } else if (!old) {
      once = name.charAt(0) === '~'; // Prefixed last, checked first
      event = once ? name.slice(1) : name;
      capture = event.charAt(0) === '!';
      event = capture ? event.slice(1) : event;
      if (Array.isArray(cur)) {
        add(event, (cur.invoker = arrInvoker(cur)), once, capture);
      } else {
        if (!cur.invoker) {
          fn = cur;
          cur = on[name] = {};
          cur.fn = fn;
          cur.invoker = fnInvoker(cur);
        }
        add(event, cur.invoker, once, capture);
      }
    } else if (cur !== old) {
      if (Array.isArray(old)) {
        old.length = cur.length;
        for (var i = 0; i < old.length; i++) { old[i] = cur[i]; }
        on[name] = old;
      } else {
        old.fn = cur;
        on[name] = old;
      }
    }
  }
  for (name in oldOn) {
    if (!on[name]) {
      once = name.charAt(0) === '~'; // Prefixed last, checked first
      event = once ? name.slice(1) : name;
      capture = event.charAt(0) === '!';
      event = capture ? event.slice(1) : event;
      remove$$1(event, oldOn[name].invoker, capture);
    }
  }
}

function arrInvoker (arr) {
  return function (ev) {
    var arguments$1 = arguments;

    var single = arguments.length === 1;
    for (var i = 0; i < arr.length; i++) {
      single ? arr[i](ev) : arr[i].apply(null, arguments$1);
    }
  }
}

function fnInvoker (o) {
  return function (ev) {
    var single = arguments.length === 1;
    single ? o.fn(ev) : o.fn.apply(null, arguments);
  }
}

/*  */

function normalizeChildren (
  children,
  ns,
  nestedIndex
) {
  if (isPrimitive(children)) {
    return [createTextVNode(children)]
  }
  if (Array.isArray(children)) {
    var res = [];
    for (var i = 0, l = children.length; i < l; i++) {
      var c = children[i];
      var last = res[res.length - 1];
      //  nested
      if (Array.isArray(c)) {
        res.push.apply(res, normalizeChildren(c, ns, ((nestedIndex || '') + "_" + i)));
      } else if (isPrimitive(c)) {
        if (last && last.text) {
          last.text += String(c);
        } else if (c !== '') {
          // convert primitive to vnode
          res.push(createTextVNode(c));
        }
      } else if (c instanceof VNode) {
        if (c.text && last && last.text) {
          if (!last.isCloned) {
            last.text += c.text;
          }
        } else {
          // inherit parent namespace
          if (ns) {
            applyNS(c, ns);
          }
          // default key for nested array children (likely generated by v-for)
          if (c.tag && c.key == null && nestedIndex != null) {
            c.key = "__vlist" + nestedIndex + "_" + i + "__";
          }
          res.push(c);
        }
      }
    }
    return res
  }
}

function createTextVNode (val) {
  return new VNode(undefined, undefined, undefined, String(val))
}

function applyNS (vnode, ns) {
  if (vnode.tag && !vnode.ns) {
    vnode.ns = ns;
    if (vnode.children) {
      for (var i = 0, l = vnode.children.length; i < l; i++) {
        applyNS(vnode.children[i], ns);
      }
    }
  }
}

/*  */

function getFirstComponentChild (children) {
  return children && children.filter(function (c) { return c && c.componentOptions; })[0]
}

/*  */

var activeInstance = null;

function initLifecycle (vm) {
  var options = vm.$options;

  // locate first non-abstract parent
  var parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._inactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin (Vue) {
  Vue.prototype._mount = function (
    el,
    hydrating
  ) {
    var vm = this;
    vm.$el = el;
    if (!vm.$options.render) {
      vm.$options.render = emptyVNode;
      if (process.env.NODE_ENV !== 'production') {
        /* istanbul ignore if */
        if (vm.$options.template && vm.$options.template.charAt(0) !== '#') {
          warn(
            'You are using the runtime-only build of Vue where the template ' +
            'option is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
            vm
          );
        } else {
          warn(
            'Failed to mount component: template or render function not defined.',
            vm
          );
        }
      }
    }
    callHook(vm, 'beforeMount');
    vm._watcher = new Watcher(vm, function () {
      vm._update(vm._render(), hydrating);
    }, noop);
    hydrating = false;
    // manually mounted instance, call mounted on self
    // mounted is called for render-created child components in its inserted hook
    if (vm.$vnode == null) {
      vm._isMounted = true;
      callHook(vm, 'mounted');
    }
    return vm
  };

  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this;
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate');
    }
    var prevEl = vm.$el;
    var prevVnode = vm._vnode;
    var prevActiveInstance = activeInstance;
    activeInstance = vm;
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(
        vm.$el, vnode, hydrating, false /* removeOnly */,
        vm.$options._parentElm,
        vm.$options._refElm
      );
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    activeInstance = prevActiveInstance;
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
    if (vm._isMounted) {
      callHook(vm, 'updated');
    }
  };

  Vue.prototype._updateFromParent = function (
    propsData,
    listeners,
    parentVnode,
    renderChildren
  ) {
    var vm = this;
    var hasChildren = !!(vm.$options._renderChildren || renderChildren);
    vm.$options._parentVnode = parentVnode;
    vm.$vnode = parentVnode; // update vm's placeholder node without re-render
    if (vm._vnode) { // update child tree's parent
      vm._vnode.parent = parentVnode;
    }
    vm.$options._renderChildren = renderChildren;
    // update props
    if (propsData && vm.$options.props) {
      observerState.shouldConvert = false;
      if (process.env.NODE_ENV !== 'production') {
        observerState.isSettingProps = true;
      }
      var propKeys = vm.$options._propKeys || [];
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        vm[key] = validateProp(key, vm.$options.props, propsData, vm);
      }
      observerState.shouldConvert = true;
      if (process.env.NODE_ENV !== 'production') {
        observerState.isSettingProps = false;
      }
      vm.$options.propsData = propsData;
    }
    // update listeners
    if (listeners) {
      var oldListeners = vm.$options._parentListeners;
      vm.$options._parentListeners = listeners;
      vm._updateListeners(listeners, oldListeners);
    }
    // resolve slots + force update if has children
    if (hasChildren) {
      vm.$slots = resolveSlots(renderChildren, parentVnode.context);
      vm.$forceUpdate();
    }
  };

  Vue.prototype.$forceUpdate = function () {
    var vm = this;
    if (vm._watcher) {
      vm._watcher.update();
    }
  };

  Vue.prototype.$destroy = function () {
    var vm = this;
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true;
    // remove self from parent
    var parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove$1(parent.$children, vm);
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown();
    }
    var i = vm._watchers.length;
    while (i--) {
      vm._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }
    // call the last hook...
    vm._isDestroyed = true;
    callHook(vm, 'destroyed');
    // turn off all instance listeners.
    vm.$off();
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null;
    }
    // invoke destroy hooks on current rendered tree
    vm.__patch__(vm._vnode, null);
  };
}

function callHook (vm, hook) {
  var handlers = vm.$options[hook];
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(vm);
    }
  }
  vm.$emit('hook:' + hook);
}

/*  */

var hooks = { init: init, prepatch: prepatch, insert: insert, destroy: destroy$1 };
var hooksToMerge = Object.keys(hooks);

function createComponent (
  Ctor,
  data,
  context,
  children,
  tag
) {
  if (!Ctor) {
    return
  }

  var baseCtor = context.$options._base;
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  }

  if (typeof Ctor !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      warn(("Invalid Component definition: " + (String(Ctor))), context);
    }
    return
  }

  // async component
  if (!Ctor.cid) {
    if (Ctor.resolved) {
      Ctor = Ctor.resolved;
    } else {
      Ctor = resolveAsyncComponent(Ctor, baseCtor, function () {
        // it's ok to queue this on every render because
        // $forceUpdate is buffered by the scheduler.
        context.$forceUpdate();
      });
      if (!Ctor) {
        // return nothing if this is indeed an async component
        // wait for the callback to trigger parent update.
        return
      }
    }
  }

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor);

  data = data || {};

  // extract props
  var propsData = extractProps(data, Ctor);

  // functional component
  if (Ctor.options.functional) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on;
  // replace with listeners with .native modifier
  data.on = data.nativeOn;

  if (Ctor.options.abstract) {
    // abstract components do not keep anything
    // other than props & listeners
    data = {};
  }

  // merge component management hooks onto the placeholder node
  mergeHooks(data);

  // return a placeholder vnode
  var name = Ctor.options.name || tag;
  var vnode = new VNode(
    ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
    data, undefined, undefined, undefined, undefined, context,
    { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children }
  );
  return vnode
}

function createFunctionalComponent (
  Ctor,
  propsData,
  data,
  context,
  children
) {
  var props = {};
  var propOptions = Ctor.options.props;
  if (propOptions) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData);
    }
  }
  var vnode = Ctor.options.render.call(
    null,
    // ensure the createElement function in functional components
    // gets a unique context - this is necessary for correct named slot check
    bind$1(createElement, { _self: Object.create(context) }),
    {
      props: props,
      data: data,
      parent: context,
      children: normalizeChildren(children),
      slots: function () { return resolveSlots(children, context); }
    }
  );
  if (vnode instanceof VNode) {
    vnode.functionalContext = context;
    if (data.slot) {
      (vnode.data || (vnode.data = {})).slot = data.slot;
    }
  }
  return vnode
}

function createComponentInstanceForVnode (
  vnode, // we know it's MountedComponentVNode but flow doesn't
  parent, // activeInstance in lifecycle state
  parentElm,
  refElm
) {
  var vnodeComponentOptions = vnode.componentOptions;
  var options = {
    _isComponent: true,
    parent: parent,
    propsData: vnodeComponentOptions.propsData,
    _componentTag: vnodeComponentOptions.tag,
    _parentVnode: vnode,
    _parentListeners: vnodeComponentOptions.listeners,
    _renderChildren: vnodeComponentOptions.children,
    _parentElm: parentElm || null,
    _refElm: refElm || null
  };
  // check inline-template render functions
  var inlineTemplate = vnode.data.inlineTemplate;
  if (inlineTemplate) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }
  return new vnodeComponentOptions.Ctor(options)
}

function init (
  vnode,
  hydrating,
  parentElm,
  refElm
) {
  if (!vnode.child || vnode.child._isDestroyed) {
    var child = vnode.child = createComponentInstanceForVnode(
      vnode,
      activeInstance,
      parentElm,
      refElm
    );
    child.$mount(hydrating ? vnode.elm : undefined, hydrating);
  } else if (vnode.data.keepAlive) {
    // kept-alive components, treat as a patch
    var mountedNode = vnode; // work around flow
    prepatch(mountedNode, mountedNode);
  }
}

function prepatch (
  oldVnode,
  vnode
) {
  var options = vnode.componentOptions;
  var child = vnode.child = oldVnode.child;
  child._updateFromParent(
    options.propsData, // updated props
    options.listeners, // updated listeners
    vnode, // new parent vnode
    options.children // new children
  );
}

function insert (vnode) {
  if (!vnode.child._isMounted) {
    vnode.child._isMounted = true;
    callHook(vnode.child, 'mounted');
  }
  if (vnode.data.keepAlive) {
    vnode.child._inactive = false;
    callHook(vnode.child, 'activated');
  }
}

function destroy$1 (vnode) {
  if (!vnode.child._isDestroyed) {
    if (!vnode.data.keepAlive) {
      vnode.child.$destroy();
    } else {
      vnode.child._inactive = true;
      callHook(vnode.child, 'deactivated');
    }
  }
}

function resolveAsyncComponent (
  factory,
  baseCtor,
  cb
) {
  if (factory.requested) {
    // pool callbacks
    factory.pendingCallbacks.push(cb);
  } else {
    factory.requested = true;
    var cbs = factory.pendingCallbacks = [cb];
    var sync = true;

    var resolve = function (res) {
      if (isObject(res)) {
        res = baseCtor.extend(res);
      }
      // cache resolved
      factory.resolved = res;
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        for (var i = 0, l = cbs.length; i < l; i++) {
          cbs[i](res);
        }
      }
    };

    var reject = function (reason) {
      process.env.NODE_ENV !== 'production' && warn(
        "Failed to resolve async component: " + (String(factory)) +
        (reason ? ("\nReason: " + reason) : '')
      );
    };

    var res = factory(resolve, reject);

    // handle promise
    if (res && typeof res.then === 'function' && !factory.resolved) {
      res.then(resolve, reject);
    }

    sync = false;
    // return in case resolved synchronously
    return factory.resolved
  }
}

function extractProps (data, Ctor) {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props;
  if (!propOptions) {
    return
  }
  var res = {};
  var attrs = data.attrs;
  var props = data.props;
  var domProps = data.domProps;
  if (attrs || props || domProps) {
    for (var key in propOptions) {
      var altKey = hyphenate(key);
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey) ||
      checkProp(res, domProps, key, altKey);
    }
  }
  return res
}

function checkProp (
  res,
  hash,
  key,
  altKey,
  preserve
) {
  if (hash) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true
    }
  }
  return false
}

function mergeHooks (data) {
  if (!data.hook) {
    data.hook = {};
  }
  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i];
    var fromParent = data.hook[key];
    var ours = hooks[key];
    data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours;
  }
}

function mergeHook$1 (one, two) {
  return function (a, b, c, d) {
    one(a, b, c, d);
    two(a, b, c, d);
  }
}

/*  */

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement (
  tag,
  data,
  children
) {
  if (data && (Array.isArray(data) || typeof data !== 'object')) {
    children = data;
    data = undefined;
  }
  // make sure to use real instance instead of proxy as context
  return _createElement(this._self, tag, data, children)
}

function _createElement (
  context,
  tag,
  data,
  children
) {
  if (data && data.__ob__) {
    process.env.NODE_ENV !== 'production' && warn(
      "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
      'Always create fresh vnode data objects in each render!',
      context
    );
    return
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return emptyVNode()
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
      typeof children[0] === 'function') {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }
  if (typeof tag === 'string') {
    var Ctor;
    var ns = config.getTagNamespace(tag);
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      return new VNode(
        tag, data, normalizeChildren(children, ns),
        undefined, undefined, ns, context
      )
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      return createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      var childNs = tag === 'foreignObject' ? 'xhtml' : ns;
      return new VNode(
        tag, data, normalizeChildren(children, childNs),
        undefined, undefined, ns, context
      )
    }
  } else {
    // direct component options / constructor
    return createComponent(tag, data, context, children)
  }
}

/*  */

function initRender (vm) {
  vm.$vnode = null; // the placeholder node in parent tree
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null;
  var parentVnode = vm.$options._parentVnode;
  var renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext);
  vm.$scopedSlots = {};
  // bind the public createElement fn to this instance
  // so that we get proper render context inside it.
  vm.$createElement = bind$1(createElement, vm);
  if (vm.$options.el) {
    vm.$mount(vm.$options.el);
  }
}

function renderMixin (Vue) {
  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  };

  Vue.prototype._render = function () {
    var vm = this;
    var ref = vm.$options;
    var render = ref.render;
    var staticRenderFns = ref.staticRenderFns;
    var _parentVnode = ref._parentVnode;

    if (vm._isMounted) {
      // clone slot nodes on re-renders
      for (var key in vm.$slots) {
        vm.$slots[key] = cloneVNodes(vm.$slots[key]);
      }
    }

    if (_parentVnode && _parentVnode.data.scopedSlots) {
      vm.$scopedSlots = _parentVnode.data.scopedSlots;
    }

    if (staticRenderFns && !vm._staticTrees) {
      vm._staticTrees = [];
    }
    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode;
    // render self
    var vnode;
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      /* istanbul ignore else */
      if (config.errorHandler) {
        config.errorHandler.call(null, e, vm);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn(("Error when rendering " + (formatComponentName(vm)) + ":"));
        }
        throw e
      }
      // return previous vnode to prevent render error causing blank component
      vnode = vm._vnode;
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        );
      }
      vnode = emptyVNode();
    }
    // set parent
    vnode.parent = _parentVnode;
    return vnode
  };

  // shorthands used in render functions
  Vue.prototype._h = createElement;
  // toString for mustaches
  Vue.prototype._s = _toString;
  // number conversion
  Vue.prototype._n = toNumber;
  // empty vnode
  Vue.prototype._e = emptyVNode;
  // loose equal
  Vue.prototype._q = looseEqual;
  // loose indexOf
  Vue.prototype._i = looseIndexOf;

  // render static tree by index
  Vue.prototype._m = function renderStatic (
    index,
    isInFor
  ) {
    var tree = this._staticTrees[index];
    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree by doing a shallow clone.
    if (tree && !isInFor) {
      return Array.isArray(tree)
        ? cloneVNodes(tree)
        : cloneVNode(tree)
    }
    // otherwise, render a fresh tree.
    tree = this._staticTrees[index] = this.$options.staticRenderFns[index].call(this._renderProxy);
    markStatic(tree, ("__static__" + index), false);
    return tree
  };

  // mark node as static (v-once)
  Vue.prototype._o = function markOnce (
    tree,
    index,
    key
  ) {
    markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
    return tree
  };

  function markStatic (tree, key, isOnce) {
    if (Array.isArray(tree)) {
      for (var i = 0; i < tree.length; i++) {
        if (tree[i] && typeof tree[i] !== 'string') {
          markStaticNode(tree[i], (key + "_" + i), isOnce);
        }
      }
    } else {
      markStaticNode(tree, key, isOnce);
    }
  }

  function markStaticNode (node, key, isOnce) {
    node.isStatic = true;
    node.key = key;
    node.isOnce = isOnce;
  }

  // filter resolution helper
  var identity = function (_) { return _; };
  Vue.prototype._f = function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  };

  // render v-for
  Vue.prototype._l = function renderList (
    val,
    render
  ) {
    var ret, i, l, keys, key;
    if (Array.isArray(val)) {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === 'number') {
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else if (isObject(val)) {
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
    return ret
  };

  // renderSlot
  Vue.prototype._t = function (
    name,
    fallback,
    props
  ) {
    var scopedSlotFn = this.$scopedSlots[name];
    if (scopedSlotFn) { // scoped slot
      return scopedSlotFn(props || {}) || fallback
    } else {
      var slotNodes = this.$slots[name];
      // warn duplicate slot usage
      if (slotNodes && process.env.NODE_ENV !== 'production') {
        slotNodes._rendered && warn(
          "Duplicate presence of slot \"" + name + "\" found in the same render tree " +
          "- this will likely cause render errors.",
          this
        );
        slotNodes._rendered = true;
      }
      return slotNodes || fallback
    }
  };

  // apply v-bind object
  Vue.prototype._b = function bindProps (
    data,
    tag,
    value,
    asProp
  ) {
    if (value) {
      if (!isObject(value)) {
        process.env.NODE_ENV !== 'production' && warn(
          'v-bind without argument expects an Object or Array value',
          this
        );
      } else {
        if (Array.isArray(value)) {
          value = toObject(value);
        }
        for (var key in value) {
          if (key === 'class' || key === 'style') {
            data[key] = value[key];
          } else {
            var hash = asProp || config.mustUseProp(tag, key)
              ? data.domProps || (data.domProps = {})
              : data.attrs || (data.attrs = {});
            hash[key] = value[key];
          }
        }
      }
    }
    return data
  };

  // check v-on keyCodes
  Vue.prototype._k = function checkKeyCodes (
    eventKeyCode,
    key,
    builtInAlias
  ) {
    var keyCodes = config.keyCodes[key] || builtInAlias;
    if (Array.isArray(keyCodes)) {
      return keyCodes.indexOf(eventKeyCode) === -1
    } else {
      return keyCodes !== eventKeyCode
    }
  };
}

function resolveSlots (
  renderChildren,
  context
) {
  var slots = {};
  if (!renderChildren) {
    return slots
  }
  var children = normalizeChildren(renderChildren) || [];
  var defaultSlot = [];
  var name, child;
  for (var i = 0, l = children.length; i < l; i++) {
    child = children[i];
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.functionalContext === context) &&
        child.data && (name = child.data.slot)) {
      var slot = (slots[name] || (slots[name] = []));
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children);
      } else {
        slot.push(child);
      }
    } else {
      defaultSlot.push(child);
    }
  }
  // ignore single whitespace
  if (defaultSlot.length && !(
    defaultSlot.length === 1 &&
    (defaultSlot[0].text === ' ' || defaultSlot[0].isComment)
  )) {
    slots.default = defaultSlot;
  }
  return slots
}

/*  */

function initEvents (vm) {
  vm._events = Object.create(null);
  // init parent attached events
  var listeners = vm.$options._parentListeners;
  var add = function (event, fn, once) {
    once ? vm.$once(event, fn) : vm.$on(event, fn);
  };
  var remove$$1 = bind$1(vm.$off, vm);
  vm._updateListeners = function (listeners, oldListeners) {
    updateListeners(listeners, oldListeners || {}, add, remove$$1, vm);
  };
  if (listeners) {
    vm._updateListeners(listeners);
  }
}

function eventsMixin (Vue) {
  Vue.prototype.$on = function (event, fn) {
    var vm = this;(vm._events[event] || (vm._events[event] = [])).push(fn);
    return vm
  };

  Vue.prototype.$once = function (event, fn) {
    var vm = this;
    function on () {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm
  };

  Vue.prototype.$off = function (event, fn) {
    var vm = this;
    // all
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm
    }
    // specific event
    var cbs = vm._events[event];
    if (!cbs) {
      return vm
    }
    if (arguments.length === 1) {
      vm._events[event] = null;
      return vm
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break
      }
    }
    return vm
  };

  Vue.prototype.$emit = function (event) {
    var vm = this;
    var cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        cbs[i].apply(vm, args);
      }
    }
    return vm
  };
}

/*  */

var uid = 0;

function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    var vm = this;
    // a uid
    vm._uid = uid++;
    // a flag to avoid this being observed
    vm._isVue = true;
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm);
    } else {
      vm._renderProxy = vm;
    }
    // expose real self
    vm._self = vm;
    initLifecycle(vm);
    initEvents(vm);
    callHook(vm, 'beforeCreate');
    initState(vm);
    callHook(vm, 'created');
    initRender(vm);
  };
}

function initInternalComponent (vm, options) {
  var opts = vm.$options = Object.create(vm.constructor.options);
  // doing this because it's faster than dynamic enumeration.
  opts.parent = options.parent;
  opts.propsData = options.propsData;
  opts._parentVnode = options._parentVnode;
  opts._parentListeners = options._parentListeners;
  opts._renderChildren = options._renderChildren;
  opts._componentTag = options._componentTag;
  opts._parentElm = options._parentElm;
  opts._refElm = options._refElm;
  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

function resolveConstructorOptions (Ctor) {
  var options = Ctor.options;
  if (Ctor.super) {
    var superOptions = Ctor.super.options;
    var cachedSuperOptions = Ctor.superOptions;
    var extendOptions = Ctor.extendOptions;
    if (superOptions !== cachedSuperOptions) {
      // super option changed
      Ctor.superOptions = superOptions;
      extendOptions.render = options.render;
      extendOptions.staticRenderFns = options.staticRenderFns;
      extendOptions._scopeId = options._scopeId;
      options = Ctor.options = mergeOptions(superOptions, extendOptions);
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options
}

function Vue$2 (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue$2)) {
    warn('Vue is a constructor and should be called with the `new` keyword');
  }
  this._init(options);
}

initMixin(Vue$2);
stateMixin(Vue$2);
eventsMixin(Vue$2);
lifecycleMixin(Vue$2);
renderMixin(Vue$2);

/*  */

function initUse (Vue) {
  Vue.use = function (plugin) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return
    }
    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else {
      plugin.apply(null, args);
    }
    plugin.installed = true;
    return this
  };
}

/*  */

function initMixin$1 (Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
  };
}

/*  */

function initExtend (Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var SuperId = Super.cid;
    var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }
    var name = extendOptions.name || Super.options.name;
    if (process.env.NODE_ENV !== 'production') {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        warn(
          'Invalid component name: "' + name + '". Component names ' +
          'can only contain alphanumeric characaters and the hyphen.'
        );
      }
    }
    var Sub = function VueComponent (options) {
      this._init(options);
    };
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    );
    Sub['super'] = Super;
    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;
    // create asset registers, so extended classes
    // can have their private assets too.
    config._assetTypes.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }
    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    // cache constructor
    cachedCtors[SuperId] = Sub;
    return Sub
  };
}

/*  */

function initAssetRegisters (Vue) {
  /**
   * Create asset registration methods.
   */
  config._assetTypes.forEach(function (type) {
    Vue[type] = function (
      id,
      definition
    ) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          if (type === 'component' && config.isReservedTag(id)) {
            warn(
              'Do not use built-in or reserved HTML elements as component ' +
              'id: ' + id
            );
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          definition = this.options._base.extend(definition);
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition };
        }
        this.options[type + 's'][id] = definition;
        return definition
      }
    };
  });
}

/*  */

var patternTypes = [String, RegExp];

function matches (pattern, name) {
  if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else {
    return pattern.test(name)
  }
}

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,
  props: {
    include: patternTypes,
    exclude: patternTypes
  },
  created: function created () {
    this.cache = Object.create(null);
  },
  render: function render () {
    var vnode = getFirstComponentChild(this.$slots.default);
    if (vnode && vnode.componentOptions) {
      var opts = vnode.componentOptions;
      // check pattern
      var name = opts.Ctor.options.name || opts.tag;
      if (name && (
        (this.include && !matches(this.include, name)) ||
        (this.exclude && matches(this.exclude, name))
      )) {
        return vnode
      }
      var key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? opts.Ctor.cid + (opts.tag ? ("::" + (opts.tag)) : '')
        : vnode.key;
      if (this.cache[key]) {
        vnode.child = this.cache[key].child;
      } else {
        this.cache[key] = vnode;
      }
      vnode.data.keepAlive = true;
    }
    return vnode
  },
  destroyed: function destroyed () {
    var this$1 = this;

    for (var key in this.cache) {
      var vnode = this$1.cache[key];
      callHook(vnode.child, 'deactivated');
      vnode.child.$destroy();
    }
  }
};

var builtInComponents = {
  KeepAlive: KeepAlive
};

/*  */

function initGlobalAPI (Vue) {
  // config
  var configDef = {};
  configDef.get = function () { return config; };
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = function () {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      );
    };
  }
  Object.defineProperty(Vue, 'config', configDef);
  Vue.util = util;
  Vue.set = set$1;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  Vue.options = Object.create(null);
  config._assetTypes.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue;

  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

initGlobalAPI(Vue$2);

Object.defineProperty(Vue$2.prototype, '$isServer', {
  get: isServerRendering
});

Vue$2.version = '2.1.4';

/*  */

// attributes that should be using props for binding
var mustUseProp = function (tag, attr) {
  return (
    (attr === 'value' && (tag === 'input' || tag === 'textarea' || tag === 'option')) ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
};

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

var isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,translate,' +
  'truespeed,typemustmatch,visible'
);

var xlinkNS = 'http://www.w3.org/1999/xlink';

var isXlink = function (name) {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
};

var getXlinkProp = function (name) {
  return isXlink(name) ? name.slice(6, name.length) : ''
};

var isFalsyAttrValue = function (val) {
  return val == null || val === false
};

/*  */

function genClassForVnode (vnode) {
  var data = vnode.data;
  var parentNode = vnode;
  var childNode = vnode;
  while (childNode.child) {
    childNode = childNode.child._vnode;
    if (childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }
  return genClassFromData(data)
}

function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: child.class
      ? [child.class, parent.class]
      : parent.class
  }
}

function genClassFromData (data) {
  var dynamicClass = data.class;
  var staticClass = data.staticClass;
  if (staticClass || dynamicClass) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  /* istanbul ignore next */
  return ''
}

function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function stringifyClass (value) {
  var res = '';
  if (!value) {
    return res
  }
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value)) {
    var stringified;
    for (var i = 0, l = value.length; i < l; i++) {
      if (value[i]) {
        if ((stringified = stringifyClass(value[i]))) {
          res += stringified + ' ';
        }
      }
    }
    return res.slice(0, -1)
  }
  if (isObject(value)) {
    for (var key in value) {
      if (value[key]) { res += key + ' '; }
    }
    return res.slice(0, -1)
  }
  /* istanbul ignore next */
  return res
}

/*  */

var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML',
  xhtml: 'http://www.w3.org/1999/xhtml'
};

var isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template'
);

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font,' +
  'font-face,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
);



var isReservedTag = function (tag) {
  return isHTMLTag(tag) || isSVG(tag)
};

function getTagNamespace (tag) {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}

var unknownElementCache = Object.create(null);
function isUnknownElement (tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true
  }
  if (isReservedTag(tag)) {
    return false
  }
  tag = tag.toLowerCase();
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  var el = document.createElement(tag);
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}

/*  */

/**
 * Query an element selector if it's not an element already.
 */
function query (el) {
  if (typeof el === 'string') {
    var selector = el;
    el = document.querySelector(el);
    if (!el) {
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + selector
      );
      return document.createElement('div')
    }
  }
  return el
}

/*  */

function createElement$1 (tagName, vnode) {
  var elm = document.createElement(tagName);
  if (tagName !== 'select') {
    return elm
  }
  if (vnode.data && vnode.data.attrs && 'multiple' in vnode.data.attrs) {
    elm.setAttribute('multiple', 'multiple');
  }
  return elm
}

function createElementNS (namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

function createTextNode (text) {
  return document.createTextNode(text)
}

function createComment (text) {
  return document.createComment(text)
}

function insertBefore (parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild (node, child) {
  node.removeChild(child);
}

function appendChild (node, child) {
  node.appendChild(child);
}

function parentNode (node) {
  return node.parentNode
}

function nextSibling (node) {
  return node.nextSibling
}

function tagName (node) {
  return node.tagName
}

function setTextContent (node, text) {
  node.textContent = text;
}

function childNodes (node) {
  return node.childNodes
}

function setAttribute (node, key, val) {
  node.setAttribute(key, val);
}


var nodeOps = Object.freeze({
	createElement: createElement$1,
	createElementNS: createElementNS,
	createTextNode: createTextNode,
	createComment: createComment,
	insertBefore: insertBefore,
	removeChild: removeChild,
	appendChild: appendChild,
	parentNode: parentNode,
	nextSibling: nextSibling,
	tagName: tagName,
	setTextContent: setTextContent,
	childNodes: childNodes,
	setAttribute: setAttribute
});

/*  */

var ref = {
  create: function create (_, vnode) {
    registerRef(vnode);
  },
  update: function update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy: function destroy (vnode) {
    registerRef(vnode, true);
  }
};

function registerRef (vnode, isRemoval) {
  var key = vnode.data.ref;
  if (!key) { return }

  var vm = vnode.context;
  var ref = vnode.child || vnode.elm;
  var refs = vm.$refs;
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove$1(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    if (vnode.data.refInFor) {
      if (Array.isArray(refs[key]) && refs[key].indexOf(ref) < 0) {
        refs[key].push(ref);
      } else {
        refs[key] = [ref];
      }
    } else {
      refs[key] = ref;
    }
  }
}

/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *

/*
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

var emptyNode = new VNode('', {}, []);

var hooks$1 = ['create', 'activate', 'update', 'remove', 'destroy'];

function isUndef (s) {
  return s == null
}

function isDef (s) {
  return s != null
}

function sameVnode (vnode1, vnode2) {
  return (
    vnode1.key === vnode2.key &&
    vnode1.tag === vnode2.tag &&
    vnode1.isComment === vnode2.isComment &&
    !vnode1.data === !vnode2.data
  )
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  var i, key;
  var map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) { map[key] = i; }
  }
  return map
}

function createPatchFunction (backend) {
  var i, j;
  var cbs = {};

  var modules = backend.modules;
  var nodeOps = backend.nodeOps;

  for (i = 0; i < hooks$1.length; ++i) {
    cbs[hooks$1[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks$1[i]] !== undefined) { cbs[hooks$1[i]].push(modules[j][hooks$1[i]]); }
    }
  }

  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  function createRmCb (childElm, listeners) {
    function remove$$1 () {
      if (--remove$$1.listeners === 0) {
        removeElement(childElm);
      }
    }
    remove$$1.listeners = listeners;
    return remove$$1
  }

  function removeElement (el) {
    var parent = nodeOps.parentNode(el);
    // element may have already been removed due to v-html
    if (parent) {
      nodeOps.removeChild(parent, el);
    }
  }

  var inPre = 0;
  function createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested) {
    vnode.isRootInsert = !nested; // for transition enter check
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    var data = vnode.data;
    var children = vnode.children;
    var tag = vnode.tag;
    if (isDef(tag)) {
      if (process.env.NODE_ENV !== 'production') {
        if (data && data.pre) {
          inPre++;
        }
        if (
          !inPre &&
          !vnode.ns &&
          !(config.ignoredElements && config.ignoredElements.indexOf(tag) > -1) &&
          config.isUnknownElement(tag)
        ) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          );
        }
      }
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);
      setScope(vnode);

      /* istanbul ignore if */
      {
        createChildren(vnode, children, insertedVnodeQueue);
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        insert(parentElm, vnode.elm, refElm);
      }

      if (process.env.NODE_ENV !== 'production' && data && data.pre) {
        inPre--;
      }
    } else if (vnode.isComment) {
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i = vnode.data;
    if (isDef(i)) {
      var isReactivated = isDef(vnode.child) && i.keepAlive;
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */, parentElm, refElm);
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(vnode.child)) {
        initComponent(vnode, insertedVnodeQueue);
        if (isReactivated) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true
      }
    }
  }

  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i;
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    var innerNode = vnode;
    while (innerNode.child) {
      innerNode = innerNode.child._vnode;
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode);
        }
        insertedVnodeQueue.push(innerNode);
        break
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    insert(parentElm, vnode.elm, refElm);
  }

  function insert (parent, elm, ref) {
    if (parent) {
      nodeOps.insertBefore(parent, elm, ref);
    }
  }

  function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true);
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text));
    }
  }

  function isPatchable (vnode) {
    while (vnode.child) {
      vnode = vnode.child._vnode;
    }
    return isDef(vnode.tag)
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode);
    }
    i = vnode.data.hook; // Reuse variable
    if (isDef(i)) {
      if (i.create) { i.create(emptyNode, vnode); }
      if (i.insert) { insertedVnodeQueue.push(vnode); }
    }
  }

  function initComponent (vnode, insertedVnodeQueue) {
    if (vnode.data.pendingInsert) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
    }
    vnode.elm = vnode.child.$el;
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode);
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode);
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope (vnode) {
    var i;
    if (isDef(i = vnode.context) && isDef(i = i.$options._scopeId)) {
      nodeOps.setAttribute(vnode.elm, i, '');
    }
    if (isDef(i = activeInstance) &&
        i !== vnode.context &&
        isDef(i = i.$options._scopeId)) {
      nodeOps.setAttribute(vnode.elm, i, '');
    }
  }

  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm);
    }
  }

  function invokeDestroyHook (vnode) {
    var i, j;
    var data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
      for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else { // Text node
          nodeOps.removeChild(parentElm, ch.elm);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook (vnode, rm) {
    if (rm || isDef(vnode.data)) {
      var listeners = cbs.remove.length + 1;
      if (!rm) {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      } else {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.child) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeElement(vnode.elm);
    }
  }

  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, elmToMove, refElm;

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    var canMove = !removeOnly;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
        idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null;
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          elmToMove = oldCh[idxInOld];
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !elmToMove) {
            warn(
              'It seems there are duplicate keys that is causing an update error. ' +
              'Make sure each v-for item has a unique key.'
            );
          }
          if (elmToMove.tag !== newStartVnode.tag) {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
          } else {
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
          }
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    if (oldVnode === vnode) {
      return
    }
    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    if (vnode.isStatic &&
        oldVnode.isStatic &&
        vnode.key === oldVnode.key &&
        (vnode.isCloned || vnode.isOnce)) {
      vnode.elm = oldVnode.elm;
      vnode.child = oldVnode.child;
      return
    }
    var i;
    var data = vnode.data;
    var hasData = isDef(data);
    if (hasData && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode);
    }
    var elm = vnode.elm = oldVnode.elm;
    var oldCh = oldVnode.children;
    var ch = vnode.children;
    if (hasData && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
      if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text);
    }
    if (hasData) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
    }
  }

  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (initial && vnode.parent) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  var bailed = false;
  function hydrate (elm, vnode, insertedVnodeQueue) {
    if (process.env.NODE_ENV !== 'production') {
      if (!assertNodeMatch(elm, vnode)) {
        return false
      }
    }
    vnode.elm = elm;
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
      if (isDef(i = vnode.child)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        var childNodes = nodeOps.childNodes(elm);
        // empty element, allow client to pick up and populate children
        if (!childNodes.length) {
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          var childrenMatch = true;
          if (childNodes.length !== children.length) {
            childrenMatch = false;
          } else {
            for (var i$1 = 0; i$1 < children.length; i$1++) {
              if (!hydrate(childNodes[i$1], children[i$1], insertedVnodeQueue)) {
                childrenMatch = false;
                break
              }
            }
          }
          if (!childrenMatch) {
            if (process.env.NODE_ENV !== 'production' &&
                typeof console !== 'undefined' &&
                !bailed) {
              bailed = true;
              console.warn('Parent: ', elm);
              console.warn('Mismatching childNodes vs. VNodes: ', childNodes, children);
            }
            return false
          }
        }
      }
      if (isDef(data)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
      }
    }
    return true
  }

  function assertNodeMatch (node, vnode) {
    if (vnode.tag) {
      return (
        vnode.tag.indexOf('vue-component') === 0 ||
        vnode.tag.toLowerCase() === nodeOps.tagName(node).toLowerCase()
      )
    } else {
      return _toString(vnode.text) === node.data
    }
  }

  return function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
    if (!vnode) {
      if (oldVnode) { invokeDestroyHook(oldVnode); }
      return
    }

    var elm, parent;
    var isInitialPatch = false;
    var insertedVnodeQueue = [];

    if (!oldVnode) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true;
      createElm(vnode, insertedVnodeQueue, parentElm, refElm);
    } else {
      var isRealElement = isDef(oldVnode.nodeType);
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute('server-rendered')) {
            oldVnode.removeAttribute('server-rendered');
            hydrating = true;
          }
          if (hydrating) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode
            } else if (process.env.NODE_ENV !== 'production') {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              );
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode);
        }

        // replacing existing element
        elm = oldVnode.elm;
        parent = nodeOps.parentNode(elm);
        createElm(vnode, insertedVnodeQueue, parent, nodeOps.nextSibling(elm));

        if (vnode.parent) {
          // component root element replaced.
          // update parent placeholder node element, recursively
          var ancestor = vnode.parent;
          while (ancestor) {
            ancestor.elm = vnode.elm;
            ancestor = ancestor.parent;
          }
          if (isPatchable(vnode)) {
            for (var i = 0; i < cbs.create.length; ++i) {
              cbs.create[i](emptyNode, vnode.parent);
            }
          }
        }

        if (parent !== null) {
          removeVnodes(parent, [oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode);
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm
  }
}

/*  */

var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode) {
    updateDirectives(vnode, emptyNode);
  }
};

function updateDirectives (
  oldVnode,
  vnode
) {
  if (!oldVnode.data.directives && !vnode.data.directives) {
    return
  }
  var isCreate = oldVnode === emptyNode;
  var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
  var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

  var dirsWithInsert = [];
  var dirsWithPostpatch = [];

  var key, oldDir, dir;
  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];
    if (!oldDir) {
      // new directive, bind
      callHook$1(dir, 'bind', vnode, oldVnode);
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir);
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value;
      callHook$1(dir, 'update', vnode, oldVnode);
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir);
      }
    }
  }

  if (dirsWithInsert.length) {
    var callInsert = function () {
      dirsWithInsert.forEach(function (dir) {
        callHook$1(dir, 'inserted', vnode, oldVnode);
      });
    };
    if (isCreate) {
      mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', callInsert, 'dir-insert');
    } else {
      callInsert();
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'postpatch', function () {
      dirsWithPostpatch.forEach(function (dir) {
        callHook$1(dir, 'componentUpdated', vnode, oldVnode);
      });
    }, 'dir-postpatch');
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook$1(oldDirs[key], 'unbind', oldVnode);
      }
    }
  }
}

var emptyModifiers = Object.create(null);

function normalizeDirectives$1 (
  dirs,
  vm
) {
  var res = Object.create(null);
  if (!dirs) {
    return res
  }
  var i, dir;
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i];
    if (!dir.modifiers) {
      dir.modifiers = emptyModifiers;
    }
    res[getRawDirName(dir)] = dir;
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
  }
  return res
}

function getRawDirName (dir) {
  return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
}

function callHook$1 (dir, hook, vnode, oldVnode) {
  var fn = dir.def && dir.def[hook];
  if (fn) {
    fn(vnode.elm, dir, vnode, oldVnode);
  }
}

var baseModules = [
  ref,
  directives
];

/*  */

function updateAttrs (oldVnode, vnode) {
  if (!oldVnode.data.attrs && !vnode.data.attrs) {
    return
  }
  var key, cur, old;
  var elm = vnode.elm;
  var oldAttrs = oldVnode.data.attrs || {};
  var attrs = vnode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (attrs.__ob__) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      setAttr(elm, key, cur);
    }
  }
  for (key in oldAttrs) {
    if (attrs[key] == null) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key);
      }
    }
  }
}

function setAttr (el, key, value) {
  if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, key);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs
};

/*  */

function updateClass (oldVnode, vnode) {
  var el = vnode.elm;
  var data = vnode.data;
  var oldData = oldVnode.data;
  if (!data.staticClass && !data.class &&
      (!oldData || (!oldData.staticClass && !oldData.class))) {
    return
  }

  var cls = genClassForVnode(vnode);

  // handle transition classes
  var transitionClass = el._transitionClasses;
  if (transitionClass) {
    cls = concat(cls, stringifyClass(transitionClass));
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

var klass = {
  create: updateClass,
  update: updateClass
};

// skip type checking this file because we need to attach private properties
// to elements

function updateDOMListeners (oldVnode, vnode) {
  if (!oldVnode.data.on && !vnode.data.on) {
    return
  }
  var on = vnode.data.on || {};
  var oldOn = oldVnode.data.on || {};
  var add = vnode.elm._v_add || (
    vnode.elm._v_add = function (event, handler, once, capture) {
      if (once) {
        var oldHandler = handler;
        handler = function (ev) {
          remove(event, handler, capture);
          arguments.length === 1
            ? oldHandler(ev)
            : oldHandler.apply(null, arguments);
        };
      }
      vnode.elm.addEventListener(event, handler, capture);
    }
  );
  var remove = vnode.elm._v_remove || (
    vnode.elm._v_remove = function (event, handler, capture) {
      vnode.elm.removeEventListener(event, handler, capture);
    }
  );
  updateListeners(on, oldOn, add, remove, vnode.context);
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
};

/*  */

function updateDOMProps (oldVnode, vnode) {
  if (!oldVnode.data.domProps && !vnode.data.domProps) {
    return
  }
  var key, cur;
  var elm = vnode.elm;
  var oldProps = oldVnode.data.domProps || {};
  var props = vnode.data.domProps || {};
  // clone observed objects, as the user probably wants to mutate it
  if (props.__ob__) {
    props = vnode.data.domProps = extend({}, props);
  }

  for (key in oldProps) {
    if (props[key] == null) {
      elm[key] = '';
    }
  }
  for (key in props) {
    cur = props[key];
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) { vnode.children.length = 0; }
      if (cur === oldProps[key]) { continue }
    }
    if (key === 'value') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur;
      // avoid resetting cursor position when value is the same
      var strCur = cur == null ? '' : String(cur);
      if (elm.value !== strCur && !elm.composing) {
        elm.value = strCur;
      }
    } else {
      elm[key] = cur;
    }
  }
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
};

/*  */

var parseStyleText = cached(function (cssText) {
  var res = {};
  var listDelimiter = /;(?![^(]*\))/g;
  var propertyDelimiter = /:(.+)/;
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      var tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return res
});

// merge static and dynamic style data on the same vnode
function normalizeStyleData (data) {
  var style = normalizeStyleBinding(data.style);
  // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
  return data.staticStyle
    ? extend(data.staticStyle, style)
    : style
}

// normalize possible array / string values into Object
function normalizeStyleBinding (bindingStyle) {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle)
  }
  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle)
  }
  return bindingStyle
}

/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
function getStyle (vnode, checkChild) {
  var res = {};
  var styleData;

  if (checkChild) {
    var childNode = vnode;
    while (childNode.child) {
      childNode = childNode.child._vnode;
      if (childNode.data && (styleData = normalizeStyleData(childNode.data))) {
        extend(res, styleData);
      }
    }
  }

  if ((styleData = normalizeStyleData(vnode.data))) {
    extend(res, styleData);
  }

  var parentNode = vnode;
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData);
    }
  }
  return res
}

/*  */

var cssVarRE = /^--/;
var importantRE = /\s*!important$/;
var setProp = function (el, name, val) {
  /* istanbul ignore if */
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val);
  } else if (importantRE.test(val)) {
    el.style.setProperty(name, val.replace(importantRE, ''), 'important');
  } else {
    el.style[normalize(name)] = val;
  }
};

var prefixes = ['Webkit', 'Moz', 'ms'];

var testEl;
var normalize = cached(function (prop) {
  testEl = testEl || document.createElement('div');
  prop = camelize(prop);
  if (prop !== 'filter' && (prop in testEl.style)) {
    return prop
  }
  var upper = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (var i = 0; i < prefixes.length; i++) {
    var prefixed = prefixes[i] + upper;
    if (prefixed in testEl.style) {
      return prefixed
    }
  }
});

function updateStyle (oldVnode, vnode) {
  var data = vnode.data;
  var oldData = oldVnode.data;

  if (!data.staticStyle && !data.style &&
      !oldData.staticStyle && !oldData.style) {
    return
  }

  var cur, name;
  var el = vnode.elm;
  var oldStaticStyle = oldVnode.data.staticStyle;
  var oldStyleBinding = oldVnode.data.style || {};

  // if static style exists, stylebinding already merged into it when doing normalizeStyleData
  var oldStyle = oldStaticStyle || oldStyleBinding;

  var style = normalizeStyleBinding(vnode.data.style) || {};

  vnode.data.style = style.__ob__ ? extend({}, style) : style;

  var newStyle = getStyle(vnode, true);

  for (name in oldStyle) {
    if (newStyle[name] == null) {
      setProp(el, name, '');
    }
  }
  for (name in newStyle) {
    cur = newStyle[name];
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      setProp(el, name, cur == null ? '' : cur);
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle
};

/*  */

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function addClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !cls.trim()) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) { return el.classList.add(c); });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = ' ' + el.getAttribute('class') + ' ';
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function removeClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !cls.trim()) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) { return el.classList.remove(c); });
    } else {
      el.classList.remove(cls);
    }
  } else {
    var cur = ' ' + el.getAttribute('class') + ' ';
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    el.setAttribute('class', cur.trim());
  }
}

/*  */

var hasTransition = inBrowser && !isIE9;
var TRANSITION = 'transition';
var ANIMATION = 'animation';

// Transition property/event sniffing
var transitionProp = 'transition';
var transitionEndEvent = 'transitionend';
var animationProp = 'animation';
var animationEndEvent = 'animationend';
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
  }
  if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
  }
}

var raf = (inBrowser && window.requestAnimationFrame) || setTimeout;
function nextFrame (fn) {
  raf(function () {
    raf(fn);
  });
}

function addTransitionClass (el, cls) {
  (el._transitionClasses || (el._transitionClasses = [])).push(cls);
  addClass(el, cls);
}

function removeTransitionClass (el, cls) {
  if (el._transitionClasses) {
    remove$1(el._transitionClasses, cls);
  }
  removeClass(el, cls);
}

function whenTransitionEnds (
  el,
  expectedType,
  cb
) {
  var ref = getTransitionInfo(el, expectedType);
  var type = ref.type;
  var timeout = ref.timeout;
  var propCount = ref.propCount;
  if (!type) { return cb() }
  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
  var ended = 0;
  var end = function () {
    el.removeEventListener(event, onEnd);
    cb();
  };
  var onEnd = function (e) {
    if (e.target === el) {
      if (++ended >= propCount) {
        end();
      }
    }
  };
  setTimeout(function () {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(event, onEnd);
}

var transformRE = /\b(transform|all)(,|$)/;

function getTransitionInfo (el, expectedType) {
  var styles = window.getComputedStyle(el);
  var transitioneDelays = styles[transitionProp + 'Delay'].split(', ');
  var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
  var transitionTimeout = getTimeout(transitioneDelays, transitionDurations);
  var animationDelays = styles[animationProp + 'Delay'].split(', ');
  var animationDurations = styles[animationProp + 'Duration'].split(', ');
  var animationTimeout = getTimeout(animationDelays, animationDurations);

  var type;
  var timeout = 0;
  var propCount = 0;
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null;
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0;
  }
  var hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property']);
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  }
}

function getTimeout (delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i])
  }))
}

function toMs (s) {
  return Number(s.slice(0, -1)) * 1000
}

/*  */

function enter (vnode) {
  var el = vnode.elm;

  // call leave callback now
  if (el._leaveCb) {
    el._leaveCb.cancelled = true;
    el._leaveCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (!data) {
    return
  }

  /* istanbul ignore if */
  if (el._enterCb || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
  var context = activeInstance;
  var transitionNode = activeInstance.$vnode;
  while (transitionNode && transitionNode.parent) {
    transitionNode = transitionNode.parent;
    context = transitionNode.context;
  }

  var isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return
  }

  var startClass = isAppear ? appearClass : enterClass;
  var activeClass = isAppear ? appearActiveClass : enterActiveClass;
  var beforeEnterHook = isAppear ? (beforeAppear || beforeEnter) : beforeEnter;
  var enterHook = isAppear ? (typeof appear === 'function' ? appear : enter) : enter;
  var afterEnterHook = isAppear ? (afterAppear || afterEnter) : afterEnter;
  var enterCancelledHook = isAppear ? (appearCancelled || enterCancelled) : enterCancelled;

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl =
    enterHook &&
    // enterHook may be a bound method which exposes
    // the length of original fn as _length
    (enterHook._length || enterHook.length) > 1;

  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, activeClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }
      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }
    el._enterCb = null;
  });

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
      var parent = el.parentNode;
      var pendingNode = parent && parent._pending && parent._pending[vnode.key];
      if (pendingNode &&
          pendingNode.context === vnode.context &&
          pendingNode.tag === vnode.tag &&
          pendingNode.elm._leaveCb) {
        pendingNode.elm._leaveCb();
      }
      enterHook && enterHook(el, cb);
    }, 'transition-insert');
  }

  // start enter transition
  beforeEnterHook && beforeEnterHook(el);
  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(function () {
      removeTransitionClass(el, startClass);
      if (!cb.cancelled && !userWantsControl) {
        whenTransitionEnds(el, type, cb);
      }
    });
  }

  if (vnode.data.show) {
    enterHook && enterHook(el, cb);
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave (vnode, rm) {
  var el = vnode.elm;

  // call enter callback now
  if (el._enterCb) {
    el._enterCb.cancelled = true;
    el._enterCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (!data) {
    return rm()
  }

  /* istanbul ignore if */
  if (el._leaveCb || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl =
    leave &&
    // leave hook may be a bound method which exposes
    // the length of original fn as _length
    (leave._length || leave.length) > 1;

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveActiveClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }
      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }
    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave () {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return
    }
    // record leaving element
    if (!vnode.data.show) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] = vnode;
    }
    beforeLeave && beforeLeave(el);
    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(function () {
        removeTransitionClass(el, leaveClass);
        if (!cb.cancelled && !userWantsControl) {
          whenTransitionEnds(el, type, cb);
        }
      });
    }
    leave && leave(el, cb);
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
}

function resolveTransition (def$$1) {
  if (!def$$1) {
    return
  }
  /* istanbul ignore else */
  if (typeof def$$1 === 'object') {
    var res = {};
    if (def$$1.css !== false) {
      extend(res, autoCssTransition(def$$1.name || 'v'));
    }
    extend(res, def$$1);
    return res
  } else if (typeof def$$1 === 'string') {
    return autoCssTransition(def$$1)
  }
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: (name + "-enter"),
    leaveClass: (name + "-leave"),
    appearClass: (name + "-enter"),
    enterActiveClass: (name + "-enter-active"),
    leaveActiveClass: (name + "-leave-active"),
    appearActiveClass: (name + "-enter-active")
  }
});

function once (fn) {
  var called = false;
  return function () {
    if (!called) {
      called = true;
      fn();
    }
  }
}

function _enter (_, vnode) {
  if (!vnode.data.show) {
    enter(vnode);
  }
}

var transition = inBrowser ? {
  create: _enter,
  activate: _enter,
  remove: function remove (vnode, rm) {
    /* istanbul ignore else */
    if (!vnode.data.show) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};

var platformModules = [
  attrs,
  klass,
  events,
  domProps,
  style,
  transition
];

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
var modules = platformModules.concat(baseModules);

var patch$1 = createPatchFunction({ nodeOps: nodeOps, modules: modules });

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

var modelableTagRE = /^input|select|textarea|vue-component-[0-9]+(-[0-9a-zA-Z_-]*)?$/;

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement;
    if (el && el.vmodel) {
      trigger(el, 'input');
    }
  });
}

var model = {
  inserted: function inserted (el, binding, vnode) {
    if (process.env.NODE_ENV !== 'production') {
      if (!modelableTagRE.test(vnode.tag)) {
        warn(
          "v-model is not supported on element type: <" + (vnode.tag) + ">. " +
          'If you are working with contenteditable, it\'s recommended to ' +
          'wrap a library dedicated for that purpose inside a custom component.',
          vnode.context
        );
      }
    }
    if (vnode.tag === 'select') {
      var cb = function () {
        setSelected(el, binding, vnode.context);
      };
      cb();
      /* istanbul ignore if */
      if (isIE || isEdge) {
        setTimeout(cb, 0);
      }
    } else if (
      (vnode.tag === 'textarea' || el.type === 'text') &&
      !binding.modifiers.lazy
    ) {
      if (!isAndroid) {
        el.addEventListener('compositionstart', onCompositionStart);
        el.addEventListener('compositionend', onCompositionEnd);
      }
      /* istanbul ignore if */
      if (isIE9) {
        el.vmodel = true;
      }
    }
  },
  componentUpdated: function componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context);
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
      var needReset = el.multiple
        ? binding.value.some(function (v) { return hasNoMatchingOption(v, el.options); })
        : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, el.options);
      if (needReset) {
        trigger(el, 'change');
      }
    }
  }
};

function setSelected (el, binding, vm) {
  var value = binding.value;
  var isMultiple = el.multiple;
  if (isMultiple && !Array.isArray(value)) {
    process.env.NODE_ENV !== 'production' && warn(
      "<select multiple v-model=\"" + (binding.expression) + "\"> " +
      "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
      vm
    );
    return
  }
  var selected, option;
  for (var i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i];
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1;
      if (option.selected !== selected) {
        option.selected = selected;
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i;
        }
        return
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1;
  }
}

function hasNoMatchingOption (value, options) {
  for (var i = 0, l = options.length; i < l; i++) {
    if (looseEqual(getValue(options[i]), value)) {
      return false
    }
  }
  return true
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value
}

function onCompositionStart (e) {
  e.target.composing = true;
}

function onCompositionEnd (e) {
  e.target.composing = false;
  trigger(e.target, 'input');
}

function trigger (el, type) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}

/*  */

// recursively search for possible transition defined inside the component root
function locateNode (vnode) {
  return vnode.child && (!vnode.data || !vnode.data.transition)
    ? locateNode(vnode.child._vnode)
    : vnode
}

var show = {
  bind: function bind (el, ref, vnode) {
    var value = ref.value;

    vnode = locateNode(vnode);
    var transition = vnode.data && vnode.data.transition;
    if (value && transition && !isIE9) {
      enter(vnode);
    }
    var originalDisplay = el.style.display === 'none' ? '' : el.style.display;
    el.style.display = value ? originalDisplay : 'none';
    el.__vOriginalDisplay = originalDisplay;
  },
  update: function update (el, ref, vnode) {
    var value = ref.value;
    var oldValue = ref.oldValue;

    /* istanbul ignore if */
    if (value === oldValue) { return }
    vnode = locateNode(vnode);
    var transition = vnode.data && vnode.data.transition;
    if (transition && !isIE9) {
      if (value) {
        enter(vnode);
        el.style.display = el.__vOriginalDisplay;
      } else {
        leave(vnode, function () {
          el.style.display = 'none';
        });
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none';
    }
  }
};

var platformDirectives = {
  model: model,
  show: show
};

/*  */

// Provides transition support for a single element/component.
// supports transition mode (out-in / in-out)

var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String
};

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function extractTransitionData (comp) {
  var data = {};
  var options = comp.$options;
  // props
  for (var key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  var listeners = options._parentListeners;
  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1].fn;
  }
  return data
}

function placeholder (h, rawChild) {
  return /\d-keep-alive$/.test(rawChild.tag)
    ? h('keep-alive')
    : null
}

function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,
  render: function render (h) {
    var this$1 = this;

    var children = this.$slots.default;
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(function (c) { return c.tag; });
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if (process.env.NODE_ENV !== 'production' && children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      );
    }

    var mode = this.mode;

    // warn invalid mode
    if (process.env.NODE_ENV !== 'production' &&
        mode && mode !== 'in-out' && mode !== 'out-in') {
      warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      );
    }

    var rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    var child = getRealChild(rawChild);
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    if (this._leaving) {
      return placeholder(h, rawChild)
    }

    var key = child.key = child.key == null || child.isStatic
      ? ("__v" + (child.tag + this._uid) + "__")
      : child.key;
    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild);

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
      child.data.show = true;
    }

    if (oldChild && oldChild.data && oldChild.key !== key) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild.data.transition = extend({}, data);

      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true;
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this$1._leaving = false;
          this$1.$forceUpdate();
        }, key);
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        var delayedLeave;
        var performLeave = function () { delayedLeave(); };
        mergeVNodeHook(data, 'afterEnter', performLeave, key);
        mergeVNodeHook(data, 'enterCancelled', performLeave, key);
        mergeVNodeHook(oldData, 'delayLeave', function (leave) {
          delayedLeave = leave;
        }, key);
      }
    }

    return rawChild
  }
};

/*  */

// Provides transition support for list items.
// supports move transitions using the FLIP technique.

// Because the vdom's children update algorithm is "unstable" - i.e.
// it doesn't guarantee the relative positioning of removed elements,
// we force transition-group to update its children into two passes:
// in the first pass, we remove all nodes that need to be removed,
// triggering their leaving transition; in the second pass, we insert/move
// into the final disired state. This way in the second pass removed
// nodes will remain where they should be.

var props = extend({
  tag: String,
  moveClass: String
}, transitionProps);

delete props.mode;

var TransitionGroup = {
  props: props,

  render: function render (h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var map = Object.create(null);
    var prevChildren = this.prevChildren = this.children;
    var rawChildren = this.$slots.default || [];
    var children = this.children = [];
    var transitionData = extractTransitionData(this);

    for (var i = 0; i < rawChildren.length; i++) {
      var c = rawChildren[i];
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c);
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData;
        } else if (process.env.NODE_ENV !== 'production') {
          var opts = c.componentOptions;
          var name = opts
            ? (opts.Ctor.options.name || opts.tag)
            : c.tag;
          warn(("<transition-group> children must be keyed: <" + name + ">"));
        }
      }
    }

    if (prevChildren) {
      var kept = [];
      var removed = [];
      for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
        var c$1 = prevChildren[i$1];
        c$1.data.transition = transitionData;
        c$1.data.pos = c$1.elm.getBoundingClientRect();
        if (map[c$1.key]) {
          kept.push(c$1);
        } else {
          removed.push(c$1);
        }
      }
      this.kept = h(tag, null, kept);
      this.removed = removed;
    }

    return h(tag, null, children)
  },

  beforeUpdate: function beforeUpdate () {
    // force removing pass
    this.__patch__(
      this._vnode,
      this.kept,
      false, // hydrating
      true // removeOnly (!important, avoids unnecessary moves)
    );
    this._vnode = this.kept;
  },

  updated: function updated () {
    var children = this.prevChildren;
    var moveClass = this.moveClass || ((this.name || 'v') + '-move');
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    // we divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.
    children.forEach(callPendingCbs);
    children.forEach(recordPosition);
    children.forEach(applyTranslation);

    // force reflow to put everything in position
    var f = document.body.offsetHeight; // eslint-disable-line

    children.forEach(function (c) {
      if (c.data.moved) {
        var el = c.elm;
        var s = el.style;
        addTransitionClass(el, moveClass);
        s.transform = s.WebkitTransform = s.transitionDuration = '';
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        });
      }
    });
  },

  methods: {
    hasMove: function hasMove (el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false
      }
      if (this._hasMove != null) {
        return this._hasMove
      }
      addTransitionClass(el, moveClass);
      var info = getTransitionInfo(el);
      removeTransitionClass(el, moveClass);
      return (this._hasMove = info.hasTransform)
    }
  }
};

function callPendingCbs (c) {
  /* istanbul ignore if */
  if (c.elm._moveCb) {
    c.elm._moveCb();
  }
  /* istanbul ignore if */
  if (c.elm._enterCb) {
    c.elm._enterCb();
  }
}

function recordPosition (c) {
  c.data.newPos = c.elm.getBoundingClientRect();
}

function applyTranslation (c) {
  var oldPos = c.data.pos;
  var newPos = c.data.newPos;
  var dx = oldPos.left - newPos.left;
  var dy = oldPos.top - newPos.top;
  if (dx || dy) {
    c.data.moved = true;
    var s = c.elm.style;
    s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
    s.transitionDuration = '0s';
  }
}

var platformComponents = {
  Transition: Transition,
  TransitionGroup: TransitionGroup
};

/*  */

// install platform specific utils
Vue$2.config.isUnknownElement = isUnknownElement;
Vue$2.config.isReservedTag = isReservedTag;
Vue$2.config.getTagNamespace = getTagNamespace;
Vue$2.config.mustUseProp = mustUseProp;

// install platform runtime directives & components
extend(Vue$2.options.directives, platformDirectives);
extend(Vue$2.options.components, platformComponents);

// install platform patch function
Vue$2.prototype.__patch__ = inBrowser ? patch$1 : noop;

// wrap mount
Vue$2.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && inBrowser ? query(el) : undefined;
  return this._mount(el, hydrating)
};

// devtools global hook
/* istanbul ignore next */
setTimeout(function () {
  if (config.devtools) {
    if (devtools) {
      devtools.emit('init', Vue$2);
    } else if (
      process.env.NODE_ENV !== 'production' &&
      inBrowser && /Chrome\/\d+/.test(window.navigator.userAgent)
    ) {
      console.log(
        'Download the Vue Devtools for a better development experience:\n' +
        'https://github.com/vuejs/vue-devtools'
      );
    }
  }
}, 0);

module.exports = Vue$2;

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":1}],4:[function(require,module,exports){
/**
 * vuex v2.0.0
 * (c) 2016 Evan You
 * @license MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Vuex = factory());
}(this, (function () { 'use strict';

var devtoolHook =
  typeof window !== 'undefined' &&
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__

function devtoolPlugin (store) {
  if (!devtoolHook) { return }

  store._devtoolHook = devtoolHook

  devtoolHook.emit('vuex:init', store)

  devtoolHook.on('vuex:travel-to-state', function (targetState) {
    store.replaceState(targetState)
  })

  store.subscribe(function (mutation, state) {
    devtoolHook.emit('vuex:mutation', mutation, state)
  })
}

function applyMixin (Vue) {
  var version = Number(Vue.version.split('.')[0])

  if (version >= 2) {
    var usesInit = Vue.config._lifecycleHooks.indexOf('init') > -1
    Vue.mixin(usesInit ? { init: vuexInit } : { beforeCreate: vuexInit })
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    var _init = Vue.prototype._init
    Vue.prototype._init = function (options) {
      if ( options === void 0 ) options = {};

      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit () {
    var options = this.$options
    // store injection
    if (options.store) {
      this.$store = options.store
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
}

function mapState (states) {
  var res = {}
  normalizeMap(states).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedState () {
      return typeof val === 'function'
        ? val.call(this, this.$store.state, this.$store.getters)
        : this.$store.state[val]
    }
  })
  return res
}

function mapMutations (mutations) {
  var res = {}
  normalizeMap(mutations).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedMutation () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return this.$store.commit.apply(this.$store, [val].concat(args))
    }
  })
  return res
}

function mapGetters (getters) {
  var res = {}
  normalizeMap(getters).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedGetter () {
      if (!(val in this.$store.getters)) {
        console.error(("[vuex] unknown getter: " + val))
      }
      return this.$store.getters[val]
    }
  })
  return res
}

function mapActions (actions) {
  var res = {}
  normalizeMap(actions).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedAction () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return this.$store.dispatch.apply(this.$store, [val].concat(args))
    }
  })
  return res
}

function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(function (key) { return ({ key: key, val: key }); })
    : Object.keys(map).map(function (key) { return ({ key: key, val: map[key] }); })
}

function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

function isPromise (val) {
  return val && typeof val.then === 'function'
}

function assert (condition, msg) {
  if (!condition) { throw new Error(("[vuex] " + msg)) }
}

var Vue // bind on install

var Store = function Store (options) {
  var this$1 = this;
  if ( options === void 0 ) options = {};

  assert(Vue, "must call Vue.use(Vuex) before creating a store instance.")
  assert(typeof Promise !== 'undefined', "vuex requires a Promise polyfill in this browser.")

  var state = options.state; if ( state === void 0 ) state = {};
  var plugins = options.plugins; if ( plugins === void 0 ) plugins = [];
  var strict = options.strict; if ( strict === void 0 ) strict = false;

  // store internal state
  this._options = options
  this._committing = false
  this._actions = Object.create(null)
  this._mutations = Object.create(null)
  this._wrappedGetters = Object.create(null)
  this._runtimeModules = Object.create(null)
  this._subscribers = []
  this._watcherVM = new Vue()

    // bind commit and dispatch to self
  var store = this
  var ref = this;
  var dispatch = ref.dispatch;
  var commit = ref.commit;
  this.dispatch = function boundDispatch (type, payload) {
    return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
    return commit.call(store, type, payload, options)
  }

  // strict mode
  this.strict = strict

  // init root module.
  // this also recursively registers all sub-modules
  // and collects all module getters inside this._wrappedGetters
  installModule(this, state, [], options)

  // initialize the store vm, which is responsible for the reactivity
  // (also registers _wrappedGetters as computed properties)
  resetStoreVM(this, state)

  // apply plugins
  plugins.concat(devtoolPlugin).forEach(function (plugin) { return plugin(this$1); })
};

var prototypeAccessors = { state: {} };

prototypeAccessors.state.get = function () {
  return this._vm.state
};

prototypeAccessors.state.set = function (v) {
  assert(false, "Use store.replaceState() to explicit replace store state.")
};

Store.prototype.commit = function commit (type, payload, options) {
    var this$1 = this;

  // check object-style commit
  if (isObject(type) && type.type) {
    options = payload
    payload = type
    type = type.type
  }
  var mutation = { type: type, payload: payload }
  var entry = this._mutations[type]
  if (!entry) {
    console.error(("[vuex] unknown mutation type: " + type))
    return
  }
  this._withCommit(function () {
    entry.forEach(function commitIterator (handler) {
      handler(payload)
    })
  })
  if (!options || !options.silent) {
    this._subscribers.forEach(function (sub) { return sub(mutation, this$1.state); })
  }
};

Store.prototype.dispatch = function dispatch (type, payload) {
  // check object-style dispatch
  if (isObject(type) && type.type) {
    payload = type
    type = type.type
  }
  var entry = this._actions[type]
  if (!entry) {
    console.error(("[vuex] unknown action type: " + type))
    return
  }
  return entry.length > 1
    ? Promise.all(entry.map(function (handler) { return handler(payload); }))
    : entry[0](payload)
};

Store.prototype.subscribe = function subscribe (fn) {
  var subs = this._subscribers
  if (subs.indexOf(fn) < 0) {
    subs.push(fn)
  }
  return function () {
    var i = subs.indexOf(fn)
    if (i > -1) {
      subs.splice(i, 1)
    }
  }
};

Store.prototype.watch = function watch (getter, cb, options) {
    var this$1 = this;

  assert(typeof getter === 'function', "store.watch only accepts a function.")
  return this._watcherVM.$watch(function () { return getter(this$1.state); }, cb, options)
};

Store.prototype.replaceState = function replaceState (state) {
    var this$1 = this;

  this._withCommit(function () {
    this$1._vm.state = state
  })
};

Store.prototype.registerModule = function registerModule (path, module) {
  if (typeof path === 'string') { path = [path] }
  assert(Array.isArray(path), "module path must be a string or an Array.")
  this._runtimeModules[path.join('.')] = module
  installModule(this, this.state, path, module)
  // reset store to update getters...
  resetStoreVM(this, this.state)
};

Store.prototype.unregisterModule = function unregisterModule (path) {
    var this$1 = this;

  if (typeof path === 'string') { path = [path] }
  assert(Array.isArray(path), "module path must be a string or an Array.")
    delete this._runtimeModules[path.join('.')]
  this._withCommit(function () {
    var parentState = getNestedState(this$1.state, path.slice(0, -1))
    Vue.delete(parentState, path[path.length - 1])
  })
  resetStore(this)
};

Store.prototype.hotUpdate = function hotUpdate (newOptions) {
  updateModule(this._options, newOptions)
  resetStore(this)
};

Store.prototype._withCommit = function _withCommit (fn) {
  var committing = this._committing
  this._committing = true
  fn()
  this._committing = committing
};

Object.defineProperties( Store.prototype, prototypeAccessors );

function updateModule (targetModule, newModule) {
  if (newModule.actions) {
    targetModule.actions = newModule.actions
  }
  if (newModule.mutations) {
    targetModule.mutations = newModule.mutations
  }
  if (newModule.getters) {
    targetModule.getters = newModule.getters
  }
  if (newModule.modules) {
    for (var key in newModule.modules) {
      if (!(targetModule.modules && targetModule.modules[key])) {
        console.warn(
          "[vuex] trying to add a new module '" + key + "' on hot reloading, " +
          'manual reload is needed'
        )
        return
      }
      updateModule(targetModule.modules[key], newModule.modules[key])
    }
  }
}

function resetStore (store) {
  store._actions = Object.create(null)
  store._mutations = Object.create(null)
  store._wrappedGetters = Object.create(null)
  var state = store.state
  // init root module
  installModule(store, state, [], store._options, true)
  // init all runtime modules
  Object.keys(store._runtimeModules).forEach(function (key) {
    installModule(store, state, key.split('.'), store._runtimeModules[key], true)
  })
  // reset vm
  resetStoreVM(store, state)
}

function resetStoreVM (store, state) {
  var oldVm = store._vm

  // bind store public getters
  store.getters = {}
  var wrappedGetters = store._wrappedGetters
  var computed = {}
  Object.keys(wrappedGetters).forEach(function (key) {
    var fn = wrappedGetters[key]
    // use computed to leverage its lazy-caching mechanism
    computed[key] = function () { return fn(store); }
    Object.defineProperty(store.getters, key, {
      get: function () { return store._vm[key]; }
    })
  })

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  var silent = Vue.config.silent
  Vue.config.silent = true
  store._vm = new Vue({
    data: { state: state },
    computed: computed
  })
  Vue.config.silent = silent

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store)
  }

  if (oldVm) {
    // dispatch changes in all subscribed watchers
    // to force getter re-evaluation.
    store._withCommit(function () {
      oldVm.state = null
    })
    Vue.nextTick(function () { return oldVm.$destroy(); })
  }
}

function installModule (store, rootState, path, module, hot) {
  var isRoot = !path.length
  var state = module.state;
  var actions = module.actions;
  var mutations = module.mutations;
  var getters = module.getters;
  var modules = module.modules;

  // set state
  if (!isRoot && !hot) {
    var parentState = getNestedState(rootState, path.slice(0, -1))
    var moduleName = path[path.length - 1]
    store._withCommit(function () {
      Vue.set(parentState, moduleName, state || {})
    })
  }

  if (mutations) {
    Object.keys(mutations).forEach(function (key) {
      registerMutation(store, key, mutations[key], path)
    })
  }

  if (actions) {
    Object.keys(actions).forEach(function (key) {
      registerAction(store, key, actions[key], path)
    })
  }

  if (getters) {
    wrapGetters(store, getters, path)
  }

  if (modules) {
    Object.keys(modules).forEach(function (key) {
      installModule(store, rootState, path.concat(key), modules[key], hot)
    })
  }
}

function registerMutation (store, type, handler, path) {
  if ( path === void 0 ) path = [];

  var entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler (payload) {
    handler(getNestedState(store.state, path), payload)
  })
}

function registerAction (store, type, handler, path) {
  if ( path === void 0 ) path = [];

  var entry = store._actions[type] || (store._actions[type] = [])
  var dispatch = store.dispatch;
  var commit = store.commit;
  entry.push(function wrappedActionHandler (payload, cb) {
    var res = handler({
      dispatch: dispatch,
      commit: commit,
      getters: store.getters,
      state: getNestedState(store.state, path),
      rootState: store.state
    }, payload, cb)
    if (!isPromise(res)) {
      res = Promise.resolve(res)
    }
    if (store._devtoolHook) {
      return res.catch(function (err) {
        store._devtoolHook.emit('vuex:error', err)
        throw err
      })
    } else {
      return res
    }
  })
}

function wrapGetters (store, moduleGetters, modulePath) {
  Object.keys(moduleGetters).forEach(function (getterKey) {
    var rawGetter = moduleGetters[getterKey]
    if (store._wrappedGetters[getterKey]) {
      console.error(("[vuex] duplicate getter key: " + getterKey))
      return
    }
    store._wrappedGetters[getterKey] = function wrappedGetter (store) {
      return rawGetter(
        getNestedState(store.state, modulePath), // local state
        store.getters, // getters
        store.state // root state
      )
    }
  })
}

function enableStrictMode (store) {
  store._vm.$watch('state', function () {
    assert(store._committing, "Do not mutate vuex store state outside mutation handlers.")
  }, { deep: true, sync: true })
}

function getNestedState (state, path) {
  return path.length
    ? path.reduce(function (state, key) { return state[key]; }, state)
    : state
}

function install (_Vue) {
  if (Vue) {
    console.error(
      '[vuex] already installed. Vue.use(Vuex) should be called only once.'
    )
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}

// auto install in dist mode
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

var index = {
  Store: Store,
  install: install,
  mapState: mapState,
  mapMutations: mapMutations,
  mapGetters: mapGetters,
  mapActions: mapActions
}

return index;

})));
},{}],5:[function(require,module,exports){
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

const taskForm = require('./TaskForm.vue');
const taskItem = require('./TaskItem.vue');
const store = require('./store.js');

module.exports = {
	components: {
		taskForm: taskForm,
		taskItem: taskItem,
	},
	data: function() {
		return store.state;
	},
	computed: {
	},
	methods: {
		delete_click: function(event) {
			this.tasks = this.tasks.filter(v=>!v.finished);
		},
	},
};

})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;return _h('div',{staticClass:"container"},[_h('h1',["Vue TODO"])," ",_h('div',[_h('task-form',{attrs:{"task":_vm.newTask}})])," ",_h('hr')," ",_h('div',{staticClass:"taskListOperator"},[_h('button',{staticClass:"btn btn-default",on:{"click":_vm.delete_click}},["Delete finished tasks"])])," ",_h('div',{staticClass:"list-group"},[_vm._l((_vm.tasks),function(task){return _h('task-item',{attrs:{"task":task}})})," ",_h('p',{directives:[{name:"show",rawName:"v-show",value:(_vm.tasks.length < 1),expression:"tasks.length < 1"}],staticClass:"text-muted"},["No tasks. Yay!"])])])}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1", __vue__options__)
  } else {
    hotAPI.reload("data-v-1", __vue__options__)
  }
})()}

},{"./TaskForm.vue":6,"./TaskItem.vue":7,"./store.js":9,"vue":3,"vue-hot-reload-api":2}],6:[function(require,module,exports){
;(function(){
//
//
//
//
//
//
//
//
//
//
//
//
//
//

const store = require('./store.js');

module.exports = {
	props: [
		'task',
	],
	methods: {
		form_submit: function(event) {
			if (!this.task.name) {
				return;
			}

			store.commit('add');
		},
	},
};

})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;return _h('form',{on:{"submit":function($event){$event.preventDefault();_vm.form_submit($event)}}},[_h('div',{staticClass:"input-group"},[_h('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.task.name),expression:"task.name"}],staticClass:"form-control",attrs:{"type":"text","placeholder":"Buy milk 2L"},domProps:{"value":_vm._s(_vm.task.name)},on:{"input":function($event){if($event.target.composing){ return; }_vm.task.name=$event.target.value}}})," ",_vm._m(0)])])}
__vue__options__.staticRenderFns = [function render () {var _vm=this;var _h=_vm.$createElement;return _h('span',{staticClass:"input-group-btn"},[_h('button',{staticClass:"btn btn-primary"},["Add new task"])])}]
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2", __vue__options__)
  } else {
    hotAPI.reload("data-v-2", __vue__options__)
  }
})()}

},{"./store.js":9,"vue":3,"vue-hot-reload-api":2}],7:[function(require,module,exports){
;(function(){
//
//
//
//
//
//
//
//
//
//
//

module.exports = {
	props: [
		'task',
	],
	methods: {
		edit_click: function(event) {
			// update if not canceled
			var newName = window.prompt('Task Name', this.task.name);
			if (typeof newName === 'string') {
				this.task.name = newName;
			}
		},
	},
};

})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;return _h('label',{staticClass:"list-group-item"},[_h('span',{staticClass:"pull-right btn btn-link",on:{"click":function($event){$event.preventDefault();_vm.edit_click($event)}}},["Edit"])," ",_h('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.task.finished),expression:"task.finished"}],attrs:{"type":"checkbox"},domProps:{"checked":Array.isArray(_vm.task.finished)?_vm._i(_vm.task.finished,null)>-1:_vm._q(_vm.task.finished,true)},on:{"change":function($event){var $$a=_vm.task.finished,$$el=$event.target,$$c=$$el.checked?(true):(false);if(Array.isArray($$a)){var $$v=null,$$i=_vm._i($$a,$$v);if($$c){$$i<0&&(_vm.task.finished=$$a.concat($$v))}else{$$i>-1&&(_vm.task.finished=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}}else{_vm.task.finished=$$c}}}}),"\n\t"+_vm._s(_vm.task.name)+"\n"])}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3", __vue__options__)
  } else {
    hotAPI.reload("data-v-3", __vue__options__)
  }
})()}

},{"vue":3,"vue-hot-reload-api":2}],8:[function(require,module,exports){
const Vue = require('vue');
const Vuex = require('vuex');
Vue.use(Vuex);

const App = require('./App.vue');

new Vue({
	el: '#app',
	render: function(createElement) {
		return createElement(App);
	},
});

},{"./App.vue":5,"vue":3,"vuex":4}],9:[function(require,module,exports){
const Vuex = require('vuex');

module.exports = new Vuex.Store({
	state: {
		newTask: { finished: false, name: '' },
		tasks: [
			{ finished: false, name: 'Buy milk 2L' },
			{ finished: false, name: 'Call to Alice' },
			{ finished: false, name: 'Return books' },
		],
	},
	mutations: {
		add: function(state) {
			state.tasks.unshift(state.newTask);
			state.newTask = { finished: false, name: '' };
		},
	},
});

},{"vuex":4}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS1ob3QtcmVsb2FkLWFwaS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy92dWUvZGlzdC92dWUucnVudGltZS5jb21tb24uanMiLCJub2RlX21vZHVsZXMvdnVleC9kaXN0L3Z1ZXguanMiLCJzcmMvQXBwLnZ1ZT8yZTJmZDk2YyIsInNyYy9UYXNrRm9ybS52dWU/MThlOTczOWUiLCJzcmMvVGFza0l0ZW0udnVlP2Q0NzYxZjAwIiwic3JjL21haW4uanMiLCJzcmMvc3RvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDanpMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9nQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQXRDQTtBQUFBOzs7Ozs7Ozs7Ozs7OztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FBNUJBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQXZCQTtBQUFBOzs7Ozs7Ozs7Ozs7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsInZhciBWdWUgLy8gbGF0ZSBiaW5kXG52YXIgbWFwID0gd2luZG93Ll9fVlVFX0hPVF9NQVBfXyA9IE9iamVjdC5jcmVhdGUobnVsbClcbnZhciBpbnN0YWxsZWQgPSBmYWxzZVxudmFyIGlzQnJvd3NlcmlmeSA9IGZhbHNlXG52YXIgaW5pdEhvb2tOYW1lID0gJ2JlZm9yZUNyZWF0ZSdcblxuZXhwb3J0cy5pbnN0YWxsID0gZnVuY3Rpb24gKHZ1ZSwgYnJvd3NlcmlmeSkge1xuICBpZiAoaW5zdGFsbGVkKSByZXR1cm5cbiAgaW5zdGFsbGVkID0gdHJ1ZVxuXG4gIFZ1ZSA9IHZ1ZVxuICBpc0Jyb3dzZXJpZnkgPSBicm93c2VyaWZ5XG5cbiAgLy8gY29tcGF0IHdpdGggPCAyLjAuMC1hbHBoYS43XG4gIGlmIChWdWUuY29uZmlnLl9saWZlY3ljbGVIb29rcy5pbmRleE9mKCdpbml0JykgPiAtMSkge1xuICAgIGluaXRIb29rTmFtZSA9ICdpbml0J1xuICB9XG5cbiAgZXhwb3J0cy5jb21wYXRpYmxlID0gTnVtYmVyKFZ1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMF0pID49IDJcbiAgaWYgKCFleHBvcnRzLmNvbXBhdGlibGUpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnW0hNUl0gWW91IGFyZSB1c2luZyBhIHZlcnNpb24gb2YgdnVlLWhvdC1yZWxvYWQtYXBpIHRoYXQgaXMgJyArXG4gICAgICAnb25seSBjb21wYXRpYmxlIHdpdGggVnVlLmpzIGNvcmUgXjIuMC4wLidcbiAgICApXG4gICAgcmV0dXJuXG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgYSByZWNvcmQgZm9yIGEgaG90IG1vZHVsZSwgd2hpY2gga2VlcHMgdHJhY2sgb2YgaXRzIGNvbnN0cnVjdG9yXG4gKiBhbmQgaW5zdGFuY2VzXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlkXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmV4cG9ydHMuY3JlYXRlUmVjb3JkID0gZnVuY3Rpb24gKGlkLCBvcHRpb25zKSB7XG4gIHZhciBDdG9yID0gbnVsbFxuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBDdG9yID0gb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBDdG9yLm9wdGlvbnNcbiAgfVxuICBtYWtlT3B0aW9uc0hvdChpZCwgb3B0aW9ucylcbiAgbWFwW2lkXSA9IHtcbiAgICBDdG9yOiBWdWUuZXh0ZW5kKG9wdGlvbnMpLFxuICAgIGluc3RhbmNlczogW11cbiAgfVxufVxuXG4vKipcbiAqIE1ha2UgYSBDb21wb25lbnQgb3B0aW9ucyBvYmplY3QgaG90LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBtYWtlT3B0aW9uc0hvdCAoaWQsIG9wdGlvbnMpIHtcbiAgaW5qZWN0SG9vayhvcHRpb25zLCBpbml0SG9va05hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICBtYXBbaWRdLmluc3RhbmNlcy5wdXNoKHRoaXMpXG4gIH0pXG4gIGluamVjdEhvb2sob3B0aW9ucywgJ2JlZm9yZURlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGluc3RhbmNlcyA9IG1hcFtpZF0uaW5zdGFuY2VzXG4gICAgaW5zdGFuY2VzLnNwbGljZShpbnN0YW5jZXMuaW5kZXhPZih0aGlzKSwgMSlcbiAgfSlcbn1cblxuLyoqXG4gKiBJbmplY3QgYSBob29rIHRvIGEgaG90IHJlbG9hZGFibGUgY29tcG9uZW50IHNvIHRoYXRcbiAqIHdlIGNhbiBrZWVwIHRyYWNrIG9mIGl0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gaG9va1xuICovXG5cbmZ1bmN0aW9uIGluamVjdEhvb2sgKG9wdGlvbnMsIG5hbWUsIGhvb2spIHtcbiAgdmFyIGV4aXN0aW5nID0gb3B0aW9uc1tuYW1lXVxuICBvcHRpb25zW25hbWVdID0gZXhpc3RpbmdcbiAgICA/IEFycmF5LmlzQXJyYXkoZXhpc3RpbmcpXG4gICAgICA/IGV4aXN0aW5nLmNvbmNhdChob29rKVxuICAgICAgOiBbZXhpc3RpbmcsIGhvb2tdXG4gICAgOiBbaG9va11cbn1cblxuZnVuY3Rpb24gdHJ5V3JhcCAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChpZCwgYXJnKSB7XG4gICAgdHJ5IHsgZm4oaWQsIGFyZykgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKVxuICAgICAgY29uc29sZS53YXJuKCdTb21ldGhpbmcgd2VudCB3cm9uZyBkdXJpbmcgVnVlIGNvbXBvbmVudCBob3QtcmVsb2FkLiBGdWxsIHJlbG9hZCByZXF1aXJlZC4nKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnRzLnJlcmVuZGVyID0gdHJ5V3JhcChmdW5jdGlvbiAoaWQsIGZucykge1xuICB2YXIgcmVjb3JkID0gbWFwW2lkXVxuICByZWNvcmQuQ3Rvci5vcHRpb25zLnJlbmRlciA9IGZucy5yZW5kZXJcbiAgcmVjb3JkLkN0b3Iub3B0aW9ucy5zdGF0aWNSZW5kZXJGbnMgPSBmbnMuc3RhdGljUmVuZGVyRm5zXG4gIHJlY29yZC5pbnN0YW5jZXMuc2xpY2UoKS5mb3JFYWNoKGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgIGluc3RhbmNlLiRvcHRpb25zLnJlbmRlciA9IGZucy5yZW5kZXJcbiAgICBpbnN0YW5jZS4kb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnMgPSBmbnMuc3RhdGljUmVuZGVyRm5zXG4gICAgaW5zdGFuY2UuX3N0YXRpY1RyZWVzID0gW10gLy8gcmVzZXQgc3RhdGljIHRyZWVzXG4gICAgaW5zdGFuY2UuJGZvcmNlVXBkYXRlKClcbiAgfSlcbn0pXG5cbmV4cG9ydHMucmVsb2FkID0gdHJ5V3JhcChmdW5jdGlvbiAoaWQsIG9wdGlvbnMpIHtcbiAgbWFrZU9wdGlvbnNIb3QoaWQsIG9wdGlvbnMpXG4gIHZhciByZWNvcmQgPSBtYXBbaWRdXG4gIHJlY29yZC5DdG9yLmV4dGVuZE9wdGlvbnMgPSBvcHRpb25zXG4gIHZhciBuZXdDdG9yID0gVnVlLmV4dGVuZChvcHRpb25zKVxuICByZWNvcmQuQ3Rvci5vcHRpb25zID0gbmV3Q3Rvci5vcHRpb25zXG4gIHJlY29yZC5DdG9yLmNpZCA9IG5ld0N0b3IuY2lkXG4gIGlmIChuZXdDdG9yLnJlbGVhc2UpIHtcbiAgICAvLyB0ZW1wb3JhcnkgZ2xvYmFsIG1peGluIHN0cmF0ZWd5IHVzZWQgaW4gPCAyLjAuMC1hbHBoYS42XG4gICAgbmV3Q3Rvci5yZWxlYXNlKClcbiAgfVxuICByZWNvcmQuaW5zdGFuY2VzLnNsaWNlKCkuZm9yRWFjaChmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICBpZiAoaW5zdGFuY2UuJHBhcmVudCkge1xuICAgICAgaW5zdGFuY2UuJHBhcmVudC4kZm9yY2VVcGRhdGUoKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1Jvb3Qgb3IgbWFudWFsbHkgbW91bnRlZCBpbnN0YW5jZSBtb2RpZmllZC4gRnVsbCByZWxvYWQgcmVxdWlyZWQuJylcbiAgICB9XG4gIH0pXG59KVxuIiwiLyohXG4gKiBWdWUuanMgdjIuMS40XG4gKiAoYykgMjAxNC0yMDE2IEV2YW4gWW91XG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLyogICovXG5cbi8qKlxuICogQ29udmVydCBhIHZhbHVlIHRvIGEgc3RyaW5nIHRoYXQgaXMgYWN0dWFsbHkgcmVuZGVyZWQuXG4gKi9cbmZ1bmN0aW9uIF90b1N0cmluZyAodmFsKSB7XG4gIHJldHVybiB2YWwgPT0gbnVsbFxuICAgID8gJydcbiAgICA6IHR5cGVvZiB2YWwgPT09ICdvYmplY3QnXG4gICAgICA/IEpTT04uc3RyaW5naWZ5KHZhbCwgbnVsbCwgMilcbiAgICAgIDogU3RyaW5nKHZhbClcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgaW5wdXQgdmFsdWUgdG8gYSBudW1iZXIgZm9yIHBlcnNpc3RlbmNlLlxuICogSWYgdGhlIGNvbnZlcnNpb24gZmFpbHMsIHJldHVybiBvcmlnaW5hbCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIHRvTnVtYmVyICh2YWwpIHtcbiAgdmFyIG4gPSBwYXJzZUZsb2F0KHZhbCwgMTApO1xuICByZXR1cm4gKG4gfHwgbiA9PT0gMCkgPyBuIDogdmFsXG59XG5cbi8qKlxuICogTWFrZSBhIG1hcCBhbmQgcmV0dXJuIGEgZnVuY3Rpb24gZm9yIGNoZWNraW5nIGlmIGEga2V5XG4gKiBpcyBpbiB0aGF0IG1hcC5cbiAqL1xuZnVuY3Rpb24gbWFrZU1hcCAoXG4gIHN0cixcbiAgZXhwZWN0c0xvd2VyQ2FzZVxuKSB7XG4gIHZhciBtYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB2YXIgbGlzdCA9IHN0ci5zcGxpdCgnLCcpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBtYXBbbGlzdFtpXV0gPSB0cnVlO1xuICB9XG4gIHJldHVybiBleHBlY3RzTG93ZXJDYXNlXG4gICAgPyBmdW5jdGlvbiAodmFsKSB7IHJldHVybiBtYXBbdmFsLnRvTG93ZXJDYXNlKCldOyB9XG4gICAgOiBmdW5jdGlvbiAodmFsKSB7IHJldHVybiBtYXBbdmFsXTsgfVxufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgdGFnIGlzIGEgYnVpbHQtaW4gdGFnLlxuICovXG52YXIgaXNCdWlsdEluVGFnID0gbWFrZU1hcCgnc2xvdCxjb21wb25lbnQnLCB0cnVlKTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaXRlbSBmcm9tIGFuIGFycmF5XG4gKi9cbmZ1bmN0aW9uIHJlbW92ZSQxIChhcnIsIGl0ZW0pIHtcbiAgaWYgKGFyci5sZW5ndGgpIHtcbiAgICB2YXIgaW5kZXggPSBhcnIuaW5kZXhPZihpdGVtKTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgcmV0dXJuIGFyci5zcGxpY2UoaW5kZXgsIDEpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgb2JqZWN0IGhhcyB0aGUgcHJvcGVydHkuXG4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5mdW5jdGlvbiBoYXNPd24gKG9iaiwga2V5KSB7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KVxufVxuXG4vKipcbiAqIENoZWNrIGlmIHZhbHVlIGlzIHByaW1pdGl2ZVxuICovXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZSAodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJ1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGNhY2hlZCB2ZXJzaW9uIG9mIGEgcHVyZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY2FjaGVkIChmbikge1xuICB2YXIgY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICByZXR1cm4gZnVuY3Rpb24gY2FjaGVkRm4gKHN0cikge1xuICAgIHZhciBoaXQgPSBjYWNoZVtzdHJdO1xuICAgIHJldHVybiBoaXQgfHwgKGNhY2hlW3N0cl0gPSBmbihzdHIpKVxuICB9XG59XG5cbi8qKlxuICogQ2FtZWxpemUgYSBoeXBoZW4tZGVsbWl0ZWQgc3RyaW5nLlxuICovXG52YXIgY2FtZWxpemVSRSA9IC8tKFxcdykvZztcbnZhciBjYW1lbGl6ZSA9IGNhY2hlZChmdW5jdGlvbiAoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShjYW1lbGl6ZVJFLCBmdW5jdGlvbiAoXywgYykgeyByZXR1cm4gYyA/IGMudG9VcHBlckNhc2UoKSA6ICcnOyB9KVxufSk7XG5cbi8qKlxuICogQ2FwaXRhbGl6ZSBhIHN0cmluZy5cbiAqL1xudmFyIGNhcGl0YWxpemUgPSBjYWNoZWQoZnVuY3Rpb24gKHN0cikge1xuICByZXR1cm4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpXG59KTtcblxuLyoqXG4gKiBIeXBoZW5hdGUgYSBjYW1lbENhc2Ugc3RyaW5nLlxuICovXG52YXIgaHlwaGVuYXRlUkUgPSAvKFteLV0pKFtBLVpdKS9nO1xudmFyIGh5cGhlbmF0ZSA9IGNhY2hlZChmdW5jdGlvbiAoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZShoeXBoZW5hdGVSRSwgJyQxLSQyJylcbiAgICAucmVwbGFjZShoeXBoZW5hdGVSRSwgJyQxLSQyJylcbiAgICAudG9Mb3dlckNhc2UoKVxufSk7XG5cbi8qKlxuICogU2ltcGxlIGJpbmQsIGZhc3RlciB0aGFuIG5hdGl2ZVxuICovXG5mdW5jdGlvbiBiaW5kJDEgKGZuLCBjdHgpIHtcbiAgZnVuY3Rpb24gYm91bmRGbiAoYSkge1xuICAgIHZhciBsID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICByZXR1cm4gbFxuICAgICAgPyBsID4gMVxuICAgICAgICA/IGZuLmFwcGx5KGN0eCwgYXJndW1lbnRzKVxuICAgICAgICA6IGZuLmNhbGwoY3R4LCBhKVxuICAgICAgOiBmbi5jYWxsKGN0eClcbiAgfVxuICAvLyByZWNvcmQgb3JpZ2luYWwgZm4gbGVuZ3RoXG4gIGJvdW5kRm4uX2xlbmd0aCA9IGZuLmxlbmd0aDtcbiAgcmV0dXJuIGJvdW5kRm5cbn1cblxuLyoqXG4gKiBDb252ZXJ0IGFuIEFycmF5LWxpa2Ugb2JqZWN0IHRvIGEgcmVhbCBBcnJheS5cbiAqL1xuZnVuY3Rpb24gdG9BcnJheSAobGlzdCwgc3RhcnQpIHtcbiAgc3RhcnQgPSBzdGFydCB8fCAwO1xuICB2YXIgaSA9IGxpc3QubGVuZ3RoIC0gc3RhcnQ7XG4gIHZhciByZXQgPSBuZXcgQXJyYXkoaSk7XG4gIHdoaWxlIChpLS0pIHtcbiAgICByZXRbaV0gPSBsaXN0W2kgKyBzdGFydF07XG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG4vKipcbiAqIE1peCBwcm9wZXJ0aWVzIGludG8gdGFyZ2V0IG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gZXh0ZW5kICh0bywgX2Zyb20pIHtcbiAgZm9yICh2YXIga2V5IGluIF9mcm9tKSB7XG4gICAgdG9ba2V5XSA9IF9mcm9tW2tleV07XG4gIH1cbiAgcmV0dXJuIHRvXG59XG5cbi8qKlxuICogUXVpY2sgb2JqZWN0IGNoZWNrIC0gdGhpcyBpcyBwcmltYXJpbHkgdXNlZCB0byB0ZWxsXG4gKiBPYmplY3RzIGZyb20gcHJpbWl0aXZlIHZhbHVlcyB3aGVuIHdlIGtub3cgdGhlIHZhbHVlXG4gKiBpcyBhIEpTT04tY29tcGxpYW50IHR5cGUuXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0IChvYmopIHtcbiAgcmV0dXJuIG9iaiAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0J1xufVxuXG4vKipcbiAqIFN0cmljdCBvYmplY3QgdHlwZSBjaGVjay4gT25seSByZXR1cm5zIHRydWVcbiAqIGZvciBwbGFpbiBKYXZhU2NyaXB0IG9iamVjdHMuXG4gKi9cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgT0JKRUNUX1NUUklORyA9ICdbb2JqZWN0IE9iamVjdF0nO1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCAob2JqKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09IE9CSkVDVF9TVFJJTkdcbn1cblxuLyoqXG4gKiBNZXJnZSBhbiBBcnJheSBvZiBPYmplY3RzIGludG8gYSBzaW5nbGUgT2JqZWN0LlxuICovXG5mdW5jdGlvbiB0b09iamVjdCAoYXJyKSB7XG4gIHZhciByZXMgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYXJyW2ldKSB7XG4gICAgICBleHRlbmQocmVzLCBhcnJbaV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbi8qKlxuICogUGVyZm9ybSBubyBvcGVyYXRpb24uXG4gKi9cbmZ1bmN0aW9uIG5vb3AgKCkge31cblxuLyoqXG4gKiBBbHdheXMgcmV0dXJuIGZhbHNlLlxuICovXG52YXIgbm8gPSBmdW5jdGlvbiAoKSB7IHJldHVybiBmYWxzZTsgfTtcblxuLyoqXG4gKiBHZW5lcmF0ZSBhIHN0YXRpYyBrZXlzIHN0cmluZyBmcm9tIGNvbXBpbGVyIG1vZHVsZXMuXG4gKi9cbmZ1bmN0aW9uIGdlblN0YXRpY0tleXMgKG1vZHVsZXMpIHtcbiAgcmV0dXJuIG1vZHVsZXMucmVkdWNlKGZ1bmN0aW9uIChrZXlzLCBtKSB7XG4gICAgcmV0dXJuIGtleXMuY29uY2F0KG0uc3RhdGljS2V5cyB8fCBbXSlcbiAgfSwgW10pLmpvaW4oJywnKVxufVxuXG4vKipcbiAqIENoZWNrIGlmIHR3byB2YWx1ZXMgYXJlIGxvb3NlbHkgZXF1YWwgLSB0aGF0IGlzLFxuICogaWYgdGhleSBhcmUgcGxhaW4gb2JqZWN0cywgZG8gdGhleSBoYXZlIHRoZSBzYW1lIHNoYXBlP1xuICovXG5mdW5jdGlvbiBsb29zZUVxdWFsIChhLCBiKSB7XG4gIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuICByZXR1cm4gYSA9PSBiIHx8IChcbiAgICBpc09iamVjdChhKSAmJiBpc09iamVjdChiKVxuICAgICAgPyBKU09OLnN0cmluZ2lmeShhKSA9PT0gSlNPTi5zdHJpbmdpZnkoYilcbiAgICAgIDogZmFsc2VcbiAgKVxuICAvKiBlc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xufVxuXG5mdW5jdGlvbiBsb29zZUluZGV4T2YgKGFyciwgdmFsKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGxvb3NlRXF1YWwoYXJyW2ldLCB2YWwpKSB7IHJldHVybiBpIH1cbiAgfVxuICByZXR1cm4gLTFcbn1cblxuLyogICovXG5cbnZhciBjb25maWcgPSB7XG4gIC8qKlxuICAgKiBPcHRpb24gbWVyZ2Ugc3RyYXRlZ2llcyAodXNlZCBpbiBjb3JlL3V0aWwvb3B0aW9ucylcbiAgICovXG4gIG9wdGlvbk1lcmdlU3RyYXRlZ2llczogT2JqZWN0LmNyZWF0ZShudWxsKSxcblxuICAvKipcbiAgICogV2hldGhlciB0byBzdXBwcmVzcyB3YXJuaW5ncy5cbiAgICovXG4gIHNpbGVudDogZmFsc2UsXG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gZW5hYmxlIGRldnRvb2xzXG4gICAqL1xuICBkZXZ0b29sczogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyxcblxuICAvKipcbiAgICogRXJyb3IgaGFuZGxlciBmb3Igd2F0Y2hlciBlcnJvcnNcbiAgICovXG4gIGVycm9ySGFuZGxlcjogbnVsbCxcblxuICAvKipcbiAgICogSWdub3JlIGNlcnRhaW4gY3VzdG9tIGVsZW1lbnRzXG4gICAqL1xuICBpZ25vcmVkRWxlbWVudHM6IG51bGwsXG5cbiAgLyoqXG4gICAqIEN1c3RvbSB1c2VyIGtleSBhbGlhc2VzIGZvciB2LW9uXG4gICAqL1xuICBrZXlDb2RlczogT2JqZWN0LmNyZWF0ZShudWxsKSxcblxuICAvKipcbiAgICogQ2hlY2sgaWYgYSB0YWcgaXMgcmVzZXJ2ZWQgc28gdGhhdCBpdCBjYW5ub3QgYmUgcmVnaXN0ZXJlZCBhcyBhXG4gICAqIGNvbXBvbmVudC4gVGhpcyBpcyBwbGF0Zm9ybS1kZXBlbmRlbnQgYW5kIG1heSBiZSBvdmVyd3JpdHRlbi5cbiAgICovXG4gIGlzUmVzZXJ2ZWRUYWc6IG5vLFxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhIHRhZyBpcyBhbiB1bmtub3duIGVsZW1lbnQuXG4gICAqIFBsYXRmb3JtLWRlcGVuZGVudC5cbiAgICovXG4gIGlzVW5rbm93bkVsZW1lbnQ6IG5vLFxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5hbWVzcGFjZSBvZiBhbiBlbGVtZW50XG4gICAqL1xuICBnZXRUYWdOYW1lc3BhY2U6IG5vb3AsXG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGFuIGF0dHJpYnV0ZSBtdXN0IGJlIGJvdW5kIHVzaW5nIHByb3BlcnR5LCBlLmcuIHZhbHVlXG4gICAqIFBsYXRmb3JtLWRlcGVuZGVudC5cbiAgICovXG4gIG11c3RVc2VQcm9wOiBubyxcblxuICAvKipcbiAgICogTGlzdCBvZiBhc3NldCB0eXBlcyB0aGF0IGEgY29tcG9uZW50IGNhbiBvd24uXG4gICAqL1xuICBfYXNzZXRUeXBlczogW1xuICAgICdjb21wb25lbnQnLFxuICAgICdkaXJlY3RpdmUnLFxuICAgICdmaWx0ZXInXG4gIF0sXG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgbGlmZWN5Y2xlIGhvb2tzLlxuICAgKi9cbiAgX2xpZmVjeWNsZUhvb2tzOiBbXG4gICAgJ2JlZm9yZUNyZWF0ZScsXG4gICAgJ2NyZWF0ZWQnLFxuICAgICdiZWZvcmVNb3VudCcsXG4gICAgJ21vdW50ZWQnLFxuICAgICdiZWZvcmVVcGRhdGUnLFxuICAgICd1cGRhdGVkJyxcbiAgICAnYmVmb3JlRGVzdHJveScsXG4gICAgJ2Rlc3Ryb3llZCcsXG4gICAgJ2FjdGl2YXRlZCcsXG4gICAgJ2RlYWN0aXZhdGVkJ1xuICBdLFxuXG4gIC8qKlxuICAgKiBNYXggY2lyY3VsYXIgdXBkYXRlcyBhbGxvd2VkIGluIGEgc2NoZWR1bGVyIGZsdXNoIGN5Y2xlLlxuICAgKi9cbiAgX21heFVwZGF0ZUNvdW50OiAxMDBcbn07XG5cbi8qICAqL1xuXG4vKipcbiAqIENoZWNrIGlmIGEgc3RyaW5nIHN0YXJ0cyB3aXRoICQgb3IgX1xuICovXG5mdW5jdGlvbiBpc1Jlc2VydmVkIChzdHIpIHtcbiAgdmFyIGMgPSAoc3RyICsgJycpLmNoYXJDb2RlQXQoMCk7XG4gIHJldHVybiBjID09PSAweDI0IHx8IGMgPT09IDB4NUZcbn1cblxuLyoqXG4gKiBEZWZpbmUgYSBwcm9wZXJ0eS5cbiAqL1xuZnVuY3Rpb24gZGVmIChvYmosIGtleSwgdmFsLCBlbnVtZXJhYmxlKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgIHZhbHVlOiB2YWwsXG4gICAgZW51bWVyYWJsZTogISFlbnVtZXJhYmxlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbn1cblxuLyoqXG4gKiBQYXJzZSBzaW1wbGUgcGF0aC5cbiAqL1xudmFyIGJhaWxSRSA9IC9bXlxcdy4kXS87XG5mdW5jdGlvbiBwYXJzZVBhdGggKHBhdGgpIHtcbiAgaWYgKGJhaWxSRS50ZXN0KHBhdGgpKSB7XG4gICAgcmV0dXJuXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLicpO1xuICAgIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlZ21lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghb2JqKSB7IHJldHVybiB9XG4gICAgICAgIG9iaiA9IG9ialtzZWdtZW50c1tpXV07XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqXG4gICAgfVxuICB9XG59XG5cbi8qICAqL1xuLyogZ2xvYmFscyBNdXRhdGlvbk9ic2VydmVyICovXG5cbi8vIGNhbiB3ZSB1c2UgX19wcm90b19fP1xudmFyIGhhc1Byb3RvID0gJ19fcHJvdG9fXycgaW4ge307XG5cbi8vIEJyb3dzZXIgZW52aXJvbm1lbnQgc25pZmZpbmdcbnZhciBpbkJyb3dzZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbnZhciBVQSA9IGluQnJvd3NlciAmJiB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xudmFyIGlzSUUgPSBVQSAmJiAvbXNpZXx0cmlkZW50Ly50ZXN0KFVBKTtcbnZhciBpc0lFOSA9IFVBICYmIFVBLmluZGV4T2YoJ21zaWUgOS4wJykgPiAwO1xudmFyIGlzRWRnZSA9IFVBICYmIFVBLmluZGV4T2YoJ2VkZ2UvJykgPiAwO1xudmFyIGlzQW5kcm9pZCA9IFVBICYmIFVBLmluZGV4T2YoJ2FuZHJvaWQnKSA+IDA7XG52YXIgaXNJT1MgPSBVQSAmJiAvaXBob25lfGlwYWR8aXBvZHxpb3MvLnRlc3QoVUEpO1xuXG4vLyB0aGlzIG5lZWRzIHRvIGJlIGxhenktZXZhbGVkIGJlY2F1c2UgdnVlIG1heSBiZSByZXF1aXJlZCBiZWZvcmVcbi8vIHZ1ZS1zZXJ2ZXItcmVuZGVyZXIgY2FuIHNldCBWVUVfRU5WXG52YXIgX2lzU2VydmVyO1xudmFyIGlzU2VydmVyUmVuZGVyaW5nID0gZnVuY3Rpb24gKCkge1xuICBpZiAoX2lzU2VydmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIWluQnJvd3NlciAmJiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gZGV0ZWN0IHByZXNlbmNlIG9mIHZ1ZS1zZXJ2ZXItcmVuZGVyZXIgYW5kIGF2b2lkXG4gICAgICAvLyBXZWJwYWNrIHNoaW1taW5nIHRoZSBwcm9jZXNzXG4gICAgICBfaXNTZXJ2ZXIgPSBnbG9iYWxbJ3Byb2Nlc3MnXS5lbnYuVlVFX0VOViA9PT0gJ3NlcnZlcic7XG4gICAgfSBlbHNlIHtcbiAgICAgIF9pc1NlcnZlciA9IGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gX2lzU2VydmVyXG59O1xuXG4vLyBkZXRlY3QgZGV2dG9vbHNcbnZhciBkZXZ0b29scyA9IGluQnJvd3NlciAmJiB3aW5kb3cuX19WVUVfREVWVE9PTFNfR0xPQkFMX0hPT0tfXztcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIGlzTmF0aXZlIChDdG9yKSB7XG4gIHJldHVybiAvbmF0aXZlIGNvZGUvLnRlc3QoQ3Rvci50b1N0cmluZygpKVxufVxuXG4vKipcbiAqIERlZmVyIGEgdGFzayB0byBleGVjdXRlIGl0IGFzeW5jaHJvbm91c2x5LlxuICovXG52YXIgbmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgY2FsbGJhY2tzID0gW107XG4gIHZhciBwZW5kaW5nID0gZmFsc2U7XG4gIHZhciB0aW1lckZ1bmM7XG5cbiAgZnVuY3Rpb24gbmV4dFRpY2tIYW5kbGVyICgpIHtcbiAgICBwZW5kaW5nID0gZmFsc2U7XG4gICAgdmFyIGNvcGllcyA9IGNhbGxiYWNrcy5zbGljZSgwKTtcbiAgICBjYWxsYmFja3MubGVuZ3RoID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvcGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29waWVzW2ldKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gdGhlIG5leHRUaWNrIGJlaGF2aW9yIGxldmVyYWdlcyB0aGUgbWljcm90YXNrIHF1ZXVlLCB3aGljaCBjYW4gYmUgYWNjZXNzZWRcbiAgLy8gdmlhIGVpdGhlciBuYXRpdmUgUHJvbWlzZS50aGVuIG9yIE11dGF0aW9uT2JzZXJ2ZXIuXG4gIC8vIE11dGF0aW9uT2JzZXJ2ZXIgaGFzIHdpZGVyIHN1cHBvcnQsIGhvd2V2ZXIgaXQgaXMgc2VyaW91c2x5IGJ1Z2dlZCBpblxuICAvLyBVSVdlYlZpZXcgaW4gaU9TID49IDkuMy4zIHdoZW4gdHJpZ2dlcmVkIGluIHRvdWNoIGV2ZW50IGhhbmRsZXJzLiBJdFxuICAvLyBjb21wbGV0ZWx5IHN0b3BzIHdvcmtpbmcgYWZ0ZXIgdHJpZ2dlcmluZyBhIGZldyB0aW1lcy4uLiBzbywgaWYgbmF0aXZlXG4gIC8vIFByb21pc2UgaXMgYXZhaWxhYmxlLCB3ZSB3aWxsIHVzZSBpdDpcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICh0eXBlb2YgUHJvbWlzZSAhPT0gJ3VuZGVmaW5lZCcgJiYgaXNOYXRpdmUoUHJvbWlzZSkpIHtcbiAgICB2YXIgcCA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIHZhciBsb2dFcnJvciA9IGZ1bmN0aW9uIChlcnIpIHsgY29uc29sZS5lcnJvcihlcnIpOyB9O1xuICAgIHRpbWVyRnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHAudGhlbihuZXh0VGlja0hhbmRsZXIpLmNhdGNoKGxvZ0Vycm9yKTtcbiAgICAgIC8vIGluIHByb2JsZW1hdGljIFVJV2ViVmlld3MsIFByb21pc2UudGhlbiBkb2Vzbid0IGNvbXBsZXRlbHkgYnJlYWssIGJ1dFxuICAgICAgLy8gaXQgY2FuIGdldCBzdHVjayBpbiBhIHdlaXJkIHN0YXRlIHdoZXJlIGNhbGxiYWNrcyBhcmUgcHVzaGVkIGludG8gdGhlXG4gICAgICAvLyBtaWNyb3Rhc2sgcXVldWUgYnV0IHRoZSBxdWV1ZSBpc24ndCBiZWluZyBmbHVzaGVkLCB1bnRpbCB0aGUgYnJvd3NlclxuICAgICAgLy8gbmVlZHMgdG8gZG8gc29tZSBvdGhlciB3b3JrLCBlLmcuIGhhbmRsZSBhIHRpbWVyLiBUaGVyZWZvcmUgd2UgY2FuXG4gICAgICAvLyBcImZvcmNlXCIgdGhlIG1pY3JvdGFzayBxdWV1ZSB0byBiZSBmbHVzaGVkIGJ5IGFkZGluZyBhbiBlbXB0eSB0aW1lci5cbiAgICAgIGlmIChpc0lPUykgeyBzZXRUaW1lb3V0KG5vb3ApOyB9XG4gICAgfTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgTXV0YXRpb25PYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgKFxuICAgIGlzTmF0aXZlKE11dGF0aW9uT2JzZXJ2ZXIpIHx8XG4gICAgLy8gUGhhbnRvbUpTIGFuZCBpT1MgNy54XG4gICAgTXV0YXRpb25PYnNlcnZlci50b1N0cmluZygpID09PSAnW29iamVjdCBNdXRhdGlvbk9ic2VydmVyQ29uc3RydWN0b3JdJ1xuICApKSB7XG4gICAgLy8gdXNlIE11dGF0aW9uT2JzZXJ2ZXIgd2hlcmUgbmF0aXZlIFByb21pc2UgaXMgbm90IGF2YWlsYWJsZSxcbiAgICAvLyBlLmcuIFBoYW50b21KUyBJRTExLCBpT1M3LCBBbmRyb2lkIDQuNFxuICAgIHZhciBjb3VudGVyID0gMTtcbiAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihuZXh0VGlja0hhbmRsZXIpO1xuICAgIHZhciB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFN0cmluZyhjb3VudGVyKSk7XG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZSh0ZXh0Tm9kZSwge1xuICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZVxuICAgIH0pO1xuICAgIHRpbWVyRnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvdW50ZXIgPSAoY291bnRlciArIDEpICUgMjtcbiAgICAgIHRleHROb2RlLmRhdGEgPSBTdHJpbmcoY291bnRlcik7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBmYWxsYmFjayB0byBzZXRUaW1lb3V0XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICB0aW1lckZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRUaW1lb3V0KG5leHRUaWNrSGFuZGxlciwgMCk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBxdWV1ZU5leHRUaWNrIChjYiwgY3R4KSB7XG4gICAgdmFyIF9yZXNvbHZlO1xuICAgIGNhbGxiYWNrcy5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChjYikgeyBjYi5jYWxsKGN0eCk7IH1cbiAgICAgIGlmIChfcmVzb2x2ZSkgeyBfcmVzb2x2ZShjdHgpOyB9XG4gICAgfSk7XG4gICAgaWYgKCFwZW5kaW5nKSB7XG4gICAgICBwZW5kaW5nID0gdHJ1ZTtcbiAgICAgIHRpbWVyRnVuYygpO1xuICAgIH1cbiAgICBpZiAoIWNiICYmIHR5cGVvZiBQcm9taXNlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG59KSgpO1xuXG52YXIgX1NldDtcbi8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuaWYgKHR5cGVvZiBTZXQgIT09ICd1bmRlZmluZWQnICYmIGlzTmF0aXZlKFNldCkpIHtcbiAgLy8gdXNlIG5hdGl2ZSBTZXQgd2hlbiBhdmFpbGFibGUuXG4gIF9TZXQgPSBTZXQ7XG59IGVsc2Uge1xuICAvLyBhIG5vbi1zdGFuZGFyZCBTZXQgcG9seWZpbGwgdGhhdCBvbmx5IHdvcmtzIHdpdGggcHJpbWl0aXZlIGtleXMuXG4gIF9TZXQgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNldCAoKSB7XG4gICAgICB0aGlzLnNldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgfVxuICAgIFNldC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gaGFzIChrZXkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldFtrZXldICE9PSB1bmRlZmluZWRcbiAgICB9O1xuICAgIFNldC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkIChrZXkpIHtcbiAgICAgIHRoaXMuc2V0W2tleV0gPSAxO1xuICAgIH07XG4gICAgU2V0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uIGNsZWFyICgpIHtcbiAgICAgIHRoaXMuc2V0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFNldDtcbiAgfSgpKTtcbn1cblxudmFyIHdhcm4gPSBub29wO1xudmFyIGZvcm1hdENvbXBvbmVudE5hbWU7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIHZhciBoYXNDb25zb2xlID0gdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnO1xuXG4gIHdhcm4gPSBmdW5jdGlvbiAobXNnLCB2bSkge1xuICAgIGlmIChoYXNDb25zb2xlICYmICghY29uZmlnLnNpbGVudCkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJbVnVlIHdhcm5dOiBcIiArIG1zZyArIFwiIFwiICsgKFxuICAgICAgICB2bSA/IGZvcm1hdExvY2F0aW9uKGZvcm1hdENvbXBvbmVudE5hbWUodm0pKSA6ICcnXG4gICAgICApKTtcbiAgICB9XG4gIH07XG5cbiAgZm9ybWF0Q29tcG9uZW50TmFtZSA9IGZ1bmN0aW9uICh2bSkge1xuICAgIGlmICh2bS4kcm9vdCA9PT0gdm0pIHtcbiAgICAgIHJldHVybiAncm9vdCBpbnN0YW5jZSdcbiAgICB9XG4gICAgdmFyIG5hbWUgPSB2bS5faXNWdWVcbiAgICAgID8gdm0uJG9wdGlvbnMubmFtZSB8fCB2bS4kb3B0aW9ucy5fY29tcG9uZW50VGFnXG4gICAgICA6IHZtLm5hbWU7XG4gICAgcmV0dXJuIChcbiAgICAgIChuYW1lID8gKFwiY29tcG9uZW50IDxcIiArIG5hbWUgKyBcIj5cIikgOiBcImFub255bW91cyBjb21wb25lbnRcIikgK1xuICAgICAgKHZtLl9pc1Z1ZSAmJiB2bS4kb3B0aW9ucy5fX2ZpbGUgPyAoXCIgYXQgXCIgKyAodm0uJG9wdGlvbnMuX19maWxlKSkgOiAnJylcbiAgICApXG4gIH07XG5cbiAgdmFyIGZvcm1hdExvY2F0aW9uID0gZnVuY3Rpb24gKHN0cikge1xuICAgIGlmIChzdHIgPT09ICdhbm9ueW1vdXMgY29tcG9uZW50Jykge1xuICAgICAgc3RyICs9IFwiIC0gdXNlIHRoZSBcXFwibmFtZVxcXCIgb3B0aW9uIGZvciBiZXR0ZXIgZGVidWdnaW5nIG1lc3NhZ2VzLlwiO1xuICAgIH1cbiAgICByZXR1cm4gKFwiXFxuKGZvdW5kIGluIFwiICsgc3RyICsgXCIpXCIpXG4gIH07XG59XG5cbi8qICAqL1xuXG5cbnZhciB1aWQkMSA9IDA7XG5cbi8qKlxuICogQSBkZXAgaXMgYW4gb2JzZXJ2YWJsZSB0aGF0IGNhbiBoYXZlIG11bHRpcGxlXG4gKiBkaXJlY3RpdmVzIHN1YnNjcmliaW5nIHRvIGl0LlxuICovXG52YXIgRGVwID0gZnVuY3Rpb24gRGVwICgpIHtcbiAgdGhpcy5pZCA9IHVpZCQxKys7XG4gIHRoaXMuc3VicyA9IFtdO1xufTtcblxuRGVwLnByb3RvdHlwZS5hZGRTdWIgPSBmdW5jdGlvbiBhZGRTdWIgKHN1Yikge1xuICB0aGlzLnN1YnMucHVzaChzdWIpO1xufTtcblxuRGVwLnByb3RvdHlwZS5yZW1vdmVTdWIgPSBmdW5jdGlvbiByZW1vdmVTdWIgKHN1Yikge1xuICByZW1vdmUkMSh0aGlzLnN1YnMsIHN1Yik7XG59O1xuXG5EZXAucHJvdG90eXBlLmRlcGVuZCA9IGZ1bmN0aW9uIGRlcGVuZCAoKSB7XG4gIGlmIChEZXAudGFyZ2V0KSB7XG4gICAgRGVwLnRhcmdldC5hZGREZXAodGhpcyk7XG4gIH1cbn07XG5cbkRlcC5wcm90b3R5cGUubm90aWZ5ID0gZnVuY3Rpb24gbm90aWZ5ICgpIHtcbiAgLy8gc3RhYmxpemUgdGhlIHN1YnNjcmliZXIgbGlzdCBmaXJzdFxuICB2YXIgc3VicyA9IHRoaXMuc3Vicy5zbGljZSgpO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHN1YnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgc3Vic1tpXS51cGRhdGUoKTtcbiAgfVxufTtcblxuLy8gdGhlIGN1cnJlbnQgdGFyZ2V0IHdhdGNoZXIgYmVpbmcgZXZhbHVhdGVkLlxuLy8gdGhpcyBpcyBnbG9iYWxseSB1bmlxdWUgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBvbmx5IG9uZVxuLy8gd2F0Y2hlciBiZWluZyBldmFsdWF0ZWQgYXQgYW55IHRpbWUuXG5EZXAudGFyZ2V0ID0gbnVsbDtcbnZhciB0YXJnZXRTdGFjayA9IFtdO1xuXG5mdW5jdGlvbiBwdXNoVGFyZ2V0IChfdGFyZ2V0KSB7XG4gIGlmIChEZXAudGFyZ2V0KSB7IHRhcmdldFN0YWNrLnB1c2goRGVwLnRhcmdldCk7IH1cbiAgRGVwLnRhcmdldCA9IF90YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIHBvcFRhcmdldCAoKSB7XG4gIERlcC50YXJnZXQgPSB0YXJnZXRTdGFjay5wb3AoKTtcbn1cblxuLypcbiAqIG5vdCB0eXBlIGNoZWNraW5nIHRoaXMgZmlsZSBiZWNhdXNlIGZsb3cgZG9lc24ndCBwbGF5IHdlbGwgd2l0aFxuICogZHluYW1pY2FsbHkgYWNjZXNzaW5nIG1ldGhvZHMgb24gQXJyYXkgcHJvdG90eXBlXG4gKi9cblxudmFyIGFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG52YXIgYXJyYXlNZXRob2RzID0gT2JqZWN0LmNyZWF0ZShhcnJheVByb3RvKTtbXG4gICdwdXNoJyxcbiAgJ3BvcCcsXG4gICdzaGlmdCcsXG4gICd1bnNoaWZ0JyxcbiAgJ3NwbGljZScsXG4gICdzb3J0JyxcbiAgJ3JldmVyc2UnXG5dXG4uZm9yRWFjaChmdW5jdGlvbiAobWV0aG9kKSB7XG4gIC8vIGNhY2hlIG9yaWdpbmFsIG1ldGhvZFxuICB2YXIgb3JpZ2luYWwgPSBhcnJheVByb3RvW21ldGhvZF07XG4gIGRlZihhcnJheU1ldGhvZHMsIG1ldGhvZCwgZnVuY3Rpb24gbXV0YXRvciAoKSB7XG4gICAgdmFyIGFyZ3VtZW50cyQxID0gYXJndW1lbnRzO1xuXG4gICAgLy8gYXZvaWQgbGVha2luZyBhcmd1bWVudHM6XG4gICAgLy8gaHR0cDovL2pzcGVyZi5jb20vY2xvc3VyZS13aXRoLWFyZ3VtZW50c1xuICAgIHZhciBpID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShpKTtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzJDFbaV07XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB2YXIgb2IgPSB0aGlzLl9fb2JfXztcbiAgICB2YXIgaW5zZXJ0ZWQ7XG4gICAgc3dpdGNoIChtZXRob2QpIHtcbiAgICAgIGNhc2UgJ3B1c2gnOlxuICAgICAgICBpbnNlcnRlZCA9IGFyZ3M7XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICd1bnNoaWZ0JzpcbiAgICAgICAgaW5zZXJ0ZWQgPSBhcmdzO1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnc3BsaWNlJzpcbiAgICAgICAgaW5zZXJ0ZWQgPSBhcmdzLnNsaWNlKDIpO1xuICAgICAgICBicmVha1xuICAgIH1cbiAgICBpZiAoaW5zZXJ0ZWQpIHsgb2Iub2JzZXJ2ZUFycmF5KGluc2VydGVkKTsgfVxuICAgIC8vIG5vdGlmeSBjaGFuZ2VcbiAgICBvYi5kZXAubm90aWZ5KCk7XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9KTtcbn0pO1xuXG4vKiAgKi9cblxudmFyIGFycmF5S2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFycmF5TWV0aG9kcyk7XG5cbi8qKlxuICogQnkgZGVmYXVsdCwgd2hlbiBhIHJlYWN0aXZlIHByb3BlcnR5IGlzIHNldCwgdGhlIG5ldyB2YWx1ZSBpc1xuICogYWxzbyBjb252ZXJ0ZWQgdG8gYmVjb21lIHJlYWN0aXZlLiBIb3dldmVyIHdoZW4gcGFzc2luZyBkb3duIHByb3BzLFxuICogd2UgZG9uJ3Qgd2FudCB0byBmb3JjZSBjb252ZXJzaW9uIGJlY2F1c2UgdGhlIHZhbHVlIG1heSBiZSBhIG5lc3RlZCB2YWx1ZVxuICogdW5kZXIgYSBmcm96ZW4gZGF0YSBzdHJ1Y3R1cmUuIENvbnZlcnRpbmcgaXQgd291bGQgZGVmZWF0IHRoZSBvcHRpbWl6YXRpb24uXG4gKi9cbnZhciBvYnNlcnZlclN0YXRlID0ge1xuICBzaG91bGRDb252ZXJ0OiB0cnVlLFxuICBpc1NldHRpbmdQcm9wczogZmFsc2Vcbn07XG5cbi8qKlxuICogT2JzZXJ2ZXIgY2xhc3MgdGhhdCBhcmUgYXR0YWNoZWQgdG8gZWFjaCBvYnNlcnZlZFxuICogb2JqZWN0LiBPbmNlIGF0dGFjaGVkLCB0aGUgb2JzZXJ2ZXIgY29udmVydHMgdGFyZ2V0XG4gKiBvYmplY3QncyBwcm9wZXJ0eSBrZXlzIGludG8gZ2V0dGVyL3NldHRlcnMgdGhhdFxuICogY29sbGVjdCBkZXBlbmRlbmNpZXMgYW5kIGRpc3BhdGNoZXMgdXBkYXRlcy5cbiAqL1xudmFyIE9ic2VydmVyID0gZnVuY3Rpb24gT2JzZXJ2ZXIgKHZhbHVlKSB7XG4gIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgdGhpcy5kZXAgPSBuZXcgRGVwKCk7XG4gIHRoaXMudm1Db3VudCA9IDA7XG4gIGRlZih2YWx1ZSwgJ19fb2JfXycsIHRoaXMpO1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICB2YXIgYXVnbWVudCA9IGhhc1Byb3RvXG4gICAgICA/IHByb3RvQXVnbWVudFxuICAgICAgOiBjb3B5QXVnbWVudDtcbiAgICBhdWdtZW50KHZhbHVlLCBhcnJheU1ldGhvZHMsIGFycmF5S2V5cyk7XG4gICAgdGhpcy5vYnNlcnZlQXJyYXkodmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMud2Fsayh2YWx1ZSk7XG4gIH1cbn07XG5cbi8qKlxuICogV2FsayB0aHJvdWdoIGVhY2ggcHJvcGVydHkgYW5kIGNvbnZlcnQgdGhlbSBpbnRvXG4gKiBnZXR0ZXIvc2V0dGVycy4gVGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdoZW5cbiAqIHZhbHVlIHR5cGUgaXMgT2JqZWN0LlxuICovXG5PYnNlcnZlci5wcm90b3R5cGUud2FsayA9IGZ1bmN0aW9uIHdhbGsgKG9iaikge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIGRlZmluZVJlYWN0aXZlJCQxKG9iaiwga2V5c1tpXSwgb2JqW2tleXNbaV1dKTtcbiAgfVxufTtcblxuLyoqXG4gKiBPYnNlcnZlIGEgbGlzdCBvZiBBcnJheSBpdGVtcy5cbiAqL1xuT2JzZXJ2ZXIucHJvdG90eXBlLm9ic2VydmVBcnJheSA9IGZ1bmN0aW9uIG9ic2VydmVBcnJheSAoaXRlbXMpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBpdGVtcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBvYnNlcnZlKGl0ZW1zW2ldKTtcbiAgfVxufTtcblxuLy8gaGVscGVyc1xuXG4vKipcbiAqIEF1Z21lbnQgYW4gdGFyZ2V0IE9iamVjdCBvciBBcnJheSBieSBpbnRlcmNlcHRpbmdcbiAqIHRoZSBwcm90b3R5cGUgY2hhaW4gdXNpbmcgX19wcm90b19fXG4gKi9cbmZ1bmN0aW9uIHByb3RvQXVnbWVudCAodGFyZ2V0LCBzcmMpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cbiAgdGFyZ2V0Ll9fcHJvdG9fXyA9IHNyYztcbiAgLyogZXNsaW50LWVuYWJsZSBuby1wcm90byAqL1xufVxuXG4vKipcbiAqIEF1Z21lbnQgYW4gdGFyZ2V0IE9iamVjdCBvciBBcnJheSBieSBkZWZpbmluZ1xuICogaGlkZGVuIHByb3BlcnRpZXMuXG4gKlxuICogaXN0YW5idWwgaWdub3JlIG5leHRcbiAqL1xuZnVuY3Rpb24gY29weUF1Z21lbnQgKHRhcmdldCwgc3JjLCBrZXlzKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsID0ga2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICBkZWYodGFyZ2V0LCBrZXksIHNyY1trZXldKTtcbiAgfVxufVxuXG4vKipcbiAqIEF0dGVtcHQgdG8gY3JlYXRlIGFuIG9ic2VydmVyIGluc3RhbmNlIGZvciBhIHZhbHVlLFxuICogcmV0dXJucyB0aGUgbmV3IG9ic2VydmVyIGlmIHN1Y2Nlc3NmdWxseSBvYnNlcnZlZCxcbiAqIG9yIHRoZSBleGlzdGluZyBvYnNlcnZlciBpZiB0aGUgdmFsdWUgYWxyZWFkeSBoYXMgb25lLlxuICovXG5mdW5jdGlvbiBvYnNlcnZlICh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVyblxuICB9XG4gIHZhciBvYjtcbiAgaWYgKGhhc093bih2YWx1ZSwgJ19fb2JfXycpICYmIHZhbHVlLl9fb2JfXyBpbnN0YW5jZW9mIE9ic2VydmVyKSB7XG4gICAgb2IgPSB2YWx1ZS5fX29iX187XG4gIH0gZWxzZSBpZiAoXG4gICAgb2JzZXJ2ZXJTdGF0ZS5zaG91bGRDb252ZXJ0ICYmXG4gICAgIWlzU2VydmVyUmVuZGVyaW5nKCkgJiZcbiAgICAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgaXNQbGFpbk9iamVjdCh2YWx1ZSkpICYmXG4gICAgT2JqZWN0LmlzRXh0ZW5zaWJsZSh2YWx1ZSkgJiZcbiAgICAhdmFsdWUuX2lzVnVlXG4gICkge1xuICAgIG9iID0gbmV3IE9ic2VydmVyKHZhbHVlKTtcbiAgfVxuICByZXR1cm4gb2Jcbn1cblxuLyoqXG4gKiBEZWZpbmUgYSByZWFjdGl2ZSBwcm9wZXJ0eSBvbiBhbiBPYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGRlZmluZVJlYWN0aXZlJCQxIChcbiAgb2JqLFxuICBrZXksXG4gIHZhbCxcbiAgY3VzdG9tU2V0dGVyXG4pIHtcbiAgdmFyIGRlcCA9IG5ldyBEZXAoKTtcblxuICB2YXIgcHJvcGVydHkgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KTtcbiAgaWYgKHByb3BlcnR5ICYmIHByb3BlcnR5LmNvbmZpZ3VyYWJsZSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8vIGNhdGVyIGZvciBwcmUtZGVmaW5lZCBnZXR0ZXIvc2V0dGVyc1xuICB2YXIgZ2V0dGVyID0gcHJvcGVydHkgJiYgcHJvcGVydHkuZ2V0O1xuICB2YXIgc2V0dGVyID0gcHJvcGVydHkgJiYgcHJvcGVydHkuc2V0O1xuXG4gIHZhciBjaGlsZE9iID0gb2JzZXJ2ZSh2YWwpO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uIHJlYWN0aXZlR2V0dGVyICgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGdldHRlciA/IGdldHRlci5jYWxsKG9iaikgOiB2YWw7XG4gICAgICBpZiAoRGVwLnRhcmdldCkge1xuICAgICAgICBkZXAuZGVwZW5kKCk7XG4gICAgICAgIGlmIChjaGlsZE9iKSB7XG4gICAgICAgICAgY2hpbGRPYi5kZXAuZGVwZW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgZGVwZW5kQXJyYXkodmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gcmVhY3RpdmVTZXR0ZXIgKG5ld1ZhbCkge1xuICAgICAgdmFyIHZhbHVlID0gZ2V0dGVyID8gZ2V0dGVyLmNhbGwob2JqKSA6IHZhbDtcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXNlbGYtY29tcGFyZSAqL1xuICAgICAgaWYgKG5ld1ZhbCA9PT0gdmFsdWUgfHwgKG5ld1ZhbCAhPT0gbmV3VmFsICYmIHZhbHVlICE9PSB2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXNlbGYtY29tcGFyZSAqL1xuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgY3VzdG9tU2V0dGVyKSB7XG4gICAgICAgIGN1c3RvbVNldHRlcigpO1xuICAgICAgfVxuICAgICAgaWYgKHNldHRlcikge1xuICAgICAgICBzZXR0ZXIuY2FsbChvYmosIG5ld1ZhbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBuZXdWYWw7XG4gICAgICB9XG4gICAgICBjaGlsZE9iID0gb2JzZXJ2ZShuZXdWYWwpO1xuICAgICAgZGVwLm5vdGlmeSgpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogU2V0IGEgcHJvcGVydHkgb24gYW4gb2JqZWN0LiBBZGRzIHRoZSBuZXcgcHJvcGVydHkgYW5kXG4gKiB0cmlnZ2VycyBjaGFuZ2Ugbm90aWZpY2F0aW9uIGlmIHRoZSBwcm9wZXJ0eSBkb2Vzbid0XG4gKiBhbHJlYWR5IGV4aXN0LlxuICovXG5mdW5jdGlvbiBzZXQkMSAob2JqLCBrZXksIHZhbCkge1xuICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgb2JqLmxlbmd0aCA9IE1hdGgubWF4KG9iai5sZW5ndGgsIGtleSk7XG4gICAgb2JqLnNwbGljZShrZXksIDEsIHZhbCk7XG4gICAgcmV0dXJuIHZhbFxuICB9XG4gIGlmIChoYXNPd24ob2JqLCBrZXkpKSB7XG4gICAgb2JqW2tleV0gPSB2YWw7XG4gICAgcmV0dXJuXG4gIH1cbiAgdmFyIG9iID0gb2JqLl9fb2JfXztcbiAgaWYgKG9iai5faXNWdWUgfHwgKG9iICYmIG9iLnZtQ291bnQpKSB7XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKFxuICAgICAgJ0F2b2lkIGFkZGluZyByZWFjdGl2ZSBwcm9wZXJ0aWVzIHRvIGEgVnVlIGluc3RhbmNlIG9yIGl0cyByb290ICRkYXRhICcgK1xuICAgICAgJ2F0IHJ1bnRpbWUgLSBkZWNsYXJlIGl0IHVwZnJvbnQgaW4gdGhlIGRhdGEgb3B0aW9uLidcbiAgICApO1xuICAgIHJldHVyblxuICB9XG4gIGlmICghb2IpIHtcbiAgICBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm5cbiAgfVxuICBkZWZpbmVSZWFjdGl2ZSQkMShvYi52YWx1ZSwga2V5LCB2YWwpO1xuICBvYi5kZXAubm90aWZ5KCk7XG4gIHJldHVybiB2YWxcbn1cblxuLyoqXG4gKiBEZWxldGUgYSBwcm9wZXJ0eSBhbmQgdHJpZ2dlciBjaGFuZ2UgaWYgbmVjZXNzYXJ5LlxuICovXG5mdW5jdGlvbiBkZWwgKG9iaiwga2V5KSB7XG4gIHZhciBvYiA9IG9iai5fX29iX187XG4gIGlmIChvYmouX2lzVnVlIHx8IChvYiAmJiBvYi52bUNvdW50KSkge1xuICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybihcbiAgICAgICdBdm9pZCBkZWxldGluZyBwcm9wZXJ0aWVzIG9uIGEgVnVlIGluc3RhbmNlIG9yIGl0cyByb290ICRkYXRhICcgK1xuICAgICAgJy0ganVzdCBzZXQgaXQgdG8gbnVsbC4nXG4gICAgKTtcbiAgICByZXR1cm5cbiAgfVxuICBpZiAoIWhhc093bihvYmosIGtleSkpIHtcbiAgICByZXR1cm5cbiAgfVxuICBkZWxldGUgb2JqW2tleV07XG4gIGlmICghb2IpIHtcbiAgICByZXR1cm5cbiAgfVxuICBvYi5kZXAubm90aWZ5KCk7XG59XG5cbi8qKlxuICogQ29sbGVjdCBkZXBlbmRlbmNpZXMgb24gYXJyYXkgZWxlbWVudHMgd2hlbiB0aGUgYXJyYXkgaXMgdG91Y2hlZCwgc2luY2VcbiAqIHdlIGNhbm5vdCBpbnRlcmNlcHQgYXJyYXkgZWxlbWVudCBhY2Nlc3MgbGlrZSBwcm9wZXJ0eSBnZXR0ZXJzLlxuICovXG5mdW5jdGlvbiBkZXBlbmRBcnJheSAodmFsdWUpIHtcbiAgZm9yICh2YXIgZSA9ICh2b2lkIDApLCBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGUgPSB2YWx1ZVtpXTtcbiAgICBlICYmIGUuX19vYl9fICYmIGUuX19vYl9fLmRlcC5kZXBlbmQoKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShlKSkge1xuICAgICAgZGVwZW5kQXJyYXkoZSk7XG4gICAgfVxuICB9XG59XG5cbi8qICAqL1xuXG4vKipcbiAqIE9wdGlvbiBvdmVyd3JpdGluZyBzdHJhdGVnaWVzIGFyZSBmdW5jdGlvbnMgdGhhdCBoYW5kbGVcbiAqIGhvdyB0byBtZXJnZSBhIHBhcmVudCBvcHRpb24gdmFsdWUgYW5kIGEgY2hpbGQgb3B0aW9uXG4gKiB2YWx1ZSBpbnRvIHRoZSBmaW5hbCB2YWx1ZS5cbiAqL1xudmFyIHN0cmF0cyA9IGNvbmZpZy5vcHRpb25NZXJnZVN0cmF0ZWdpZXM7XG5cbi8qKlxuICogT3B0aW9ucyB3aXRoIHJlc3RyaWN0aW9uc1xuICovXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBzdHJhdHMuZWwgPSBzdHJhdHMucHJvcHNEYXRhID0gZnVuY3Rpb24gKHBhcmVudCwgY2hpbGQsIHZtLCBrZXkpIHtcbiAgICBpZiAoIXZtKSB7XG4gICAgICB3YXJuKFxuICAgICAgICBcIm9wdGlvbiBcXFwiXCIgKyBrZXkgKyBcIlxcXCIgY2FuIG9ubHkgYmUgdXNlZCBkdXJpbmcgaW5zdGFuY2UgXCIgK1xuICAgICAgICAnY3JlYXRpb24gd2l0aCB0aGUgYG5ld2Aga2V5d29yZC4nXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gZGVmYXVsdFN0cmF0KHBhcmVudCwgY2hpbGQpXG4gIH07XG59XG5cbi8qKlxuICogSGVscGVyIHRoYXQgcmVjdXJzaXZlbHkgbWVyZ2VzIHR3byBkYXRhIG9iamVjdHMgdG9nZXRoZXIuXG4gKi9cbmZ1bmN0aW9uIG1lcmdlRGF0YSAodG8sIGZyb20pIHtcbiAgaWYgKCFmcm9tKSB7IHJldHVybiB0byB9XG4gIHZhciBrZXksIHRvVmFsLCBmcm9tVmFsO1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGZyb20pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICBrZXkgPSBrZXlzW2ldO1xuICAgIHRvVmFsID0gdG9ba2V5XTtcbiAgICBmcm9tVmFsID0gZnJvbVtrZXldO1xuICAgIGlmICghaGFzT3duKHRvLCBrZXkpKSB7XG4gICAgICBzZXQkMSh0bywga2V5LCBmcm9tVmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodG9WYWwpICYmIGlzUGxhaW5PYmplY3QoZnJvbVZhbCkpIHtcbiAgICAgIG1lcmdlRGF0YSh0b1ZhbCwgZnJvbVZhbCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0b1xufVxuXG4vKipcbiAqIERhdGFcbiAqL1xuc3RyYXRzLmRhdGEgPSBmdW5jdGlvbiAoXG4gIHBhcmVudFZhbCxcbiAgY2hpbGRWYWwsXG4gIHZtXG4pIHtcbiAgaWYgKCF2bSkge1xuICAgIC8vIGluIGEgVnVlLmV4dGVuZCBtZXJnZSwgYm90aCBzaG91bGQgYmUgZnVuY3Rpb25zXG4gICAgaWYgKCFjaGlsZFZhbCkge1xuICAgICAgcmV0dXJuIHBhcmVudFZhbFxuICAgIH1cbiAgICBpZiAodHlwZW9mIGNoaWxkVmFsICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oXG4gICAgICAgICdUaGUgXCJkYXRhXCIgb3B0aW9uIHNob3VsZCBiZSBhIGZ1bmN0aW9uICcgK1xuICAgICAgICAndGhhdCByZXR1cm5zIGEgcGVyLWluc3RhbmNlIHZhbHVlIGluIGNvbXBvbmVudCAnICtcbiAgICAgICAgJ2RlZmluaXRpb25zLicsXG4gICAgICAgIHZtXG4gICAgICApO1xuICAgICAgcmV0dXJuIHBhcmVudFZhbFxuICAgIH1cbiAgICBpZiAoIXBhcmVudFZhbCkge1xuICAgICAgcmV0dXJuIGNoaWxkVmFsXG4gICAgfVxuICAgIC8vIHdoZW4gcGFyZW50VmFsICYgY2hpbGRWYWwgYXJlIGJvdGggcHJlc2VudCxcbiAgICAvLyB3ZSBuZWVkIHRvIHJldHVybiBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgICAvLyBtZXJnZWQgcmVzdWx0IG9mIGJvdGggZnVuY3Rpb25zLi4uIG5vIG5lZWQgdG9cbiAgICAvLyBjaGVjayBpZiBwYXJlbnRWYWwgaXMgYSBmdW5jdGlvbiBoZXJlIGJlY2F1c2VcbiAgICAvLyBpdCBoYXMgdG8gYmUgYSBmdW5jdGlvbiB0byBwYXNzIHByZXZpb3VzIG1lcmdlcy5cbiAgICByZXR1cm4gZnVuY3Rpb24gbWVyZ2VkRGF0YUZuICgpIHtcbiAgICAgIHJldHVybiBtZXJnZURhdGEoXG4gICAgICAgIGNoaWxkVmFsLmNhbGwodGhpcyksXG4gICAgICAgIHBhcmVudFZhbC5jYWxsKHRoaXMpXG4gICAgICApXG4gICAgfVxuICB9IGVsc2UgaWYgKHBhcmVudFZhbCB8fCBjaGlsZFZhbCkge1xuICAgIHJldHVybiBmdW5jdGlvbiBtZXJnZWRJbnN0YW5jZURhdGFGbiAoKSB7XG4gICAgICAvLyBpbnN0YW5jZSBtZXJnZVxuICAgICAgdmFyIGluc3RhbmNlRGF0YSA9IHR5cGVvZiBjaGlsZFZhbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IGNoaWxkVmFsLmNhbGwodm0pXG4gICAgICAgIDogY2hpbGRWYWw7XG4gICAgICB2YXIgZGVmYXVsdERhdGEgPSB0eXBlb2YgcGFyZW50VmFsID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gcGFyZW50VmFsLmNhbGwodm0pXG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgICAgaWYgKGluc3RhbmNlRGF0YSkge1xuICAgICAgICByZXR1cm4gbWVyZ2VEYXRhKGluc3RhbmNlRGF0YSwgZGVmYXVsdERhdGEpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZGVmYXVsdERhdGFcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogSG9va3MgYW5kIHBhcmFtIGF0dHJpYnV0ZXMgYXJlIG1lcmdlZCBhcyBhcnJheXMuXG4gKi9cbmZ1bmN0aW9uIG1lcmdlSG9vayAoXG4gIHBhcmVudFZhbCxcbiAgY2hpbGRWYWxcbikge1xuICByZXR1cm4gY2hpbGRWYWxcbiAgICA/IHBhcmVudFZhbFxuICAgICAgPyBwYXJlbnRWYWwuY29uY2F0KGNoaWxkVmFsKVxuICAgICAgOiBBcnJheS5pc0FycmF5KGNoaWxkVmFsKVxuICAgICAgICA/IGNoaWxkVmFsXG4gICAgICAgIDogW2NoaWxkVmFsXVxuICAgIDogcGFyZW50VmFsXG59XG5cbmNvbmZpZy5fbGlmZWN5Y2xlSG9va3MuZm9yRWFjaChmdW5jdGlvbiAoaG9vaykge1xuICBzdHJhdHNbaG9va10gPSBtZXJnZUhvb2s7XG59KTtcblxuLyoqXG4gKiBBc3NldHNcbiAqXG4gKiBXaGVuIGEgdm0gaXMgcHJlc2VudCAoaW5zdGFuY2UgY3JlYXRpb24pLCB3ZSBuZWVkIHRvIGRvXG4gKiBhIHRocmVlLXdheSBtZXJnZSBiZXR3ZWVuIGNvbnN0cnVjdG9yIG9wdGlvbnMsIGluc3RhbmNlXG4gKiBvcHRpb25zIGFuZCBwYXJlbnQgb3B0aW9ucy5cbiAqL1xuZnVuY3Rpb24gbWVyZ2VBc3NldHMgKHBhcmVudFZhbCwgY2hpbGRWYWwpIHtcbiAgdmFyIHJlcyA9IE9iamVjdC5jcmVhdGUocGFyZW50VmFsIHx8IG51bGwpO1xuICByZXR1cm4gY2hpbGRWYWxcbiAgICA/IGV4dGVuZChyZXMsIGNoaWxkVmFsKVxuICAgIDogcmVzXG59XG5cbmNvbmZpZy5fYXNzZXRUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlKSB7XG4gIHN0cmF0c1t0eXBlICsgJ3MnXSA9IG1lcmdlQXNzZXRzO1xufSk7XG5cbi8qKlxuICogV2F0Y2hlcnMuXG4gKlxuICogV2F0Y2hlcnMgaGFzaGVzIHNob3VsZCBub3Qgb3ZlcndyaXRlIG9uZVxuICogYW5vdGhlciwgc28gd2UgbWVyZ2UgdGhlbSBhcyBhcnJheXMuXG4gKi9cbnN0cmF0cy53YXRjaCA9IGZ1bmN0aW9uIChwYXJlbnRWYWwsIGNoaWxkVmFsKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoIWNoaWxkVmFsKSB7IHJldHVybiBwYXJlbnRWYWwgfVxuICBpZiAoIXBhcmVudFZhbCkgeyByZXR1cm4gY2hpbGRWYWwgfVxuICB2YXIgcmV0ID0ge307XG4gIGV4dGVuZChyZXQsIHBhcmVudFZhbCk7XG4gIGZvciAodmFyIGtleSBpbiBjaGlsZFZhbCkge1xuICAgIHZhciBwYXJlbnQgPSByZXRba2V5XTtcbiAgICB2YXIgY2hpbGQgPSBjaGlsZFZhbFtrZXldO1xuICAgIGlmIChwYXJlbnQgJiYgIUFycmF5LmlzQXJyYXkocGFyZW50KSkge1xuICAgICAgcGFyZW50ID0gW3BhcmVudF07XG4gICAgfVxuICAgIHJldFtrZXldID0gcGFyZW50XG4gICAgICA/IHBhcmVudC5jb25jYXQoY2hpbGQpXG4gICAgICA6IFtjaGlsZF07XG4gIH1cbiAgcmV0dXJuIHJldFxufTtcblxuLyoqXG4gKiBPdGhlciBvYmplY3QgaGFzaGVzLlxuICovXG5zdHJhdHMucHJvcHMgPVxuc3RyYXRzLm1ldGhvZHMgPVxuc3RyYXRzLmNvbXB1dGVkID0gZnVuY3Rpb24gKHBhcmVudFZhbCwgY2hpbGRWYWwpIHtcbiAgaWYgKCFjaGlsZFZhbCkgeyByZXR1cm4gcGFyZW50VmFsIH1cbiAgaWYgKCFwYXJlbnRWYWwpIHsgcmV0dXJuIGNoaWxkVmFsIH1cbiAgdmFyIHJldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGV4dGVuZChyZXQsIHBhcmVudFZhbCk7XG4gIGV4dGVuZChyZXQsIGNoaWxkVmFsKTtcbiAgcmV0dXJuIHJldFxufTtcblxuLyoqXG4gKiBEZWZhdWx0IHN0cmF0ZWd5LlxuICovXG52YXIgZGVmYXVsdFN0cmF0ID0gZnVuY3Rpb24gKHBhcmVudFZhbCwgY2hpbGRWYWwpIHtcbiAgcmV0dXJuIGNoaWxkVmFsID09PSB1bmRlZmluZWRcbiAgICA/IHBhcmVudFZhbFxuICAgIDogY2hpbGRWYWxcbn07XG5cbi8qKlxuICogVmFsaWRhdGUgY29tcG9uZW50IG5hbWVzXG4gKi9cbmZ1bmN0aW9uIGNoZWNrQ29tcG9uZW50cyAob3B0aW9ucykge1xuICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucy5jb21wb25lbnRzKSB7XG4gICAgdmFyIGxvd2VyID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKGlzQnVpbHRJblRhZyhsb3dlcikgfHwgY29uZmlnLmlzUmVzZXJ2ZWRUYWcobG93ZXIpKSB7XG4gICAgICB3YXJuKFxuICAgICAgICAnRG8gbm90IHVzZSBidWlsdC1pbiBvciByZXNlcnZlZCBIVE1MIGVsZW1lbnRzIGFzIGNvbXBvbmVudCAnICtcbiAgICAgICAgJ2lkOiAnICsga2V5XG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEVuc3VyZSBhbGwgcHJvcHMgb3B0aW9uIHN5bnRheCBhcmUgbm9ybWFsaXplZCBpbnRvIHRoZVxuICogT2JqZWN0LWJhc2VkIGZvcm1hdC5cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplUHJvcHMgKG9wdGlvbnMpIHtcbiAgdmFyIHByb3BzID0gb3B0aW9ucy5wcm9wcztcbiAgaWYgKCFwcm9wcykgeyByZXR1cm4gfVxuICB2YXIgcmVzID0ge307XG4gIHZhciBpLCB2YWwsIG5hbWU7XG4gIGlmIChBcnJheS5pc0FycmF5KHByb3BzKSkge1xuICAgIGkgPSBwcm9wcy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdmFsID0gcHJvcHNbaV07XG4gICAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgbmFtZSA9IGNhbWVsaXplKHZhbCk7XG4gICAgICAgIHJlc1tuYW1lXSA9IHsgdHlwZTogbnVsbCB9O1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIHdhcm4oJ3Byb3BzIG11c3QgYmUgc3RyaW5ncyB3aGVuIHVzaW5nIGFycmF5IHN5bnRheC4nKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdChwcm9wcykpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gcHJvcHMpIHtcbiAgICAgIHZhbCA9IHByb3BzW2tleV07XG4gICAgICBuYW1lID0gY2FtZWxpemUoa2V5KTtcbiAgICAgIHJlc1tuYW1lXSA9IGlzUGxhaW5PYmplY3QodmFsKVxuICAgICAgICA/IHZhbFxuICAgICAgICA6IHsgdHlwZTogdmFsIH07XG4gICAgfVxuICB9XG4gIG9wdGlvbnMucHJvcHMgPSByZXM7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIHJhdyBmdW5jdGlvbiBkaXJlY3RpdmVzIGludG8gb2JqZWN0IGZvcm1hdC5cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplRGlyZWN0aXZlcyAob3B0aW9ucykge1xuICB2YXIgZGlycyA9IG9wdGlvbnMuZGlyZWN0aXZlcztcbiAgaWYgKGRpcnMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGlycykge1xuICAgICAgdmFyIGRlZiA9IGRpcnNba2V5XTtcbiAgICAgIGlmICh0eXBlb2YgZGVmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRpcnNba2V5XSA9IHsgYmluZDogZGVmLCB1cGRhdGU6IGRlZiB9O1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIE1lcmdlIHR3byBvcHRpb24gb2JqZWN0cyBpbnRvIGEgbmV3IG9uZS5cbiAqIENvcmUgdXRpbGl0eSB1c2VkIGluIGJvdGggaW5zdGFudGlhdGlvbiBhbmQgaW5oZXJpdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIG1lcmdlT3B0aW9ucyAoXG4gIHBhcmVudCxcbiAgY2hpbGQsXG4gIHZtXG4pIHtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBjaGVja0NvbXBvbmVudHMoY2hpbGQpO1xuICB9XG4gIG5vcm1hbGl6ZVByb3BzKGNoaWxkKTtcbiAgbm9ybWFsaXplRGlyZWN0aXZlcyhjaGlsZCk7XG4gIHZhciBleHRlbmRzRnJvbSA9IGNoaWxkLmV4dGVuZHM7XG4gIGlmIChleHRlbmRzRnJvbSkge1xuICAgIHBhcmVudCA9IHR5cGVvZiBleHRlbmRzRnJvbSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBtZXJnZU9wdGlvbnMocGFyZW50LCBleHRlbmRzRnJvbS5vcHRpb25zLCB2bSlcbiAgICAgIDogbWVyZ2VPcHRpb25zKHBhcmVudCwgZXh0ZW5kc0Zyb20sIHZtKTtcbiAgfVxuICBpZiAoY2hpbGQubWl4aW5zKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGlsZC5taXhpbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgbWl4aW4gPSBjaGlsZC5taXhpbnNbaV07XG4gICAgICBpZiAobWl4aW4ucHJvdG90eXBlIGluc3RhbmNlb2YgVnVlJDIpIHtcbiAgICAgICAgbWl4aW4gPSBtaXhpbi5vcHRpb25zO1xuICAgICAgfVxuICAgICAgcGFyZW50ID0gbWVyZ2VPcHRpb25zKHBhcmVudCwgbWl4aW4sIHZtKTtcbiAgICB9XG4gIH1cbiAgdmFyIG9wdGlvbnMgPSB7fTtcbiAgdmFyIGtleTtcbiAgZm9yIChrZXkgaW4gcGFyZW50KSB7XG4gICAgbWVyZ2VGaWVsZChrZXkpO1xuICB9XG4gIGZvciAoa2V5IGluIGNoaWxkKSB7XG4gICAgaWYgKCFoYXNPd24ocGFyZW50LCBrZXkpKSB7XG4gICAgICBtZXJnZUZpZWxkKGtleSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG1lcmdlRmllbGQgKGtleSkge1xuICAgIHZhciBzdHJhdCA9IHN0cmF0c1trZXldIHx8IGRlZmF1bHRTdHJhdDtcbiAgICBvcHRpb25zW2tleV0gPSBzdHJhdChwYXJlbnRba2V5XSwgY2hpbGRba2V5XSwgdm0sIGtleSk7XG4gIH1cbiAgcmV0dXJuIG9wdGlvbnNcbn1cblxuLyoqXG4gKiBSZXNvbHZlIGFuIGFzc2V0LlxuICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIGJlY2F1c2UgY2hpbGQgaW5zdGFuY2VzIG5lZWQgYWNjZXNzXG4gKiB0byBhc3NldHMgZGVmaW5lZCBpbiBpdHMgYW5jZXN0b3IgY2hhaW4uXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVBc3NldCAoXG4gIG9wdGlvbnMsXG4gIHR5cGUsXG4gIGlkLFxuICB3YXJuTWlzc2luZ1xuKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAodHlwZW9mIGlkICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVyblxuICB9XG4gIHZhciBhc3NldHMgPSBvcHRpb25zW3R5cGVdO1xuICB2YXIgcmVzID0gYXNzZXRzW2lkXSB8fFxuICAgIC8vIGNhbWVsQ2FzZSBJRFxuICAgIGFzc2V0c1tjYW1lbGl6ZShpZCldIHx8XG4gICAgLy8gUGFzY2FsIENhc2UgSURcbiAgICBhc3NldHNbY2FwaXRhbGl6ZShjYW1lbGl6ZShpZCkpXTtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2Fybk1pc3NpbmcgJiYgIXJlcykge1xuICAgIHdhcm4oXG4gICAgICAnRmFpbGVkIHRvIHJlc29sdmUgJyArIHR5cGUuc2xpY2UoMCwgLTEpICsgJzogJyArIGlkLFxuICAgICAgb3B0aW9uc1xuICAgICk7XG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG4vKiAgKi9cblxuZnVuY3Rpb24gdmFsaWRhdGVQcm9wIChcbiAga2V5LFxuICBwcm9wT3B0aW9ucyxcbiAgcHJvcHNEYXRhLFxuICB2bVxuKSB7XG4gIHZhciBwcm9wID0gcHJvcE9wdGlvbnNba2V5XTtcbiAgdmFyIGFic2VudCA9ICFoYXNPd24ocHJvcHNEYXRhLCBrZXkpO1xuICB2YXIgdmFsdWUgPSBwcm9wc0RhdGFba2V5XTtcbiAgLy8gaGFuZGxlIGJvb2xlYW4gcHJvcHNcbiAgaWYgKGlzQm9vbGVhblR5cGUocHJvcC50eXBlKSkge1xuICAgIGlmIChhYnNlbnQgJiYgIWhhc093bihwcm9wLCAnZGVmYXVsdCcpKSB7XG4gICAgICB2YWx1ZSA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09ICcnIHx8IHZhbHVlID09PSBoeXBoZW5hdGUoa2V5KSkge1xuICAgICAgdmFsdWUgPSB0cnVlO1xuICAgIH1cbiAgfVxuICAvLyBjaGVjayBkZWZhdWx0IHZhbHVlXG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFsdWUgPSBnZXRQcm9wRGVmYXVsdFZhbHVlKHZtLCBwcm9wLCBrZXkpO1xuICAgIC8vIHNpbmNlIHRoZSBkZWZhdWx0IHZhbHVlIGlzIGEgZnJlc2ggY29weSxcbiAgICAvLyBtYWtlIHN1cmUgdG8gb2JzZXJ2ZSBpdC5cbiAgICB2YXIgcHJldlNob3VsZENvbnZlcnQgPSBvYnNlcnZlclN0YXRlLnNob3VsZENvbnZlcnQ7XG4gICAgb2JzZXJ2ZXJTdGF0ZS5zaG91bGRDb252ZXJ0ID0gdHJ1ZTtcbiAgICBvYnNlcnZlKHZhbHVlKTtcbiAgICBvYnNlcnZlclN0YXRlLnNob3VsZENvbnZlcnQgPSBwcmV2U2hvdWxkQ29udmVydDtcbiAgfVxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIGFzc2VydFByb3AocHJvcCwga2V5LCB2YWx1ZSwgdm0sIGFic2VudCk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlXG59XG5cbi8qKlxuICogR2V0IHRoZSBkZWZhdWx0IHZhbHVlIG9mIGEgcHJvcC5cbiAqL1xuZnVuY3Rpb24gZ2V0UHJvcERlZmF1bHRWYWx1ZSAodm0sIHByb3AsIGtleSkge1xuICAvLyBubyBkZWZhdWx0LCByZXR1cm4gdW5kZWZpbmVkXG4gIGlmICghaGFzT3duKHByb3AsICdkZWZhdWx0JykpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cbiAgdmFyIGRlZiA9IHByb3AuZGVmYXVsdDtcbiAgLy8gd2FybiBhZ2FpbnN0IG5vbi1mYWN0b3J5IGRlZmF1bHRzIGZvciBPYmplY3QgJiBBcnJheVxuICBpZiAoaXNPYmplY3QoZGVmKSkge1xuICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybihcbiAgICAgICdJbnZhbGlkIGRlZmF1bHQgdmFsdWUgZm9yIHByb3AgXCInICsga2V5ICsgJ1wiOiAnICtcbiAgICAgICdQcm9wcyB3aXRoIHR5cGUgT2JqZWN0L0FycmF5IG11c3QgdXNlIGEgZmFjdG9yeSBmdW5jdGlvbiAnICtcbiAgICAgICd0byByZXR1cm4gdGhlIGRlZmF1bHQgdmFsdWUuJyxcbiAgICAgIHZtXG4gICAgKTtcbiAgfVxuICAvLyB0aGUgcmF3IHByb3AgdmFsdWUgd2FzIGFsc28gdW5kZWZpbmVkIGZyb20gcHJldmlvdXMgcmVuZGVyLFxuICAvLyByZXR1cm4gcHJldmlvdXMgZGVmYXVsdCB2YWx1ZSB0byBhdm9pZCB1bm5lY2Vzc2FyeSB3YXRjaGVyIHRyaWdnZXJcbiAgaWYgKHZtICYmIHZtLiRvcHRpb25zLnByb3BzRGF0YSAmJlxuICAgIHZtLiRvcHRpb25zLnByb3BzRGF0YVtrZXldID09PSB1bmRlZmluZWQgJiZcbiAgICB2bVtrZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdm1ba2V5XVxuICB9XG4gIC8vIGNhbGwgZmFjdG9yeSBmdW5jdGlvbiBmb3Igbm9uLUZ1bmN0aW9uIHR5cGVzXG4gIHJldHVybiB0eXBlb2YgZGVmID09PSAnZnVuY3Rpb24nICYmIHByb3AudHlwZSAhPT0gRnVuY3Rpb25cbiAgICA/IGRlZi5jYWxsKHZtKVxuICAgIDogZGVmXG59XG5cbi8qKlxuICogQXNzZXJ0IHdoZXRoZXIgYSBwcm9wIGlzIHZhbGlkLlxuICovXG5mdW5jdGlvbiBhc3NlcnRQcm9wIChcbiAgcHJvcCxcbiAgbmFtZSxcbiAgdmFsdWUsXG4gIHZtLFxuICBhYnNlbnRcbikge1xuICBpZiAocHJvcC5yZXF1aXJlZCAmJiBhYnNlbnQpIHtcbiAgICB3YXJuKFxuICAgICAgJ01pc3NpbmcgcmVxdWlyZWQgcHJvcDogXCInICsgbmFtZSArICdcIicsXG4gICAgICB2bVxuICAgICk7XG4gICAgcmV0dXJuXG4gIH1cbiAgaWYgKHZhbHVlID09IG51bGwgJiYgIXByb3AucmVxdWlyZWQpIHtcbiAgICByZXR1cm5cbiAgfVxuICB2YXIgdHlwZSA9IHByb3AudHlwZTtcbiAgdmFyIHZhbGlkID0gIXR5cGUgfHwgdHlwZSA9PT0gdHJ1ZTtcbiAgdmFyIGV4cGVjdGVkVHlwZXMgPSBbXTtcbiAgaWYgKHR5cGUpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodHlwZSkpIHtcbiAgICAgIHR5cGUgPSBbdHlwZV07XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGggJiYgIXZhbGlkOyBpKyspIHtcbiAgICAgIHZhciBhc3NlcnRlZFR5cGUgPSBhc3NlcnRUeXBlKHZhbHVlLCB0eXBlW2ldKTtcbiAgICAgIGV4cGVjdGVkVHlwZXMucHVzaChhc3NlcnRlZFR5cGUuZXhwZWN0ZWRUeXBlKTtcbiAgICAgIHZhbGlkID0gYXNzZXJ0ZWRUeXBlLnZhbGlkO1xuICAgIH1cbiAgfVxuICBpZiAoIXZhbGlkKSB7XG4gICAgd2FybihcbiAgICAgICdJbnZhbGlkIHByb3A6IHR5cGUgY2hlY2sgZmFpbGVkIGZvciBwcm9wIFwiJyArIG5hbWUgKyAnXCIuJyArXG4gICAgICAnIEV4cGVjdGVkICcgKyBleHBlY3RlZFR5cGVzLm1hcChjYXBpdGFsaXplKS5qb2luKCcsICcpICtcbiAgICAgICcsIGdvdCAnICsgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKS5zbGljZSg4LCAtMSkgKyAnLicsXG4gICAgICB2bVxuICAgICk7XG4gICAgcmV0dXJuXG4gIH1cbiAgdmFyIHZhbGlkYXRvciA9IHByb3AudmFsaWRhdG9yO1xuICBpZiAodmFsaWRhdG9yKSB7XG4gICAgaWYgKCF2YWxpZGF0b3IodmFsdWUpKSB7XG4gICAgICB3YXJuKFxuICAgICAgICAnSW52YWxpZCBwcm9wOiBjdXN0b20gdmFsaWRhdG9yIGNoZWNrIGZhaWxlZCBmb3IgcHJvcCBcIicgKyBuYW1lICsgJ1wiLicsXG4gICAgICAgIHZtXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgdHlwZSBvZiBhIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFR5cGUgKHZhbHVlLCB0eXBlKSB7XG4gIHZhciB2YWxpZDtcbiAgdmFyIGV4cGVjdGVkVHlwZSA9IGdldFR5cGUodHlwZSk7XG4gIGlmIChleHBlY3RlZFR5cGUgPT09ICdTdHJpbmcnKSB7XG4gICAgdmFsaWQgPSB0eXBlb2YgdmFsdWUgPT09IChleHBlY3RlZFR5cGUgPSAnc3RyaW5nJyk7XG4gIH0gZWxzZSBpZiAoZXhwZWN0ZWRUeXBlID09PSAnTnVtYmVyJykge1xuICAgIHZhbGlkID0gdHlwZW9mIHZhbHVlID09PSAoZXhwZWN0ZWRUeXBlID0gJ251bWJlcicpO1xuICB9IGVsc2UgaWYgKGV4cGVjdGVkVHlwZSA9PT0gJ0Jvb2xlYW4nKSB7XG4gICAgdmFsaWQgPSB0eXBlb2YgdmFsdWUgPT09IChleHBlY3RlZFR5cGUgPSAnYm9vbGVhbicpO1xuICB9IGVsc2UgaWYgKGV4cGVjdGVkVHlwZSA9PT0gJ0Z1bmN0aW9uJykge1xuICAgIHZhbGlkID0gdHlwZW9mIHZhbHVlID09PSAoZXhwZWN0ZWRUeXBlID0gJ2Z1bmN0aW9uJyk7XG4gIH0gZWxzZSBpZiAoZXhwZWN0ZWRUeXBlID09PSAnT2JqZWN0Jykge1xuICAgIHZhbGlkID0gaXNQbGFpbk9iamVjdCh2YWx1ZSk7XG4gIH0gZWxzZSBpZiAoZXhwZWN0ZWRUeXBlID09PSAnQXJyYXknKSB7XG4gICAgdmFsaWQgPSBBcnJheS5pc0FycmF5KHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICB2YWxpZCA9IHZhbHVlIGluc3RhbmNlb2YgdHlwZTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHZhbGlkOiB2YWxpZCxcbiAgICBleHBlY3RlZFR5cGU6IGV4cGVjdGVkVHlwZVxuICB9XG59XG5cbi8qKlxuICogVXNlIGZ1bmN0aW9uIHN0cmluZyBuYW1lIHRvIGNoZWNrIGJ1aWx0LWluIHR5cGVzLFxuICogYmVjYXVzZSBhIHNpbXBsZSBlcXVhbGl0eSBjaGVjayB3aWxsIGZhaWwgd2hlbiBydW5uaW5nXG4gKiBhY3Jvc3MgZGlmZmVyZW50IHZtcyAvIGlmcmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGdldFR5cGUgKGZuKSB7XG4gIHZhciBtYXRjaCA9IGZuICYmIGZuLnRvU3RyaW5nKCkubWF0Y2goL15cXHMqZnVuY3Rpb24gKFxcdyspLyk7XG4gIHJldHVybiBtYXRjaCAmJiBtYXRjaFsxXVxufVxuXG5mdW5jdGlvbiBpc0Jvb2xlYW5UeXBlIChmbikge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoZm4pKSB7XG4gICAgcmV0dXJuIGdldFR5cGUoZm4pID09PSAnQm9vbGVhbidcbiAgfVxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gZm4ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZ2V0VHlwZShmbltpXSkgPT09ICdCb29sZWFuJykge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuXG52YXIgdXRpbCA9IE9iamVjdC5mcmVlemUoe1xuXHRkZWZpbmVSZWFjdGl2ZTogZGVmaW5lUmVhY3RpdmUkJDEsXG5cdF90b1N0cmluZzogX3RvU3RyaW5nLFxuXHR0b051bWJlcjogdG9OdW1iZXIsXG5cdG1ha2VNYXA6IG1ha2VNYXAsXG5cdGlzQnVpbHRJblRhZzogaXNCdWlsdEluVGFnLFxuXHRyZW1vdmU6IHJlbW92ZSQxLFxuXHRoYXNPd246IGhhc093bixcblx0aXNQcmltaXRpdmU6IGlzUHJpbWl0aXZlLFxuXHRjYWNoZWQ6IGNhY2hlZCxcblx0Y2FtZWxpemU6IGNhbWVsaXplLFxuXHRjYXBpdGFsaXplOiBjYXBpdGFsaXplLFxuXHRoeXBoZW5hdGU6IGh5cGhlbmF0ZSxcblx0YmluZDogYmluZCQxLFxuXHR0b0FycmF5OiB0b0FycmF5LFxuXHRleHRlbmQ6IGV4dGVuZCxcblx0aXNPYmplY3Q6IGlzT2JqZWN0LFxuXHRpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuXHR0b09iamVjdDogdG9PYmplY3QsXG5cdG5vb3A6IG5vb3AsXG5cdG5vOiBubyxcblx0Z2VuU3RhdGljS2V5czogZ2VuU3RhdGljS2V5cyxcblx0bG9vc2VFcXVhbDogbG9vc2VFcXVhbCxcblx0bG9vc2VJbmRleE9mOiBsb29zZUluZGV4T2YsXG5cdGlzUmVzZXJ2ZWQ6IGlzUmVzZXJ2ZWQsXG5cdGRlZjogZGVmLFxuXHRwYXJzZVBhdGg6IHBhcnNlUGF0aCxcblx0aGFzUHJvdG86IGhhc1Byb3RvLFxuXHRpbkJyb3dzZXI6IGluQnJvd3Nlcixcblx0VUE6IFVBLFxuXHRpc0lFOiBpc0lFLFxuXHRpc0lFOTogaXNJRTksXG5cdGlzRWRnZTogaXNFZGdlLFxuXHRpc0FuZHJvaWQ6IGlzQW5kcm9pZCxcblx0aXNJT1M6IGlzSU9TLFxuXHRpc1NlcnZlclJlbmRlcmluZzogaXNTZXJ2ZXJSZW5kZXJpbmcsXG5cdGRldnRvb2xzOiBkZXZ0b29scyxcblx0bmV4dFRpY2s6IG5leHRUaWNrLFxuXHRnZXQgX1NldCAoKSB7IHJldHVybiBfU2V0OyB9LFxuXHRtZXJnZU9wdGlvbnM6IG1lcmdlT3B0aW9ucyxcblx0cmVzb2x2ZUFzc2V0OiByZXNvbHZlQXNzZXQsXG5cdGdldCB3YXJuICgpIHsgcmV0dXJuIHdhcm47IH0sXG5cdGdldCBmb3JtYXRDb21wb25lbnROYW1lICgpIHsgcmV0dXJuIGZvcm1hdENvbXBvbmVudE5hbWU7IH0sXG5cdHZhbGlkYXRlUHJvcDogdmFsaWRhdGVQcm9wXG59KTtcblxuLyogbm90IHR5cGUgY2hlY2tpbmcgdGhpcyBmaWxlIGJlY2F1c2UgZmxvdyBkb2Vzbid0IHBsYXkgd2VsbCB3aXRoIFByb3h5ICovXG5cbnZhciBpbml0UHJveHk7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIHZhciBhbGxvd2VkR2xvYmFscyA9IG1ha2VNYXAoXG4gICAgJ0luZmluaXR5LHVuZGVmaW5lZCxOYU4saXNGaW5pdGUsaXNOYU4sJyArXG4gICAgJ3BhcnNlRmxvYXQscGFyc2VJbnQsZGVjb2RlVVJJLGRlY29kZVVSSUNvbXBvbmVudCxlbmNvZGVVUkksZW5jb2RlVVJJQ29tcG9uZW50LCcgK1xuICAgICdNYXRoLE51bWJlcixEYXRlLEFycmF5LE9iamVjdCxCb29sZWFuLFN0cmluZyxSZWdFeHAsTWFwLFNldCxKU09OLEludGwsJyArXG4gICAgJ3JlcXVpcmUnIC8vIGZvciBXZWJwYWNrL0Jyb3dzZXJpZnlcbiAgKTtcblxuICB2YXIgd2Fybk5vblByZXNlbnQgPSBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHtcbiAgICB3YXJuKFxuICAgICAgXCJQcm9wZXJ0eSBvciBtZXRob2QgXFxcIlwiICsga2V5ICsgXCJcXFwiIGlzIG5vdCBkZWZpbmVkIG9uIHRoZSBpbnN0YW5jZSBidXQgXCIgK1xuICAgICAgXCJyZWZlcmVuY2VkIGR1cmluZyByZW5kZXIuIE1ha2Ugc3VyZSB0byBkZWNsYXJlIHJlYWN0aXZlIGRhdGEgXCIgK1xuICAgICAgXCJwcm9wZXJ0aWVzIGluIHRoZSBkYXRhIG9wdGlvbi5cIixcbiAgICAgIHRhcmdldFxuICAgICk7XG4gIH07XG5cbiAgdmFyIGhhc1Byb3h5ID1cbiAgICB0eXBlb2YgUHJveHkgIT09ICd1bmRlZmluZWQnICYmXG4gICAgUHJveHkudG9TdHJpbmcoKS5tYXRjaCgvbmF0aXZlIGNvZGUvKTtcblxuICBpZiAoaGFzUHJveHkpIHtcbiAgICB2YXIgaXNCdWlsdEluTW9kaWZpZXIgPSBtYWtlTWFwKCdzdG9wLHByZXZlbnQsc2VsZixjdHJsLHNoaWZ0LGFsdCxtZXRhJyk7XG4gICAgY29uZmlnLmtleUNvZGVzID0gbmV3IFByb3h5KGNvbmZpZy5rZXlDb2Rlcywge1xuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQgKHRhcmdldCwga2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoaXNCdWlsdEluTW9kaWZpZXIoa2V5KSkge1xuICAgICAgICAgIHdhcm4oKFwiQXZvaWQgb3ZlcndyaXRpbmcgYnVpbHQtaW4gbW9kaWZpZXIgaW4gY29uZmlnLmtleUNvZGVzOiAuXCIgKyBrZXkpKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHZhciBoYXNIYW5kbGVyID0ge1xuICAgIGhhczogZnVuY3Rpb24gaGFzICh0YXJnZXQsIGtleSkge1xuICAgICAgdmFyIGhhcyA9IGtleSBpbiB0YXJnZXQ7XG4gICAgICB2YXIgaXNBbGxvd2VkID0gYWxsb3dlZEdsb2JhbHMoa2V5KSB8fCBrZXkuY2hhckF0KDApID09PSAnXyc7XG4gICAgICBpZiAoIWhhcyAmJiAhaXNBbGxvd2VkKSB7XG4gICAgICAgIHdhcm5Ob25QcmVzZW50KHRhcmdldCwga2V5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBoYXMgfHwgIWlzQWxsb3dlZFxuICAgIH1cbiAgfTtcblxuICB2YXIgZ2V0SGFuZGxlciA9IHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCAodGFyZ2V0LCBrZXkpIHtcbiAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyAmJiAhKGtleSBpbiB0YXJnZXQpKSB7XG4gICAgICAgIHdhcm5Ob25QcmVzZW50KHRhcmdldCwga2V5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0YXJnZXRba2V5XVxuICAgIH1cbiAgfTtcblxuICBpbml0UHJveHkgPSBmdW5jdGlvbiBpbml0UHJveHkgKHZtKSB7XG4gICAgaWYgKGhhc1Byb3h5KSB7XG4gICAgICAvLyBkZXRlcm1pbmUgd2hpY2ggcHJveHkgaGFuZGxlciB0byB1c2VcbiAgICAgIHZhciBvcHRpb25zID0gdm0uJG9wdGlvbnM7XG4gICAgICB2YXIgaGFuZGxlcnMgPSBvcHRpb25zLnJlbmRlciAmJiBvcHRpb25zLnJlbmRlci5fd2l0aFN0cmlwcGVkXG4gICAgICAgID8gZ2V0SGFuZGxlclxuICAgICAgICA6IGhhc0hhbmRsZXI7XG4gICAgICB2bS5fcmVuZGVyUHJveHkgPSBuZXcgUHJveHkodm0sIGhhbmRsZXJzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdm0uX3JlbmRlclByb3h5ID0gdm07XG4gICAgfVxuICB9O1xufVxuXG4vKiAgKi9cblxuXG52YXIgcXVldWUgPSBbXTtcbnZhciBoYXMkMSA9IHt9O1xudmFyIGNpcmN1bGFyID0ge307XG52YXIgd2FpdGluZyA9IGZhbHNlO1xudmFyIGZsdXNoaW5nID0gZmFsc2U7XG52YXIgaW5kZXggPSAwO1xuXG4vKipcbiAqIFJlc2V0IHRoZSBzY2hlZHVsZXIncyBzdGF0ZS5cbiAqL1xuZnVuY3Rpb24gcmVzZXRTY2hlZHVsZXJTdGF0ZSAoKSB7XG4gIHF1ZXVlLmxlbmd0aCA9IDA7XG4gIGhhcyQxID0ge307XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgY2lyY3VsYXIgPSB7fTtcbiAgfVxuICB3YWl0aW5nID0gZmx1c2hpbmcgPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBGbHVzaCBib3RoIHF1ZXVlcyBhbmQgcnVuIHRoZSB3YXRjaGVycy5cbiAqL1xuZnVuY3Rpb24gZmx1c2hTY2hlZHVsZXJRdWV1ZSAoKSB7XG4gIGZsdXNoaW5nID0gdHJ1ZTtcblxuICAvLyBTb3J0IHF1ZXVlIGJlZm9yZSBmbHVzaC5cbiAgLy8gVGhpcyBlbnN1cmVzIHRoYXQ6XG4gIC8vIDEuIENvbXBvbmVudHMgYXJlIHVwZGF0ZWQgZnJvbSBwYXJlbnQgdG8gY2hpbGQuIChiZWNhdXNlIHBhcmVudCBpcyBhbHdheXNcbiAgLy8gICAgY3JlYXRlZCBiZWZvcmUgdGhlIGNoaWxkKVxuICAvLyAyLiBBIGNvbXBvbmVudCdzIHVzZXIgd2F0Y2hlcnMgYXJlIHJ1biBiZWZvcmUgaXRzIHJlbmRlciB3YXRjaGVyIChiZWNhdXNlXG4gIC8vICAgIHVzZXIgd2F0Y2hlcnMgYXJlIGNyZWF0ZWQgYmVmb3JlIHRoZSByZW5kZXIgd2F0Y2hlcilcbiAgLy8gMy4gSWYgYSBjb21wb25lbnQgaXMgZGVzdHJveWVkIGR1cmluZyBhIHBhcmVudCBjb21wb25lbnQncyB3YXRjaGVyIHJ1bixcbiAgLy8gICAgaXRzIHdhdGNoZXJzIGNhbiBiZSBza2lwcGVkLlxuICBxdWV1ZS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLmlkIC0gYi5pZDsgfSk7XG5cbiAgLy8gZG8gbm90IGNhY2hlIGxlbmd0aCBiZWNhdXNlIG1vcmUgd2F0Y2hlcnMgbWlnaHQgYmUgcHVzaGVkXG4gIC8vIGFzIHdlIHJ1biBleGlzdGluZyB3YXRjaGVyc1xuICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBxdWV1ZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICB2YXIgd2F0Y2hlciA9IHF1ZXVlW2luZGV4XTtcbiAgICB2YXIgaWQgPSB3YXRjaGVyLmlkO1xuICAgIGhhcyQxW2lkXSA9IG51bGw7XG4gICAgd2F0Y2hlci5ydW4oKTtcbiAgICAvLyBpbiBkZXYgYnVpbGQsIGNoZWNrIGFuZCBzdG9wIGNpcmN1bGFyIHVwZGF0ZXMuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgaGFzJDFbaWRdICE9IG51bGwpIHtcbiAgICAgIGNpcmN1bGFyW2lkXSA9IChjaXJjdWxhcltpZF0gfHwgMCkgKyAxO1xuICAgICAgaWYgKGNpcmN1bGFyW2lkXSA+IGNvbmZpZy5fbWF4VXBkYXRlQ291bnQpIHtcbiAgICAgICAgd2FybihcbiAgICAgICAgICAnWW91IG1heSBoYXZlIGFuIGluZmluaXRlIHVwZGF0ZSBsb29wICcgKyAoXG4gICAgICAgICAgICB3YXRjaGVyLnVzZXJcbiAgICAgICAgICAgICAgPyAoXCJpbiB3YXRjaGVyIHdpdGggZXhwcmVzc2lvbiBcXFwiXCIgKyAod2F0Y2hlci5leHByZXNzaW9uKSArIFwiXFxcIlwiKVxuICAgICAgICAgICAgICA6IFwiaW4gYSBjb21wb25lbnQgcmVuZGVyIGZ1bmN0aW9uLlwiXG4gICAgICAgICAgKSxcbiAgICAgICAgICB3YXRjaGVyLnZtXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gZGV2dG9vbCBob29rXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoZGV2dG9vbHMgJiYgY29uZmlnLmRldnRvb2xzKSB7XG4gICAgZGV2dG9vbHMuZW1pdCgnZmx1c2gnKTtcbiAgfVxuXG4gIHJlc2V0U2NoZWR1bGVyU3RhdGUoKTtcbn1cblxuLyoqXG4gKiBQdXNoIGEgd2F0Y2hlciBpbnRvIHRoZSB3YXRjaGVyIHF1ZXVlLlxuICogSm9icyB3aXRoIGR1cGxpY2F0ZSBJRHMgd2lsbCBiZSBza2lwcGVkIHVubGVzcyBpdCdzXG4gKiBwdXNoZWQgd2hlbiB0aGUgcXVldWUgaXMgYmVpbmcgZmx1c2hlZC5cbiAqL1xuZnVuY3Rpb24gcXVldWVXYXRjaGVyICh3YXRjaGVyKSB7XG4gIHZhciBpZCA9IHdhdGNoZXIuaWQ7XG4gIGlmIChoYXMkMVtpZF0gPT0gbnVsbCkge1xuICAgIGhhcyQxW2lkXSA9IHRydWU7XG4gICAgaWYgKCFmbHVzaGluZykge1xuICAgICAgcXVldWUucHVzaCh3YXRjaGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaWYgYWxyZWFkeSBmbHVzaGluZywgc3BsaWNlIHRoZSB3YXRjaGVyIGJhc2VkIG9uIGl0cyBpZFxuICAgICAgLy8gaWYgYWxyZWFkeSBwYXN0IGl0cyBpZCwgaXQgd2lsbCBiZSBydW4gbmV4dCBpbW1lZGlhdGVseS5cbiAgICAgIHZhciBpID0gcXVldWUubGVuZ3RoIC0gMTtcbiAgICAgIHdoaWxlIChpID49IDAgJiYgcXVldWVbaV0uaWQgPiB3YXRjaGVyLmlkKSB7XG4gICAgICAgIGktLTtcbiAgICAgIH1cbiAgICAgIHF1ZXVlLnNwbGljZShNYXRoLm1heChpLCBpbmRleCkgKyAxLCAwLCB3YXRjaGVyKTtcbiAgICB9XG4gICAgLy8gcXVldWUgdGhlIGZsdXNoXG4gICAgaWYgKCF3YWl0aW5nKSB7XG4gICAgICB3YWl0aW5nID0gdHJ1ZTtcbiAgICAgIG5leHRUaWNrKGZsdXNoU2NoZWR1bGVyUXVldWUpO1xuICAgIH1cbiAgfVxufVxuXG4vKiAgKi9cblxudmFyIHVpZCQyID0gMDtcblxuLyoqXG4gKiBBIHdhdGNoZXIgcGFyc2VzIGFuIGV4cHJlc3Npb24sIGNvbGxlY3RzIGRlcGVuZGVuY2llcyxcbiAqIGFuZCBmaXJlcyBjYWxsYmFjayB3aGVuIHRoZSBleHByZXNzaW9uIHZhbHVlIGNoYW5nZXMuXG4gKiBUaGlzIGlzIHVzZWQgZm9yIGJvdGggdGhlICR3YXRjaCgpIGFwaSBhbmQgZGlyZWN0aXZlcy5cbiAqL1xudmFyIFdhdGNoZXIgPSBmdW5jdGlvbiBXYXRjaGVyIChcbiAgdm0sXG4gIGV4cE9yRm4sXG4gIGNiLFxuICBvcHRpb25zXG4pIHtcbiAgaWYgKCBvcHRpb25zID09PSB2b2lkIDAgKSBvcHRpb25zID0ge307XG5cbiAgdGhpcy52bSA9IHZtO1xuICB2bS5fd2F0Y2hlcnMucHVzaCh0aGlzKTtcbiAgLy8gb3B0aW9uc1xuICB0aGlzLmRlZXAgPSAhIW9wdGlvbnMuZGVlcDtcbiAgdGhpcy51c2VyID0gISFvcHRpb25zLnVzZXI7XG4gIHRoaXMubGF6eSA9ICEhb3B0aW9ucy5sYXp5O1xuICB0aGlzLnN5bmMgPSAhIW9wdGlvbnMuc3luYztcbiAgdGhpcy5leHByZXNzaW9uID0gZXhwT3JGbi50b1N0cmluZygpO1xuICB0aGlzLmNiID0gY2I7XG4gIHRoaXMuaWQgPSArK3VpZCQyOyAvLyB1aWQgZm9yIGJhdGNoaW5nXG4gIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgdGhpcy5kaXJ0eSA9IHRoaXMubGF6eTsgLy8gZm9yIGxhenkgd2F0Y2hlcnNcbiAgdGhpcy5kZXBzID0gW107XG4gIHRoaXMubmV3RGVwcyA9IFtdO1xuICB0aGlzLmRlcElkcyA9IG5ldyBfU2V0KCk7XG4gIHRoaXMubmV3RGVwSWRzID0gbmV3IF9TZXQoKTtcbiAgLy8gcGFyc2UgZXhwcmVzc2lvbiBmb3IgZ2V0dGVyXG4gIGlmICh0eXBlb2YgZXhwT3JGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRoaXMuZ2V0dGVyID0gZXhwT3JGbjtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmdldHRlciA9IHBhcnNlUGF0aChleHBPckZuKTtcbiAgICBpZiAoIXRoaXMuZ2V0dGVyKSB7XG4gICAgICB0aGlzLmdldHRlciA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKFxuICAgICAgICBcIkZhaWxlZCB3YXRjaGluZyBwYXRoOiBcXFwiXCIgKyBleHBPckZuICsgXCJcXFwiIFwiICtcbiAgICAgICAgJ1dhdGNoZXIgb25seSBhY2NlcHRzIHNpbXBsZSBkb3QtZGVsaW1pdGVkIHBhdGhzLiAnICtcbiAgICAgICAgJ0ZvciBmdWxsIGNvbnRyb2wsIHVzZSBhIGZ1bmN0aW9uIGluc3RlYWQuJyxcbiAgICAgICAgdm1cbiAgICAgICk7XG4gICAgfVxuICB9XG4gIHRoaXMudmFsdWUgPSB0aGlzLmxhenlcbiAgICA/IHVuZGVmaW5lZFxuICAgIDogdGhpcy5nZXQoKTtcbn07XG5cbi8qKlxuICogRXZhbHVhdGUgdGhlIGdldHRlciwgYW5kIHJlLWNvbGxlY3QgZGVwZW5kZW5jaWVzLlxuICovXG5XYXRjaGVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQgKCkge1xuICBwdXNoVGFyZ2V0KHRoaXMpO1xuICB2YXIgdmFsdWUgPSB0aGlzLmdldHRlci5jYWxsKHRoaXMudm0sIHRoaXMudm0pO1xuICAvLyBcInRvdWNoXCIgZXZlcnkgcHJvcGVydHkgc28gdGhleSBhcmUgYWxsIHRyYWNrZWQgYXNcbiAgLy8gZGVwZW5kZW5jaWVzIGZvciBkZWVwIHdhdGNoaW5nXG4gIGlmICh0aGlzLmRlZXApIHtcbiAgICB0cmF2ZXJzZSh2YWx1ZSk7XG4gIH1cbiAgcG9wVGFyZ2V0KCk7XG4gIHRoaXMuY2xlYW51cERlcHMoKTtcbiAgcmV0dXJuIHZhbHVlXG59O1xuXG4vKipcbiAqIEFkZCBhIGRlcGVuZGVuY3kgdG8gdGhpcyBkaXJlY3RpdmUuXG4gKi9cbldhdGNoZXIucHJvdG90eXBlLmFkZERlcCA9IGZ1bmN0aW9uIGFkZERlcCAoZGVwKSB7XG4gIHZhciBpZCA9IGRlcC5pZDtcbiAgaWYgKCF0aGlzLm5ld0RlcElkcy5oYXMoaWQpKSB7XG4gICAgdGhpcy5uZXdEZXBJZHMuYWRkKGlkKTtcbiAgICB0aGlzLm5ld0RlcHMucHVzaChkZXApO1xuICAgIGlmICghdGhpcy5kZXBJZHMuaGFzKGlkKSkge1xuICAgICAgZGVwLmFkZFN1Yih0aGlzKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogQ2xlYW4gdXAgZm9yIGRlcGVuZGVuY3kgY29sbGVjdGlvbi5cbiAqL1xuV2F0Y2hlci5wcm90b3R5cGUuY2xlYW51cERlcHMgPSBmdW5jdGlvbiBjbGVhbnVwRGVwcyAoKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdmFyIGkgPSB0aGlzLmRlcHMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgdmFyIGRlcCA9IHRoaXMkMS5kZXBzW2ldO1xuICAgIGlmICghdGhpcyQxLm5ld0RlcElkcy5oYXMoZGVwLmlkKSkge1xuICAgICAgZGVwLnJlbW92ZVN1Yih0aGlzJDEpO1xuICAgIH1cbiAgfVxuICB2YXIgdG1wID0gdGhpcy5kZXBJZHM7XG4gIHRoaXMuZGVwSWRzID0gdGhpcy5uZXdEZXBJZHM7XG4gIHRoaXMubmV3RGVwSWRzID0gdG1wO1xuICB0aGlzLm5ld0RlcElkcy5jbGVhcigpO1xuICB0bXAgPSB0aGlzLmRlcHM7XG4gIHRoaXMuZGVwcyA9IHRoaXMubmV3RGVwcztcbiAgdGhpcy5uZXdEZXBzID0gdG1wO1xuICB0aGlzLm5ld0RlcHMubGVuZ3RoID0gMDtcbn07XG5cbi8qKlxuICogU3Vic2NyaWJlciBpbnRlcmZhY2UuXG4gKiBXaWxsIGJlIGNhbGxlZCB3aGVuIGEgZGVwZW5kZW5jeSBjaGFuZ2VzLlxuICovXG5XYXRjaGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUgKCkge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAodGhpcy5sYXp5KSB7XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gIH0gZWxzZSBpZiAodGhpcy5zeW5jKSB7XG4gICAgdGhpcy5ydW4oKTtcbiAgfSBlbHNlIHtcbiAgICBxdWV1ZVdhdGNoZXIodGhpcyk7XG4gIH1cbn07XG5cbi8qKlxuICogU2NoZWR1bGVyIGpvYiBpbnRlcmZhY2UuXG4gKiBXaWxsIGJlIGNhbGxlZCBieSB0aGUgc2NoZWR1bGVyLlxuICovXG5XYXRjaGVyLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiBydW4gKCkge1xuICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmdldCgpO1xuICAgICAgaWYgKFxuICAgICAgICB2YWx1ZSAhPT0gdGhpcy52YWx1ZSB8fFxuICAgICAgLy8gRGVlcCB3YXRjaGVycyBhbmQgd2F0Y2hlcnMgb24gT2JqZWN0L0FycmF5cyBzaG91bGQgZmlyZSBldmVuXG4gICAgICAvLyB3aGVuIHRoZSB2YWx1ZSBpcyB0aGUgc2FtZSwgYmVjYXVzZSB0aGUgdmFsdWUgbWF5XG4gICAgICAvLyBoYXZlIG11dGF0ZWQuXG4gICAgICBpc09iamVjdCh2YWx1ZSkgfHxcbiAgICAgIHRoaXMuZGVlcFxuICAgICkge1xuICAgICAgLy8gc2V0IG5ldyB2YWx1ZVxuICAgICAgdmFyIG9sZFZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgIGlmICh0aGlzLnVzZXIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmNiLmNhbGwodGhpcy52bSwgdmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgICAgaWYgKGNvbmZpZy5lcnJvckhhbmRsZXIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5lcnJvckhhbmRsZXIuY2FsbChudWxsLCBlLCB0aGlzLnZtKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKFxuICAgICAgICAgICAgICAoXCJFcnJvciBpbiB3YXRjaGVyIFxcXCJcIiArICh0aGlzLmV4cHJlc3Npb24pICsgXCJcXFwiXCIpLFxuICAgICAgICAgICAgICB0aGlzLnZtXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhyb3cgZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jYi5jYWxsKHRoaXMudm0sIHZhbHVlLCBvbGRWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEV2YWx1YXRlIHRoZSB2YWx1ZSBvZiB0aGUgd2F0Y2hlci5cbiAqIFRoaXMgb25seSBnZXRzIGNhbGxlZCBmb3IgbGF6eSB3YXRjaGVycy5cbiAqL1xuV2F0Y2hlci5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiBldmFsdWF0ZSAoKSB7XG4gIHRoaXMudmFsdWUgPSB0aGlzLmdldCgpO1xuICB0aGlzLmRpcnR5ID0gZmFsc2U7XG59O1xuXG4vKipcbiAqIERlcGVuZCBvbiBhbGwgZGVwcyBjb2xsZWN0ZWQgYnkgdGhpcyB3YXRjaGVyLlxuICovXG5XYXRjaGVyLnByb3RvdHlwZS5kZXBlbmQgPSBmdW5jdGlvbiBkZXBlbmQgKCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIHZhciBpID0gdGhpcy5kZXBzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIHRoaXMkMS5kZXBzW2ldLmRlcGVuZCgpO1xuICB9XG59O1xuXG4vKipcbiAqIFJlbW92ZSBzZWxmIGZyb20gYWxsIGRlcGVuZGVuY2llcycgc3Vic2NyaWJlciBsaXN0LlxuICovXG5XYXRjaGVyLnByb3RvdHlwZS50ZWFyZG93biA9IGZ1bmN0aW9uIHRlYXJkb3duICgpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAvLyByZW1vdmUgc2VsZiBmcm9tIHZtJ3Mgd2F0Y2hlciBsaXN0XG4gICAgLy8gdGhpcyBpcyBhIHNvbWV3aGF0IGV4cGVuc2l2ZSBvcGVyYXRpb24gc28gd2Ugc2tpcCBpdFxuICAgIC8vIGlmIHRoZSB2bSBpcyBiZWluZyBkZXN0cm95ZWQgb3IgaXMgcGVyZm9ybWluZyBhIHYtZm9yXG4gICAgLy8gcmUtcmVuZGVyICh0aGUgd2F0Y2hlciBsaXN0IGlzIHRoZW4gZmlsdGVyZWQgYnkgdi1mb3IpLlxuICAgIGlmICghdGhpcy52bS5faXNCZWluZ0Rlc3Ryb3llZCAmJiAhdGhpcy52bS5fdkZvclJlbW92aW5nKSB7XG4gICAgICByZW1vdmUkMSh0aGlzLnZtLl93YXRjaGVycywgdGhpcyk7XG4gICAgfVxuICAgIHZhciBpID0gdGhpcy5kZXBzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB0aGlzJDEuZGVwc1tpXS5yZW1vdmVTdWIodGhpcyQxKTtcbiAgICB9XG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZWN1cnNpdmVseSB0cmF2ZXJzZSBhbiBvYmplY3QgdG8gZXZva2UgYWxsIGNvbnZlcnRlZFxuICogZ2V0dGVycywgc28gdGhhdCBldmVyeSBuZXN0ZWQgcHJvcGVydHkgaW5zaWRlIHRoZSBvYmplY3RcbiAqIGlzIGNvbGxlY3RlZCBhcyBhIFwiZGVlcFwiIGRlcGVuZGVuY3kuXG4gKi9cbnZhciBzZWVuT2JqZWN0cyA9IG5ldyBfU2V0KCk7XG5mdW5jdGlvbiB0cmF2ZXJzZSAodmFsKSB7XG4gIHNlZW5PYmplY3RzLmNsZWFyKCk7XG4gIF90cmF2ZXJzZSh2YWwsIHNlZW5PYmplY3RzKTtcbn1cblxuZnVuY3Rpb24gX3RyYXZlcnNlICh2YWwsIHNlZW4pIHtcbiAgdmFyIGksIGtleXM7XG4gIHZhciBpc0EgPSBBcnJheS5pc0FycmF5KHZhbCk7XG4gIGlmICgoIWlzQSAmJiAhaXNPYmplY3QodmFsKSkgfHwgIU9iamVjdC5pc0V4dGVuc2libGUodmFsKSkge1xuICAgIHJldHVyblxuICB9XG4gIGlmICh2YWwuX19vYl9fKSB7XG4gICAgdmFyIGRlcElkID0gdmFsLl9fb2JfXy5kZXAuaWQ7XG4gICAgaWYgKHNlZW4uaGFzKGRlcElkKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHNlZW4uYWRkKGRlcElkKTtcbiAgfVxuICBpZiAoaXNBKSB7XG4gICAgaSA9IHZhbC5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkgeyBfdHJhdmVyc2UodmFsW2ldLCBzZWVuKTsgfVxuICB9IGVsc2Uge1xuICAgIGtleXMgPSBPYmplY3Qua2V5cyh2YWwpO1xuICAgIGkgPSBrZXlzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7IF90cmF2ZXJzZSh2YWxba2V5c1tpXV0sIHNlZW4pOyB9XG4gIH1cbn1cblxuLyogICovXG5cbmZ1bmN0aW9uIGluaXRTdGF0ZSAodm0pIHtcbiAgdm0uX3dhdGNoZXJzID0gW107XG4gIGluaXRQcm9wcyh2bSk7XG4gIGluaXRNZXRob2RzKHZtKTtcbiAgaW5pdERhdGEodm0pO1xuICBpbml0Q29tcHV0ZWQodm0pO1xuICBpbml0V2F0Y2godm0pO1xufVxuXG52YXIgaXNSZXNlcnZlZFByb3AgPSB7IGtleTogMSwgcmVmOiAxLCBzbG90OiAxIH07XG5cbmZ1bmN0aW9uIGluaXRQcm9wcyAodm0pIHtcbiAgdmFyIHByb3BzID0gdm0uJG9wdGlvbnMucHJvcHM7XG4gIGlmIChwcm9wcykge1xuICAgIHZhciBwcm9wc0RhdGEgPSB2bS4kb3B0aW9ucy5wcm9wc0RhdGEgfHwge307XG4gICAgdmFyIGtleXMgPSB2bS4kb3B0aW9ucy5fcHJvcEtleXMgPSBPYmplY3Qua2V5cyhwcm9wcyk7XG4gICAgdmFyIGlzUm9vdCA9ICF2bS4kcGFyZW50O1xuICAgIC8vIHJvb3QgaW5zdGFuY2UgcHJvcHMgc2hvdWxkIGJlIGNvbnZlcnRlZFxuICAgIG9ic2VydmVyU3RhdGUuc2hvdWxkQ29udmVydCA9IGlzUm9vdDtcbiAgICB2YXIgbG9vcCA9IGZ1bmN0aW9uICggaSApIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIGlmIChpc1Jlc2VydmVkUHJvcFtrZXldKSB7XG4gICAgICAgICAgd2FybihcbiAgICAgICAgICAgIChcIlxcXCJcIiArIGtleSArIFwiXFxcIiBpcyBhIHJlc2VydmVkIGF0dHJpYnV0ZSBhbmQgY2Fubm90IGJlIHVzZWQgYXMgY29tcG9uZW50IHByb3AuXCIpLFxuICAgICAgICAgICAgdm1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGRlZmluZVJlYWN0aXZlJCQxKHZtLCBrZXksIHZhbGlkYXRlUHJvcChrZXksIHByb3BzLCBwcm9wc0RhdGEsIHZtKSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmICh2bS4kcGFyZW50ICYmICFvYnNlcnZlclN0YXRlLmlzU2V0dGluZ1Byb3BzKSB7XG4gICAgICAgICAgICB3YXJuKFxuICAgICAgICAgICAgICBcIkF2b2lkIG11dGF0aW5nIGEgcHJvcCBkaXJlY3RseSBzaW5jZSB0aGUgdmFsdWUgd2lsbCBiZSBcIiArXG4gICAgICAgICAgICAgIFwib3ZlcndyaXR0ZW4gd2hlbmV2ZXIgdGhlIHBhcmVudCBjb21wb25lbnQgcmUtcmVuZGVycy4gXCIgK1xuICAgICAgICAgICAgICBcIkluc3RlYWQsIHVzZSBhIGRhdGEgb3IgY29tcHV0ZWQgcHJvcGVydHkgYmFzZWQgb24gdGhlIHByb3AncyBcIiArXG4gICAgICAgICAgICAgIFwidmFsdWUuIFByb3AgYmVpbmcgbXV0YXRlZDogXFxcIlwiICsga2V5ICsgXCJcXFwiXCIsXG4gICAgICAgICAgICAgIHZtXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZpbmVSZWFjdGl2ZSQkMSh2bSwga2V5LCB2YWxpZGF0ZVByb3Aoa2V5LCBwcm9wcywgcHJvcHNEYXRhLCB2bSkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIGxvb3AoIGkgKTtcbiAgICBvYnNlcnZlclN0YXRlLnNob3VsZENvbnZlcnQgPSB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluaXREYXRhICh2bSkge1xuICB2YXIgZGF0YSA9IHZtLiRvcHRpb25zLmRhdGE7XG4gIGRhdGEgPSB2bS5fZGF0YSA9IHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nXG4gICAgPyBkYXRhLmNhbGwodm0pXG4gICAgOiBkYXRhIHx8IHt9O1xuICBpZiAoIWlzUGxhaW5PYmplY3QoZGF0YSkpIHtcbiAgICBkYXRhID0ge307XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKFxuICAgICAgJ2RhdGEgZnVuY3Rpb25zIHNob3VsZCByZXR1cm4gYW4gb2JqZWN0LicsXG4gICAgICB2bVxuICAgICk7XG4gIH1cbiAgLy8gcHJveHkgZGF0YSBvbiBpbnN0YW5jZVxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpO1xuICB2YXIgcHJvcHMgPSB2bS4kb3B0aW9ucy5wcm9wcztcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIGlmIChwcm9wcyAmJiBoYXNPd24ocHJvcHMsIGtleXNbaV0pKSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oXG4gICAgICAgIFwiVGhlIGRhdGEgcHJvcGVydHkgXFxcIlwiICsgKGtleXNbaV0pICsgXCJcXFwiIGlzIGFscmVhZHkgZGVjbGFyZWQgYXMgYSBwcm9wLiBcIiArXG4gICAgICAgIFwiVXNlIHByb3AgZGVmYXVsdCB2YWx1ZSBpbnN0ZWFkLlwiLFxuICAgICAgICB2bVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJveHkodm0sIGtleXNbaV0pO1xuICAgIH1cbiAgfVxuICAvLyBvYnNlcnZlIGRhdGFcbiAgb2JzZXJ2ZShkYXRhKTtcbiAgZGF0YS5fX29iX18gJiYgZGF0YS5fX29iX18udm1Db3VudCsrO1xufVxuXG52YXIgY29tcHV0ZWRTaGFyZWREZWZpbml0aW9uID0ge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBjb25maWd1cmFibGU6IHRydWUsXG4gIGdldDogbm9vcCxcbiAgc2V0OiBub29wXG59O1xuXG5mdW5jdGlvbiBpbml0Q29tcHV0ZWQgKHZtKSB7XG4gIHZhciBjb21wdXRlZCA9IHZtLiRvcHRpb25zLmNvbXB1dGVkO1xuICBpZiAoY29tcHV0ZWQpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gY29tcHV0ZWQpIHtcbiAgICAgIHZhciB1c2VyRGVmID0gY29tcHV0ZWRba2V5XTtcbiAgICAgIGlmICh0eXBlb2YgdXNlckRlZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb21wdXRlZFNoYXJlZERlZmluaXRpb24uZ2V0ID0gbWFrZUNvbXB1dGVkR2V0dGVyKHVzZXJEZWYsIHZtKTtcbiAgICAgICAgY29tcHV0ZWRTaGFyZWREZWZpbml0aW9uLnNldCA9IG5vb3A7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21wdXRlZFNoYXJlZERlZmluaXRpb24uZ2V0ID0gdXNlckRlZi5nZXRcbiAgICAgICAgICA/IHVzZXJEZWYuY2FjaGUgIT09IGZhbHNlXG4gICAgICAgICAgICA/IG1ha2VDb21wdXRlZEdldHRlcih1c2VyRGVmLmdldCwgdm0pXG4gICAgICAgICAgICA6IGJpbmQkMSh1c2VyRGVmLmdldCwgdm0pXG4gICAgICAgICAgOiBub29wO1xuICAgICAgICBjb21wdXRlZFNoYXJlZERlZmluaXRpb24uc2V0ID0gdXNlckRlZi5zZXRcbiAgICAgICAgICA/IGJpbmQkMSh1c2VyRGVmLnNldCwgdm0pXG4gICAgICAgICAgOiBub29wO1xuICAgICAgfVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHZtLCBrZXksIGNvbXB1dGVkU2hhcmVkRGVmaW5pdGlvbik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VDb21wdXRlZEdldHRlciAoZ2V0dGVyLCBvd25lcikge1xuICB2YXIgd2F0Y2hlciA9IG5ldyBXYXRjaGVyKG93bmVyLCBnZXR0ZXIsIG5vb3AsIHtcbiAgICBsYXp5OiB0cnVlXG4gIH0pO1xuICByZXR1cm4gZnVuY3Rpb24gY29tcHV0ZWRHZXR0ZXIgKCkge1xuICAgIGlmICh3YXRjaGVyLmRpcnR5KSB7XG4gICAgICB3YXRjaGVyLmV2YWx1YXRlKCk7XG4gICAgfVxuICAgIGlmIChEZXAudGFyZ2V0KSB7XG4gICAgICB3YXRjaGVyLmRlcGVuZCgpO1xuICAgIH1cbiAgICByZXR1cm4gd2F0Y2hlci52YWx1ZVxuICB9XG59XG5cbmZ1bmN0aW9uIGluaXRNZXRob2RzICh2bSkge1xuICB2YXIgbWV0aG9kcyA9IHZtLiRvcHRpb25zLm1ldGhvZHM7XG4gIGlmIChtZXRob2RzKSB7XG4gICAgZm9yICh2YXIga2V5IGluIG1ldGhvZHMpIHtcbiAgICAgIHZtW2tleV0gPSBtZXRob2RzW2tleV0gPT0gbnVsbCA/IG5vb3AgOiBiaW5kJDEobWV0aG9kc1trZXldLCB2bSk7XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBtZXRob2RzW2tleV0gPT0gbnVsbCkge1xuICAgICAgICB3YXJuKFxuICAgICAgICAgIFwibWV0aG9kIFxcXCJcIiArIGtleSArIFwiXFxcIiBoYXMgYW4gdW5kZWZpbmVkIHZhbHVlIGluIHRoZSBjb21wb25lbnQgZGVmaW5pdGlvbi4gXCIgK1xuICAgICAgICAgIFwiRGlkIHlvdSByZWZlcmVuY2UgdGhlIGZ1bmN0aW9uIGNvcnJlY3RseT9cIixcbiAgICAgICAgICB2bVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0V2F0Y2ggKHZtKSB7XG4gIHZhciB3YXRjaCA9IHZtLiRvcHRpb25zLndhdGNoO1xuICBpZiAod2F0Y2gpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gd2F0Y2gpIHtcbiAgICAgIHZhciBoYW5kbGVyID0gd2F0Y2hba2V5XTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGhhbmRsZXIpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGFuZGxlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNyZWF0ZVdhdGNoZXIodm0sIGtleSwgaGFuZGxlcltpXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNyZWF0ZVdhdGNoZXIodm0sIGtleSwgaGFuZGxlcik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVdhdGNoZXIgKHZtLCBrZXksIGhhbmRsZXIpIHtcbiAgdmFyIG9wdGlvbnM7XG4gIGlmIChpc1BsYWluT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgb3B0aW9ucyA9IGhhbmRsZXI7XG4gICAgaGFuZGxlciA9IGhhbmRsZXIuaGFuZGxlcjtcbiAgfVxuICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgaGFuZGxlciA9IHZtW2hhbmRsZXJdO1xuICB9XG4gIHZtLiR3YXRjaChrZXksIGhhbmRsZXIsIG9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiBzdGF0ZU1peGluIChWdWUpIHtcbiAgLy8gZmxvdyBzb21laG93IGhhcyBwcm9ibGVtcyB3aXRoIGRpcmVjdGx5IGRlY2xhcmVkIGRlZmluaXRpb24gb2JqZWN0XG4gIC8vIHdoZW4gdXNpbmcgT2JqZWN0LmRlZmluZVByb3BlcnR5LCBzbyB3ZSBoYXZlIHRvIHByb2NlZHVyYWxseSBidWlsZCB1cFxuICAvLyB0aGUgb2JqZWN0IGhlcmUuXG4gIHZhciBkYXRhRGVmID0ge307XG4gIGRhdGFEZWYuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhXG4gIH07XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgZGF0YURlZi5zZXQgPSBmdW5jdGlvbiAobmV3RGF0YSkge1xuICAgICAgd2FybihcbiAgICAgICAgJ0F2b2lkIHJlcGxhY2luZyBpbnN0YW5jZSByb290ICRkYXRhLiAnICtcbiAgICAgICAgJ1VzZSBuZXN0ZWQgZGF0YSBwcm9wZXJ0aWVzIGluc3RlYWQuJyxcbiAgICAgICAgdGhpc1xuICAgICAgKTtcbiAgICB9O1xuICB9XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShWdWUucHJvdG90eXBlLCAnJGRhdGEnLCBkYXRhRGVmKTtcblxuICBWdWUucHJvdG90eXBlLiRzZXQgPSBzZXQkMTtcbiAgVnVlLnByb3RvdHlwZS4kZGVsZXRlID0gZGVsO1xuXG4gIFZ1ZS5wcm90b3R5cGUuJHdhdGNoID0gZnVuY3Rpb24gKFxuICAgIGV4cE9yRm4sXG4gICAgY2IsXG4gICAgb3B0aW9uc1xuICApIHtcbiAgICB2YXIgdm0gPSB0aGlzO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMudXNlciA9IHRydWU7XG4gICAgdmFyIHdhdGNoZXIgPSBuZXcgV2F0Y2hlcih2bSwgZXhwT3JGbiwgY2IsIG9wdGlvbnMpO1xuICAgIGlmIChvcHRpb25zLmltbWVkaWF0ZSkge1xuICAgICAgY2IuY2FsbCh2bSwgd2F0Y2hlci52YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiB1bndhdGNoRm4gKCkge1xuICAgICAgd2F0Y2hlci50ZWFyZG93bigpO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gcHJveHkgKHZtLCBrZXkpIHtcbiAgaWYgKCFpc1Jlc2VydmVkKGtleSkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodm0sIGtleSwge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24gcHJveHlHZXR0ZXIgKCkge1xuICAgICAgICByZXR1cm4gdm0uX2RhdGFba2V5XVxuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24gcHJveHlTZXR0ZXIgKHZhbCkge1xuICAgICAgICB2bS5fZGF0YVtrZXldID0gdmFsO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbi8qICAqL1xuXG52YXIgVk5vZGUgPSBmdW5jdGlvbiBWTm9kZSAoXG4gIHRhZyxcbiAgZGF0YSxcbiAgY2hpbGRyZW4sXG4gIHRleHQsXG4gIGVsbSxcbiAgbnMsXG4gIGNvbnRleHQsXG4gIGNvbXBvbmVudE9wdGlvbnNcbikge1xuICB0aGlzLnRhZyA9IHRhZztcbiAgdGhpcy5kYXRhID0gZGF0YTtcbiAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICB0aGlzLnRleHQgPSB0ZXh0O1xuICB0aGlzLmVsbSA9IGVsbTtcbiAgdGhpcy5ucyA9IG5zO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLmZ1bmN0aW9uYWxDb250ZXh0ID0gdW5kZWZpbmVkO1xuICB0aGlzLmtleSA9IGRhdGEgJiYgZGF0YS5rZXk7XG4gIHRoaXMuY29tcG9uZW50T3B0aW9ucyA9IGNvbXBvbmVudE9wdGlvbnM7XG4gIHRoaXMuY2hpbGQgPSB1bmRlZmluZWQ7XG4gIHRoaXMucGFyZW50ID0gdW5kZWZpbmVkO1xuICB0aGlzLnJhdyA9IGZhbHNlO1xuICB0aGlzLmlzU3RhdGljID0gZmFsc2U7XG4gIHRoaXMuaXNSb290SW5zZXJ0ID0gdHJ1ZTtcbiAgdGhpcy5pc0NvbW1lbnQgPSBmYWxzZTtcbiAgdGhpcy5pc0Nsb25lZCA9IGZhbHNlO1xuICB0aGlzLmlzT25jZSA9IGZhbHNlO1xufTtcblxudmFyIGVtcHR5Vk5vZGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBub2RlID0gbmV3IFZOb2RlKCk7XG4gIG5vZGUudGV4dCA9ICcnO1xuICBub2RlLmlzQ29tbWVudCA9IHRydWU7XG4gIHJldHVybiBub2RlXG59O1xuXG4vLyBvcHRpbWl6ZWQgc2hhbGxvdyBjbG9uZVxuLy8gdXNlZCBmb3Igc3RhdGljIG5vZGVzIGFuZCBzbG90IG5vZGVzIGJlY2F1c2UgdGhleSBtYXkgYmUgcmV1c2VkIGFjcm9zc1xuLy8gbXVsdGlwbGUgcmVuZGVycywgY2xvbmluZyB0aGVtIGF2b2lkcyBlcnJvcnMgd2hlbiBET00gbWFuaXB1bGF0aW9ucyByZWx5XG4vLyBvbiB0aGVpciBlbG0gcmVmZXJlbmNlLlxuZnVuY3Rpb24gY2xvbmVWTm9kZSAodm5vZGUpIHtcbiAgdmFyIGNsb25lZCA9IG5ldyBWTm9kZShcbiAgICB2bm9kZS50YWcsXG4gICAgdm5vZGUuZGF0YSxcbiAgICB2bm9kZS5jaGlsZHJlbixcbiAgICB2bm9kZS50ZXh0LFxuICAgIHZub2RlLmVsbSxcbiAgICB2bm9kZS5ucyxcbiAgICB2bm9kZS5jb250ZXh0LFxuICAgIHZub2RlLmNvbXBvbmVudE9wdGlvbnNcbiAgKTtcbiAgY2xvbmVkLmlzU3RhdGljID0gdm5vZGUuaXNTdGF0aWM7XG4gIGNsb25lZC5rZXkgPSB2bm9kZS5rZXk7XG4gIGNsb25lZC5pc0Nsb25lZCA9IHRydWU7XG4gIHJldHVybiBjbG9uZWRcbn1cblxuZnVuY3Rpb24gY2xvbmVWTm9kZXMgKHZub2Rlcykge1xuICB2YXIgcmVzID0gbmV3IEFycmF5KHZub2Rlcy5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHZub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIHJlc1tpXSA9IGNsb25lVk5vZGUodm5vZGVzW2ldKTtcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBtZXJnZVZOb2RlSG9vayAoZGVmLCBob29rS2V5LCBob29rLCBrZXkpIHtcbiAga2V5ID0ga2V5ICsgaG9va0tleTtcbiAgdmFyIGluamVjdGVkSGFzaCA9IGRlZi5fX2luamVjdGVkIHx8IChkZWYuX19pbmplY3RlZCA9IHt9KTtcbiAgaWYgKCFpbmplY3RlZEhhc2hba2V5XSkge1xuICAgIGluamVjdGVkSGFzaFtrZXldID0gdHJ1ZTtcbiAgICB2YXIgb2xkSG9vayA9IGRlZltob29rS2V5XTtcbiAgICBpZiAob2xkSG9vaykge1xuICAgICAgZGVmW2hvb2tLZXldID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBvbGRIb29rLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGhvb2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlZltob29rS2V5XSA9IGhvb2s7XG4gICAgfVxuICB9XG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiB1cGRhdGVMaXN0ZW5lcnMgKFxuICBvbixcbiAgb2xkT24sXG4gIGFkZCxcbiAgcmVtb3ZlJCQxLFxuICB2bVxuKSB7XG4gIHZhciBuYW1lLCBjdXIsIG9sZCwgZm4sIGV2ZW50LCBjYXB0dXJlLCBvbmNlO1xuICBmb3IgKG5hbWUgaW4gb24pIHtcbiAgICBjdXIgPSBvbltuYW1lXTtcbiAgICBvbGQgPSBvbGRPbltuYW1lXTtcbiAgICBpZiAoIWN1cikge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKFxuICAgICAgICBcIkludmFsaWQgaGFuZGxlciBmb3IgZXZlbnQgXFxcIlwiICsgbmFtZSArIFwiXFxcIjogZ290IFwiICsgU3RyaW5nKGN1ciksXG4gICAgICAgIHZtXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoIW9sZCkge1xuICAgICAgb25jZSA9IG5hbWUuY2hhckF0KDApID09PSAnfic7IC8vIFByZWZpeGVkIGxhc3QsIGNoZWNrZWQgZmlyc3RcbiAgICAgIGV2ZW50ID0gb25jZSA/IG5hbWUuc2xpY2UoMSkgOiBuYW1lO1xuICAgICAgY2FwdHVyZSA9IGV2ZW50LmNoYXJBdCgwKSA9PT0gJyEnO1xuICAgICAgZXZlbnQgPSBjYXB0dXJlID8gZXZlbnQuc2xpY2UoMSkgOiBldmVudDtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGN1cikpIHtcbiAgICAgICAgYWRkKGV2ZW50LCAoY3VyLmludm9rZXIgPSBhcnJJbnZva2VyKGN1cikpLCBvbmNlLCBjYXB0dXJlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghY3VyLmludm9rZXIpIHtcbiAgICAgICAgICBmbiA9IGN1cjtcbiAgICAgICAgICBjdXIgPSBvbltuYW1lXSA9IHt9O1xuICAgICAgICAgIGN1ci5mbiA9IGZuO1xuICAgICAgICAgIGN1ci5pbnZva2VyID0gZm5JbnZva2VyKGN1cik7XG4gICAgICAgIH1cbiAgICAgICAgYWRkKGV2ZW50LCBjdXIuaW52b2tlciwgb25jZSwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjdXIgIT09IG9sZCkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2xkKSkge1xuICAgICAgICBvbGQubGVuZ3RoID0gY3VyLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbGQubGVuZ3RoOyBpKyspIHsgb2xkW2ldID0gY3VyW2ldOyB9XG4gICAgICAgIG9uW25hbWVdID0gb2xkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2xkLmZuID0gY3VyO1xuICAgICAgICBvbltuYW1lXSA9IG9sZDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZm9yIChuYW1lIGluIG9sZE9uKSB7XG4gICAgaWYgKCFvbltuYW1lXSkge1xuICAgICAgb25jZSA9IG5hbWUuY2hhckF0KDApID09PSAnfic7IC8vIFByZWZpeGVkIGxhc3QsIGNoZWNrZWQgZmlyc3RcbiAgICAgIGV2ZW50ID0gb25jZSA/IG5hbWUuc2xpY2UoMSkgOiBuYW1lO1xuICAgICAgY2FwdHVyZSA9IGV2ZW50LmNoYXJBdCgwKSA9PT0gJyEnO1xuICAgICAgZXZlbnQgPSBjYXB0dXJlID8gZXZlbnQuc2xpY2UoMSkgOiBldmVudDtcbiAgICAgIHJlbW92ZSQkMShldmVudCwgb2xkT25bbmFtZV0uaW52b2tlciwgY2FwdHVyZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFyckludm9rZXIgKGFycikge1xuICByZXR1cm4gZnVuY3Rpb24gKGV2KSB7XG4gICAgdmFyIGFyZ3VtZW50cyQxID0gYXJndW1lbnRzO1xuXG4gICAgdmFyIHNpbmdsZSA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgIHNpbmdsZSA/IGFycltpXShldikgOiBhcnJbaV0uYXBwbHkobnVsbCwgYXJndW1lbnRzJDEpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBmbkludm9rZXIgKG8pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChldikge1xuICAgIHZhciBzaW5nbGUgPSBhcmd1bWVudHMubGVuZ3RoID09PSAxO1xuICAgIHNpbmdsZSA/IG8uZm4oZXYpIDogby5mbi5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICB9XG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBub3JtYWxpemVDaGlsZHJlbiAoXG4gIGNoaWxkcmVuLFxuICBucyxcbiAgbmVzdGVkSW5kZXhcbikge1xuICBpZiAoaXNQcmltaXRpdmUoY2hpbGRyZW4pKSB7XG4gICAgcmV0dXJuIFtjcmVhdGVUZXh0Vk5vZGUoY2hpbGRyZW4pXVxuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGMgPSBjaGlsZHJlbltpXTtcbiAgICAgIHZhciBsYXN0ID0gcmVzW3Jlcy5sZW5ndGggLSAxXTtcbiAgICAgIC8vICBuZXN0ZWRcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGMpKSB7XG4gICAgICAgIHJlcy5wdXNoLmFwcGx5KHJlcywgbm9ybWFsaXplQ2hpbGRyZW4oYywgbnMsICgobmVzdGVkSW5kZXggfHwgJycpICsgXCJfXCIgKyBpKSkpO1xuICAgICAgfSBlbHNlIGlmIChpc1ByaW1pdGl2ZShjKSkge1xuICAgICAgICBpZiAobGFzdCAmJiBsYXN0LnRleHQpIHtcbiAgICAgICAgICBsYXN0LnRleHQgKz0gU3RyaW5nKGMpO1xuICAgICAgICB9IGVsc2UgaWYgKGMgIT09ICcnKSB7XG4gICAgICAgICAgLy8gY29udmVydCBwcmltaXRpdmUgdG8gdm5vZGVcbiAgICAgICAgICByZXMucHVzaChjcmVhdGVUZXh0Vk5vZGUoYykpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGMgaW5zdGFuY2VvZiBWTm9kZSkge1xuICAgICAgICBpZiAoYy50ZXh0ICYmIGxhc3QgJiYgbGFzdC50ZXh0KSB7XG4gICAgICAgICAgaWYgKCFsYXN0LmlzQ2xvbmVkKSB7XG4gICAgICAgICAgICBsYXN0LnRleHQgKz0gYy50ZXh0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBpbmhlcml0IHBhcmVudCBuYW1lc3BhY2VcbiAgICAgICAgICBpZiAobnMpIHtcbiAgICAgICAgICAgIGFwcGx5TlMoYywgbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBkZWZhdWx0IGtleSBmb3IgbmVzdGVkIGFycmF5IGNoaWxkcmVuIChsaWtlbHkgZ2VuZXJhdGVkIGJ5IHYtZm9yKVxuICAgICAgICAgIGlmIChjLnRhZyAmJiBjLmtleSA9PSBudWxsICYmIG5lc3RlZEluZGV4ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGMua2V5ID0gXCJfX3ZsaXN0XCIgKyBuZXN0ZWRJbmRleCArIFwiX1wiICsgaSArIFwiX19cIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzLnB1c2goYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHRWTm9kZSAodmFsKSB7XG4gIHJldHVybiBuZXcgVk5vZGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgU3RyaW5nKHZhbCkpXG59XG5cbmZ1bmN0aW9uIGFwcGx5TlMgKHZub2RlLCBucykge1xuICBpZiAodm5vZGUudGFnICYmICF2bm9kZS5ucykge1xuICAgIHZub2RlLm5zID0gbnM7XG4gICAgaWYgKHZub2RlLmNoaWxkcmVuKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHZub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBhcHBseU5TKHZub2RlLmNoaWxkcmVuW2ldLCBucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBnZXRGaXJzdENvbXBvbmVudENoaWxkIChjaGlsZHJlbikge1xuICByZXR1cm4gY2hpbGRyZW4gJiYgY2hpbGRyZW4uZmlsdGVyKGZ1bmN0aW9uIChjKSB7IHJldHVybiBjICYmIGMuY29tcG9uZW50T3B0aW9uczsgfSlbMF1cbn1cblxuLyogICovXG5cbnZhciBhY3RpdmVJbnN0YW5jZSA9IG51bGw7XG5cbmZ1bmN0aW9uIGluaXRMaWZlY3ljbGUgKHZtKSB7XG4gIHZhciBvcHRpb25zID0gdm0uJG9wdGlvbnM7XG5cbiAgLy8gbG9jYXRlIGZpcnN0IG5vbi1hYnN0cmFjdCBwYXJlbnRcbiAgdmFyIHBhcmVudCA9IG9wdGlvbnMucGFyZW50O1xuICBpZiAocGFyZW50ICYmICFvcHRpb25zLmFic3RyYWN0KSB7XG4gICAgd2hpbGUgKHBhcmVudC4kb3B0aW9ucy5hYnN0cmFjdCAmJiBwYXJlbnQuJHBhcmVudCkge1xuICAgICAgcGFyZW50ID0gcGFyZW50LiRwYXJlbnQ7XG4gICAgfVxuICAgIHBhcmVudC4kY2hpbGRyZW4ucHVzaCh2bSk7XG4gIH1cblxuICB2bS4kcGFyZW50ID0gcGFyZW50O1xuICB2bS4kcm9vdCA9IHBhcmVudCA/IHBhcmVudC4kcm9vdCA6IHZtO1xuXG4gIHZtLiRjaGlsZHJlbiA9IFtdO1xuICB2bS4kcmVmcyA9IHt9O1xuXG4gIHZtLl93YXRjaGVyID0gbnVsbDtcbiAgdm0uX2luYWN0aXZlID0gZmFsc2U7XG4gIHZtLl9pc01vdW50ZWQgPSBmYWxzZTtcbiAgdm0uX2lzRGVzdHJveWVkID0gZmFsc2U7XG4gIHZtLl9pc0JlaW5nRGVzdHJveWVkID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGxpZmVjeWNsZU1peGluIChWdWUpIHtcbiAgVnVlLnByb3RvdHlwZS5fbW91bnQgPSBmdW5jdGlvbiAoXG4gICAgZWwsXG4gICAgaHlkcmF0aW5nXG4gICkge1xuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgdm0uJGVsID0gZWw7XG4gICAgaWYgKCF2bS4kb3B0aW9ucy5yZW5kZXIpIHtcbiAgICAgIHZtLiRvcHRpb25zLnJlbmRlciA9IGVtcHR5Vk5vZGU7XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKHZtLiRvcHRpb25zLnRlbXBsYXRlICYmIHZtLiRvcHRpb25zLnRlbXBsYXRlLmNoYXJBdCgwKSAhPT0gJyMnKSB7XG4gICAgICAgICAgd2FybihcbiAgICAgICAgICAgICdZb3UgYXJlIHVzaW5nIHRoZSBydW50aW1lLW9ubHkgYnVpbGQgb2YgVnVlIHdoZXJlIHRoZSB0ZW1wbGF0ZSAnICtcbiAgICAgICAgICAgICdvcHRpb24gaXMgbm90IGF2YWlsYWJsZS4gRWl0aGVyIHByZS1jb21waWxlIHRoZSB0ZW1wbGF0ZXMgaW50byAnICtcbiAgICAgICAgICAgICdyZW5kZXIgZnVuY3Rpb25zLCBvciB1c2UgdGhlIGNvbXBpbGVyLWluY2x1ZGVkIGJ1aWxkLicsXG4gICAgICAgICAgICB2bVxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2FybihcbiAgICAgICAgICAgICdGYWlsZWQgdG8gbW91bnQgY29tcG9uZW50OiB0ZW1wbGF0ZSBvciByZW5kZXIgZnVuY3Rpb24gbm90IGRlZmluZWQuJyxcbiAgICAgICAgICAgIHZtXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjYWxsSG9vayh2bSwgJ2JlZm9yZU1vdW50Jyk7XG4gICAgdm0uX3dhdGNoZXIgPSBuZXcgV2F0Y2hlcih2bSwgZnVuY3Rpb24gKCkge1xuICAgICAgdm0uX3VwZGF0ZSh2bS5fcmVuZGVyKCksIGh5ZHJhdGluZyk7XG4gICAgfSwgbm9vcCk7XG4gICAgaHlkcmF0aW5nID0gZmFsc2U7XG4gICAgLy8gbWFudWFsbHkgbW91bnRlZCBpbnN0YW5jZSwgY2FsbCBtb3VudGVkIG9uIHNlbGZcbiAgICAvLyBtb3VudGVkIGlzIGNhbGxlZCBmb3IgcmVuZGVyLWNyZWF0ZWQgY2hpbGQgY29tcG9uZW50cyBpbiBpdHMgaW5zZXJ0ZWQgaG9va1xuICAgIGlmICh2bS4kdm5vZGUgPT0gbnVsbCkge1xuICAgICAgdm0uX2lzTW91bnRlZCA9IHRydWU7XG4gICAgICBjYWxsSG9vayh2bSwgJ21vdW50ZWQnKTtcbiAgICB9XG4gICAgcmV0dXJuIHZtXG4gIH07XG5cbiAgVnVlLnByb3RvdHlwZS5fdXBkYXRlID0gZnVuY3Rpb24gKHZub2RlLCBoeWRyYXRpbmcpIHtcbiAgICB2YXIgdm0gPSB0aGlzO1xuICAgIGlmICh2bS5faXNNb3VudGVkKSB7XG4gICAgICBjYWxsSG9vayh2bSwgJ2JlZm9yZVVwZGF0ZScpO1xuICAgIH1cbiAgICB2YXIgcHJldkVsID0gdm0uJGVsO1xuICAgIHZhciBwcmV2Vm5vZGUgPSB2bS5fdm5vZGU7XG4gICAgdmFyIHByZXZBY3RpdmVJbnN0YW5jZSA9IGFjdGl2ZUluc3RhbmNlO1xuICAgIGFjdGl2ZUluc3RhbmNlID0gdm07XG4gICAgdm0uX3Zub2RlID0gdm5vZGU7XG4gICAgLy8gVnVlLnByb3RvdHlwZS5fX3BhdGNoX18gaXMgaW5qZWN0ZWQgaW4gZW50cnkgcG9pbnRzXG4gICAgLy8gYmFzZWQgb24gdGhlIHJlbmRlcmluZyBiYWNrZW5kIHVzZWQuXG4gICAgaWYgKCFwcmV2Vm5vZGUpIHtcbiAgICAgIC8vIGluaXRpYWwgcmVuZGVyXG4gICAgICB2bS4kZWwgPSB2bS5fX3BhdGNoX18oXG4gICAgICAgIHZtLiRlbCwgdm5vZGUsIGh5ZHJhdGluZywgZmFsc2UgLyogcmVtb3ZlT25seSAqLyxcbiAgICAgICAgdm0uJG9wdGlvbnMuX3BhcmVudEVsbSxcbiAgICAgICAgdm0uJG9wdGlvbnMuX3JlZkVsbVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gdXBkYXRlc1xuICAgICAgdm0uJGVsID0gdm0uX19wYXRjaF9fKHByZXZWbm9kZSwgdm5vZGUpO1xuICAgIH1cbiAgICBhY3RpdmVJbnN0YW5jZSA9IHByZXZBY3RpdmVJbnN0YW5jZTtcbiAgICAvLyB1cGRhdGUgX192dWVfXyByZWZlcmVuY2VcbiAgICBpZiAocHJldkVsKSB7XG4gICAgICBwcmV2RWwuX192dWVfXyA9IG51bGw7XG4gICAgfVxuICAgIGlmICh2bS4kZWwpIHtcbiAgICAgIHZtLiRlbC5fX3Z1ZV9fID0gdm07XG4gICAgfVxuICAgIC8vIGlmIHBhcmVudCBpcyBhbiBIT0MsIHVwZGF0ZSBpdHMgJGVsIGFzIHdlbGxcbiAgICBpZiAodm0uJHZub2RlICYmIHZtLiRwYXJlbnQgJiYgdm0uJHZub2RlID09PSB2bS4kcGFyZW50Ll92bm9kZSkge1xuICAgICAgdm0uJHBhcmVudC4kZWwgPSB2bS4kZWw7XG4gICAgfVxuICAgIGlmICh2bS5faXNNb3VudGVkKSB7XG4gICAgICBjYWxsSG9vayh2bSwgJ3VwZGF0ZWQnKTtcbiAgICB9XG4gIH07XG5cbiAgVnVlLnByb3RvdHlwZS5fdXBkYXRlRnJvbVBhcmVudCA9IGZ1bmN0aW9uIChcbiAgICBwcm9wc0RhdGEsXG4gICAgbGlzdGVuZXJzLFxuICAgIHBhcmVudFZub2RlLFxuICAgIHJlbmRlckNoaWxkcmVuXG4gICkge1xuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgdmFyIGhhc0NoaWxkcmVuID0gISEodm0uJG9wdGlvbnMuX3JlbmRlckNoaWxkcmVuIHx8IHJlbmRlckNoaWxkcmVuKTtcbiAgICB2bS4kb3B0aW9ucy5fcGFyZW50Vm5vZGUgPSBwYXJlbnRWbm9kZTtcbiAgICB2bS4kdm5vZGUgPSBwYXJlbnRWbm9kZTsgLy8gdXBkYXRlIHZtJ3MgcGxhY2Vob2xkZXIgbm9kZSB3aXRob3V0IHJlLXJlbmRlclxuICAgIGlmICh2bS5fdm5vZGUpIHsgLy8gdXBkYXRlIGNoaWxkIHRyZWUncyBwYXJlbnRcbiAgICAgIHZtLl92bm9kZS5wYXJlbnQgPSBwYXJlbnRWbm9kZTtcbiAgICB9XG4gICAgdm0uJG9wdGlvbnMuX3JlbmRlckNoaWxkcmVuID0gcmVuZGVyQ2hpbGRyZW47XG4gICAgLy8gdXBkYXRlIHByb3BzXG4gICAgaWYgKHByb3BzRGF0YSAmJiB2bS4kb3B0aW9ucy5wcm9wcykge1xuICAgICAgb2JzZXJ2ZXJTdGF0ZS5zaG91bGRDb252ZXJ0ID0gZmFsc2U7XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICBvYnNlcnZlclN0YXRlLmlzU2V0dGluZ1Byb3BzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHZhciBwcm9wS2V5cyA9IHZtLiRvcHRpb25zLl9wcm9wS2V5cyB8fCBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcEtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGtleSA9IHByb3BLZXlzW2ldO1xuICAgICAgICB2bVtrZXldID0gdmFsaWRhdGVQcm9wKGtleSwgdm0uJG9wdGlvbnMucHJvcHMsIHByb3BzRGF0YSwgdm0pO1xuICAgICAgfVxuICAgICAgb2JzZXJ2ZXJTdGF0ZS5zaG91bGRDb252ZXJ0ID0gdHJ1ZTtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIG9ic2VydmVyU3RhdGUuaXNTZXR0aW5nUHJvcHMgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZtLiRvcHRpb25zLnByb3BzRGF0YSA9IHByb3BzRGF0YTtcbiAgICB9XG4gICAgLy8gdXBkYXRlIGxpc3RlbmVyc1xuICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgIHZhciBvbGRMaXN0ZW5lcnMgPSB2bS4kb3B0aW9ucy5fcGFyZW50TGlzdGVuZXJzO1xuICAgICAgdm0uJG9wdGlvbnMuX3BhcmVudExpc3RlbmVycyA9IGxpc3RlbmVycztcbiAgICAgIHZtLl91cGRhdGVMaXN0ZW5lcnMobGlzdGVuZXJzLCBvbGRMaXN0ZW5lcnMpO1xuICAgIH1cbiAgICAvLyByZXNvbHZlIHNsb3RzICsgZm9yY2UgdXBkYXRlIGlmIGhhcyBjaGlsZHJlblxuICAgIGlmIChoYXNDaGlsZHJlbikge1xuICAgICAgdm0uJHNsb3RzID0gcmVzb2x2ZVNsb3RzKHJlbmRlckNoaWxkcmVuLCBwYXJlbnRWbm9kZS5jb250ZXh0KTtcbiAgICAgIHZtLiRmb3JjZVVwZGF0ZSgpO1xuICAgIH1cbiAgfTtcblxuICBWdWUucHJvdG90eXBlLiRmb3JjZVVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdm0gPSB0aGlzO1xuICAgIGlmICh2bS5fd2F0Y2hlcikge1xuICAgICAgdm0uX3dhdGNoZXIudXBkYXRlKCk7XG4gICAgfVxuICB9O1xuXG4gIFZ1ZS5wcm90b3R5cGUuJGRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZtID0gdGhpcztcbiAgICBpZiAodm0uX2lzQmVpbmdEZXN0cm95ZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjYWxsSG9vayh2bSwgJ2JlZm9yZURlc3Ryb3knKTtcbiAgICB2bS5faXNCZWluZ0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgLy8gcmVtb3ZlIHNlbGYgZnJvbSBwYXJlbnRcbiAgICB2YXIgcGFyZW50ID0gdm0uJHBhcmVudDtcbiAgICBpZiAocGFyZW50ICYmICFwYXJlbnQuX2lzQmVpbmdEZXN0cm95ZWQgJiYgIXZtLiRvcHRpb25zLmFic3RyYWN0KSB7XG4gICAgICByZW1vdmUkMShwYXJlbnQuJGNoaWxkcmVuLCB2bSk7XG4gICAgfVxuICAgIC8vIHRlYXJkb3duIHdhdGNoZXJzXG4gICAgaWYgKHZtLl93YXRjaGVyKSB7XG4gICAgICB2bS5fd2F0Y2hlci50ZWFyZG93bigpO1xuICAgIH1cbiAgICB2YXIgaSA9IHZtLl93YXRjaGVycy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdm0uX3dhdGNoZXJzW2ldLnRlYXJkb3duKCk7XG4gICAgfVxuICAgIC8vIHJlbW92ZSByZWZlcmVuY2UgZnJvbSBkYXRhIG9iXG4gICAgLy8gZnJvemVuIG9iamVjdCBtYXkgbm90IGhhdmUgb2JzZXJ2ZXIuXG4gICAgaWYgKHZtLl9kYXRhLl9fb2JfXykge1xuICAgICAgdm0uX2RhdGEuX19vYl9fLnZtQ291bnQtLTtcbiAgICB9XG4gICAgLy8gY2FsbCB0aGUgbGFzdCBob29rLi4uXG4gICAgdm0uX2lzRGVzdHJveWVkID0gdHJ1ZTtcbiAgICBjYWxsSG9vayh2bSwgJ2Rlc3Ryb3llZCcpO1xuICAgIC8vIHR1cm4gb2ZmIGFsbCBpbnN0YW5jZSBsaXN0ZW5lcnMuXG4gICAgdm0uJG9mZigpO1xuICAgIC8vIHJlbW92ZSBfX3Z1ZV9fIHJlZmVyZW5jZVxuICAgIGlmICh2bS4kZWwpIHtcbiAgICAgIHZtLiRlbC5fX3Z1ZV9fID0gbnVsbDtcbiAgICB9XG4gICAgLy8gaW52b2tlIGRlc3Ryb3kgaG9va3Mgb24gY3VycmVudCByZW5kZXJlZCB0cmVlXG4gICAgdm0uX19wYXRjaF9fKHZtLl92bm9kZSwgbnVsbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNhbGxIb29rICh2bSwgaG9vaykge1xuICB2YXIgaGFuZGxlcnMgPSB2bS4kb3B0aW9uc1tob29rXTtcbiAgaWYgKGhhbmRsZXJzKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGogPSBoYW5kbGVycy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgIGhhbmRsZXJzW2ldLmNhbGwodm0pO1xuICAgIH1cbiAgfVxuICB2bS4kZW1pdCgnaG9vazonICsgaG9vayk7XG59XG5cbi8qICAqL1xuXG52YXIgaG9va3MgPSB7IGluaXQ6IGluaXQsIHByZXBhdGNoOiBwcmVwYXRjaCwgaW5zZXJ0OiBpbnNlcnQsIGRlc3Ryb3k6IGRlc3Ryb3kkMSB9O1xudmFyIGhvb2tzVG9NZXJnZSA9IE9iamVjdC5rZXlzKGhvb2tzKTtcblxuZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50IChcbiAgQ3RvcixcbiAgZGF0YSxcbiAgY29udGV4dCxcbiAgY2hpbGRyZW4sXG4gIHRhZ1xuKSB7XG4gIGlmICghQ3Rvcikge1xuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIGJhc2VDdG9yID0gY29udGV4dC4kb3B0aW9ucy5fYmFzZTtcbiAgaWYgKGlzT2JqZWN0KEN0b3IpKSB7XG4gICAgQ3RvciA9IGJhc2VDdG9yLmV4dGVuZChDdG9yKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgQ3RvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICB3YXJuKChcIkludmFsaWQgQ29tcG9uZW50IGRlZmluaXRpb246IFwiICsgKFN0cmluZyhDdG9yKSkpLCBjb250ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBhc3luYyBjb21wb25lbnRcbiAgaWYgKCFDdG9yLmNpZCkge1xuICAgIGlmIChDdG9yLnJlc29sdmVkKSB7XG4gICAgICBDdG9yID0gQ3Rvci5yZXNvbHZlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgQ3RvciA9IHJlc29sdmVBc3luY0NvbXBvbmVudChDdG9yLCBiYXNlQ3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBpdCdzIG9rIHRvIHF1ZXVlIHRoaXMgb24gZXZlcnkgcmVuZGVyIGJlY2F1c2VcbiAgICAgICAgLy8gJGZvcmNlVXBkYXRlIGlzIGJ1ZmZlcmVkIGJ5IHRoZSBzY2hlZHVsZXIuXG4gICAgICAgIGNvbnRleHQuJGZvcmNlVXBkYXRlKCk7XG4gICAgICB9KTtcbiAgICAgIGlmICghQ3Rvcikge1xuICAgICAgICAvLyByZXR1cm4gbm90aGluZyBpZiB0aGlzIGlzIGluZGVlZCBhbiBhc3luYyBjb21wb25lbnRcbiAgICAgICAgLy8gd2FpdCBmb3IgdGhlIGNhbGxiYWNrIHRvIHRyaWdnZXIgcGFyZW50IHVwZGF0ZS5cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gcmVzb2x2ZSBjb25zdHJ1Y3RvciBvcHRpb25zIGluIGNhc2UgZ2xvYmFsIG1peGlucyBhcmUgYXBwbGllZCBhZnRlclxuICAvLyBjb21wb25lbnQgY29uc3RydWN0b3IgY3JlYXRpb25cbiAgcmVzb2x2ZUNvbnN0cnVjdG9yT3B0aW9ucyhDdG9yKTtcblxuICBkYXRhID0gZGF0YSB8fCB7fTtcblxuICAvLyBleHRyYWN0IHByb3BzXG4gIHZhciBwcm9wc0RhdGEgPSBleHRyYWN0UHJvcHMoZGF0YSwgQ3Rvcik7XG5cbiAgLy8gZnVuY3Rpb25hbCBjb21wb25lbnRcbiAgaWYgKEN0b3Iub3B0aW9ucy5mdW5jdGlvbmFsKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnQoQ3RvciwgcHJvcHNEYXRhLCBkYXRhLCBjb250ZXh0LCBjaGlsZHJlbilcbiAgfVxuXG4gIC8vIGV4dHJhY3QgbGlzdGVuZXJzLCBzaW5jZSB0aGVzZSBuZWVkcyB0byBiZSB0cmVhdGVkIGFzXG4gIC8vIGNoaWxkIGNvbXBvbmVudCBsaXN0ZW5lcnMgaW5zdGVhZCBvZiBET00gbGlzdGVuZXJzXG4gIHZhciBsaXN0ZW5lcnMgPSBkYXRhLm9uO1xuICAvLyByZXBsYWNlIHdpdGggbGlzdGVuZXJzIHdpdGggLm5hdGl2ZSBtb2RpZmllclxuICBkYXRhLm9uID0gZGF0YS5uYXRpdmVPbjtcblxuICBpZiAoQ3Rvci5vcHRpb25zLmFic3RyYWN0KSB7XG4gICAgLy8gYWJzdHJhY3QgY29tcG9uZW50cyBkbyBub3Qga2VlcCBhbnl0aGluZ1xuICAgIC8vIG90aGVyIHRoYW4gcHJvcHMgJiBsaXN0ZW5lcnNcbiAgICBkYXRhID0ge307XG4gIH1cblxuICAvLyBtZXJnZSBjb21wb25lbnQgbWFuYWdlbWVudCBob29rcyBvbnRvIHRoZSBwbGFjZWhvbGRlciBub2RlXG4gIG1lcmdlSG9va3MoZGF0YSk7XG5cbiAgLy8gcmV0dXJuIGEgcGxhY2Vob2xkZXIgdm5vZGVcbiAgdmFyIG5hbWUgPSBDdG9yLm9wdGlvbnMubmFtZSB8fCB0YWc7XG4gIHZhciB2bm9kZSA9IG5ldyBWTm9kZShcbiAgICAoXCJ2dWUtY29tcG9uZW50LVwiICsgKEN0b3IuY2lkKSArIChuYW1lID8gKFwiLVwiICsgbmFtZSkgOiAnJykpLFxuICAgIGRhdGEsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY29udGV4dCxcbiAgICB7IEN0b3I6IEN0b3IsIHByb3BzRGF0YTogcHJvcHNEYXRhLCBsaXN0ZW5lcnM6IGxpc3RlbmVycywgdGFnOiB0YWcsIGNoaWxkcmVuOiBjaGlsZHJlbiB9XG4gICk7XG4gIHJldHVybiB2bm9kZVxufVxuXG5mdW5jdGlvbiBjcmVhdGVGdW5jdGlvbmFsQ29tcG9uZW50IChcbiAgQ3RvcixcbiAgcHJvcHNEYXRhLFxuICBkYXRhLFxuICBjb250ZXh0LFxuICBjaGlsZHJlblxuKSB7XG4gIHZhciBwcm9wcyA9IHt9O1xuICB2YXIgcHJvcE9wdGlvbnMgPSBDdG9yLm9wdGlvbnMucHJvcHM7XG4gIGlmIChwcm9wT3B0aW9ucykge1xuICAgIGZvciAodmFyIGtleSBpbiBwcm9wT3B0aW9ucykge1xuICAgICAgcHJvcHNba2V5XSA9IHZhbGlkYXRlUHJvcChrZXksIHByb3BPcHRpb25zLCBwcm9wc0RhdGEpO1xuICAgIH1cbiAgfVxuICB2YXIgdm5vZGUgPSBDdG9yLm9wdGlvbnMucmVuZGVyLmNhbGwoXG4gICAgbnVsbCxcbiAgICAvLyBlbnN1cmUgdGhlIGNyZWF0ZUVsZW1lbnQgZnVuY3Rpb24gaW4gZnVuY3Rpb25hbCBjb21wb25lbnRzXG4gICAgLy8gZ2V0cyBhIHVuaXF1ZSBjb250ZXh0IC0gdGhpcyBpcyBuZWNlc3NhcnkgZm9yIGNvcnJlY3QgbmFtZWQgc2xvdCBjaGVja1xuICAgIGJpbmQkMShjcmVhdGVFbGVtZW50LCB7IF9zZWxmOiBPYmplY3QuY3JlYXRlKGNvbnRleHQpIH0pLFxuICAgIHtcbiAgICAgIHByb3BzOiBwcm9wcyxcbiAgICAgIGRhdGE6IGRhdGEsXG4gICAgICBwYXJlbnQ6IGNvbnRleHQsXG4gICAgICBjaGlsZHJlbjogbm9ybWFsaXplQ2hpbGRyZW4oY2hpbGRyZW4pLFxuICAgICAgc2xvdHM6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlc29sdmVTbG90cyhjaGlsZHJlbiwgY29udGV4dCk7IH1cbiAgICB9XG4gICk7XG4gIGlmICh2bm9kZSBpbnN0YW5jZW9mIFZOb2RlKSB7XG4gICAgdm5vZGUuZnVuY3Rpb25hbENvbnRleHQgPSBjb250ZXh0O1xuICAgIGlmIChkYXRhLnNsb3QpIHtcbiAgICAgICh2bm9kZS5kYXRhIHx8ICh2bm9kZS5kYXRhID0ge30pKS5zbG90ID0gZGF0YS5zbG90O1xuICAgIH1cbiAgfVxuICByZXR1cm4gdm5vZGVcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50SW5zdGFuY2VGb3JWbm9kZSAoXG4gIHZub2RlLCAvLyB3ZSBrbm93IGl0J3MgTW91bnRlZENvbXBvbmVudFZOb2RlIGJ1dCBmbG93IGRvZXNuJ3RcbiAgcGFyZW50LCAvLyBhY3RpdmVJbnN0YW5jZSBpbiBsaWZlY3ljbGUgc3RhdGVcbiAgcGFyZW50RWxtLFxuICByZWZFbG1cbikge1xuICB2YXIgdm5vZGVDb21wb25lbnRPcHRpb25zID0gdm5vZGUuY29tcG9uZW50T3B0aW9ucztcbiAgdmFyIG9wdGlvbnMgPSB7XG4gICAgX2lzQ29tcG9uZW50OiB0cnVlLFxuICAgIHBhcmVudDogcGFyZW50LFxuICAgIHByb3BzRGF0YTogdm5vZGVDb21wb25lbnRPcHRpb25zLnByb3BzRGF0YSxcbiAgICBfY29tcG9uZW50VGFnOiB2bm9kZUNvbXBvbmVudE9wdGlvbnMudGFnLFxuICAgIF9wYXJlbnRWbm9kZTogdm5vZGUsXG4gICAgX3BhcmVudExpc3RlbmVyczogdm5vZGVDb21wb25lbnRPcHRpb25zLmxpc3RlbmVycyxcbiAgICBfcmVuZGVyQ2hpbGRyZW46IHZub2RlQ29tcG9uZW50T3B0aW9ucy5jaGlsZHJlbixcbiAgICBfcGFyZW50RWxtOiBwYXJlbnRFbG0gfHwgbnVsbCxcbiAgICBfcmVmRWxtOiByZWZFbG0gfHwgbnVsbFxuICB9O1xuICAvLyBjaGVjayBpbmxpbmUtdGVtcGxhdGUgcmVuZGVyIGZ1bmN0aW9uc1xuICB2YXIgaW5saW5lVGVtcGxhdGUgPSB2bm9kZS5kYXRhLmlubGluZVRlbXBsYXRlO1xuICBpZiAoaW5saW5lVGVtcGxhdGUpIHtcbiAgICBvcHRpb25zLnJlbmRlciA9IGlubGluZVRlbXBsYXRlLnJlbmRlcjtcbiAgICBvcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IGlubGluZVRlbXBsYXRlLnN0YXRpY1JlbmRlckZucztcbiAgfVxuICByZXR1cm4gbmV3IHZub2RlQ29tcG9uZW50T3B0aW9ucy5DdG9yKG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGluaXQgKFxuICB2bm9kZSxcbiAgaHlkcmF0aW5nLFxuICBwYXJlbnRFbG0sXG4gIHJlZkVsbVxuKSB7XG4gIGlmICghdm5vZGUuY2hpbGQgfHwgdm5vZGUuY2hpbGQuX2lzRGVzdHJveWVkKSB7XG4gICAgdmFyIGNoaWxkID0gdm5vZGUuY2hpbGQgPSBjcmVhdGVDb21wb25lbnRJbnN0YW5jZUZvclZub2RlKFxuICAgICAgdm5vZGUsXG4gICAgICBhY3RpdmVJbnN0YW5jZSxcbiAgICAgIHBhcmVudEVsbSxcbiAgICAgIHJlZkVsbVxuICAgICk7XG4gICAgY2hpbGQuJG1vdW50KGh5ZHJhdGluZyA/IHZub2RlLmVsbSA6IHVuZGVmaW5lZCwgaHlkcmF0aW5nKTtcbiAgfSBlbHNlIGlmICh2bm9kZS5kYXRhLmtlZXBBbGl2ZSkge1xuICAgIC8vIGtlcHQtYWxpdmUgY29tcG9uZW50cywgdHJlYXQgYXMgYSBwYXRjaFxuICAgIHZhciBtb3VudGVkTm9kZSA9IHZub2RlOyAvLyB3b3JrIGFyb3VuZCBmbG93XG4gICAgcHJlcGF0Y2gobW91bnRlZE5vZGUsIG1vdW50ZWROb2RlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcmVwYXRjaCAoXG4gIG9sZFZub2RlLFxuICB2bm9kZVxuKSB7XG4gIHZhciBvcHRpb25zID0gdm5vZGUuY29tcG9uZW50T3B0aW9ucztcbiAgdmFyIGNoaWxkID0gdm5vZGUuY2hpbGQgPSBvbGRWbm9kZS5jaGlsZDtcbiAgY2hpbGQuX3VwZGF0ZUZyb21QYXJlbnQoXG4gICAgb3B0aW9ucy5wcm9wc0RhdGEsIC8vIHVwZGF0ZWQgcHJvcHNcbiAgICBvcHRpb25zLmxpc3RlbmVycywgLy8gdXBkYXRlZCBsaXN0ZW5lcnNcbiAgICB2bm9kZSwgLy8gbmV3IHBhcmVudCB2bm9kZVxuICAgIG9wdGlvbnMuY2hpbGRyZW4gLy8gbmV3IGNoaWxkcmVuXG4gICk7XG59XG5cbmZ1bmN0aW9uIGluc2VydCAodm5vZGUpIHtcbiAgaWYgKCF2bm9kZS5jaGlsZC5faXNNb3VudGVkKSB7XG4gICAgdm5vZGUuY2hpbGQuX2lzTW91bnRlZCA9IHRydWU7XG4gICAgY2FsbEhvb2sodm5vZGUuY2hpbGQsICdtb3VudGVkJyk7XG4gIH1cbiAgaWYgKHZub2RlLmRhdGEua2VlcEFsaXZlKSB7XG4gICAgdm5vZGUuY2hpbGQuX2luYWN0aXZlID0gZmFsc2U7XG4gICAgY2FsbEhvb2sodm5vZGUuY2hpbGQsICdhY3RpdmF0ZWQnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkZXN0cm95JDEgKHZub2RlKSB7XG4gIGlmICghdm5vZGUuY2hpbGQuX2lzRGVzdHJveWVkKSB7XG4gICAgaWYgKCF2bm9kZS5kYXRhLmtlZXBBbGl2ZSkge1xuICAgICAgdm5vZGUuY2hpbGQuJGRlc3Ryb3koKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdm5vZGUuY2hpbGQuX2luYWN0aXZlID0gdHJ1ZTtcbiAgICAgIGNhbGxIb29rKHZub2RlLmNoaWxkLCAnZGVhY3RpdmF0ZWQnKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUFzeW5jQ29tcG9uZW50IChcbiAgZmFjdG9yeSxcbiAgYmFzZUN0b3IsXG4gIGNiXG4pIHtcbiAgaWYgKGZhY3RvcnkucmVxdWVzdGVkKSB7XG4gICAgLy8gcG9vbCBjYWxsYmFja3NcbiAgICBmYWN0b3J5LnBlbmRpbmdDYWxsYmFja3MucHVzaChjYik7XG4gIH0gZWxzZSB7XG4gICAgZmFjdG9yeS5yZXF1ZXN0ZWQgPSB0cnVlO1xuICAgIHZhciBjYnMgPSBmYWN0b3J5LnBlbmRpbmdDYWxsYmFja3MgPSBbY2JdO1xuICAgIHZhciBzeW5jID0gdHJ1ZTtcblxuICAgIHZhciByZXNvbHZlID0gZnVuY3Rpb24gKHJlcykge1xuICAgICAgaWYgKGlzT2JqZWN0KHJlcykpIHtcbiAgICAgICAgcmVzID0gYmFzZUN0b3IuZXh0ZW5kKHJlcyk7XG4gICAgICB9XG4gICAgICAvLyBjYWNoZSByZXNvbHZlZFxuICAgICAgZmFjdG9yeS5yZXNvbHZlZCA9IHJlcztcbiAgICAgIC8vIGludm9rZSBjYWxsYmFja3Mgb25seSBpZiB0aGlzIGlzIG5vdCBhIHN5bmNocm9ub3VzIHJlc29sdmVcbiAgICAgIC8vIChhc3luYyByZXNvbHZlcyBhcmUgc2hpbW1lZCBhcyBzeW5jaHJvbm91cyBkdXJpbmcgU1NSKVxuICAgICAgaWYgKCFzeW5jKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2JzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGNic1tpXShyZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciByZWplY3QgPSBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oXG4gICAgICAgIFwiRmFpbGVkIHRvIHJlc29sdmUgYXN5bmMgY29tcG9uZW50OiBcIiArIChTdHJpbmcoZmFjdG9yeSkpICtcbiAgICAgICAgKHJlYXNvbiA/IChcIlxcblJlYXNvbjogXCIgKyByZWFzb24pIDogJycpXG4gICAgICApO1xuICAgIH07XG5cbiAgICB2YXIgcmVzID0gZmFjdG9yeShyZXNvbHZlLCByZWplY3QpO1xuXG4gICAgLy8gaGFuZGxlIHByb21pc2VcbiAgICBpZiAocmVzICYmIHR5cGVvZiByZXMudGhlbiA9PT0gJ2Z1bmN0aW9uJyAmJiAhZmFjdG9yeS5yZXNvbHZlZCkge1xuICAgICAgcmVzLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9XG5cbiAgICBzeW5jID0gZmFsc2U7XG4gICAgLy8gcmV0dXJuIGluIGNhc2UgcmVzb2x2ZWQgc3luY2hyb25vdXNseVxuICAgIHJldHVybiBmYWN0b3J5LnJlc29sdmVkXG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0cmFjdFByb3BzIChkYXRhLCBDdG9yKSB7XG4gIC8vIHdlIGFyZSBvbmx5IGV4dHJhY3RpbmcgcmF3IHZhbHVlcyBoZXJlLlxuICAvLyB2YWxpZGF0aW9uIGFuZCBkZWZhdWx0IHZhbHVlcyBhcmUgaGFuZGxlZCBpbiB0aGUgY2hpbGRcbiAgLy8gY29tcG9uZW50IGl0c2VsZi5cbiAgdmFyIHByb3BPcHRpb25zID0gQ3Rvci5vcHRpb25zLnByb3BzO1xuICBpZiAoIXByb3BPcHRpb25zKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgdmFyIHJlcyA9IHt9O1xuICB2YXIgYXR0cnMgPSBkYXRhLmF0dHJzO1xuICB2YXIgcHJvcHMgPSBkYXRhLnByb3BzO1xuICB2YXIgZG9tUHJvcHMgPSBkYXRhLmRvbVByb3BzO1xuICBpZiAoYXR0cnMgfHwgcHJvcHMgfHwgZG9tUHJvcHMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gcHJvcE9wdGlvbnMpIHtcbiAgICAgIHZhciBhbHRLZXkgPSBoeXBoZW5hdGUoa2V5KTtcbiAgICAgIGNoZWNrUHJvcChyZXMsIHByb3BzLCBrZXksIGFsdEtleSwgdHJ1ZSkgfHxcbiAgICAgIGNoZWNrUHJvcChyZXMsIGF0dHJzLCBrZXksIGFsdEtleSkgfHxcbiAgICAgIGNoZWNrUHJvcChyZXMsIGRvbVByb3BzLCBrZXksIGFsdEtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gY2hlY2tQcm9wIChcbiAgcmVzLFxuICBoYXNoLFxuICBrZXksXG4gIGFsdEtleSxcbiAgcHJlc2VydmVcbikge1xuICBpZiAoaGFzaCkge1xuICAgIGlmIChoYXNPd24oaGFzaCwga2V5KSkge1xuICAgICAgcmVzW2tleV0gPSBoYXNoW2tleV07XG4gICAgICBpZiAoIXByZXNlcnZlKSB7XG4gICAgICAgIGRlbGV0ZSBoYXNoW2tleV07XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSBpZiAoaGFzT3duKGhhc2gsIGFsdEtleSkpIHtcbiAgICAgIHJlc1trZXldID0gaGFzaFthbHRLZXldO1xuICAgICAgaWYgKCFwcmVzZXJ2ZSkge1xuICAgICAgICBkZWxldGUgaGFzaFthbHRLZXldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIG1lcmdlSG9va3MgKGRhdGEpIHtcbiAgaWYgKCFkYXRhLmhvb2spIHtcbiAgICBkYXRhLmhvb2sgPSB7fTtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGhvb2tzVG9NZXJnZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBob29rc1RvTWVyZ2VbaV07XG4gICAgdmFyIGZyb21QYXJlbnQgPSBkYXRhLmhvb2tba2V5XTtcbiAgICB2YXIgb3VycyA9IGhvb2tzW2tleV07XG4gICAgZGF0YS5ob29rW2tleV0gPSBmcm9tUGFyZW50ID8gbWVyZ2VIb29rJDEob3VycywgZnJvbVBhcmVudCkgOiBvdXJzO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1lcmdlSG9vayQxIChvbmUsIHR3bykge1xuICByZXR1cm4gZnVuY3Rpb24gKGEsIGIsIGMsIGQpIHtcbiAgICBvbmUoYSwgYiwgYywgZCk7XG4gICAgdHdvKGEsIGIsIGMsIGQpO1xuICB9XG59XG5cbi8qICAqL1xuXG4vLyB3cmFwcGVyIGZ1bmN0aW9uIGZvciBwcm92aWRpbmcgYSBtb3JlIGZsZXhpYmxlIGludGVyZmFjZVxuLy8gd2l0aG91dCBnZXR0aW5nIHllbGxlZCBhdCBieSBmbG93XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50IChcbiAgdGFnLFxuICBkYXRhLFxuICBjaGlsZHJlblxuKSB7XG4gIGlmIChkYXRhICYmIChBcnJheS5pc0FycmF5KGRhdGEpIHx8IHR5cGVvZiBkYXRhICE9PSAnb2JqZWN0JykpIHtcbiAgICBjaGlsZHJlbiA9IGRhdGE7XG4gICAgZGF0YSA9IHVuZGVmaW5lZDtcbiAgfVxuICAvLyBtYWtlIHN1cmUgdG8gdXNlIHJlYWwgaW5zdGFuY2UgaW5zdGVhZCBvZiBwcm94eSBhcyBjb250ZXh0XG4gIHJldHVybiBfY3JlYXRlRWxlbWVudCh0aGlzLl9zZWxmLCB0YWcsIGRhdGEsIGNoaWxkcmVuKVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlRWxlbWVudCAoXG4gIGNvbnRleHQsXG4gIHRhZyxcbiAgZGF0YSxcbiAgY2hpbGRyZW5cbikge1xuICBpZiAoZGF0YSAmJiBkYXRhLl9fb2JfXykge1xuICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybihcbiAgICAgIFwiQXZvaWQgdXNpbmcgb2JzZXJ2ZWQgZGF0YSBvYmplY3QgYXMgdm5vZGUgZGF0YTogXCIgKyAoSlNPTi5zdHJpbmdpZnkoZGF0YSkpICsgXCJcXG5cIiArXG4gICAgICAnQWx3YXlzIGNyZWF0ZSBmcmVzaCB2bm9kZSBkYXRhIG9iamVjdHMgaW4gZWFjaCByZW5kZXIhJyxcbiAgICAgIGNvbnRleHRcbiAgICApO1xuICAgIHJldHVyblxuICB9XG4gIGlmICghdGFnKSB7XG4gICAgLy8gaW4gY2FzZSBvZiBjb21wb25lbnQgOmlzIHNldCB0byBmYWxzeSB2YWx1ZVxuICAgIHJldHVybiBlbXB0eVZOb2RlKClcbiAgfVxuICAvLyBzdXBwb3J0IHNpbmdsZSBmdW5jdGlvbiBjaGlsZHJlbiBhcyBkZWZhdWx0IHNjb3BlZCBzbG90XG4gIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSAmJlxuICAgICAgdHlwZW9mIGNoaWxkcmVuWzBdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZGF0YSA9IGRhdGEgfHwge307XG4gICAgZGF0YS5zY29wZWRTbG90cyA9IHsgZGVmYXVsdDogY2hpbGRyZW5bMF0gfTtcbiAgICBjaGlsZHJlbi5sZW5ndGggPSAwO1xuICB9XG4gIGlmICh0eXBlb2YgdGFnID09PSAnc3RyaW5nJykge1xuICAgIHZhciBDdG9yO1xuICAgIHZhciBucyA9IGNvbmZpZy5nZXRUYWdOYW1lc3BhY2UodGFnKTtcbiAgICBpZiAoY29uZmlnLmlzUmVzZXJ2ZWRUYWcodGFnKSkge1xuICAgICAgLy8gcGxhdGZvcm0gYnVpbHQtaW4gZWxlbWVudHNcbiAgICAgIHJldHVybiBuZXcgVk5vZGUoXG4gICAgICAgIHRhZywgZGF0YSwgbm9ybWFsaXplQ2hpbGRyZW4oY2hpbGRyZW4sIG5zKSxcbiAgICAgICAgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG5zLCBjb250ZXh0XG4gICAgICApXG4gICAgfSBlbHNlIGlmICgoQ3RvciA9IHJlc29sdmVBc3NldChjb250ZXh0LiRvcHRpb25zLCAnY29tcG9uZW50cycsIHRhZykpKSB7XG4gICAgICAvLyBjb21wb25lbnRcbiAgICAgIHJldHVybiBjcmVhdGVDb21wb25lbnQoQ3RvciwgZGF0YSwgY29udGV4dCwgY2hpbGRyZW4sIHRhZylcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gdW5rbm93biBvciB1bmxpc3RlZCBuYW1lc3BhY2VkIGVsZW1lbnRzXG4gICAgICAvLyBjaGVjayBhdCBydW50aW1lIGJlY2F1c2UgaXQgbWF5IGdldCBhc3NpZ25lZCBhIG5hbWVzcGFjZSB3aGVuIGl0c1xuICAgICAgLy8gcGFyZW50IG5vcm1hbGl6ZXMgY2hpbGRyZW5cbiAgICAgIHZhciBjaGlsZE5zID0gdGFnID09PSAnZm9yZWlnbk9iamVjdCcgPyAneGh0bWwnIDogbnM7XG4gICAgICByZXR1cm4gbmV3IFZOb2RlKFxuICAgICAgICB0YWcsIGRhdGEsIG5vcm1hbGl6ZUNoaWxkcmVuKGNoaWxkcmVuLCBjaGlsZE5zKSxcbiAgICAgICAgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG5zLCBjb250ZXh0XG4gICAgICApXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIGRpcmVjdCBjb21wb25lbnQgb3B0aW9ucyAvIGNvbnN0cnVjdG9yXG4gICAgcmV0dXJuIGNyZWF0ZUNvbXBvbmVudCh0YWcsIGRhdGEsIGNvbnRleHQsIGNoaWxkcmVuKVxuICB9XG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBpbml0UmVuZGVyICh2bSkge1xuICB2bS4kdm5vZGUgPSBudWxsOyAvLyB0aGUgcGxhY2Vob2xkZXIgbm9kZSBpbiBwYXJlbnQgdHJlZVxuICB2bS5fdm5vZGUgPSBudWxsOyAvLyB0aGUgcm9vdCBvZiB0aGUgY2hpbGQgdHJlZVxuICB2bS5fc3RhdGljVHJlZXMgPSBudWxsO1xuICB2YXIgcGFyZW50Vm5vZGUgPSB2bS4kb3B0aW9ucy5fcGFyZW50Vm5vZGU7XG4gIHZhciByZW5kZXJDb250ZXh0ID0gcGFyZW50Vm5vZGUgJiYgcGFyZW50Vm5vZGUuY29udGV4dDtcbiAgdm0uJHNsb3RzID0gcmVzb2x2ZVNsb3RzKHZtLiRvcHRpb25zLl9yZW5kZXJDaGlsZHJlbiwgcmVuZGVyQ29udGV4dCk7XG4gIHZtLiRzY29wZWRTbG90cyA9IHt9O1xuICAvLyBiaW5kIHRoZSBwdWJsaWMgY3JlYXRlRWxlbWVudCBmbiB0byB0aGlzIGluc3RhbmNlXG4gIC8vIHNvIHRoYXQgd2UgZ2V0IHByb3BlciByZW5kZXIgY29udGV4dCBpbnNpZGUgaXQuXG4gIHZtLiRjcmVhdGVFbGVtZW50ID0gYmluZCQxKGNyZWF0ZUVsZW1lbnQsIHZtKTtcbiAgaWYgKHZtLiRvcHRpb25zLmVsKSB7XG4gICAgdm0uJG1vdW50KHZtLiRvcHRpb25zLmVsKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJNaXhpbiAoVnVlKSB7XG4gIFZ1ZS5wcm90b3R5cGUuJG5leHRUaWNrID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgcmV0dXJuIG5leHRUaWNrKGZuLCB0aGlzKVxuICB9O1xuXG4gIFZ1ZS5wcm90b3R5cGUuX3JlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdm0gPSB0aGlzO1xuICAgIHZhciByZWYgPSB2bS4kb3B0aW9ucztcbiAgICB2YXIgcmVuZGVyID0gcmVmLnJlbmRlcjtcbiAgICB2YXIgc3RhdGljUmVuZGVyRm5zID0gcmVmLnN0YXRpY1JlbmRlckZucztcbiAgICB2YXIgX3BhcmVudFZub2RlID0gcmVmLl9wYXJlbnRWbm9kZTtcblxuICAgIGlmICh2bS5faXNNb3VudGVkKSB7XG4gICAgICAvLyBjbG9uZSBzbG90IG5vZGVzIG9uIHJlLXJlbmRlcnNcbiAgICAgIGZvciAodmFyIGtleSBpbiB2bS4kc2xvdHMpIHtcbiAgICAgICAgdm0uJHNsb3RzW2tleV0gPSBjbG9uZVZOb2Rlcyh2bS4kc2xvdHNba2V5XSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKF9wYXJlbnRWbm9kZSAmJiBfcGFyZW50Vm5vZGUuZGF0YS5zY29wZWRTbG90cykge1xuICAgICAgdm0uJHNjb3BlZFNsb3RzID0gX3BhcmVudFZub2RlLmRhdGEuc2NvcGVkU2xvdHM7XG4gICAgfVxuXG4gICAgaWYgKHN0YXRpY1JlbmRlckZucyAmJiAhdm0uX3N0YXRpY1RyZWVzKSB7XG4gICAgICB2bS5fc3RhdGljVHJlZXMgPSBbXTtcbiAgICB9XG4gICAgLy8gc2V0IHBhcmVudCB2bm9kZS4gdGhpcyBhbGxvd3MgcmVuZGVyIGZ1bmN0aW9ucyB0byBoYXZlIGFjY2Vzc1xuICAgIC8vIHRvIHRoZSBkYXRhIG9uIHRoZSBwbGFjZWhvbGRlciBub2RlLlxuICAgIHZtLiR2bm9kZSA9IF9wYXJlbnRWbm9kZTtcbiAgICAvLyByZW5kZXIgc2VsZlxuICAgIHZhciB2bm9kZTtcbiAgICB0cnkge1xuICAgICAgdm5vZGUgPSByZW5kZXIuY2FsbCh2bS5fcmVuZGVyUHJveHksIHZtLiRjcmVhdGVFbGVtZW50KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgaWYgKGNvbmZpZy5lcnJvckhhbmRsZXIpIHtcbiAgICAgICAgY29uZmlnLmVycm9ySGFuZGxlci5jYWxsKG51bGwsIGUsIHZtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgd2FybigoXCJFcnJvciB3aGVuIHJlbmRlcmluZyBcIiArIChmb3JtYXRDb21wb25lbnROYW1lKHZtKSkgKyBcIjpcIikpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICAgIC8vIHJldHVybiBwcmV2aW91cyB2bm9kZSB0byBwcmV2ZW50IHJlbmRlciBlcnJvciBjYXVzaW5nIGJsYW5rIGNvbXBvbmVudFxuICAgICAgdm5vZGUgPSB2bS5fdm5vZGU7XG4gICAgfVxuICAgIC8vIHJldHVybiBlbXB0eSB2bm9kZSBpbiBjYXNlIHRoZSByZW5kZXIgZnVuY3Rpb24gZXJyb3JlZCBvdXRcbiAgICBpZiAoISh2bm9kZSBpbnN0YW5jZW9mIFZOb2RlKSkge1xuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgQXJyYXkuaXNBcnJheSh2bm9kZSkpIHtcbiAgICAgICAgd2FybihcbiAgICAgICAgICAnTXVsdGlwbGUgcm9vdCBub2RlcyByZXR1cm5lZCBmcm9tIHJlbmRlciBmdW5jdGlvbi4gUmVuZGVyIGZ1bmN0aW9uICcgK1xuICAgICAgICAgICdzaG91bGQgcmV0dXJuIGEgc2luZ2xlIHJvb3Qgbm9kZS4nLFxuICAgICAgICAgIHZtXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB2bm9kZSA9IGVtcHR5Vk5vZGUoKTtcbiAgICB9XG4gICAgLy8gc2V0IHBhcmVudFxuICAgIHZub2RlLnBhcmVudCA9IF9wYXJlbnRWbm9kZTtcbiAgICByZXR1cm4gdm5vZGVcbiAgfTtcblxuICAvLyBzaG9ydGhhbmRzIHVzZWQgaW4gcmVuZGVyIGZ1bmN0aW9uc1xuICBWdWUucHJvdG90eXBlLl9oID0gY3JlYXRlRWxlbWVudDtcbiAgLy8gdG9TdHJpbmcgZm9yIG11c3RhY2hlc1xuICBWdWUucHJvdG90eXBlLl9zID0gX3RvU3RyaW5nO1xuICAvLyBudW1iZXIgY29udmVyc2lvblxuICBWdWUucHJvdG90eXBlLl9uID0gdG9OdW1iZXI7XG4gIC8vIGVtcHR5IHZub2RlXG4gIFZ1ZS5wcm90b3R5cGUuX2UgPSBlbXB0eVZOb2RlO1xuICAvLyBsb29zZSBlcXVhbFxuICBWdWUucHJvdG90eXBlLl9xID0gbG9vc2VFcXVhbDtcbiAgLy8gbG9vc2UgaW5kZXhPZlxuICBWdWUucHJvdG90eXBlLl9pID0gbG9vc2VJbmRleE9mO1xuXG4gIC8vIHJlbmRlciBzdGF0aWMgdHJlZSBieSBpbmRleFxuICBWdWUucHJvdG90eXBlLl9tID0gZnVuY3Rpb24gcmVuZGVyU3RhdGljIChcbiAgICBpbmRleCxcbiAgICBpc0luRm9yXG4gICkge1xuICAgIHZhciB0cmVlID0gdGhpcy5fc3RhdGljVHJlZXNbaW5kZXhdO1xuICAgIC8vIGlmIGhhcyBhbHJlYWR5LXJlbmRlcmVkIHN0YXRpYyB0cmVlIGFuZCBub3QgaW5zaWRlIHYtZm9yLFxuICAgIC8vIHdlIGNhbiByZXVzZSB0aGUgc2FtZSB0cmVlIGJ5IGRvaW5nIGEgc2hhbGxvdyBjbG9uZS5cbiAgICBpZiAodHJlZSAmJiAhaXNJbkZvcikge1xuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodHJlZSlcbiAgICAgICAgPyBjbG9uZVZOb2Rlcyh0cmVlKVxuICAgICAgICA6IGNsb25lVk5vZGUodHJlZSlcbiAgICB9XG4gICAgLy8gb3RoZXJ3aXNlLCByZW5kZXIgYSBmcmVzaCB0cmVlLlxuICAgIHRyZWUgPSB0aGlzLl9zdGF0aWNUcmVlc1tpbmRleF0gPSB0aGlzLiRvcHRpb25zLnN0YXRpY1JlbmRlckZuc1tpbmRleF0uY2FsbCh0aGlzLl9yZW5kZXJQcm94eSk7XG4gICAgbWFya1N0YXRpYyh0cmVlLCAoXCJfX3N0YXRpY19fXCIgKyBpbmRleCksIGZhbHNlKTtcbiAgICByZXR1cm4gdHJlZVxuICB9O1xuXG4gIC8vIG1hcmsgbm9kZSBhcyBzdGF0aWMgKHYtb25jZSlcbiAgVnVlLnByb3RvdHlwZS5fbyA9IGZ1bmN0aW9uIG1hcmtPbmNlIChcbiAgICB0cmVlLFxuICAgIGluZGV4LFxuICAgIGtleVxuICApIHtcbiAgICBtYXJrU3RhdGljKHRyZWUsIChcIl9fb25jZV9fXCIgKyBpbmRleCArIChrZXkgPyAoXCJfXCIgKyBrZXkpIDogXCJcIikpLCB0cnVlKTtcbiAgICByZXR1cm4gdHJlZVxuICB9O1xuXG4gIGZ1bmN0aW9uIG1hcmtTdGF0aWMgKHRyZWUsIGtleSwgaXNPbmNlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodHJlZSkpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHJlZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodHJlZVtpXSAmJiB0eXBlb2YgdHJlZVtpXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBtYXJrU3RhdGljTm9kZSh0cmVlW2ldLCAoa2V5ICsgXCJfXCIgKyBpKSwgaXNPbmNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtYXJrU3RhdGljTm9kZSh0cmVlLCBrZXksIGlzT25jZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWFya1N0YXRpY05vZGUgKG5vZGUsIGtleSwgaXNPbmNlKSB7XG4gICAgbm9kZS5pc1N0YXRpYyA9IHRydWU7XG4gICAgbm9kZS5rZXkgPSBrZXk7XG4gICAgbm9kZS5pc09uY2UgPSBpc09uY2U7XG4gIH1cblxuICAvLyBmaWx0ZXIgcmVzb2x1dGlvbiBoZWxwZXJcbiAgdmFyIGlkZW50aXR5ID0gZnVuY3Rpb24gKF8pIHsgcmV0dXJuIF87IH07XG4gIFZ1ZS5wcm90b3R5cGUuX2YgPSBmdW5jdGlvbiByZXNvbHZlRmlsdGVyIChpZCkge1xuICAgIHJldHVybiByZXNvbHZlQXNzZXQodGhpcy4kb3B0aW9ucywgJ2ZpbHRlcnMnLCBpZCwgdHJ1ZSkgfHwgaWRlbnRpdHlcbiAgfTtcblxuICAvLyByZW5kZXIgdi1mb3JcbiAgVnVlLnByb3RvdHlwZS5fbCA9IGZ1bmN0aW9uIHJlbmRlckxpc3QgKFxuICAgIHZhbCxcbiAgICByZW5kZXJcbiAgKSB7XG4gICAgdmFyIHJldCwgaSwgbCwga2V5cywga2V5O1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgIHJldCA9IG5ldyBBcnJheSh2YWwubGVuZ3RoKTtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSB2YWwubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHJldFtpXSA9IHJlbmRlcih2YWxbaV0sIGkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICAgIHJldCA9IG5ldyBBcnJheSh2YWwpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHZhbDsgaSsrKSB7XG4gICAgICAgIHJldFtpXSA9IHJlbmRlcihpICsgMSwgaSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc09iamVjdCh2YWwpKSB7XG4gICAgICBrZXlzID0gT2JqZWN0LmtleXModmFsKTtcbiAgICAgIHJldCA9IG5ldyBBcnJheShrZXlzLmxlbmd0aCk7XG4gICAgICBmb3IgKGkgPSAwLCBsID0ga2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgcmV0W2ldID0gcmVuZGVyKHZhbFtrZXldLCBrZXksIGkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0XG4gIH07XG5cbiAgLy8gcmVuZGVyU2xvdFxuICBWdWUucHJvdG90eXBlLl90ID0gZnVuY3Rpb24gKFxuICAgIG5hbWUsXG4gICAgZmFsbGJhY2ssXG4gICAgcHJvcHNcbiAgKSB7XG4gICAgdmFyIHNjb3BlZFNsb3RGbiA9IHRoaXMuJHNjb3BlZFNsb3RzW25hbWVdO1xuICAgIGlmIChzY29wZWRTbG90Rm4pIHsgLy8gc2NvcGVkIHNsb3RcbiAgICAgIHJldHVybiBzY29wZWRTbG90Rm4ocHJvcHMgfHwge30pIHx8IGZhbGxiYWNrXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzbG90Tm9kZXMgPSB0aGlzLiRzbG90c1tuYW1lXTtcbiAgICAgIC8vIHdhcm4gZHVwbGljYXRlIHNsb3QgdXNhZ2VcbiAgICAgIGlmIChzbG90Tm9kZXMgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICBzbG90Tm9kZXMuX3JlbmRlcmVkICYmIHdhcm4oXG4gICAgICAgICAgXCJEdXBsaWNhdGUgcHJlc2VuY2Ugb2Ygc2xvdCBcXFwiXCIgKyBuYW1lICsgXCJcXFwiIGZvdW5kIGluIHRoZSBzYW1lIHJlbmRlciB0cmVlIFwiICtcbiAgICAgICAgICBcIi0gdGhpcyB3aWxsIGxpa2VseSBjYXVzZSByZW5kZXIgZXJyb3JzLlwiLFxuICAgICAgICAgIHRoaXNcbiAgICAgICAgKTtcbiAgICAgICAgc2xvdE5vZGVzLl9yZW5kZXJlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2xvdE5vZGVzIHx8IGZhbGxiYWNrXG4gICAgfVxuICB9O1xuXG4gIC8vIGFwcGx5IHYtYmluZCBvYmplY3RcbiAgVnVlLnByb3RvdHlwZS5fYiA9IGZ1bmN0aW9uIGJpbmRQcm9wcyAoXG4gICAgZGF0YSxcbiAgICB0YWcsXG4gICAgdmFsdWUsXG4gICAgYXNQcm9wXG4gICkge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKFxuICAgICAgICAgICd2LWJpbmQgd2l0aG91dCBhcmd1bWVudCBleHBlY3RzIGFuIE9iamVjdCBvciBBcnJheSB2YWx1ZScsXG4gICAgICAgICAgdGhpc1xuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgdmFsdWUgPSB0b09iamVjdCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ2NsYXNzJyB8fCBrZXkgPT09ICdzdHlsZScpIHtcbiAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlW2tleV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBoYXNoID0gYXNQcm9wIHx8IGNvbmZpZy5tdXN0VXNlUHJvcCh0YWcsIGtleSlcbiAgICAgICAgICAgICAgPyBkYXRhLmRvbVByb3BzIHx8IChkYXRhLmRvbVByb3BzID0ge30pXG4gICAgICAgICAgICAgIDogZGF0YS5hdHRycyB8fCAoZGF0YS5hdHRycyA9IHt9KTtcbiAgICAgICAgICAgIGhhc2hba2V5XSA9IHZhbHVlW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhXG4gIH07XG5cbiAgLy8gY2hlY2sgdi1vbiBrZXlDb2Rlc1xuICBWdWUucHJvdG90eXBlLl9rID0gZnVuY3Rpb24gY2hlY2tLZXlDb2RlcyAoXG4gICAgZXZlbnRLZXlDb2RlLFxuICAgIGtleSxcbiAgICBidWlsdEluQWxpYXNcbiAgKSB7XG4gICAgdmFyIGtleUNvZGVzID0gY29uZmlnLmtleUNvZGVzW2tleV0gfHwgYnVpbHRJbkFsaWFzO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGtleUNvZGVzKSkge1xuICAgICAgcmV0dXJuIGtleUNvZGVzLmluZGV4T2YoZXZlbnRLZXlDb2RlKSA9PT0gLTFcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGtleUNvZGVzICE9PSBldmVudEtleUNvZGVcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVTbG90cyAoXG4gIHJlbmRlckNoaWxkcmVuLFxuICBjb250ZXh0XG4pIHtcbiAgdmFyIHNsb3RzID0ge307XG4gIGlmICghcmVuZGVyQ2hpbGRyZW4pIHtcbiAgICByZXR1cm4gc2xvdHNcbiAgfVxuICB2YXIgY2hpbGRyZW4gPSBub3JtYWxpemVDaGlsZHJlbihyZW5kZXJDaGlsZHJlbikgfHwgW107XG4gIHZhciBkZWZhdWx0U2xvdCA9IFtdO1xuICB2YXIgbmFtZSwgY2hpbGQ7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAvLyBuYW1lZCBzbG90cyBzaG91bGQgb25seSBiZSByZXNwZWN0ZWQgaWYgdGhlIHZub2RlIHdhcyByZW5kZXJlZCBpbiB0aGVcbiAgICAvLyBzYW1lIGNvbnRleHQuXG4gICAgaWYgKChjaGlsZC5jb250ZXh0ID09PSBjb250ZXh0IHx8IGNoaWxkLmZ1bmN0aW9uYWxDb250ZXh0ID09PSBjb250ZXh0KSAmJlxuICAgICAgICBjaGlsZC5kYXRhICYmIChuYW1lID0gY2hpbGQuZGF0YS5zbG90KSkge1xuICAgICAgdmFyIHNsb3QgPSAoc2xvdHNbbmFtZV0gfHwgKHNsb3RzW25hbWVdID0gW10pKTtcbiAgICAgIGlmIChjaGlsZC50YWcgPT09ICd0ZW1wbGF0ZScpIHtcbiAgICAgICAgc2xvdC5wdXNoLmFwcGx5KHNsb3QsIGNoaWxkLmNoaWxkcmVuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNsb3QucHVzaChjaGlsZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlZmF1bHRTbG90LnB1c2goY2hpbGQpO1xuICAgIH1cbiAgfVxuICAvLyBpZ25vcmUgc2luZ2xlIHdoaXRlc3BhY2VcbiAgaWYgKGRlZmF1bHRTbG90Lmxlbmd0aCAmJiAhKFxuICAgIGRlZmF1bHRTbG90Lmxlbmd0aCA9PT0gMSAmJlxuICAgIChkZWZhdWx0U2xvdFswXS50ZXh0ID09PSAnICcgfHwgZGVmYXVsdFNsb3RbMF0uaXNDb21tZW50KVxuICApKSB7XG4gICAgc2xvdHMuZGVmYXVsdCA9IGRlZmF1bHRTbG90O1xuICB9XG4gIHJldHVybiBzbG90c1xufVxuXG4vKiAgKi9cblxuZnVuY3Rpb24gaW5pdEV2ZW50cyAodm0pIHtcbiAgdm0uX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIC8vIGluaXQgcGFyZW50IGF0dGFjaGVkIGV2ZW50c1xuICB2YXIgbGlzdGVuZXJzID0gdm0uJG9wdGlvbnMuX3BhcmVudExpc3RlbmVycztcbiAgdmFyIGFkZCA9IGZ1bmN0aW9uIChldmVudCwgZm4sIG9uY2UpIHtcbiAgICBvbmNlID8gdm0uJG9uY2UoZXZlbnQsIGZuKSA6IHZtLiRvbihldmVudCwgZm4pO1xuICB9O1xuICB2YXIgcmVtb3ZlJCQxID0gYmluZCQxKHZtLiRvZmYsIHZtKTtcbiAgdm0uX3VwZGF0ZUxpc3RlbmVycyA9IGZ1bmN0aW9uIChsaXN0ZW5lcnMsIG9sZExpc3RlbmVycykge1xuICAgIHVwZGF0ZUxpc3RlbmVycyhsaXN0ZW5lcnMsIG9sZExpc3RlbmVycyB8fCB7fSwgYWRkLCByZW1vdmUkJDEsIHZtKTtcbiAgfTtcbiAgaWYgKGxpc3RlbmVycykge1xuICAgIHZtLl91cGRhdGVMaXN0ZW5lcnMobGlzdGVuZXJzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBldmVudHNNaXhpbiAoVnVlKSB7XG4gIFZ1ZS5wcm90b3R5cGUuJG9uID0gZnVuY3Rpb24gKGV2ZW50LCBmbikge1xuICAgIHZhciB2bSA9IHRoaXM7KHZtLl9ldmVudHNbZXZlbnRdIHx8ICh2bS5fZXZlbnRzW2V2ZW50XSA9IFtdKSkucHVzaChmbik7XG4gICAgcmV0dXJuIHZtXG4gIH07XG5cbiAgVnVlLnByb3RvdHlwZS4kb25jZSA9IGZ1bmN0aW9uIChldmVudCwgZm4pIHtcbiAgICB2YXIgdm0gPSB0aGlzO1xuICAgIGZ1bmN0aW9uIG9uICgpIHtcbiAgICAgIHZtLiRvZmYoZXZlbnQsIG9uKTtcbiAgICAgIGZuLmFwcGx5KHZtLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgICBvbi5mbiA9IGZuO1xuICAgIHZtLiRvbihldmVudCwgb24pO1xuICAgIHJldHVybiB2bVxuICB9O1xuXG4gIFZ1ZS5wcm90b3R5cGUuJG9mZiA9IGZ1bmN0aW9uIChldmVudCwgZm4pIHtcbiAgICB2YXIgdm0gPSB0aGlzO1xuICAgIC8vIGFsbFxuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgdm0uX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICByZXR1cm4gdm1cbiAgICB9XG4gICAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgICB2YXIgY2JzID0gdm0uX2V2ZW50c1tldmVudF07XG4gICAgaWYgKCFjYnMpIHtcbiAgICAgIHJldHVybiB2bVxuICAgIH1cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdm0uX2V2ZW50c1tldmVudF0gPSBudWxsO1xuICAgICAgcmV0dXJuIHZtXG4gICAgfVxuICAgIC8vIHNwZWNpZmljIGhhbmRsZXJcbiAgICB2YXIgY2I7XG4gICAgdmFyIGkgPSBjYnMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGNiID0gY2JzW2ldO1xuICAgICAgaWYgKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pIHtcbiAgICAgICAgY2JzLnNwbGljZShpLCAxKTtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZtXG4gIH07XG5cbiAgVnVlLnByb3RvdHlwZS4kZW1pdCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgdmFyIGNicyA9IHZtLl9ldmVudHNbZXZlbnRdO1xuICAgIGlmIChjYnMpIHtcbiAgICAgIGNicyA9IGNicy5sZW5ndGggPiAxID8gdG9BcnJheShjYnMpIDogY2JzO1xuICAgICAgdmFyIGFyZ3MgPSB0b0FycmF5KGFyZ3VtZW50cywgMSk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNicy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgY2JzW2ldLmFwcGx5KHZtLCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZtXG4gIH07XG59XG5cbi8qICAqL1xuXG52YXIgdWlkID0gMDtcblxuZnVuY3Rpb24gaW5pdE1peGluIChWdWUpIHtcbiAgVnVlLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgdmFyIHZtID0gdGhpcztcbiAgICAvLyBhIHVpZFxuICAgIHZtLl91aWQgPSB1aWQrKztcbiAgICAvLyBhIGZsYWcgdG8gYXZvaWQgdGhpcyBiZWluZyBvYnNlcnZlZFxuICAgIHZtLl9pc1Z1ZSA9IHRydWU7XG4gICAgLy8gbWVyZ2Ugb3B0aW9uc1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuX2lzQ29tcG9uZW50KSB7XG4gICAgICAvLyBvcHRpbWl6ZSBpbnRlcm5hbCBjb21wb25lbnQgaW5zdGFudGlhdGlvblxuICAgICAgLy8gc2luY2UgZHluYW1pYyBvcHRpb25zIG1lcmdpbmcgaXMgcHJldHR5IHNsb3csIGFuZCBub25lIG9mIHRoZVxuICAgICAgLy8gaW50ZXJuYWwgY29tcG9uZW50IG9wdGlvbnMgbmVlZHMgc3BlY2lhbCB0cmVhdG1lbnQuXG4gICAgICBpbml0SW50ZXJuYWxDb21wb25lbnQodm0sIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2bS4kb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyhcbiAgICAgICAgcmVzb2x2ZUNvbnN0cnVjdG9yT3B0aW9ucyh2bS5jb25zdHJ1Y3RvciksXG4gICAgICAgIG9wdGlvbnMgfHwge30sXG4gICAgICAgIHZtXG4gICAgICApO1xuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBpbml0UHJveHkodm0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2bS5fcmVuZGVyUHJveHkgPSB2bTtcbiAgICB9XG4gICAgLy8gZXhwb3NlIHJlYWwgc2VsZlxuICAgIHZtLl9zZWxmID0gdm07XG4gICAgaW5pdExpZmVjeWNsZSh2bSk7XG4gICAgaW5pdEV2ZW50cyh2bSk7XG4gICAgY2FsbEhvb2sodm0sICdiZWZvcmVDcmVhdGUnKTtcbiAgICBpbml0U3RhdGUodm0pO1xuICAgIGNhbGxIb29rKHZtLCAnY3JlYXRlZCcpO1xuICAgIGluaXRSZW5kZXIodm0pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBpbml0SW50ZXJuYWxDb21wb25lbnQgKHZtLCBvcHRpb25zKSB7XG4gIHZhciBvcHRzID0gdm0uJG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKHZtLmNvbnN0cnVjdG9yLm9wdGlvbnMpO1xuICAvLyBkb2luZyB0aGlzIGJlY2F1c2UgaXQncyBmYXN0ZXIgdGhhbiBkeW5hbWljIGVudW1lcmF0aW9uLlxuICBvcHRzLnBhcmVudCA9IG9wdGlvbnMucGFyZW50O1xuICBvcHRzLnByb3BzRGF0YSA9IG9wdGlvbnMucHJvcHNEYXRhO1xuICBvcHRzLl9wYXJlbnRWbm9kZSA9IG9wdGlvbnMuX3BhcmVudFZub2RlO1xuICBvcHRzLl9wYXJlbnRMaXN0ZW5lcnMgPSBvcHRpb25zLl9wYXJlbnRMaXN0ZW5lcnM7XG4gIG9wdHMuX3JlbmRlckNoaWxkcmVuID0gb3B0aW9ucy5fcmVuZGVyQ2hpbGRyZW47XG4gIG9wdHMuX2NvbXBvbmVudFRhZyA9IG9wdGlvbnMuX2NvbXBvbmVudFRhZztcbiAgb3B0cy5fcGFyZW50RWxtID0gb3B0aW9ucy5fcGFyZW50RWxtO1xuICBvcHRzLl9yZWZFbG0gPSBvcHRpb25zLl9yZWZFbG07XG4gIGlmIChvcHRpb25zLnJlbmRlcikge1xuICAgIG9wdHMucmVuZGVyID0gb3B0aW9ucy5yZW5kZXI7XG4gICAgb3B0cy5zdGF0aWNSZW5kZXJGbnMgPSBvcHRpb25zLnN0YXRpY1JlbmRlckZucztcbiAgfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlQ29uc3RydWN0b3JPcHRpb25zIChDdG9yKSB7XG4gIHZhciBvcHRpb25zID0gQ3Rvci5vcHRpb25zO1xuICBpZiAoQ3Rvci5zdXBlcikge1xuICAgIHZhciBzdXBlck9wdGlvbnMgPSBDdG9yLnN1cGVyLm9wdGlvbnM7XG4gICAgdmFyIGNhY2hlZFN1cGVyT3B0aW9ucyA9IEN0b3Iuc3VwZXJPcHRpb25zO1xuICAgIHZhciBleHRlbmRPcHRpb25zID0gQ3Rvci5leHRlbmRPcHRpb25zO1xuICAgIGlmIChzdXBlck9wdGlvbnMgIT09IGNhY2hlZFN1cGVyT3B0aW9ucykge1xuICAgICAgLy8gc3VwZXIgb3B0aW9uIGNoYW5nZWRcbiAgICAgIEN0b3Iuc3VwZXJPcHRpb25zID0gc3VwZXJPcHRpb25zO1xuICAgICAgZXh0ZW5kT3B0aW9ucy5yZW5kZXIgPSBvcHRpb25zLnJlbmRlcjtcbiAgICAgIGV4dGVuZE9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnM7XG4gICAgICBleHRlbmRPcHRpb25zLl9zY29wZUlkID0gb3B0aW9ucy5fc2NvcGVJZDtcbiAgICAgIG9wdGlvbnMgPSBDdG9yLm9wdGlvbnMgPSBtZXJnZU9wdGlvbnMoc3VwZXJPcHRpb25zLCBleHRlbmRPcHRpb25zKTtcbiAgICAgIGlmIChvcHRpb25zLm5hbWUpIHtcbiAgICAgICAgb3B0aW9ucy5jb21wb25lbnRzW29wdGlvbnMubmFtZV0gPSBDdG9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gb3B0aW9uc1xufVxuXG5mdW5jdGlvbiBWdWUkMiAob3B0aW9ucykge1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJlxuICAgICEodGhpcyBpbnN0YW5jZW9mIFZ1ZSQyKSkge1xuICAgIHdhcm4oJ1Z1ZSBpcyBhIGNvbnN0cnVjdG9yIGFuZCBzaG91bGQgYmUgY2FsbGVkIHdpdGggdGhlIGBuZXdgIGtleXdvcmQnKTtcbiAgfVxuICB0aGlzLl9pbml0KG9wdGlvbnMpO1xufVxuXG5pbml0TWl4aW4oVnVlJDIpO1xuc3RhdGVNaXhpbihWdWUkMik7XG5ldmVudHNNaXhpbihWdWUkMik7XG5saWZlY3ljbGVNaXhpbihWdWUkMik7XG5yZW5kZXJNaXhpbihWdWUkMik7XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBpbml0VXNlIChWdWUpIHtcbiAgVnVlLnVzZSA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAocGx1Z2luLmluc3RhbGxlZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vIGFkZGl0aW9uYWwgcGFyYW1ldGVyc1xuICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMsIDEpO1xuICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcbiAgICBpZiAodHlwZW9mIHBsdWdpbi5pbnN0YWxsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwbHVnaW4uaW5zdGFsbC5hcHBseShwbHVnaW4sIGFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwbHVnaW4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfVxuICAgIHBsdWdpbi5pbnN0YWxsZWQgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzXG4gIH07XG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBpbml0TWl4aW4kMSAoVnVlKSB7XG4gIFZ1ZS5taXhpbiA9IGZ1bmN0aW9uIChtaXhpbikge1xuICAgIHRoaXMub3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh0aGlzLm9wdGlvbnMsIG1peGluKTtcbiAgfTtcbn1cblxuLyogICovXG5cbmZ1bmN0aW9uIGluaXRFeHRlbmQgKFZ1ZSkge1xuICAvKipcbiAgICogRWFjaCBpbnN0YW5jZSBjb25zdHJ1Y3RvciwgaW5jbHVkaW5nIFZ1ZSwgaGFzIGEgdW5pcXVlXG4gICAqIGNpZC4gVGhpcyBlbmFibGVzIHVzIHRvIGNyZWF0ZSB3cmFwcGVkIFwiY2hpbGRcbiAgICogY29uc3RydWN0b3JzXCIgZm9yIHByb3RvdHlwYWwgaW5oZXJpdGFuY2UgYW5kIGNhY2hlIHRoZW0uXG4gICAqL1xuICBWdWUuY2lkID0gMDtcbiAgdmFyIGNpZCA9IDE7XG5cbiAgLyoqXG4gICAqIENsYXNzIGluaGVyaXRhbmNlXG4gICAqL1xuICBWdWUuZXh0ZW5kID0gZnVuY3Rpb24gKGV4dGVuZE9wdGlvbnMpIHtcbiAgICBleHRlbmRPcHRpb25zID0gZXh0ZW5kT3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgU3VwZXIgPSB0aGlzO1xuICAgIHZhciBTdXBlcklkID0gU3VwZXIuY2lkO1xuICAgIHZhciBjYWNoZWRDdG9ycyA9IGV4dGVuZE9wdGlvbnMuX0N0b3IgfHwgKGV4dGVuZE9wdGlvbnMuX0N0b3IgPSB7fSk7XG4gICAgaWYgKGNhY2hlZEN0b3JzW1N1cGVySWRdKSB7XG4gICAgICByZXR1cm4gY2FjaGVkQ3RvcnNbU3VwZXJJZF1cbiAgICB9XG4gICAgdmFyIG5hbWUgPSBleHRlbmRPcHRpb25zLm5hbWUgfHwgU3VwZXIub3B0aW9ucy5uYW1lO1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBpZiAoIS9eW2EtekEtWl1bXFx3LV0qJC8udGVzdChuYW1lKSkge1xuICAgICAgICB3YXJuKFxuICAgICAgICAgICdJbnZhbGlkIGNvbXBvbmVudCBuYW1lOiBcIicgKyBuYW1lICsgJ1wiLiBDb21wb25lbnQgbmFtZXMgJyArXG4gICAgICAgICAgJ2NhbiBvbmx5IGNvbnRhaW4gYWxwaGFudW1lcmljIGNoYXJhY2F0ZXJzIGFuZCB0aGUgaHlwaGVuLidcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIFN1YiA9IGZ1bmN0aW9uIFZ1ZUNvbXBvbmVudCAob3B0aW9ucykge1xuICAgICAgdGhpcy5faW5pdChvcHRpb25zKTtcbiAgICB9O1xuICAgIFN1Yi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFN1cGVyLnByb3RvdHlwZSk7XG4gICAgU3ViLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN1YjtcbiAgICBTdWIuY2lkID0gY2lkKys7XG4gICAgU3ViLm9wdGlvbnMgPSBtZXJnZU9wdGlvbnMoXG4gICAgICBTdXBlci5vcHRpb25zLFxuICAgICAgZXh0ZW5kT3B0aW9uc1xuICAgICk7XG4gICAgU3ViWydzdXBlciddID0gU3VwZXI7XG4gICAgLy8gYWxsb3cgZnVydGhlciBleHRlbnNpb24vbWl4aW4vcGx1Z2luIHVzYWdlXG4gICAgU3ViLmV4dGVuZCA9IFN1cGVyLmV4dGVuZDtcbiAgICBTdWIubWl4aW4gPSBTdXBlci5taXhpbjtcbiAgICBTdWIudXNlID0gU3VwZXIudXNlO1xuICAgIC8vIGNyZWF0ZSBhc3NldCByZWdpc3RlcnMsIHNvIGV4dGVuZGVkIGNsYXNzZXNcbiAgICAvLyBjYW4gaGF2ZSB0aGVpciBwcml2YXRlIGFzc2V0cyB0b28uXG4gICAgY29uZmlnLl9hc3NldFR5cGVzLmZvckVhY2goZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgIFN1Ylt0eXBlXSA9IFN1cGVyW3R5cGVdO1xuICAgIH0pO1xuICAgIC8vIGVuYWJsZSByZWN1cnNpdmUgc2VsZi1sb29rdXBcbiAgICBpZiAobmFtZSkge1xuICAgICAgU3ViLm9wdGlvbnMuY29tcG9uZW50c1tuYW1lXSA9IFN1YjtcbiAgICB9XG4gICAgLy8ga2VlcCBhIHJlZmVyZW5jZSB0byB0aGUgc3VwZXIgb3B0aW9ucyBhdCBleHRlbnNpb24gdGltZS5cbiAgICAvLyBsYXRlciBhdCBpbnN0YW50aWF0aW9uIHdlIGNhbiBjaGVjayBpZiBTdXBlcidzIG9wdGlvbnMgaGF2ZVxuICAgIC8vIGJlZW4gdXBkYXRlZC5cbiAgICBTdWIuc3VwZXJPcHRpb25zID0gU3VwZXIub3B0aW9ucztcbiAgICBTdWIuZXh0ZW5kT3B0aW9ucyA9IGV4dGVuZE9wdGlvbnM7XG4gICAgLy8gY2FjaGUgY29uc3RydWN0b3JcbiAgICBjYWNoZWRDdG9yc1tTdXBlcklkXSA9IFN1YjtcbiAgICByZXR1cm4gU3ViXG4gIH07XG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBpbml0QXNzZXRSZWdpc3RlcnMgKFZ1ZSkge1xuICAvKipcbiAgICogQ3JlYXRlIGFzc2V0IHJlZ2lzdHJhdGlvbiBtZXRob2RzLlxuICAgKi9cbiAgY29uZmlnLl9hc3NldFR5cGVzLmZvckVhY2goZnVuY3Rpb24gKHR5cGUpIHtcbiAgICBWdWVbdHlwZV0gPSBmdW5jdGlvbiAoXG4gICAgICBpZCxcbiAgICAgIGRlZmluaXRpb25cbiAgICApIHtcbiAgICAgIGlmICghZGVmaW5pdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW3R5cGUgKyAncyddW2lkXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdjb21wb25lbnQnICYmIGNvbmZpZy5pc1Jlc2VydmVkVGFnKGlkKSkge1xuICAgICAgICAgICAgd2FybihcbiAgICAgICAgICAgICAgJ0RvIG5vdCB1c2UgYnVpbHQtaW4gb3IgcmVzZXJ2ZWQgSFRNTCBlbGVtZW50cyBhcyBjb21wb25lbnQgJyArXG4gICAgICAgICAgICAgICdpZDogJyArIGlkXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gJ2NvbXBvbmVudCcgJiYgaXNQbGFpbk9iamVjdChkZWZpbml0aW9uKSkge1xuICAgICAgICAgIGRlZmluaXRpb24ubmFtZSA9IGRlZmluaXRpb24ubmFtZSB8fCBpZDtcbiAgICAgICAgICBkZWZpbml0aW9uID0gdGhpcy5vcHRpb25zLl9iYXNlLmV4dGVuZChkZWZpbml0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gJ2RpcmVjdGl2ZScgJiYgdHlwZW9mIGRlZmluaXRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBkZWZpbml0aW9uID0geyBiaW5kOiBkZWZpbml0aW9uLCB1cGRhdGU6IGRlZmluaXRpb24gfTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9wdGlvbnNbdHlwZSArICdzJ11baWRdID0gZGVmaW5pdGlvbjtcbiAgICAgICAgcmV0dXJuIGRlZmluaXRpb25cbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn1cblxuLyogICovXG5cbnZhciBwYXR0ZXJuVHlwZXMgPSBbU3RyaW5nLCBSZWdFeHBdO1xuXG5mdW5jdGlvbiBtYXRjaGVzIChwYXR0ZXJuLCBuYW1lKSB7XG4gIGlmICh0eXBlb2YgcGF0dGVybiA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gcGF0dGVybi5zcGxpdCgnLCcpLmluZGV4T2YobmFtZSkgPiAtMVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBwYXR0ZXJuLnRlc3QobmFtZSlcbiAgfVxufVxuXG52YXIgS2VlcEFsaXZlID0ge1xuICBuYW1lOiAna2VlcC1hbGl2ZScsXG4gIGFic3RyYWN0OiB0cnVlLFxuICBwcm9wczoge1xuICAgIGluY2x1ZGU6IHBhdHRlcm5UeXBlcyxcbiAgICBleGNsdWRlOiBwYXR0ZXJuVHlwZXNcbiAgfSxcbiAgY3JlYXRlZDogZnVuY3Rpb24gY3JlYXRlZCAoKSB7XG4gICAgdGhpcy5jYWNoZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyICgpIHtcbiAgICB2YXIgdm5vZGUgPSBnZXRGaXJzdENvbXBvbmVudENoaWxkKHRoaXMuJHNsb3RzLmRlZmF1bHQpO1xuICAgIGlmICh2bm9kZSAmJiB2bm9kZS5jb21wb25lbnRPcHRpb25zKSB7XG4gICAgICB2YXIgb3B0cyA9IHZub2RlLmNvbXBvbmVudE9wdGlvbnM7XG4gICAgICAvLyBjaGVjayBwYXR0ZXJuXG4gICAgICB2YXIgbmFtZSA9IG9wdHMuQ3Rvci5vcHRpb25zLm5hbWUgfHwgb3B0cy50YWc7XG4gICAgICBpZiAobmFtZSAmJiAoXG4gICAgICAgICh0aGlzLmluY2x1ZGUgJiYgIW1hdGNoZXModGhpcy5pbmNsdWRlLCBuYW1lKSkgfHxcbiAgICAgICAgKHRoaXMuZXhjbHVkZSAmJiBtYXRjaGVzKHRoaXMuZXhjbHVkZSwgbmFtZSkpXG4gICAgICApKSB7XG4gICAgICAgIHJldHVybiB2bm9kZVxuICAgICAgfVxuICAgICAgdmFyIGtleSA9IHZub2RlLmtleSA9PSBudWxsXG4gICAgICAgIC8vIHNhbWUgY29uc3RydWN0b3IgbWF5IGdldCByZWdpc3RlcmVkIGFzIGRpZmZlcmVudCBsb2NhbCBjb21wb25lbnRzXG4gICAgICAgIC8vIHNvIGNpZCBhbG9uZSBpcyBub3QgZW5vdWdoICgjMzI2OSlcbiAgICAgICAgPyBvcHRzLkN0b3IuY2lkICsgKG9wdHMudGFnID8gKFwiOjpcIiArIChvcHRzLnRhZykpIDogJycpXG4gICAgICAgIDogdm5vZGUua2V5O1xuICAgICAgaWYgKHRoaXMuY2FjaGVba2V5XSkge1xuICAgICAgICB2bm9kZS5jaGlsZCA9IHRoaXMuY2FjaGVba2V5XS5jaGlsZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2FjaGVba2V5XSA9IHZub2RlO1xuICAgICAgfVxuICAgICAgdm5vZGUuZGF0YS5rZWVwQWxpdmUgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdm5vZGVcbiAgfSxcbiAgZGVzdHJveWVkOiBmdW5jdGlvbiBkZXN0cm95ZWQgKCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMuY2FjaGUpIHtcbiAgICAgIHZhciB2bm9kZSA9IHRoaXMkMS5jYWNoZVtrZXldO1xuICAgICAgY2FsbEhvb2sodm5vZGUuY2hpbGQsICdkZWFjdGl2YXRlZCcpO1xuICAgICAgdm5vZGUuY2hpbGQuJGRlc3Ryb3koKTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciBidWlsdEluQ29tcG9uZW50cyA9IHtcbiAgS2VlcEFsaXZlOiBLZWVwQWxpdmVcbn07XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBpbml0R2xvYmFsQVBJIChWdWUpIHtcbiAgLy8gY29uZmlnXG4gIHZhciBjb25maWdEZWYgPSB7fTtcbiAgY29uZmlnRGVmLmdldCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNvbmZpZzsgfTtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBjb25maWdEZWYuc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgd2FybihcbiAgICAgICAgJ0RvIG5vdCByZXBsYWNlIHRoZSBWdWUuY29uZmlnIG9iamVjdCwgc2V0IGluZGl2aWR1YWwgZmllbGRzIGluc3RlYWQuJ1xuICAgICAgKTtcbiAgICB9O1xuICB9XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShWdWUsICdjb25maWcnLCBjb25maWdEZWYpO1xuICBWdWUudXRpbCA9IHV0aWw7XG4gIFZ1ZS5zZXQgPSBzZXQkMTtcbiAgVnVlLmRlbGV0ZSA9IGRlbDtcbiAgVnVlLm5leHRUaWNrID0gbmV4dFRpY2s7XG5cbiAgVnVlLm9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBjb25maWcuX2Fzc2V0VHlwZXMuZm9yRWFjaChmdW5jdGlvbiAodHlwZSkge1xuICAgIFZ1ZS5vcHRpb25zW3R5cGUgKyAncyddID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgfSk7XG5cbiAgLy8gdGhpcyBpcyB1c2VkIHRvIGlkZW50aWZ5IHRoZSBcImJhc2VcIiBjb25zdHJ1Y3RvciB0byBleHRlbmQgYWxsIHBsYWluLW9iamVjdFxuICAvLyBjb21wb25lbnRzIHdpdGggaW4gV2VleCdzIG11bHRpLWluc3RhbmNlIHNjZW5hcmlvcy5cbiAgVnVlLm9wdGlvbnMuX2Jhc2UgPSBWdWU7XG5cbiAgZXh0ZW5kKFZ1ZS5vcHRpb25zLmNvbXBvbmVudHMsIGJ1aWx0SW5Db21wb25lbnRzKTtcblxuICBpbml0VXNlKFZ1ZSk7XG4gIGluaXRNaXhpbiQxKFZ1ZSk7XG4gIGluaXRFeHRlbmQoVnVlKTtcbiAgaW5pdEFzc2V0UmVnaXN0ZXJzKFZ1ZSk7XG59XG5cbmluaXRHbG9iYWxBUEkoVnVlJDIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVnVlJDIucHJvdG90eXBlLCAnJGlzU2VydmVyJywge1xuICBnZXQ6IGlzU2VydmVyUmVuZGVyaW5nXG59KTtcblxuVnVlJDIudmVyc2lvbiA9ICcyLjEuNCc7XG5cbi8qICAqL1xuXG4vLyBhdHRyaWJ1dGVzIHRoYXQgc2hvdWxkIGJlIHVzaW5nIHByb3BzIGZvciBiaW5kaW5nXG52YXIgbXVzdFVzZVByb3AgPSBmdW5jdGlvbiAodGFnLCBhdHRyKSB7XG4gIHJldHVybiAoXG4gICAgKGF0dHIgPT09ICd2YWx1ZScgJiYgKHRhZyA9PT0gJ2lucHV0JyB8fCB0YWcgPT09ICd0ZXh0YXJlYScgfHwgdGFnID09PSAnb3B0aW9uJykpIHx8XG4gICAgKGF0dHIgPT09ICdzZWxlY3RlZCcgJiYgdGFnID09PSAnb3B0aW9uJykgfHxcbiAgICAoYXR0ciA9PT0gJ2NoZWNrZWQnICYmIHRhZyA9PT0gJ2lucHV0JykgfHxcbiAgICAoYXR0ciA9PT0gJ211dGVkJyAmJiB0YWcgPT09ICd2aWRlbycpXG4gIClcbn07XG5cbnZhciBpc0VudW1lcmF0ZWRBdHRyID0gbWFrZU1hcCgnY29udGVudGVkaXRhYmxlLGRyYWdnYWJsZSxzcGVsbGNoZWNrJyk7XG5cbnZhciBpc0Jvb2xlYW5BdHRyID0gbWFrZU1hcChcbiAgJ2FsbG93ZnVsbHNjcmVlbixhc3luYyxhdXRvZm9jdXMsYXV0b3BsYXksY2hlY2tlZCxjb21wYWN0LGNvbnRyb2xzLGRlY2xhcmUsJyArXG4gICdkZWZhdWx0LGRlZmF1bHRjaGVja2VkLGRlZmF1bHRtdXRlZCxkZWZhdWx0c2VsZWN0ZWQsZGVmZXIsZGlzYWJsZWQsJyArXG4gICdlbmFibGVkLGZvcm1ub3ZhbGlkYXRlLGhpZGRlbixpbmRldGVybWluYXRlLGluZXJ0LGlzbWFwLGl0ZW1zY29wZSxsb29wLG11bHRpcGxlLCcgK1xuICAnbXV0ZWQsbm9ocmVmLG5vcmVzaXplLG5vc2hhZGUsbm92YWxpZGF0ZSxub3dyYXAsb3BlbixwYXVzZW9uZXhpdCxyZWFkb25seSwnICtcbiAgJ3JlcXVpcmVkLHJldmVyc2VkLHNjb3BlZCxzZWFtbGVzcyxzZWxlY3RlZCxzb3J0YWJsZSx0cmFuc2xhdGUsJyArXG4gICd0cnVlc3BlZWQsdHlwZW11c3RtYXRjaCx2aXNpYmxlJ1xuKTtcblxudmFyIHhsaW5rTlMgPSAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayc7XG5cbnZhciBpc1hsaW5rID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIG5hbWUuY2hhckF0KDUpID09PSAnOicgJiYgbmFtZS5zbGljZSgwLCA1KSA9PT0gJ3hsaW5rJ1xufTtcblxudmFyIGdldFhsaW5rUHJvcCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBpc1hsaW5rKG5hbWUpID8gbmFtZS5zbGljZSg2LCBuYW1lLmxlbmd0aCkgOiAnJ1xufTtcblxudmFyIGlzRmFsc3lBdHRyVmFsdWUgPSBmdW5jdGlvbiAodmFsKSB7XG4gIHJldHVybiB2YWwgPT0gbnVsbCB8fCB2YWwgPT09IGZhbHNlXG59O1xuXG4vKiAgKi9cblxuZnVuY3Rpb24gZ2VuQ2xhc3NGb3JWbm9kZSAodm5vZGUpIHtcbiAgdmFyIGRhdGEgPSB2bm9kZS5kYXRhO1xuICB2YXIgcGFyZW50Tm9kZSA9IHZub2RlO1xuICB2YXIgY2hpbGROb2RlID0gdm5vZGU7XG4gIHdoaWxlIChjaGlsZE5vZGUuY2hpbGQpIHtcbiAgICBjaGlsZE5vZGUgPSBjaGlsZE5vZGUuY2hpbGQuX3Zub2RlO1xuICAgIGlmIChjaGlsZE5vZGUuZGF0YSkge1xuICAgICAgZGF0YSA9IG1lcmdlQ2xhc3NEYXRhKGNoaWxkTm9kZS5kYXRhLCBkYXRhKTtcbiAgICB9XG4gIH1cbiAgd2hpbGUgKChwYXJlbnROb2RlID0gcGFyZW50Tm9kZS5wYXJlbnQpKSB7XG4gICAgaWYgKHBhcmVudE5vZGUuZGF0YSkge1xuICAgICAgZGF0YSA9IG1lcmdlQ2xhc3NEYXRhKGRhdGEsIHBhcmVudE5vZGUuZGF0YSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBnZW5DbGFzc0Zyb21EYXRhKGRhdGEpXG59XG5cbmZ1bmN0aW9uIG1lcmdlQ2xhc3NEYXRhIChjaGlsZCwgcGFyZW50KSB7XG4gIHJldHVybiB7XG4gICAgc3RhdGljQ2xhc3M6IGNvbmNhdChjaGlsZC5zdGF0aWNDbGFzcywgcGFyZW50LnN0YXRpY0NsYXNzKSxcbiAgICBjbGFzczogY2hpbGQuY2xhc3NcbiAgICAgID8gW2NoaWxkLmNsYXNzLCBwYXJlbnQuY2xhc3NdXG4gICAgICA6IHBhcmVudC5jbGFzc1xuICB9XG59XG5cbmZ1bmN0aW9uIGdlbkNsYXNzRnJvbURhdGEgKGRhdGEpIHtcbiAgdmFyIGR5bmFtaWNDbGFzcyA9IGRhdGEuY2xhc3M7XG4gIHZhciBzdGF0aWNDbGFzcyA9IGRhdGEuc3RhdGljQ2xhc3M7XG4gIGlmIChzdGF0aWNDbGFzcyB8fCBkeW5hbWljQ2xhc3MpIHtcbiAgICByZXR1cm4gY29uY2F0KHN0YXRpY0NsYXNzLCBzdHJpbmdpZnlDbGFzcyhkeW5hbWljQ2xhc3MpKVxuICB9XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHJldHVybiAnJ1xufVxuXG5mdW5jdGlvbiBjb25jYXQgKGEsIGIpIHtcbiAgcmV0dXJuIGEgPyBiID8gKGEgKyAnICcgKyBiKSA6IGEgOiAoYiB8fCAnJylcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5Q2xhc3MgKHZhbHVlKSB7XG4gIHZhciByZXMgPSAnJztcbiAgaWYgKCF2YWx1ZSkge1xuICAgIHJldHVybiByZXNcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIHZhciBzdHJpbmdpZmllZDtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKHZhbHVlW2ldKSB7XG4gICAgICAgIGlmICgoc3RyaW5naWZpZWQgPSBzdHJpbmdpZnlDbGFzcyh2YWx1ZVtpXSkpKSB7XG4gICAgICAgICAgcmVzICs9IHN0cmluZ2lmaWVkICsgJyAnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXMuc2xpY2UoMCwgLTEpXG4gIH1cbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlW2tleV0pIHsgcmVzICs9IGtleSArICcgJzsgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzLnNsaWNlKDAsIC0xKVxuICB9XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHJldHVybiByZXNcbn1cblxuLyogICovXG5cbnZhciBuYW1lc3BhY2VNYXAgPSB7XG4gIHN2ZzogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyxcbiAgbWF0aDogJ2h0dHA6Ly93d3cudzMub3JnLzE5OTgvTWF0aC9NYXRoTUwnLFxuICB4aHRtbDogJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnXG59O1xuXG52YXIgaXNIVE1MVGFnID0gbWFrZU1hcChcbiAgJ2h0bWwsYm9keSxiYXNlLGhlYWQsbGluayxtZXRhLHN0eWxlLHRpdGxlLCcgK1xuICAnYWRkcmVzcyxhcnRpY2xlLGFzaWRlLGZvb3RlcixoZWFkZXIsaDEsaDIsaDMsaDQsaDUsaDYsaGdyb3VwLG5hdixzZWN0aW9uLCcgK1xuICAnZGl2LGRkLGRsLGR0LGZpZ2NhcHRpb24sZmlndXJlLGhyLGltZyxsaSxtYWluLG9sLHAscHJlLHVsLCcgK1xuICAnYSxiLGFiYnIsYmRpLGJkbyxicixjaXRlLGNvZGUsZGF0YSxkZm4sZW0saSxrYmQsbWFyayxxLHJwLHJ0LHJ0YyxydWJ5LCcgK1xuICAncyxzYW1wLHNtYWxsLHNwYW4sc3Ryb25nLHN1YixzdXAsdGltZSx1LHZhcix3YnIsYXJlYSxhdWRpbyxtYXAsdHJhY2ssdmlkZW8sJyArXG4gICdlbWJlZCxvYmplY3QscGFyYW0sc291cmNlLGNhbnZhcyxzY3JpcHQsbm9zY3JpcHQsZGVsLGlucywnICtcbiAgJ2NhcHRpb24sY29sLGNvbGdyb3VwLHRhYmxlLHRoZWFkLHRib2R5LHRkLHRoLHRyLCcgK1xuICAnYnV0dG9uLGRhdGFsaXN0LGZpZWxkc2V0LGZvcm0saW5wdXQsbGFiZWwsbGVnZW5kLG1ldGVyLG9wdGdyb3VwLG9wdGlvbiwnICtcbiAgJ291dHB1dCxwcm9ncmVzcyxzZWxlY3QsdGV4dGFyZWEsJyArXG4gICdkZXRhaWxzLGRpYWxvZyxtZW51LG1lbnVpdGVtLHN1bW1hcnksJyArXG4gICdjb250ZW50LGVsZW1lbnQsc2hhZG93LHRlbXBsYXRlJ1xuKTtcblxuLy8gdGhpcyBtYXAgaXMgaW50ZW50aW9uYWxseSBzZWxlY3RpdmUsIG9ubHkgY292ZXJpbmcgU1ZHIGVsZW1lbnRzIHRoYXQgbWF5XG4vLyBjb250YWluIGNoaWxkIGVsZW1lbnRzLlxudmFyIGlzU1ZHID0gbWFrZU1hcChcbiAgJ3N2ZyxhbmltYXRlLGNpcmNsZSxjbGlwcGF0aCxjdXJzb3IsZGVmcyxkZXNjLGVsbGlwc2UsZmlsdGVyLGZvbnQsJyArXG4gICdmb250LWZhY2UsZyxnbHlwaCxpbWFnZSxsaW5lLG1hcmtlcixtYXNrLG1pc3NpbmctZ2x5cGgscGF0aCxwYXR0ZXJuLCcgK1xuICAncG9seWdvbixwb2x5bGluZSxyZWN0LHN3aXRjaCxzeW1ib2wsdGV4dCx0ZXh0cGF0aCx0c3Bhbix1c2UsdmlldycsXG4gIHRydWVcbik7XG5cblxuXG52YXIgaXNSZXNlcnZlZFRhZyA9IGZ1bmN0aW9uICh0YWcpIHtcbiAgcmV0dXJuIGlzSFRNTFRhZyh0YWcpIHx8IGlzU1ZHKHRhZylcbn07XG5cbmZ1bmN0aW9uIGdldFRhZ05hbWVzcGFjZSAodGFnKSB7XG4gIGlmIChpc1NWRyh0YWcpKSB7XG4gICAgcmV0dXJuICdzdmcnXG4gIH1cbiAgLy8gYmFzaWMgc3VwcG9ydCBmb3IgTWF0aE1MXG4gIC8vIG5vdGUgaXQgZG9lc24ndCBzdXBwb3J0IG90aGVyIE1hdGhNTCBlbGVtZW50cyBiZWluZyBjb21wb25lbnQgcm9vdHNcbiAgaWYgKHRhZyA9PT0gJ21hdGgnKSB7XG4gICAgcmV0dXJuICdtYXRoJ1xuICB9XG59XG5cbnZhciB1bmtub3duRWxlbWVudENhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbmZ1bmN0aW9uIGlzVW5rbm93bkVsZW1lbnQgKHRhZykge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKCFpbkJyb3dzZXIpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIGlmIChpc1Jlc2VydmVkVGFnKHRhZykpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICB0YWcgPSB0YWcudG9Mb3dlckNhc2UoKTtcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICh1bmtub3duRWxlbWVudENhY2hlW3RhZ10gIT0gbnVsbCkge1xuICAgIHJldHVybiB1bmtub3duRWxlbWVudENhY2hlW3RhZ11cbiAgfVxuICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG4gIGlmICh0YWcuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yODIxMDM2NC8xMDcwMjQ0XG4gICAgcmV0dXJuICh1bmtub3duRWxlbWVudENhY2hlW3RhZ10gPSAoXG4gICAgICBlbC5jb25zdHJ1Y3RvciA9PT0gd2luZG93LkhUTUxVbmtub3duRWxlbWVudCB8fFxuICAgICAgZWwuY29uc3RydWN0b3IgPT09IHdpbmRvdy5IVE1MRWxlbWVudFxuICAgICkpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICh1bmtub3duRWxlbWVudENhY2hlW3RhZ10gPSAvSFRNTFVua25vd25FbGVtZW50Ly50ZXN0KGVsLnRvU3RyaW5nKCkpKVxuICB9XG59XG5cbi8qICAqL1xuXG4vKipcbiAqIFF1ZXJ5IGFuIGVsZW1lbnQgc2VsZWN0b3IgaWYgaXQncyBub3QgYW4gZWxlbWVudCBhbHJlYWR5LlxuICovXG5mdW5jdGlvbiBxdWVyeSAoZWwpIHtcbiAgaWYgKHR5cGVvZiBlbCA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIgc2VsZWN0b3IgPSBlbDtcbiAgICBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwpO1xuICAgIGlmICghZWwpIHtcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybihcbiAgICAgICAgJ0Nhbm5vdCBmaW5kIGVsZW1lbnQ6ICcgKyBzZWxlY3RvclxuICAgICAgKTtcbiAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIH1cbiAgfVxuICByZXR1cm4gZWxcbn1cblxuLyogICovXG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQkMSAodGFnTmFtZSwgdm5vZGUpIHtcbiAgdmFyIGVsbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG4gIGlmICh0YWdOYW1lICE9PSAnc2VsZWN0Jykge1xuICAgIHJldHVybiBlbG1cbiAgfVxuICBpZiAodm5vZGUuZGF0YSAmJiB2bm9kZS5kYXRhLmF0dHJzICYmICdtdWx0aXBsZScgaW4gdm5vZGUuZGF0YS5hdHRycykge1xuICAgIGVsbS5zZXRBdHRyaWJ1dGUoJ211bHRpcGxlJywgJ211bHRpcGxlJyk7XG4gIH1cbiAgcmV0dXJuIGVsbVxufVxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50TlMgKG5hbWVzcGFjZSwgdGFnTmFtZSkge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZU1hcFtuYW1lc3BhY2VdLCB0YWdOYW1lKVxufVxuXG5mdW5jdGlvbiBjcmVhdGVUZXh0Tm9kZSAodGV4dCkge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dClcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29tbWVudCAodGV4dCkge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCh0ZXh0KVxufVxuXG5mdW5jdGlvbiBpbnNlcnRCZWZvcmUgKHBhcmVudE5vZGUsIG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpIHtcbiAgcGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobmV3Tm9kZSwgcmVmZXJlbmNlTm9kZSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkIChub2RlLCBjaGlsZCkge1xuICBub2RlLnJlbW92ZUNoaWxkKGNoaWxkKTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kQ2hpbGQgKG5vZGUsIGNoaWxkKSB7XG4gIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGQpO1xufVxuXG5mdW5jdGlvbiBwYXJlbnROb2RlIChub2RlKSB7XG4gIHJldHVybiBub2RlLnBhcmVudE5vZGVcbn1cblxuZnVuY3Rpb24gbmV4dFNpYmxpbmcgKG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUubmV4dFNpYmxpbmdcbn1cblxuZnVuY3Rpb24gdGFnTmFtZSAobm9kZSkge1xuICByZXR1cm4gbm9kZS50YWdOYW1lXG59XG5cbmZ1bmN0aW9uIHNldFRleHRDb250ZW50IChub2RlLCB0ZXh0KSB7XG4gIG5vZGUudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuXG5mdW5jdGlvbiBjaGlsZE5vZGVzIChub2RlKSB7XG4gIHJldHVybiBub2RlLmNoaWxkTm9kZXNcbn1cblxuZnVuY3Rpb24gc2V0QXR0cmlidXRlIChub2RlLCBrZXksIHZhbCkge1xuICBub2RlLnNldEF0dHJpYnV0ZShrZXksIHZhbCk7XG59XG5cblxudmFyIG5vZGVPcHMgPSBPYmplY3QuZnJlZXplKHtcblx0Y3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCQxLFxuXHRjcmVhdGVFbGVtZW50TlM6IGNyZWF0ZUVsZW1lbnROUyxcblx0Y3JlYXRlVGV4dE5vZGU6IGNyZWF0ZVRleHROb2RlLFxuXHRjcmVhdGVDb21tZW50OiBjcmVhdGVDb21tZW50LFxuXHRpbnNlcnRCZWZvcmU6IGluc2VydEJlZm9yZSxcblx0cmVtb3ZlQ2hpbGQ6IHJlbW92ZUNoaWxkLFxuXHRhcHBlbmRDaGlsZDogYXBwZW5kQ2hpbGQsXG5cdHBhcmVudE5vZGU6IHBhcmVudE5vZGUsXG5cdG5leHRTaWJsaW5nOiBuZXh0U2libGluZyxcblx0dGFnTmFtZTogdGFnTmFtZSxcblx0c2V0VGV4dENvbnRlbnQ6IHNldFRleHRDb250ZW50LFxuXHRjaGlsZE5vZGVzOiBjaGlsZE5vZGVzLFxuXHRzZXRBdHRyaWJ1dGU6IHNldEF0dHJpYnV0ZVxufSk7XG5cbi8qICAqL1xuXG52YXIgcmVmID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSAoXywgdm5vZGUpIHtcbiAgICByZWdpc3RlclJlZih2bm9kZSk7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlIChvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICBpZiAob2xkVm5vZGUuZGF0YS5yZWYgIT09IHZub2RlLmRhdGEucmVmKSB7XG4gICAgICByZWdpc3RlclJlZihvbGRWbm9kZSwgdHJ1ZSk7XG4gICAgICByZWdpc3RlclJlZih2bm9kZSk7XG4gICAgfVxuICB9LFxuICBkZXN0cm95OiBmdW5jdGlvbiBkZXN0cm95ICh2bm9kZSkge1xuICAgIHJlZ2lzdGVyUmVmKHZub2RlLCB0cnVlKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gcmVnaXN0ZXJSZWYgKHZub2RlLCBpc1JlbW92YWwpIHtcbiAgdmFyIGtleSA9IHZub2RlLmRhdGEucmVmO1xuICBpZiAoIWtleSkgeyByZXR1cm4gfVxuXG4gIHZhciB2bSA9IHZub2RlLmNvbnRleHQ7XG4gIHZhciByZWYgPSB2bm9kZS5jaGlsZCB8fCB2bm9kZS5lbG07XG4gIHZhciByZWZzID0gdm0uJHJlZnM7XG4gIGlmIChpc1JlbW92YWwpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZWZzW2tleV0pKSB7XG4gICAgICByZW1vdmUkMShyZWZzW2tleV0sIHJlZik7XG4gICAgfSBlbHNlIGlmIChyZWZzW2tleV0gPT09IHJlZikge1xuICAgICAgcmVmc1trZXldID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAodm5vZGUuZGF0YS5yZWZJbkZvcikge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVmc1trZXldKSAmJiByZWZzW2tleV0uaW5kZXhPZihyZWYpIDwgMCkge1xuICAgICAgICByZWZzW2tleV0ucHVzaChyZWYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVmc1trZXldID0gW3JlZl07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZnNba2V5XSA9IHJlZjtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBWaXJ0dWFsIERPTSBwYXRjaGluZyBhbGdvcml0aG0gYmFzZWQgb24gU25hYmJkb20gYnlcbiAqIFNpbW9uIEZyaWlzIFZpbmR1bSAoQHBhbGRlcGluZClcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuICogaHR0cHM6Ly9naXRodWIuY29tL3BhbGRlcGluZC9zbmFiYmRvbS9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKlxuICogbW9kaWZpZWQgYnkgRXZhbiBZb3UgKEB5eXg5OTA4MDMpXG4gKlxuXG4vKlxuICogTm90IHR5cGUtY2hlY2tpbmcgdGhpcyBiZWNhdXNlIHRoaXMgZmlsZSBpcyBwZXJmLWNyaXRpY2FsIGFuZCB0aGUgY29zdFxuICogb2YgbWFraW5nIGZsb3cgdW5kZXJzdGFuZCBpdCBpcyBub3Qgd29ydGggaXQuXG4gKi9cblxudmFyIGVtcHR5Tm9kZSA9IG5ldyBWTm9kZSgnJywge30sIFtdKTtcblxudmFyIGhvb2tzJDEgPSBbJ2NyZWF0ZScsICdhY3RpdmF0ZScsICd1cGRhdGUnLCAncmVtb3ZlJywgJ2Rlc3Ryb3knXTtcblxuZnVuY3Rpb24gaXNVbmRlZiAocykge1xuICByZXR1cm4gcyA9PSBudWxsXG59XG5cbmZ1bmN0aW9uIGlzRGVmIChzKSB7XG4gIHJldHVybiBzICE9IG51bGxcbn1cblxuZnVuY3Rpb24gc2FtZVZub2RlICh2bm9kZTEsIHZub2RlMikge1xuICByZXR1cm4gKFxuICAgIHZub2RlMS5rZXkgPT09IHZub2RlMi5rZXkgJiZcbiAgICB2bm9kZTEudGFnID09PSB2bm9kZTIudGFnICYmXG4gICAgdm5vZGUxLmlzQ29tbWVudCA9PT0gdm5vZGUyLmlzQ29tbWVudCAmJlxuICAgICF2bm9kZTEuZGF0YSA9PT0gIXZub2RlMi5kYXRhXG4gIClcbn1cblxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHggKGNoaWxkcmVuLCBiZWdpbklkeCwgZW5kSWR4KSB7XG4gIHZhciBpLCBrZXk7XG4gIHZhciBtYXAgPSB7fTtcbiAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICBrZXkgPSBjaGlsZHJlbltpXS5rZXk7XG4gICAgaWYgKGlzRGVmKGtleSkpIHsgbWFwW2tleV0gPSBpOyB9XG4gIH1cbiAgcmV0dXJuIG1hcFxufVxuXG5mdW5jdGlvbiBjcmVhdGVQYXRjaEZ1bmN0aW9uIChiYWNrZW5kKSB7XG4gIHZhciBpLCBqO1xuICB2YXIgY2JzID0ge307XG5cbiAgdmFyIG1vZHVsZXMgPSBiYWNrZW5kLm1vZHVsZXM7XG4gIHZhciBub2RlT3BzID0gYmFja2VuZC5ub2RlT3BzO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBob29rcyQxLmxlbmd0aDsgKytpKSB7XG4gICAgY2JzW2hvb2tzJDFbaV1dID0gW107XG4gICAgZm9yIChqID0gMDsgaiA8IG1vZHVsZXMubGVuZ3RoOyArK2opIHtcbiAgICAgIGlmIChtb2R1bGVzW2pdW2hvb2tzJDFbaV1dICE9PSB1bmRlZmluZWQpIHsgY2JzW2hvb2tzJDFbaV1dLnB1c2gobW9kdWxlc1tqXVtob29rcyQxW2ldXSk7IH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlbXB0eU5vZGVBdCAoZWxtKSB7XG4gICAgcmV0dXJuIG5ldyBWTm9kZShub2RlT3BzLnRhZ05hbWUoZWxtKS50b0xvd2VyQ2FzZSgpLCB7fSwgW10sIHVuZGVmaW5lZCwgZWxtKVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUm1DYiAoY2hpbGRFbG0sIGxpc3RlbmVycykge1xuICAgIGZ1bmN0aW9uIHJlbW92ZSQkMSAoKSB7XG4gICAgICBpZiAoLS1yZW1vdmUkJDEubGlzdGVuZXJzID09PSAwKSB7XG4gICAgICAgIHJlbW92ZUVsZW1lbnQoY2hpbGRFbG0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZW1vdmUkJDEubGlzdGVuZXJzID0gbGlzdGVuZXJzO1xuICAgIHJldHVybiByZW1vdmUkJDFcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZUVsZW1lbnQgKGVsKSB7XG4gICAgdmFyIHBhcmVudCA9IG5vZGVPcHMucGFyZW50Tm9kZShlbCk7XG4gICAgLy8gZWxlbWVudCBtYXkgaGF2ZSBhbHJlYWR5IGJlZW4gcmVtb3ZlZCBkdWUgdG8gdi1odG1sXG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgbm9kZU9wcy5yZW1vdmVDaGlsZChwYXJlbnQsIGVsKTtcbiAgICB9XG4gIH1cblxuICB2YXIgaW5QcmUgPSAwO1xuICBmdW5jdGlvbiBjcmVhdGVFbG0gKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUsIHBhcmVudEVsbSwgcmVmRWxtLCBuZXN0ZWQpIHtcbiAgICB2bm9kZS5pc1Jvb3RJbnNlcnQgPSAhbmVzdGVkOyAvLyBmb3IgdHJhbnNpdGlvbiBlbnRlciBjaGVja1xuICAgIGlmIChjcmVhdGVDb21wb25lbnQodm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSwgcGFyZW50RWxtLCByZWZFbG0pKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgdmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgdmFyIHRhZyA9IHZub2RlLnRhZztcbiAgICBpZiAoaXNEZWYodGFnKSkge1xuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5wcmUpIHtcbiAgICAgICAgICBpblByZSsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhaW5QcmUgJiZcbiAgICAgICAgICAhdm5vZGUubnMgJiZcbiAgICAgICAgICAhKGNvbmZpZy5pZ25vcmVkRWxlbWVudHMgJiYgY29uZmlnLmlnbm9yZWRFbGVtZW50cy5pbmRleE9mKHRhZykgPiAtMSkgJiZcbiAgICAgICAgICBjb25maWcuaXNVbmtub3duRWxlbWVudCh0YWcpXG4gICAgICAgICkge1xuICAgICAgICAgIHdhcm4oXG4gICAgICAgICAgICAnVW5rbm93biBjdXN0b20gZWxlbWVudDogPCcgKyB0YWcgKyAnPiAtIGRpZCB5b3UgJyArXG4gICAgICAgICAgICAncmVnaXN0ZXIgdGhlIGNvbXBvbmVudCBjb3JyZWN0bHk/IEZvciByZWN1cnNpdmUgY29tcG9uZW50cywgJyArXG4gICAgICAgICAgICAnbWFrZSBzdXJlIHRvIHByb3ZpZGUgdGhlIFwibmFtZVwiIG9wdGlvbi4nLFxuICAgICAgICAgICAgdm5vZGUuY29udGV4dFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZub2RlLmVsbSA9IHZub2RlLm5zXG4gICAgICAgID8gbm9kZU9wcy5jcmVhdGVFbGVtZW50TlModm5vZGUubnMsIHRhZylcbiAgICAgICAgOiBub2RlT3BzLmNyZWF0ZUVsZW1lbnQodGFnLCB2bm9kZSk7XG4gICAgICBzZXRTY29wZSh2bm9kZSk7XG5cbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAge1xuICAgICAgICBjcmVhdGVDaGlsZHJlbih2bm9kZSwgY2hpbGRyZW4sIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIGlmIChpc0RlZihkYXRhKSkge1xuICAgICAgICAgIGludm9rZUNyZWF0ZUhvb2tzKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICB9XG4gICAgICAgIGluc2VydChwYXJlbnRFbG0sIHZub2RlLmVsbSwgcmVmRWxtKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgZGF0YSAmJiBkYXRhLnByZSkge1xuICAgICAgICBpblByZS0tO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodm5vZGUuaXNDb21tZW50KSB7XG4gICAgICB2bm9kZS5lbG0gPSBub2RlT3BzLmNyZWF0ZUNvbW1lbnQodm5vZGUudGV4dCk7XG4gICAgICBpbnNlcnQocGFyZW50RWxtLCB2bm9kZS5lbG0sIHJlZkVsbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZub2RlLmVsbSA9IG5vZGVPcHMuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCk7XG4gICAgICBpbnNlcnQocGFyZW50RWxtLCB2bm9kZS5lbG0sIHJlZkVsbSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50ICh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCBwYXJlbnRFbG0sIHJlZkVsbSkge1xuICAgIHZhciBpID0gdm5vZGUuZGF0YTtcbiAgICBpZiAoaXNEZWYoaSkpIHtcbiAgICAgIHZhciBpc1JlYWN0aXZhdGVkID0gaXNEZWYodm5vZGUuY2hpbGQpICYmIGkua2VlcEFsaXZlO1xuICAgICAgaWYgKGlzRGVmKGkgPSBpLmhvb2spICYmIGlzRGVmKGkgPSBpLmluaXQpKSB7XG4gICAgICAgIGkodm5vZGUsIGZhbHNlIC8qIGh5ZHJhdGluZyAqLywgcGFyZW50RWxtLCByZWZFbG0pO1xuICAgICAgfVxuICAgICAgLy8gYWZ0ZXIgY2FsbGluZyB0aGUgaW5pdCBob29rLCBpZiB0aGUgdm5vZGUgaXMgYSBjaGlsZCBjb21wb25lbnRcbiAgICAgIC8vIGl0IHNob3VsZCd2ZSBjcmVhdGVkIGEgY2hpbGQgaW5zdGFuY2UgYW5kIG1vdW50ZWQgaXQuIHRoZSBjaGlsZFxuICAgICAgLy8gY29tcG9uZW50IGFsc28gaGFzIHNldCB0aGUgcGxhY2Vob2xkZXIgdm5vZGUncyBlbG0uXG4gICAgICAvLyBpbiB0aGF0IGNhc2Ugd2UgY2FuIGp1c3QgcmV0dXJuIHRoZSBlbGVtZW50IGFuZCBiZSBkb25lLlxuICAgICAgaWYgKGlzRGVmKHZub2RlLmNoaWxkKSkge1xuICAgICAgICBpbml0Q29tcG9uZW50KHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBpZiAoaXNSZWFjdGl2YXRlZCkge1xuICAgICAgICAgIHJlYWN0aXZhdGVDb21wb25lbnQodm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSwgcGFyZW50RWxtLCByZWZFbG0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhY3RpdmF0ZUNvbXBvbmVudCAodm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSwgcGFyZW50RWxtLCByZWZFbG0pIHtcbiAgICB2YXIgaTtcbiAgICAvLyBoYWNrIGZvciAjNDMzOTogYSByZWFjdGl2YXRlZCBjb21wb25lbnQgd2l0aCBpbm5lciB0cmFuc2l0aW9uXG4gICAgLy8gZG9lcyBub3QgdHJpZ2dlciBiZWNhdXNlIHRoZSBpbm5lciBub2RlJ3MgY3JlYXRlZCBob29rcyBhcmUgbm90IGNhbGxlZFxuICAgIC8vIGFnYWluLiBJdCdzIG5vdCBpZGVhbCB0byBpbnZvbHZlIG1vZHVsZS1zcGVjaWZpYyBsb2dpYyBpbiBoZXJlIGJ1dFxuICAgIC8vIHRoZXJlIGRvZXNuJ3Qgc2VlbSB0byBiZSBhIGJldHRlciB3YXkgdG8gZG8gaXQuXG4gICAgdmFyIGlubmVyTm9kZSA9IHZub2RlO1xuICAgIHdoaWxlIChpbm5lck5vZGUuY2hpbGQpIHtcbiAgICAgIGlubmVyTm9kZSA9IGlubmVyTm9kZS5jaGlsZC5fdm5vZGU7XG4gICAgICBpZiAoaXNEZWYoaSA9IGlubmVyTm9kZS5kYXRhKSAmJiBpc0RlZihpID0gaS50cmFuc2l0aW9uKSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmFjdGl2YXRlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgY2JzLmFjdGl2YXRlW2ldKGVtcHR5Tm9kZSwgaW5uZXJOb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpbnNlcnRlZFZub2RlUXVldWUucHVzaChpbm5lck5vZGUpO1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICAvLyB1bmxpa2UgYSBuZXdseSBjcmVhdGVkIGNvbXBvbmVudCxcbiAgICAvLyBhIHJlYWN0aXZhdGVkIGtlZXAtYWxpdmUgY29tcG9uZW50IGRvZXNuJ3QgaW5zZXJ0IGl0c2VsZlxuICAgIGluc2VydChwYXJlbnRFbG0sIHZub2RlLmVsbSwgcmVmRWxtKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluc2VydCAocGFyZW50LCBlbG0sIHJlZikge1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIG5vZGVPcHMuaW5zZXJ0QmVmb3JlKHBhcmVudCwgZWxtLCByZWYpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNoaWxkcmVuICh2bm9kZSwgY2hpbGRyZW4sIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICBjcmVhdGVFbG0oY2hpbGRyZW5baV0sIGluc2VydGVkVm5vZGVRdWV1ZSwgdm5vZGUuZWxtLCBudWxsLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzUHJpbWl0aXZlKHZub2RlLnRleHQpKSB7XG4gICAgICBub2RlT3BzLmFwcGVuZENoaWxkKHZub2RlLmVsbSwgbm9kZU9wcy5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNQYXRjaGFibGUgKHZub2RlKSB7XG4gICAgd2hpbGUgKHZub2RlLmNoaWxkKSB7XG4gICAgICB2bm9kZSA9IHZub2RlLmNoaWxkLl92bm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIGlzRGVmKHZub2RlLnRhZylcbiAgfVxuXG4gIGZ1bmN0aW9uIGludm9rZUNyZWF0ZUhvb2tzICh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgZm9yICh2YXIgaSQxID0gMDsgaSQxIDwgY2JzLmNyZWF0ZS5sZW5ndGg7ICsraSQxKSB7XG4gICAgICBjYnMuY3JlYXRlW2kkMV0oZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgfVxuICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7IC8vIFJldXNlIHZhcmlhYmxlXG4gICAgaWYgKGlzRGVmKGkpKSB7XG4gICAgICBpZiAoaS5jcmVhdGUpIHsgaS5jcmVhdGUoZW1wdHlOb2RlLCB2bm9kZSk7IH1cbiAgICAgIGlmIChpLmluc2VydCkgeyBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7IH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q29tcG9uZW50ICh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgaWYgKHZub2RlLmRhdGEucGVuZGluZ0luc2VydCkge1xuICAgICAgaW5zZXJ0ZWRWbm9kZVF1ZXVlLnB1c2guYXBwbHkoaW5zZXJ0ZWRWbm9kZVF1ZXVlLCB2bm9kZS5kYXRhLnBlbmRpbmdJbnNlcnQpO1xuICAgIH1cbiAgICB2bm9kZS5lbG0gPSB2bm9kZS5jaGlsZC4kZWw7XG4gICAgaWYgKGlzUGF0Y2hhYmxlKHZub2RlKSkge1xuICAgICAgaW52b2tlQ3JlYXRlSG9va3Modm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICBzZXRTY29wZSh2bm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGVtcHR5IGNvbXBvbmVudCByb290LlxuICAgICAgLy8gc2tpcCBhbGwgZWxlbWVudC1yZWxhdGVkIG1vZHVsZXMgZXhjZXB0IGZvciByZWYgKCMzNDU1KVxuICAgICAgcmVnaXN0ZXJSZWYodm5vZGUpO1xuICAgICAgLy8gbWFrZSBzdXJlIHRvIGludm9rZSB0aGUgaW5zZXJ0IGhvb2tcbiAgICAgIGluc2VydGVkVm5vZGVRdWV1ZS5wdXNoKHZub2RlKTtcbiAgICB9XG4gIH1cblxuICAvLyBzZXQgc2NvcGUgaWQgYXR0cmlidXRlIGZvciBzY29wZWQgQ1NTLlxuICAvLyB0aGlzIGlzIGltcGxlbWVudGVkIGFzIGEgc3BlY2lhbCBjYXNlIHRvIGF2b2lkIHRoZSBvdmVyaGVhZFxuICAvLyBvZiBnb2luZyB0aHJvdWdoIHRoZSBub3JtYWwgYXR0cmlidXRlIHBhdGNoaW5nIHByb2Nlc3MuXG4gIGZ1bmN0aW9uIHNldFNjb3BlICh2bm9kZSkge1xuICAgIHZhciBpO1xuICAgIGlmIChpc0RlZihpID0gdm5vZGUuY29udGV4dCkgJiYgaXNEZWYoaSA9IGkuJG9wdGlvbnMuX3Njb3BlSWQpKSB7XG4gICAgICBub2RlT3BzLnNldEF0dHJpYnV0ZSh2bm9kZS5lbG0sIGksICcnKTtcbiAgICB9XG4gICAgaWYgKGlzRGVmKGkgPSBhY3RpdmVJbnN0YW5jZSkgJiZcbiAgICAgICAgaSAhPT0gdm5vZGUuY29udGV4dCAmJlxuICAgICAgICBpc0RlZihpID0gaS4kb3B0aW9ucy5fc2NvcGVJZCkpIHtcbiAgICAgIG5vZGVPcHMuc2V0QXR0cmlidXRlKHZub2RlLmVsbSwgaSwgJycpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFZub2RlcyAocGFyZW50RWxtLCByZWZFbG0sIHZub2Rlcywgc3RhcnRJZHgsIGVuZElkeCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgZm9yICg7IHN0YXJ0SWR4IDw9IGVuZElkeDsgKytzdGFydElkeCkge1xuICAgICAgY3JlYXRlRWxtKHZub2Rlc1tzdGFydElkeF0sIGluc2VydGVkVm5vZGVRdWV1ZSwgcGFyZW50RWxtLCByZWZFbG0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGludm9rZURlc3Ryb3lIb29rICh2bm9kZSkge1xuICAgIHZhciBpLCBqO1xuICAgIHZhciBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICBpZiAoaXNEZWYoZGF0YSkpIHtcbiAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS5kZXN0cm95KSkgeyBpKHZub2RlKTsgfVxuICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5kZXN0cm95Lmxlbmd0aDsgKytpKSB7IGNicy5kZXN0cm95W2ldKHZub2RlKTsgfVxuICAgIH1cbiAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmNoaWxkcmVuKSkge1xuICAgICAgZm9yIChqID0gMDsgaiA8IHZub2RlLmNoaWxkcmVuLmxlbmd0aDsgKytqKSB7XG4gICAgICAgIGludm9rZURlc3Ryb3lIb29rKHZub2RlLmNoaWxkcmVuW2pdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVWbm9kZXMgKHBhcmVudEVsbSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4KSB7XG4gICAgZm9yICg7IHN0YXJ0SWR4IDw9IGVuZElkeDsgKytzdGFydElkeCkge1xuICAgICAgdmFyIGNoID0gdm5vZGVzW3N0YXJ0SWR4XTtcbiAgICAgIGlmIChpc0RlZihjaCkpIHtcbiAgICAgICAgaWYgKGlzRGVmKGNoLnRhZykpIHtcbiAgICAgICAgICByZW1vdmVBbmRJbnZva2VSZW1vdmVIb29rKGNoKTtcbiAgICAgICAgICBpbnZva2VEZXN0cm95SG9vayhjaCk7XG4gICAgICAgIH0gZWxzZSB7IC8vIFRleHQgbm9kZVxuICAgICAgICAgIG5vZGVPcHMucmVtb3ZlQ2hpbGQocGFyZW50RWxtLCBjaC5lbG0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlQW5kSW52b2tlUmVtb3ZlSG9vayAodm5vZGUsIHJtKSB7XG4gICAgaWYgKHJtIHx8IGlzRGVmKHZub2RlLmRhdGEpKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gY2JzLnJlbW92ZS5sZW5ndGggKyAxO1xuICAgICAgaWYgKCFybSkge1xuICAgICAgICAvLyBkaXJlY3RseSByZW1vdmluZ1xuICAgICAgICBybSA9IGNyZWF0ZVJtQ2Iodm5vZGUuZWxtLCBsaXN0ZW5lcnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gd2UgaGF2ZSBhIHJlY3Vyc2l2ZWx5IHBhc3NlZCBkb3duIHJtIGNhbGxiYWNrXG4gICAgICAgIC8vIGluY3JlYXNlIHRoZSBsaXN0ZW5lcnMgY291bnRcbiAgICAgICAgcm0ubGlzdGVuZXJzICs9IGxpc3RlbmVycztcbiAgICAgIH1cbiAgICAgIC8vIHJlY3Vyc2l2ZWx5IGludm9rZSBob29rcyBvbiBjaGlsZCBjb21wb25lbnQgcm9vdCBub2RlXG4gICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmNoaWxkKSAmJiBpc0RlZihpID0gaS5fdm5vZGUpICYmIGlzRGVmKGkuZGF0YSkpIHtcbiAgICAgICAgcmVtb3ZlQW5kSW52b2tlUmVtb3ZlSG9vayhpLCBybSk7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraSkge1xuICAgICAgICBjYnMucmVtb3ZlW2ldKHZub2RlLCBybSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkucmVtb3ZlKSkge1xuICAgICAgICBpKHZub2RlLCBybSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBybSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmVFbGVtZW50KHZub2RlLmVsbSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4gKHBhcmVudEVsbSwgb2xkQ2gsIG5ld0NoLCBpbnNlcnRlZFZub2RlUXVldWUsIHJlbW92ZU9ubHkpIHtcbiAgICB2YXIgb2xkU3RhcnRJZHggPSAwO1xuICAgIHZhciBuZXdTdGFydElkeCA9IDA7XG4gICAgdmFyIG9sZEVuZElkeCA9IG9sZENoLmxlbmd0aCAtIDE7XG4gICAgdmFyIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFswXTtcbiAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgIHZhciBuZXdFbmRJZHggPSBuZXdDaC5sZW5ndGggLSAxO1xuICAgIHZhciBuZXdTdGFydFZub2RlID0gbmV3Q2hbMF07XG4gICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICB2YXIgb2xkS2V5VG9JZHgsIGlkeEluT2xkLCBlbG1Ub01vdmUsIHJlZkVsbTtcblxuICAgIC8vIHJlbW92ZU9ubHkgaXMgYSBzcGVjaWFsIGZsYWcgdXNlZCBvbmx5IGJ5IDx0cmFuc2l0aW9uLWdyb3VwPlxuICAgIC8vIHRvIGVuc3VyZSByZW1vdmVkIGVsZW1lbnRzIHN0YXkgaW4gY29ycmVjdCByZWxhdGl2ZSBwb3NpdGlvbnNcbiAgICAvLyBkdXJpbmcgbGVhdmluZyB0cmFuc2l0aW9uc1xuICAgIHZhciBjYW5Nb3ZlID0gIXJlbW92ZU9ubHk7XG5cbiAgICB3aGlsZSAob2xkU3RhcnRJZHggPD0gb2xkRW5kSWR4ICYmIG5ld1N0YXJ0SWR4IDw9IG5ld0VuZElkeCkge1xuICAgICAgaWYgKGlzVW5kZWYob2xkU3RhcnRWbm9kZSkpIHtcbiAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdOyAvLyBWbm9kZSBoYXMgYmVlbiBtb3ZlZCBsZWZ0XG4gICAgICB9IGVsc2UgaWYgKGlzVW5kZWYob2xkRW5kVm5vZGUpKSB7XG4gICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgfSBlbHNlIGlmIChzYW1lVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHtcbiAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07XG4gICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgIH0gZWxzZSBpZiAoc2FtZVZub2RlKG9sZEVuZFZub2RlLCBuZXdFbmRWbm9kZSkpIHtcbiAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICBuZXdFbmRWbm9kZSA9IG5ld0NoWy0tbmV3RW5kSWR4XTtcbiAgICAgIH0gZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlKSkgeyAvLyBWbm9kZSBtb3ZlZCByaWdodFxuICAgICAgICBwYXRjaFZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBjYW5Nb3ZlICYmIG5vZGVPcHMuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkU3RhcnRWbm9kZS5lbG0sIG5vZGVPcHMubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHsgLy8gVm5vZGUgbW92ZWQgbGVmdFxuICAgICAgICBwYXRjaFZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBjYW5Nb3ZlICYmIG5vZGVPcHMuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkRW5kVm5vZGUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNVbmRlZihvbGRLZXlUb0lkeCkpIHsgb2xkS2V5VG9JZHggPSBjcmVhdGVLZXlUb09sZElkeChvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7IH1cbiAgICAgICAgaWR4SW5PbGQgPSBpc0RlZihuZXdTdGFydFZub2RlLmtleSkgPyBvbGRLZXlUb0lkeFtuZXdTdGFydFZub2RlLmtleV0gOiBudWxsO1xuICAgICAgICBpZiAoaXNVbmRlZihpZHhJbk9sZCkpIHsgLy8gTmV3IGVsZW1lbnRcbiAgICAgICAgICBjcmVhdGVFbG0obmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCBwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWxtVG9Nb3ZlID0gb2xkQ2hbaWR4SW5PbGRdO1xuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmICFlbG1Ub01vdmUpIHtcbiAgICAgICAgICAgIHdhcm4oXG4gICAgICAgICAgICAgICdJdCBzZWVtcyB0aGVyZSBhcmUgZHVwbGljYXRlIGtleXMgdGhhdCBpcyBjYXVzaW5nIGFuIHVwZGF0ZSBlcnJvci4gJyArXG4gICAgICAgICAgICAgICdNYWtlIHN1cmUgZWFjaCB2LWZvciBpdGVtIGhhcyBhIHVuaXF1ZSBrZXkuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVsbVRvTW92ZS50YWcgIT09IG5ld1N0YXJ0Vm5vZGUudGFnKSB7XG4gICAgICAgICAgICAvLyBzYW1lIGtleSBidXQgZGlmZmVyZW50IGVsZW1lbnQuIHRyZWF0IGFzIG5ldyBlbGVtZW50XG4gICAgICAgICAgICBjcmVhdGVFbG0obmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCBwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0Y2hWbm9kZShlbG1Ub01vdmUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICBvbGRDaFtpZHhJbk9sZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjYW5Nb3ZlICYmIG5vZGVPcHMuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgbmV3U3RhcnRWbm9kZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9sZFN0YXJ0SWR4ID4gb2xkRW5kSWR4KSB7XG4gICAgICByZWZFbG0gPSBpc1VuZGVmKG5ld0NoW25ld0VuZElkeCArIDFdKSA/IG51bGwgOiBuZXdDaFtuZXdFbmRJZHggKyAxXS5lbG07XG4gICAgICBhZGRWbm9kZXMocGFyZW50RWxtLCByZWZFbG0sIG5ld0NoLCBuZXdTdGFydElkeCwgbmV3RW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgIH0gZWxzZSBpZiAobmV3U3RhcnRJZHggPiBuZXdFbmRJZHgpIHtcbiAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYXRjaFZub2RlIChvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSwgcmVtb3ZlT25seSkge1xuICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyByZXVzZSBlbGVtZW50IGZvciBzdGF0aWMgdHJlZXMuXG4gICAgLy8gbm90ZSB3ZSBvbmx5IGRvIHRoaXMgaWYgdGhlIHZub2RlIGlzIGNsb25lZCAtXG4gICAgLy8gaWYgdGhlIG5ldyBub2RlIGlzIG5vdCBjbG9uZWQgaXQgbWVhbnMgdGhlIHJlbmRlciBmdW5jdGlvbnMgaGF2ZSBiZWVuXG4gICAgLy8gcmVzZXQgYnkgdGhlIGhvdC1yZWxvYWQtYXBpIGFuZCB3ZSBuZWVkIHRvIGRvIGEgcHJvcGVyIHJlLXJlbmRlci5cbiAgICBpZiAodm5vZGUuaXNTdGF0aWMgJiZcbiAgICAgICAgb2xkVm5vZGUuaXNTdGF0aWMgJiZcbiAgICAgICAgdm5vZGUua2V5ID09PSBvbGRWbm9kZS5rZXkgJiZcbiAgICAgICAgKHZub2RlLmlzQ2xvbmVkIHx8IHZub2RlLmlzT25jZSkpIHtcbiAgICAgIHZub2RlLmVsbSA9IG9sZFZub2RlLmVsbTtcbiAgICAgIHZub2RlLmNoaWxkID0gb2xkVm5vZGUuY2hpbGQ7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdmFyIGk7XG4gICAgdmFyIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIHZhciBoYXNEYXRhID0gaXNEZWYoZGF0YSk7XG4gICAgaWYgKGhhc0RhdGEgJiYgaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkucHJlcGF0Y2gpKSB7XG4gICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgfVxuICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgdmFyIG9sZENoID0gb2xkVm5vZGUuY2hpbGRyZW47XG4gICAgdmFyIGNoID0gdm5vZGUuY2hpbGRyZW47XG4gICAgaWYgKGhhc0RhdGEgJiYgaXNQYXRjaGFibGUodm5vZGUpKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnVwZGF0ZS5sZW5ndGg7ICsraSkgeyBjYnMudXBkYXRlW2ldKG9sZFZub2RlLCB2bm9kZSk7IH1cbiAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS51cGRhdGUpKSB7IGkob2xkVm5vZGUsIHZub2RlKTsgfVxuICAgIH1cbiAgICBpZiAoaXNVbmRlZih2bm9kZS50ZXh0KSkge1xuICAgICAgaWYgKGlzRGVmKG9sZENoKSAmJiBpc0RlZihjaCkpIHtcbiAgICAgICAgaWYgKG9sZENoICE9PSBjaCkgeyB1cGRhdGVDaGlsZHJlbihlbG0sIG9sZENoLCBjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCByZW1vdmVPbmx5KTsgfVxuICAgICAgfSBlbHNlIGlmIChpc0RlZihjaCkpIHtcbiAgICAgICAgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7IG5vZGVPcHMuc2V0VGV4dENvbnRlbnQoZWxtLCAnJyk7IH1cbiAgICAgICAgYWRkVm5vZGVzKGVsbSwgbnVsbCwgY2gsIDAsIGNoLmxlbmd0aCAtIDEsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICByZW1vdmVWbm9kZXMoZWxtLCBvbGRDaCwgMCwgb2xkQ2gubGVuZ3RoIC0gMSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7XG4gICAgICAgIG5vZGVPcHMuc2V0VGV4dENvbnRlbnQoZWxtLCAnJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChvbGRWbm9kZS50ZXh0ICE9PSB2bm9kZS50ZXh0KSB7XG4gICAgICBub2RlT3BzLnNldFRleHRDb250ZW50KGVsbSwgdm5vZGUudGV4dCk7XG4gICAgfVxuICAgIGlmIChoYXNEYXRhKSB7XG4gICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkucG9zdHBhdGNoKSkgeyBpKG9sZFZub2RlLCB2bm9kZSk7IH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VJbnNlcnRIb29rICh2bm9kZSwgcXVldWUsIGluaXRpYWwpIHtcbiAgICAvLyBkZWxheSBpbnNlcnQgaG9va3MgZm9yIGNvbXBvbmVudCByb290IG5vZGVzLCBpbnZva2UgdGhlbSBhZnRlciB0aGVcbiAgICAvLyBlbGVtZW50IGlzIHJlYWxseSBpbnNlcnRlZFxuICAgIGlmIChpbml0aWFsICYmIHZub2RlLnBhcmVudCkge1xuICAgICAgdm5vZGUucGFyZW50LmRhdGEucGVuZGluZ0luc2VydCA9IHF1ZXVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHF1ZXVlW2ldLmRhdGEuaG9vay5pbnNlcnQocXVldWVbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBiYWlsZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gaHlkcmF0ZSAoZWxtLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGlmICghYXNzZXJ0Tm9kZU1hdGNoKGVsbSwgdm5vZGUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICB2bm9kZS5lbG0gPSBlbG07XG4gICAgdmFyIHRhZyA9IHZub2RlLnRhZztcbiAgICB2YXIgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgdmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgaWYgKGlzRGVmKGRhdGEpKSB7XG4gICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkuaW5pdCkpIHsgaSh2bm9kZSwgdHJ1ZSAvKiBoeWRyYXRpbmcgKi8pOyB9XG4gICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmNoaWxkKSkge1xuICAgICAgICAvLyBjaGlsZCBjb21wb25lbnQuIGl0IHNob3VsZCBoYXZlIGh5ZHJhdGVkIGl0cyBvd24gdHJlZS5cbiAgICAgICAgaW5pdENvbXBvbmVudCh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzRGVmKHRhZykpIHtcbiAgICAgIGlmIChpc0RlZihjaGlsZHJlbikpIHtcbiAgICAgICAgdmFyIGNoaWxkTm9kZXMgPSBub2RlT3BzLmNoaWxkTm9kZXMoZWxtKTtcbiAgICAgICAgLy8gZW1wdHkgZWxlbWVudCwgYWxsb3cgY2xpZW50IHRvIHBpY2sgdXAgYW5kIHBvcHVsYXRlIGNoaWxkcmVuXG4gICAgICAgIGlmICghY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICBjcmVhdGVDaGlsZHJlbih2bm9kZSwgY2hpbGRyZW4sIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGNoaWxkcmVuTWF0Y2ggPSB0cnVlO1xuICAgICAgICAgIGlmIChjaGlsZE5vZGVzLmxlbmd0aCAhPT0gY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICBjaGlsZHJlbk1hdGNoID0gZmFsc2U7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IGNoaWxkcmVuLmxlbmd0aDsgaSQxKyspIHtcbiAgICAgICAgICAgICAgaWYgKCFoeWRyYXRlKGNoaWxkTm9kZXNbaSQxXSwgY2hpbGRyZW5baSQxXSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSkge1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuTWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghY2hpbGRyZW5NYXRjaCkge1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgICAgICAhYmFpbGVkKSB7XG4gICAgICAgICAgICAgIGJhaWxlZCA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybignUGFyZW50OiAnLCBlbG0pO1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ01pc21hdGNoaW5nIGNoaWxkTm9kZXMgdnMuIFZOb2RlczogJywgY2hpbGROb2RlcywgY2hpbGRyZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaXNEZWYoZGF0YSkpIHtcbiAgICAgICAgaW52b2tlQ3JlYXRlSG9va3Modm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBhc3NlcnROb2RlTWF0Y2ggKG5vZGUsIHZub2RlKSB7XG4gICAgaWYgKHZub2RlLnRhZykge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdm5vZGUudGFnLmluZGV4T2YoJ3Z1ZS1jb21wb25lbnQnKSA9PT0gMCB8fFxuICAgICAgICB2bm9kZS50YWcudG9Mb3dlckNhc2UoKSA9PT0gbm9kZU9wcy50YWdOYW1lKG5vZGUpLnRvTG93ZXJDYXNlKClcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIF90b1N0cmluZyh2bm9kZS50ZXh0KSA9PT0gbm9kZS5kYXRhXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIHBhdGNoIChvbGRWbm9kZSwgdm5vZGUsIGh5ZHJhdGluZywgcmVtb3ZlT25seSwgcGFyZW50RWxtLCByZWZFbG0pIHtcbiAgICBpZiAoIXZub2RlKSB7XG4gICAgICBpZiAob2xkVm5vZGUpIHsgaW52b2tlRGVzdHJveUhvb2sob2xkVm5vZGUpOyB9XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgZWxtLCBwYXJlbnQ7XG4gICAgdmFyIGlzSW5pdGlhbFBhdGNoID0gZmFsc2U7XG4gICAgdmFyIGluc2VydGVkVm5vZGVRdWV1ZSA9IFtdO1xuXG4gICAgaWYgKCFvbGRWbm9kZSkge1xuICAgICAgLy8gZW1wdHkgbW91bnQgKGxpa2VseSBhcyBjb21wb25lbnQpLCBjcmVhdGUgbmV3IHJvb3QgZWxlbWVudFxuICAgICAgaXNJbml0aWFsUGF0Y2ggPSB0cnVlO1xuICAgICAgY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUsIHBhcmVudEVsbSwgcmVmRWxtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGlzUmVhbEVsZW1lbnQgPSBpc0RlZihvbGRWbm9kZS5ub2RlVHlwZSk7XG4gICAgICBpZiAoIWlzUmVhbEVsZW1lbnQgJiYgc2FtZVZub2RlKG9sZFZub2RlLCB2bm9kZSkpIHtcbiAgICAgICAgLy8gcGF0Y2ggZXhpc3Rpbmcgcm9vdCBub2RlXG4gICAgICAgIHBhdGNoVm5vZGUob2xkVm5vZGUsIHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUsIHJlbW92ZU9ubHkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGlzUmVhbEVsZW1lbnQpIHtcbiAgICAgICAgICAvLyBtb3VudGluZyB0byBhIHJlYWwgZWxlbWVudFxuICAgICAgICAgIC8vIGNoZWNrIGlmIHRoaXMgaXMgc2VydmVyLXJlbmRlcmVkIGNvbnRlbnQgYW5kIGlmIHdlIGNhbiBwZXJmb3JtXG4gICAgICAgICAgLy8gYSBzdWNjZXNzZnVsIGh5ZHJhdGlvbi5cbiAgICAgICAgICBpZiAob2xkVm5vZGUubm9kZVR5cGUgPT09IDEgJiYgb2xkVm5vZGUuaGFzQXR0cmlidXRlKCdzZXJ2ZXItcmVuZGVyZWQnKSkge1xuICAgICAgICAgICAgb2xkVm5vZGUucmVtb3ZlQXR0cmlidXRlKCdzZXJ2ZXItcmVuZGVyZWQnKTtcbiAgICAgICAgICAgIGh5ZHJhdGluZyA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChoeWRyYXRpbmcpIHtcbiAgICAgICAgICAgIGlmIChoeWRyYXRlKG9sZFZub2RlLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSkge1xuICAgICAgICAgICAgICBpbnZva2VJbnNlcnRIb29rKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUsIHRydWUpO1xuICAgICAgICAgICAgICByZXR1cm4gb2xkVm5vZGVcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgICB3YXJuKFxuICAgICAgICAgICAgICAgICdUaGUgY2xpZW50LXNpZGUgcmVuZGVyZWQgdmlydHVhbCBET00gdHJlZSBpcyBub3QgbWF0Y2hpbmcgJyArXG4gICAgICAgICAgICAgICAgJ3NlcnZlci1yZW5kZXJlZCBjb250ZW50LiBUaGlzIGlzIGxpa2VseSBjYXVzZWQgYnkgaW5jb3JyZWN0ICcgK1xuICAgICAgICAgICAgICAgICdIVE1MIG1hcmt1cCwgZm9yIGV4YW1wbGUgbmVzdGluZyBibG9jay1sZXZlbCBlbGVtZW50cyBpbnNpZGUgJyArXG4gICAgICAgICAgICAgICAgJzxwPiwgb3IgbWlzc2luZyA8dGJvZHk+LiBCYWlsaW5nIGh5ZHJhdGlvbiBhbmQgcGVyZm9ybWluZyAnICtcbiAgICAgICAgICAgICAgICAnZnVsbCBjbGllbnQtc2lkZSByZW5kZXIuJ1xuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBlaXRoZXIgbm90IHNlcnZlci1yZW5kZXJlZCwgb3IgaHlkcmF0aW9uIGZhaWxlZC5cbiAgICAgICAgICAvLyBjcmVhdGUgYW4gZW1wdHkgbm9kZSBhbmQgcmVwbGFjZSBpdFxuICAgICAgICAgIG9sZFZub2RlID0gZW1wdHlOb2RlQXQob2xkVm5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVwbGFjaW5nIGV4aXN0aW5nIGVsZW1lbnRcbiAgICAgICAgZWxtID0gb2xkVm5vZGUuZWxtO1xuICAgICAgICBwYXJlbnQgPSBub2RlT3BzLnBhcmVudE5vZGUoZWxtKTtcbiAgICAgICAgY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUsIHBhcmVudCwgbm9kZU9wcy5uZXh0U2libGluZyhlbG0pKTtcblxuICAgICAgICBpZiAodm5vZGUucGFyZW50KSB7XG4gICAgICAgICAgLy8gY29tcG9uZW50IHJvb3QgZWxlbWVudCByZXBsYWNlZC5cbiAgICAgICAgICAvLyB1cGRhdGUgcGFyZW50IHBsYWNlaG9sZGVyIG5vZGUgZWxlbWVudCwgcmVjdXJzaXZlbHlcbiAgICAgICAgICB2YXIgYW5jZXN0b3IgPSB2bm9kZS5wYXJlbnQ7XG4gICAgICAgICAgd2hpbGUgKGFuY2VzdG9yKSB7XG4gICAgICAgICAgICBhbmNlc3Rvci5lbG0gPSB2bm9kZS5lbG07XG4gICAgICAgICAgICBhbmNlc3RvciA9IGFuY2VzdG9yLnBhcmVudDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlzUGF0Y2hhYmxlKHZub2RlKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYnMuY3JlYXRlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgIGNicy5jcmVhdGVbaV0oZW1wdHlOb2RlLCB2bm9kZS5wYXJlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50LCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0RlZihvbGRWbm9kZS50YWcpKSB7XG4gICAgICAgICAgaW52b2tlRGVzdHJveUhvb2sob2xkVm5vZGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW52b2tlSW5zZXJ0SG9vayh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCBpc0luaXRpYWxQYXRjaCk7XG4gICAgcmV0dXJuIHZub2RlLmVsbVxuICB9XG59XG5cbi8qICAqL1xuXG52YXIgZGlyZWN0aXZlcyA9IHtcbiAgY3JlYXRlOiB1cGRhdGVEaXJlY3RpdmVzLFxuICB1cGRhdGU6IHVwZGF0ZURpcmVjdGl2ZXMsXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uIHVuYmluZERpcmVjdGl2ZXMgKHZub2RlKSB7XG4gICAgdXBkYXRlRGlyZWN0aXZlcyh2bm9kZSwgZW1wdHlOb2RlKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gdXBkYXRlRGlyZWN0aXZlcyAoXG4gIG9sZFZub2RlLFxuICB2bm9kZVxuKSB7XG4gIGlmICghb2xkVm5vZGUuZGF0YS5kaXJlY3RpdmVzICYmICF2bm9kZS5kYXRhLmRpcmVjdGl2ZXMpIHtcbiAgICByZXR1cm5cbiAgfVxuICB2YXIgaXNDcmVhdGUgPSBvbGRWbm9kZSA9PT0gZW1wdHlOb2RlO1xuICB2YXIgb2xkRGlycyA9IG5vcm1hbGl6ZURpcmVjdGl2ZXMkMShvbGRWbm9kZS5kYXRhLmRpcmVjdGl2ZXMsIG9sZFZub2RlLmNvbnRleHQpO1xuICB2YXIgbmV3RGlycyA9IG5vcm1hbGl6ZURpcmVjdGl2ZXMkMSh2bm9kZS5kYXRhLmRpcmVjdGl2ZXMsIHZub2RlLmNvbnRleHQpO1xuXG4gIHZhciBkaXJzV2l0aEluc2VydCA9IFtdO1xuICB2YXIgZGlyc1dpdGhQb3N0cGF0Y2ggPSBbXTtcblxuICB2YXIga2V5LCBvbGREaXIsIGRpcjtcbiAgZm9yIChrZXkgaW4gbmV3RGlycykge1xuICAgIG9sZERpciA9IG9sZERpcnNba2V5XTtcbiAgICBkaXIgPSBuZXdEaXJzW2tleV07XG4gICAgaWYgKCFvbGREaXIpIHtcbiAgICAgIC8vIG5ldyBkaXJlY3RpdmUsIGJpbmRcbiAgICAgIGNhbGxIb29rJDEoZGlyLCAnYmluZCcsIHZub2RlLCBvbGRWbm9kZSk7XG4gICAgICBpZiAoZGlyLmRlZiAmJiBkaXIuZGVmLmluc2VydGVkKSB7XG4gICAgICAgIGRpcnNXaXRoSW5zZXJ0LnB1c2goZGlyKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZXhpc3RpbmcgZGlyZWN0aXZlLCB1cGRhdGVcbiAgICAgIGRpci5vbGRWYWx1ZSA9IG9sZERpci52YWx1ZTtcbiAgICAgIGNhbGxIb29rJDEoZGlyLCAndXBkYXRlJywgdm5vZGUsIG9sZFZub2RlKTtcbiAgICAgIGlmIChkaXIuZGVmICYmIGRpci5kZWYuY29tcG9uZW50VXBkYXRlZCkge1xuICAgICAgICBkaXJzV2l0aFBvc3RwYXRjaC5wdXNoKGRpcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGRpcnNXaXRoSW5zZXJ0Lmxlbmd0aCkge1xuICAgIHZhciBjYWxsSW5zZXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgZGlyc1dpdGhJbnNlcnQuZm9yRWFjaChmdW5jdGlvbiAoZGlyKSB7XG4gICAgICAgIGNhbGxIb29rJDEoZGlyLCAnaW5zZXJ0ZWQnLCB2bm9kZSwgb2xkVm5vZGUpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICBpZiAoaXNDcmVhdGUpIHtcbiAgICAgIG1lcmdlVk5vZGVIb29rKHZub2RlLmRhdGEuaG9vayB8fCAodm5vZGUuZGF0YS5ob29rID0ge30pLCAnaW5zZXJ0JywgY2FsbEluc2VydCwgJ2Rpci1pbnNlcnQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbEluc2VydCgpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChkaXJzV2l0aFBvc3RwYXRjaC5sZW5ndGgpIHtcbiAgICBtZXJnZVZOb2RlSG9vayh2bm9kZS5kYXRhLmhvb2sgfHwgKHZub2RlLmRhdGEuaG9vayA9IHt9KSwgJ3Bvc3RwYXRjaCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRpcnNXaXRoUG9zdHBhdGNoLmZvckVhY2goZnVuY3Rpb24gKGRpcikge1xuICAgICAgICBjYWxsSG9vayQxKGRpciwgJ2NvbXBvbmVudFVwZGF0ZWQnLCB2bm9kZSwgb2xkVm5vZGUpO1xuICAgICAgfSk7XG4gICAgfSwgJ2Rpci1wb3N0cGF0Y2gnKTtcbiAgfVxuXG4gIGlmICghaXNDcmVhdGUpIHtcbiAgICBmb3IgKGtleSBpbiBvbGREaXJzKSB7XG4gICAgICBpZiAoIW5ld0RpcnNba2V5XSkge1xuICAgICAgICAvLyBubyBsb25nZXIgcHJlc2VudCwgdW5iaW5kXG4gICAgICAgIGNhbGxIb29rJDEob2xkRGlyc1trZXldLCAndW5iaW5kJywgb2xkVm5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG52YXIgZW1wdHlNb2RpZmllcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5mdW5jdGlvbiBub3JtYWxpemVEaXJlY3RpdmVzJDEgKFxuICBkaXJzLFxuICB2bVxuKSB7XG4gIHZhciByZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIWRpcnMpIHtcbiAgICByZXR1cm4gcmVzXG4gIH1cbiAgdmFyIGksIGRpcjtcbiAgZm9yIChpID0gMDsgaSA8IGRpcnMubGVuZ3RoOyBpKyspIHtcbiAgICBkaXIgPSBkaXJzW2ldO1xuICAgIGlmICghZGlyLm1vZGlmaWVycykge1xuICAgICAgZGlyLm1vZGlmaWVycyA9IGVtcHR5TW9kaWZpZXJzO1xuICAgIH1cbiAgICByZXNbZ2V0UmF3RGlyTmFtZShkaXIpXSA9IGRpcjtcbiAgICBkaXIuZGVmID0gcmVzb2x2ZUFzc2V0KHZtLiRvcHRpb25zLCAnZGlyZWN0aXZlcycsIGRpci5uYW1lLCB0cnVlKTtcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGdldFJhd0Rpck5hbWUgKGRpcikge1xuICByZXR1cm4gZGlyLnJhd05hbWUgfHwgKChkaXIubmFtZSkgKyBcIi5cIiArIChPYmplY3Qua2V5cyhkaXIubW9kaWZpZXJzIHx8IHt9KS5qb2luKCcuJykpKVxufVxuXG5mdW5jdGlvbiBjYWxsSG9vayQxIChkaXIsIGhvb2ssIHZub2RlLCBvbGRWbm9kZSkge1xuICB2YXIgZm4gPSBkaXIuZGVmICYmIGRpci5kZWZbaG9va107XG4gIGlmIChmbikge1xuICAgIGZuKHZub2RlLmVsbSwgZGlyLCB2bm9kZSwgb2xkVm5vZGUpO1xuICB9XG59XG5cbnZhciBiYXNlTW9kdWxlcyA9IFtcbiAgcmVmLFxuICBkaXJlY3RpdmVzXG5dO1xuXG4vKiAgKi9cblxuZnVuY3Rpb24gdXBkYXRlQXR0cnMgKG9sZFZub2RlLCB2bm9kZSkge1xuICBpZiAoIW9sZFZub2RlLmRhdGEuYXR0cnMgJiYgIXZub2RlLmRhdGEuYXR0cnMpIHtcbiAgICByZXR1cm5cbiAgfVxuICB2YXIga2V5LCBjdXIsIG9sZDtcbiAgdmFyIGVsbSA9IHZub2RlLmVsbTtcbiAgdmFyIG9sZEF0dHJzID0gb2xkVm5vZGUuZGF0YS5hdHRycyB8fCB7fTtcbiAgdmFyIGF0dHJzID0gdm5vZGUuZGF0YS5hdHRycyB8fCB7fTtcbiAgLy8gY2xvbmUgb2JzZXJ2ZWQgb2JqZWN0cywgYXMgdGhlIHVzZXIgcHJvYmFibHkgd2FudHMgdG8gbXV0YXRlIGl0XG4gIGlmIChhdHRycy5fX29iX18pIHtcbiAgICBhdHRycyA9IHZub2RlLmRhdGEuYXR0cnMgPSBleHRlbmQoe30sIGF0dHJzKTtcbiAgfVxuXG4gIGZvciAoa2V5IGluIGF0dHJzKSB7XG4gICAgY3VyID0gYXR0cnNba2V5XTtcbiAgICBvbGQgPSBvbGRBdHRyc1trZXldO1xuICAgIGlmIChvbGQgIT09IGN1cikge1xuICAgICAgc2V0QXR0cihlbG0sIGtleSwgY3VyKTtcbiAgICB9XG4gIH1cbiAgZm9yIChrZXkgaW4gb2xkQXR0cnMpIHtcbiAgICBpZiAoYXR0cnNba2V5XSA9PSBudWxsKSB7XG4gICAgICBpZiAoaXNYbGluayhrZXkpKSB7XG4gICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGVOUyh4bGlua05TLCBnZXRYbGlua1Byb3Aoa2V5KSk7XG4gICAgICB9IGVsc2UgaWYgKCFpc0VudW1lcmF0ZWRBdHRyKGtleSkpIHtcbiAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRBdHRyIChlbCwga2V5LCB2YWx1ZSkge1xuICBpZiAoaXNCb29sZWFuQXR0cihrZXkpKSB7XG4gICAgLy8gc2V0IGF0dHJpYnV0ZSBmb3IgYmxhbmsgdmFsdWVcbiAgICAvLyBlLmcuIDxvcHRpb24gZGlzYWJsZWQ+U2VsZWN0IG9uZTwvb3B0aW9uPlxuICAgIGlmIChpc0ZhbHN5QXR0clZhbHVlKHZhbHVlKSkge1xuICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLnNldEF0dHJpYnV0ZShrZXksIGtleSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzRW51bWVyYXRlZEF0dHIoa2V5KSkge1xuICAgIGVsLnNldEF0dHJpYnV0ZShrZXksIGlzRmFsc3lBdHRyVmFsdWUodmFsdWUpIHx8IHZhbHVlID09PSAnZmFsc2UnID8gJ2ZhbHNlJyA6ICd0cnVlJyk7XG4gIH0gZWxzZSBpZiAoaXNYbGluayhrZXkpKSB7XG4gICAgaWYgKGlzRmFsc3lBdHRyVmFsdWUodmFsdWUpKSB7XG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGVOUyh4bGlua05TLCBnZXRYbGlua1Byb3Aoa2V5KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLnNldEF0dHJpYnV0ZU5TKHhsaW5rTlMsIGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoaXNGYWxzeUF0dHJWYWx1ZSh2YWx1ZSkpIHtcbiAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG59XG5cbnZhciBhdHRycyA9IHtcbiAgY3JlYXRlOiB1cGRhdGVBdHRycyxcbiAgdXBkYXRlOiB1cGRhdGVBdHRyc1xufTtcblxuLyogICovXG5cbmZ1bmN0aW9uIHVwZGF0ZUNsYXNzIChvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGVsID0gdm5vZGUuZWxtO1xuICB2YXIgZGF0YSA9IHZub2RlLmRhdGE7XG4gIHZhciBvbGREYXRhID0gb2xkVm5vZGUuZGF0YTtcbiAgaWYgKCFkYXRhLnN0YXRpY0NsYXNzICYmICFkYXRhLmNsYXNzICYmXG4gICAgICAoIW9sZERhdGEgfHwgKCFvbGREYXRhLnN0YXRpY0NsYXNzICYmICFvbGREYXRhLmNsYXNzKSkpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBjbHMgPSBnZW5DbGFzc0ZvclZub2RlKHZub2RlKTtcblxuICAvLyBoYW5kbGUgdHJhbnNpdGlvbiBjbGFzc2VzXG4gIHZhciB0cmFuc2l0aW9uQ2xhc3MgPSBlbC5fdHJhbnNpdGlvbkNsYXNzZXM7XG4gIGlmICh0cmFuc2l0aW9uQ2xhc3MpIHtcbiAgICBjbHMgPSBjb25jYXQoY2xzLCBzdHJpbmdpZnlDbGFzcyh0cmFuc2l0aW9uQ2xhc3MpKTtcbiAgfVxuXG4gIC8vIHNldCB0aGUgY2xhc3NcbiAgaWYgKGNscyAhPT0gZWwuX3ByZXZDbGFzcykge1xuICAgIGVsLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBjbHMpO1xuICAgIGVsLl9wcmV2Q2xhc3MgPSBjbHM7XG4gIH1cbn1cblxudmFyIGtsYXNzID0ge1xuICBjcmVhdGU6IHVwZGF0ZUNsYXNzLFxuICB1cGRhdGU6IHVwZGF0ZUNsYXNzXG59O1xuXG4vLyBza2lwIHR5cGUgY2hlY2tpbmcgdGhpcyBmaWxlIGJlY2F1c2Ugd2UgbmVlZCB0byBhdHRhY2ggcHJpdmF0ZSBwcm9wZXJ0aWVzXG4vLyB0byBlbGVtZW50c1xuXG5mdW5jdGlvbiB1cGRhdGVET01MaXN0ZW5lcnMgKG9sZFZub2RlLCB2bm9kZSkge1xuICBpZiAoIW9sZFZub2RlLmRhdGEub24gJiYgIXZub2RlLmRhdGEub24pIHtcbiAgICByZXR1cm5cbiAgfVxuICB2YXIgb24gPSB2bm9kZS5kYXRhLm9uIHx8IHt9O1xuICB2YXIgb2xkT24gPSBvbGRWbm9kZS5kYXRhLm9uIHx8IHt9O1xuICB2YXIgYWRkID0gdm5vZGUuZWxtLl92X2FkZCB8fCAoXG4gICAgdm5vZGUuZWxtLl92X2FkZCA9IGZ1bmN0aW9uIChldmVudCwgaGFuZGxlciwgb25jZSwgY2FwdHVyZSkge1xuICAgICAgaWYgKG9uY2UpIHtcbiAgICAgICAgdmFyIG9sZEhhbmRsZXIgPSBoYW5kbGVyO1xuICAgICAgICBoYW5kbGVyID0gZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgcmVtb3ZlKGV2ZW50LCBoYW5kbGVyLCBjYXB0dXJlKTtcbiAgICAgICAgICBhcmd1bWVudHMubGVuZ3RoID09PSAxXG4gICAgICAgICAgICA/IG9sZEhhbmRsZXIoZXYpXG4gICAgICAgICAgICA6IG9sZEhhbmRsZXIuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHZub2RlLmVsbS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLCBjYXB0dXJlKTtcbiAgICB9XG4gICk7XG4gIHZhciByZW1vdmUgPSB2bm9kZS5lbG0uX3ZfcmVtb3ZlIHx8IChcbiAgICB2bm9kZS5lbG0uX3ZfcmVtb3ZlID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyLCBjYXB0dXJlKSB7XG4gICAgICB2bm9kZS5lbG0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgY2FwdHVyZSk7XG4gICAgfVxuICApO1xuICB1cGRhdGVMaXN0ZW5lcnMob24sIG9sZE9uLCBhZGQsIHJlbW92ZSwgdm5vZGUuY29udGV4dCk7XG59XG5cbnZhciBldmVudHMgPSB7XG4gIGNyZWF0ZTogdXBkYXRlRE9NTGlzdGVuZXJzLFxuICB1cGRhdGU6IHVwZGF0ZURPTUxpc3RlbmVyc1xufTtcblxuLyogICovXG5cbmZ1bmN0aW9uIHVwZGF0ZURPTVByb3BzIChvbGRWbm9kZSwgdm5vZGUpIHtcbiAgaWYgKCFvbGRWbm9kZS5kYXRhLmRvbVByb3BzICYmICF2bm9kZS5kYXRhLmRvbVByb3BzKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgdmFyIGtleSwgY3VyO1xuICB2YXIgZWxtID0gdm5vZGUuZWxtO1xuICB2YXIgb2xkUHJvcHMgPSBvbGRWbm9kZS5kYXRhLmRvbVByb3BzIHx8IHt9O1xuICB2YXIgcHJvcHMgPSB2bm9kZS5kYXRhLmRvbVByb3BzIHx8IHt9O1xuICAvLyBjbG9uZSBvYnNlcnZlZCBvYmplY3RzLCBhcyB0aGUgdXNlciBwcm9iYWJseSB3YW50cyB0byBtdXRhdGUgaXRcbiAgaWYgKHByb3BzLl9fb2JfXykge1xuICAgIHByb3BzID0gdm5vZGUuZGF0YS5kb21Qcm9wcyA9IGV4dGVuZCh7fSwgcHJvcHMpO1xuICB9XG5cbiAgZm9yIChrZXkgaW4gb2xkUHJvcHMpIHtcbiAgICBpZiAocHJvcHNba2V5XSA9PSBudWxsKSB7XG4gICAgICBlbG1ba2V5XSA9ICcnO1xuICAgIH1cbiAgfVxuICBmb3IgKGtleSBpbiBwcm9wcykge1xuICAgIGN1ciA9IHByb3BzW2tleV07XG4gICAgLy8gaWdub3JlIGNoaWxkcmVuIGlmIHRoZSBub2RlIGhhcyB0ZXh0Q29udGVudCBvciBpbm5lckhUTUwsXG4gICAgLy8gYXMgdGhlc2Ugd2lsbCB0aHJvdyBhd2F5IGV4aXN0aW5nIERPTSBub2RlcyBhbmQgY2F1c2UgcmVtb3ZhbCBlcnJvcnNcbiAgICAvLyBvbiBzdWJzZXF1ZW50IHBhdGNoZXMgKCMzMzYwKVxuICAgIGlmIChrZXkgPT09ICd0ZXh0Q29udGVudCcgfHwga2V5ID09PSAnaW5uZXJIVE1MJykge1xuICAgICAgaWYgKHZub2RlLmNoaWxkcmVuKSB7IHZub2RlLmNoaWxkcmVuLmxlbmd0aCA9IDA7IH1cbiAgICAgIGlmIChjdXIgPT09IG9sZFByb3BzW2tleV0pIHsgY29udGludWUgfVxuICAgIH1cbiAgICBpZiAoa2V5ID09PSAndmFsdWUnKSB7XG4gICAgICAvLyBzdG9yZSB2YWx1ZSBhcyBfdmFsdWUgYXMgd2VsbCBzaW5jZVxuICAgICAgLy8gbm9uLXN0cmluZyB2YWx1ZXMgd2lsbCBiZSBzdHJpbmdpZmllZFxuICAgICAgZWxtLl92YWx1ZSA9IGN1cjtcbiAgICAgIC8vIGF2b2lkIHJlc2V0dGluZyBjdXJzb3IgcG9zaXRpb24gd2hlbiB2YWx1ZSBpcyB0aGUgc2FtZVxuICAgICAgdmFyIHN0ckN1ciA9IGN1ciA9PSBudWxsID8gJycgOiBTdHJpbmcoY3VyKTtcbiAgICAgIGlmIChlbG0udmFsdWUgIT09IHN0ckN1ciAmJiAhZWxtLmNvbXBvc2luZykge1xuICAgICAgICBlbG0udmFsdWUgPSBzdHJDdXI7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsbVtrZXldID0gY3VyO1xuICAgIH1cbiAgfVxufVxuXG52YXIgZG9tUHJvcHMgPSB7XG4gIGNyZWF0ZTogdXBkYXRlRE9NUHJvcHMsXG4gIHVwZGF0ZTogdXBkYXRlRE9NUHJvcHNcbn07XG5cbi8qICAqL1xuXG52YXIgcGFyc2VTdHlsZVRleHQgPSBjYWNoZWQoZnVuY3Rpb24gKGNzc1RleHQpIHtcbiAgdmFyIHJlcyA9IHt9O1xuICB2YXIgbGlzdERlbGltaXRlciA9IC87KD8hW14oXSpcXCkpL2c7XG4gIHZhciBwcm9wZXJ0eURlbGltaXRlciA9IC86KC4rKS87XG4gIGNzc1RleHQuc3BsaXQobGlzdERlbGltaXRlcikuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgIGlmIChpdGVtKSB7XG4gICAgICB2YXIgdG1wID0gaXRlbS5zcGxpdChwcm9wZXJ0eURlbGltaXRlcik7XG4gICAgICB0bXAubGVuZ3RoID4gMSAmJiAocmVzW3RtcFswXS50cmltKCldID0gdG1wWzFdLnRyaW0oKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlc1xufSk7XG5cbi8vIG1lcmdlIHN0YXRpYyBhbmQgZHluYW1pYyBzdHlsZSBkYXRhIG9uIHRoZSBzYW1lIHZub2RlXG5mdW5jdGlvbiBub3JtYWxpemVTdHlsZURhdGEgKGRhdGEpIHtcbiAgdmFyIHN0eWxlID0gbm9ybWFsaXplU3R5bGVCaW5kaW5nKGRhdGEuc3R5bGUpO1xuICAvLyBzdGF0aWMgc3R5bGUgaXMgcHJlLXByb2Nlc3NlZCBpbnRvIGFuIG9iamVjdCBkdXJpbmcgY29tcGlsYXRpb25cbiAgLy8gYW5kIGlzIGFsd2F5cyBhIGZyZXNoIG9iamVjdCwgc28gaXQncyBzYWZlIHRvIG1lcmdlIGludG8gaXRcbiAgcmV0dXJuIGRhdGEuc3RhdGljU3R5bGVcbiAgICA/IGV4dGVuZChkYXRhLnN0YXRpY1N0eWxlLCBzdHlsZSlcbiAgICA6IHN0eWxlXG59XG5cbi8vIG5vcm1hbGl6ZSBwb3NzaWJsZSBhcnJheSAvIHN0cmluZyB2YWx1ZXMgaW50byBPYmplY3RcbmZ1bmN0aW9uIG5vcm1hbGl6ZVN0eWxlQmluZGluZyAoYmluZGluZ1N0eWxlKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGJpbmRpbmdTdHlsZSkpIHtcbiAgICByZXR1cm4gdG9PYmplY3QoYmluZGluZ1N0eWxlKVxuICB9XG4gIGlmICh0eXBlb2YgYmluZGluZ1N0eWxlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBwYXJzZVN0eWxlVGV4dChiaW5kaW5nU3R5bGUpXG4gIH1cbiAgcmV0dXJuIGJpbmRpbmdTdHlsZVxufVxuXG4vKipcbiAqIHBhcmVudCBjb21wb25lbnQgc3R5bGUgc2hvdWxkIGJlIGFmdGVyIGNoaWxkJ3NcbiAqIHNvIHRoYXQgcGFyZW50IGNvbXBvbmVudCdzIHN0eWxlIGNvdWxkIG92ZXJyaWRlIGl0XG4gKi9cbmZ1bmN0aW9uIGdldFN0eWxlICh2bm9kZSwgY2hlY2tDaGlsZCkge1xuICB2YXIgcmVzID0ge307XG4gIHZhciBzdHlsZURhdGE7XG5cbiAgaWYgKGNoZWNrQ2hpbGQpIHtcbiAgICB2YXIgY2hpbGROb2RlID0gdm5vZGU7XG4gICAgd2hpbGUgKGNoaWxkTm9kZS5jaGlsZCkge1xuICAgICAgY2hpbGROb2RlID0gY2hpbGROb2RlLmNoaWxkLl92bm9kZTtcbiAgICAgIGlmIChjaGlsZE5vZGUuZGF0YSAmJiAoc3R5bGVEYXRhID0gbm9ybWFsaXplU3R5bGVEYXRhKGNoaWxkTm9kZS5kYXRhKSkpIHtcbiAgICAgICAgZXh0ZW5kKHJlcywgc3R5bGVEYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoKHN0eWxlRGF0YSA9IG5vcm1hbGl6ZVN0eWxlRGF0YSh2bm9kZS5kYXRhKSkpIHtcbiAgICBleHRlbmQocmVzLCBzdHlsZURhdGEpO1xuICB9XG5cbiAgdmFyIHBhcmVudE5vZGUgPSB2bm9kZTtcbiAgd2hpbGUgKChwYXJlbnROb2RlID0gcGFyZW50Tm9kZS5wYXJlbnQpKSB7XG4gICAgaWYgKHBhcmVudE5vZGUuZGF0YSAmJiAoc3R5bGVEYXRhID0gbm9ybWFsaXplU3R5bGVEYXRhKHBhcmVudE5vZGUuZGF0YSkpKSB7XG4gICAgICBleHRlbmQocmVzLCBzdHlsZURhdGEpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbi8qICAqL1xuXG52YXIgY3NzVmFyUkUgPSAvXi0tLztcbnZhciBpbXBvcnRhbnRSRSA9IC9cXHMqIWltcG9ydGFudCQvO1xudmFyIHNldFByb3AgPSBmdW5jdGlvbiAoZWwsIG5hbWUsIHZhbCkge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKGNzc1ZhclJFLnRlc3QobmFtZSkpIHtcbiAgICBlbC5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCB2YWwpO1xuICB9IGVsc2UgaWYgKGltcG9ydGFudFJFLnRlc3QodmFsKSkge1xuICAgIGVsLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHZhbC5yZXBsYWNlKGltcG9ydGFudFJFLCAnJyksICdpbXBvcnRhbnQnKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5zdHlsZVtub3JtYWxpemUobmFtZSldID0gdmFsO1xuICB9XG59O1xuXG52YXIgcHJlZml4ZXMgPSBbJ1dlYmtpdCcsICdNb3onLCAnbXMnXTtcblxudmFyIHRlc3RFbDtcbnZhciBub3JtYWxpemUgPSBjYWNoZWQoZnVuY3Rpb24gKHByb3ApIHtcbiAgdGVzdEVsID0gdGVzdEVsIHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBwcm9wID0gY2FtZWxpemUocHJvcCk7XG4gIGlmIChwcm9wICE9PSAnZmlsdGVyJyAmJiAocHJvcCBpbiB0ZXN0RWwuc3R5bGUpKSB7XG4gICAgcmV0dXJuIHByb3BcbiAgfVxuICB2YXIgdXBwZXIgPSBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zbGljZSgxKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwcmVmaXhlZCA9IHByZWZpeGVzW2ldICsgdXBwZXI7XG4gICAgaWYgKHByZWZpeGVkIGluIHRlc3RFbC5zdHlsZSkge1xuICAgICAgcmV0dXJuIHByZWZpeGVkXG4gICAgfVxuICB9XG59KTtcblxuZnVuY3Rpb24gdXBkYXRlU3R5bGUgKG9sZFZub2RlLCB2bm9kZSkge1xuICB2YXIgZGF0YSA9IHZub2RlLmRhdGE7XG4gIHZhciBvbGREYXRhID0gb2xkVm5vZGUuZGF0YTtcblxuICBpZiAoIWRhdGEuc3RhdGljU3R5bGUgJiYgIWRhdGEuc3R5bGUgJiZcbiAgICAgICFvbGREYXRhLnN0YXRpY1N0eWxlICYmICFvbGREYXRhLnN0eWxlKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgY3VyLCBuYW1lO1xuICB2YXIgZWwgPSB2bm9kZS5lbG07XG4gIHZhciBvbGRTdGF0aWNTdHlsZSA9IG9sZFZub2RlLmRhdGEuc3RhdGljU3R5bGU7XG4gIHZhciBvbGRTdHlsZUJpbmRpbmcgPSBvbGRWbm9kZS5kYXRhLnN0eWxlIHx8IHt9O1xuXG4gIC8vIGlmIHN0YXRpYyBzdHlsZSBleGlzdHMsIHN0eWxlYmluZGluZyBhbHJlYWR5IG1lcmdlZCBpbnRvIGl0IHdoZW4gZG9pbmcgbm9ybWFsaXplU3R5bGVEYXRhXG4gIHZhciBvbGRTdHlsZSA9IG9sZFN0YXRpY1N0eWxlIHx8IG9sZFN0eWxlQmluZGluZztcblxuICB2YXIgc3R5bGUgPSBub3JtYWxpemVTdHlsZUJpbmRpbmcodm5vZGUuZGF0YS5zdHlsZSkgfHwge307XG5cbiAgdm5vZGUuZGF0YS5zdHlsZSA9IHN0eWxlLl9fb2JfXyA/IGV4dGVuZCh7fSwgc3R5bGUpIDogc3R5bGU7XG5cbiAgdmFyIG5ld1N0eWxlID0gZ2V0U3R5bGUodm5vZGUsIHRydWUpO1xuXG4gIGZvciAobmFtZSBpbiBvbGRTdHlsZSkge1xuICAgIGlmIChuZXdTdHlsZVtuYW1lXSA9PSBudWxsKSB7XG4gICAgICBzZXRQcm9wKGVsLCBuYW1lLCAnJyk7XG4gICAgfVxuICB9XG4gIGZvciAobmFtZSBpbiBuZXdTdHlsZSkge1xuICAgIGN1ciA9IG5ld1N0eWxlW25hbWVdO1xuICAgIGlmIChjdXIgIT09IG9sZFN0eWxlW25hbWVdKSB7XG4gICAgICAvLyBpZTkgc2V0dGluZyB0byBudWxsIGhhcyBubyBlZmZlY3QsIG11c3QgdXNlIGVtcHR5IHN0cmluZ1xuICAgICAgc2V0UHJvcChlbCwgbmFtZSwgY3VyID09IG51bGwgPyAnJyA6IGN1cik7XG4gICAgfVxuICB9XG59XG5cbnZhciBzdHlsZSA9IHtcbiAgY3JlYXRlOiB1cGRhdGVTdHlsZSxcbiAgdXBkYXRlOiB1cGRhdGVTdHlsZVxufTtcblxuLyogICovXG5cbi8qKlxuICogQWRkIGNsYXNzIHdpdGggY29tcGF0aWJpbGl0eSBmb3IgU1ZHIHNpbmNlIGNsYXNzTGlzdCBpcyBub3Qgc3VwcG9ydGVkIG9uXG4gKiBTVkcgZWxlbWVudHMgaW4gSUVcbiAqL1xuZnVuY3Rpb24gYWRkQ2xhc3MgKGVsLCBjbHMpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICghY2xzIHx8ICFjbHMudHJpbSgpKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoZWwuY2xhc3NMaXN0KSB7XG4gICAgaWYgKGNscy5pbmRleE9mKCcgJykgPiAtMSkge1xuICAgICAgY2xzLnNwbGl0KC9cXHMrLykuZm9yRWFjaChmdW5jdGlvbiAoYykgeyByZXR1cm4gZWwuY2xhc3NMaXN0LmFkZChjKTsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLmNsYXNzTGlzdC5hZGQoY2xzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGN1ciA9ICcgJyArIGVsLmdldEF0dHJpYnV0ZSgnY2xhc3MnKSArICcgJztcbiAgICBpZiAoY3VyLmluZGV4T2YoJyAnICsgY2xzICsgJyAnKSA8IDApIHtcbiAgICAgIGVsLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAoY3VyICsgY2xzKS50cmltKCkpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZSBjbGFzcyB3aXRoIGNvbXBhdGliaWxpdHkgZm9yIFNWRyBzaW5jZSBjbGFzc0xpc3QgaXMgbm90IHN1cHBvcnRlZCBvblxuICogU1ZHIGVsZW1lbnRzIGluIElFXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUNsYXNzIChlbCwgY2xzKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoIWNscyB8fCAhY2xzLnRyaW0oKSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKGVsLmNsYXNzTGlzdCkge1xuICAgIGlmIChjbHMuaW5kZXhPZignICcpID4gLTEpIHtcbiAgICAgIGNscy5zcGxpdCgvXFxzKy8pLmZvckVhY2goZnVuY3Rpb24gKGMpIHsgcmV0dXJuIGVsLmNsYXNzTGlzdC5yZW1vdmUoYyk7IH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKGNscyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciBjdXIgPSAnICcgKyBlbC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgKyAnICc7XG4gICAgdmFyIHRhciA9ICcgJyArIGNscyArICcgJztcbiAgICB3aGlsZSAoY3VyLmluZGV4T2YodGFyKSA+PSAwKSB7XG4gICAgICBjdXIgPSBjdXIucmVwbGFjZSh0YXIsICcgJyk7XG4gICAgfVxuICAgIGVsLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBjdXIudHJpbSgpKTtcbiAgfVxufVxuXG4vKiAgKi9cblxudmFyIGhhc1RyYW5zaXRpb24gPSBpbkJyb3dzZXIgJiYgIWlzSUU5O1xudmFyIFRSQU5TSVRJT04gPSAndHJhbnNpdGlvbic7XG52YXIgQU5JTUFUSU9OID0gJ2FuaW1hdGlvbic7XG5cbi8vIFRyYW5zaXRpb24gcHJvcGVydHkvZXZlbnQgc25pZmZpbmdcbnZhciB0cmFuc2l0aW9uUHJvcCA9ICd0cmFuc2l0aW9uJztcbnZhciB0cmFuc2l0aW9uRW5kRXZlbnQgPSAndHJhbnNpdGlvbmVuZCc7XG52YXIgYW5pbWF0aW9uUHJvcCA9ICdhbmltYXRpb24nO1xudmFyIGFuaW1hdGlvbkVuZEV2ZW50ID0gJ2FuaW1hdGlvbmVuZCc7XG5pZiAoaGFzVHJhbnNpdGlvbikge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKHdpbmRvdy5vbnRyYW5zaXRpb25lbmQgPT09IHVuZGVmaW5lZCAmJlxuICAgIHdpbmRvdy5vbndlYmtpdHRyYW5zaXRpb25lbmQgIT09IHVuZGVmaW5lZCkge1xuICAgIHRyYW5zaXRpb25Qcm9wID0gJ1dlYmtpdFRyYW5zaXRpb24nO1xuICAgIHRyYW5zaXRpb25FbmRFdmVudCA9ICd3ZWJraXRUcmFuc2l0aW9uRW5kJztcbiAgfVxuICBpZiAod2luZG93Lm9uYW5pbWF0aW9uZW5kID09PSB1bmRlZmluZWQgJiZcbiAgICB3aW5kb3cub253ZWJraXRhbmltYXRpb25lbmQgIT09IHVuZGVmaW5lZCkge1xuICAgIGFuaW1hdGlvblByb3AgPSAnV2Via2l0QW5pbWF0aW9uJztcbiAgICBhbmltYXRpb25FbmRFdmVudCA9ICd3ZWJraXRBbmltYXRpb25FbmQnO1xuICB9XG59XG5cbnZhciByYWYgPSAoaW5Ccm93c2VyICYmIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHx8IHNldFRpbWVvdXQ7XG5mdW5jdGlvbiBuZXh0RnJhbWUgKGZuKSB7XG4gIHJhZihmdW5jdGlvbiAoKSB7XG4gICAgcmFmKGZuKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZFRyYW5zaXRpb25DbGFzcyAoZWwsIGNscykge1xuICAoZWwuX3RyYW5zaXRpb25DbGFzc2VzIHx8IChlbC5fdHJhbnNpdGlvbkNsYXNzZXMgPSBbXSkpLnB1c2goY2xzKTtcbiAgYWRkQ2xhc3MoZWwsIGNscyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVRyYW5zaXRpb25DbGFzcyAoZWwsIGNscykge1xuICBpZiAoZWwuX3RyYW5zaXRpb25DbGFzc2VzKSB7XG4gICAgcmVtb3ZlJDEoZWwuX3RyYW5zaXRpb25DbGFzc2VzLCBjbHMpO1xuICB9XG4gIHJlbW92ZUNsYXNzKGVsLCBjbHMpO1xufVxuXG5mdW5jdGlvbiB3aGVuVHJhbnNpdGlvbkVuZHMgKFxuICBlbCxcbiAgZXhwZWN0ZWRUeXBlLFxuICBjYlxuKSB7XG4gIHZhciByZWYgPSBnZXRUcmFuc2l0aW9uSW5mbyhlbCwgZXhwZWN0ZWRUeXBlKTtcbiAgdmFyIHR5cGUgPSByZWYudHlwZTtcbiAgdmFyIHRpbWVvdXQgPSByZWYudGltZW91dDtcbiAgdmFyIHByb3BDb3VudCA9IHJlZi5wcm9wQ291bnQ7XG4gIGlmICghdHlwZSkgeyByZXR1cm4gY2IoKSB9XG4gIHZhciBldmVudCA9IHR5cGUgPT09IFRSQU5TSVRJT04gPyB0cmFuc2l0aW9uRW5kRXZlbnQgOiBhbmltYXRpb25FbmRFdmVudDtcbiAgdmFyIGVuZGVkID0gMDtcbiAgdmFyIGVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBvbkVuZCk7XG4gICAgY2IoKTtcbiAgfTtcbiAgdmFyIG9uRW5kID0gZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZS50YXJnZXQgPT09IGVsKSB7XG4gICAgICBpZiAoKytlbmRlZCA+PSBwcm9wQ291bnQpIHtcbiAgICAgICAgZW5kKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoZW5kZWQgPCBwcm9wQ291bnQpIHtcbiAgICAgIGVuZCgpO1xuICAgIH1cbiAgfSwgdGltZW91dCArIDEpO1xuICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBvbkVuZCk7XG59XG5cbnZhciB0cmFuc2Zvcm1SRSA9IC9cXGIodHJhbnNmb3JtfGFsbCkoLHwkKS87XG5cbmZ1bmN0aW9uIGdldFRyYW5zaXRpb25JbmZvIChlbCwgZXhwZWN0ZWRUeXBlKSB7XG4gIHZhciBzdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XG4gIHZhciB0cmFuc2l0aW9uZURlbGF5cyA9IHN0eWxlc1t0cmFuc2l0aW9uUHJvcCArICdEZWxheSddLnNwbGl0KCcsICcpO1xuICB2YXIgdHJhbnNpdGlvbkR1cmF0aW9ucyA9IHN0eWxlc1t0cmFuc2l0aW9uUHJvcCArICdEdXJhdGlvbiddLnNwbGl0KCcsICcpO1xuICB2YXIgdHJhbnNpdGlvblRpbWVvdXQgPSBnZXRUaW1lb3V0KHRyYW5zaXRpb25lRGVsYXlzLCB0cmFuc2l0aW9uRHVyYXRpb25zKTtcbiAgdmFyIGFuaW1hdGlvbkRlbGF5cyA9IHN0eWxlc1thbmltYXRpb25Qcm9wICsgJ0RlbGF5J10uc3BsaXQoJywgJyk7XG4gIHZhciBhbmltYXRpb25EdXJhdGlvbnMgPSBzdHlsZXNbYW5pbWF0aW9uUHJvcCArICdEdXJhdGlvbiddLnNwbGl0KCcsICcpO1xuICB2YXIgYW5pbWF0aW9uVGltZW91dCA9IGdldFRpbWVvdXQoYW5pbWF0aW9uRGVsYXlzLCBhbmltYXRpb25EdXJhdGlvbnMpO1xuXG4gIHZhciB0eXBlO1xuICB2YXIgdGltZW91dCA9IDA7XG4gIHZhciBwcm9wQ291bnQgPSAwO1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKGV4cGVjdGVkVHlwZSA9PT0gVFJBTlNJVElPTikge1xuICAgIGlmICh0cmFuc2l0aW9uVGltZW91dCA+IDApIHtcbiAgICAgIHR5cGUgPSBUUkFOU0lUSU9OO1xuICAgICAgdGltZW91dCA9IHRyYW5zaXRpb25UaW1lb3V0O1xuICAgICAgcHJvcENvdW50ID0gdHJhbnNpdGlvbkR1cmF0aW9ucy5sZW5ndGg7XG4gICAgfVxuICB9IGVsc2UgaWYgKGV4cGVjdGVkVHlwZSA9PT0gQU5JTUFUSU9OKSB7XG4gICAgaWYgKGFuaW1hdGlvblRpbWVvdXQgPiAwKSB7XG4gICAgICB0eXBlID0gQU5JTUFUSU9OO1xuICAgICAgdGltZW91dCA9IGFuaW1hdGlvblRpbWVvdXQ7XG4gICAgICBwcm9wQ291bnQgPSBhbmltYXRpb25EdXJhdGlvbnMubGVuZ3RoO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aW1lb3V0ID0gTWF0aC5tYXgodHJhbnNpdGlvblRpbWVvdXQsIGFuaW1hdGlvblRpbWVvdXQpO1xuICAgIHR5cGUgPSB0aW1lb3V0ID4gMFxuICAgICAgPyB0cmFuc2l0aW9uVGltZW91dCA+IGFuaW1hdGlvblRpbWVvdXRcbiAgICAgICAgPyBUUkFOU0lUSU9OXG4gICAgICAgIDogQU5JTUFUSU9OXG4gICAgICA6IG51bGw7XG4gICAgcHJvcENvdW50ID0gdHlwZVxuICAgICAgPyB0eXBlID09PSBUUkFOU0lUSU9OXG4gICAgICAgID8gdHJhbnNpdGlvbkR1cmF0aW9ucy5sZW5ndGhcbiAgICAgICAgOiBhbmltYXRpb25EdXJhdGlvbnMubGVuZ3RoXG4gICAgICA6IDA7XG4gIH1cbiAgdmFyIGhhc1RyYW5zZm9ybSA9XG4gICAgdHlwZSA9PT0gVFJBTlNJVElPTiAmJlxuICAgIHRyYW5zZm9ybVJFLnRlc3Qoc3R5bGVzW3RyYW5zaXRpb25Qcm9wICsgJ1Byb3BlcnR5J10pO1xuICByZXR1cm4ge1xuICAgIHR5cGU6IHR5cGUsXG4gICAgdGltZW91dDogdGltZW91dCxcbiAgICBwcm9wQ291bnQ6IHByb3BDb3VudCxcbiAgICBoYXNUcmFuc2Zvcm06IGhhc1RyYW5zZm9ybVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldFRpbWVvdXQgKGRlbGF5cywgZHVyYXRpb25zKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHdoaWxlIChkZWxheXMubGVuZ3RoIDwgZHVyYXRpb25zLmxlbmd0aCkge1xuICAgIGRlbGF5cyA9IGRlbGF5cy5jb25jYXQoZGVsYXlzKTtcbiAgfVxuXG4gIHJldHVybiBNYXRoLm1heC5hcHBseShudWxsLCBkdXJhdGlvbnMubWFwKGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgcmV0dXJuIHRvTXMoZCkgKyB0b01zKGRlbGF5c1tpXSlcbiAgfSkpXG59XG5cbmZ1bmN0aW9uIHRvTXMgKHMpIHtcbiAgcmV0dXJuIE51bWJlcihzLnNsaWNlKDAsIC0xKSkgKiAxMDAwXG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBlbnRlciAodm5vZGUpIHtcbiAgdmFyIGVsID0gdm5vZGUuZWxtO1xuXG4gIC8vIGNhbGwgbGVhdmUgY2FsbGJhY2sgbm93XG4gIGlmIChlbC5fbGVhdmVDYikge1xuICAgIGVsLl9sZWF2ZUNiLmNhbmNlbGxlZCA9IHRydWU7XG4gICAgZWwuX2xlYXZlQ2IoKTtcbiAgfVxuXG4gIHZhciBkYXRhID0gcmVzb2x2ZVRyYW5zaXRpb24odm5vZGUuZGF0YS50cmFuc2l0aW9uKTtcbiAgaWYgKCFkYXRhKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKGVsLl9lbnRlckNiIHx8IGVsLm5vZGVUeXBlICE9PSAxKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgY3NzID0gZGF0YS5jc3M7XG4gIHZhciB0eXBlID0gZGF0YS50eXBlO1xuICB2YXIgZW50ZXJDbGFzcyA9IGRhdGEuZW50ZXJDbGFzcztcbiAgdmFyIGVudGVyQWN0aXZlQ2xhc3MgPSBkYXRhLmVudGVyQWN0aXZlQ2xhc3M7XG4gIHZhciBhcHBlYXJDbGFzcyA9IGRhdGEuYXBwZWFyQ2xhc3M7XG4gIHZhciBhcHBlYXJBY3RpdmVDbGFzcyA9IGRhdGEuYXBwZWFyQWN0aXZlQ2xhc3M7XG4gIHZhciBiZWZvcmVFbnRlciA9IGRhdGEuYmVmb3JlRW50ZXI7XG4gIHZhciBlbnRlciA9IGRhdGEuZW50ZXI7XG4gIHZhciBhZnRlckVudGVyID0gZGF0YS5hZnRlckVudGVyO1xuICB2YXIgZW50ZXJDYW5jZWxsZWQgPSBkYXRhLmVudGVyQ2FuY2VsbGVkO1xuICB2YXIgYmVmb3JlQXBwZWFyID0gZGF0YS5iZWZvcmVBcHBlYXI7XG4gIHZhciBhcHBlYXIgPSBkYXRhLmFwcGVhcjtcbiAgdmFyIGFmdGVyQXBwZWFyID0gZGF0YS5hZnRlckFwcGVhcjtcbiAgdmFyIGFwcGVhckNhbmNlbGxlZCA9IGRhdGEuYXBwZWFyQ2FuY2VsbGVkO1xuXG4gIC8vIGFjdGl2ZUluc3RhbmNlIHdpbGwgYWx3YXlzIGJlIHRoZSA8dHJhbnNpdGlvbj4gY29tcG9uZW50IG1hbmFnaW5nIHRoaXNcbiAgLy8gdHJhbnNpdGlvbi4gT25lIGVkZ2UgY2FzZSB0byBjaGVjayBpcyB3aGVuIHRoZSA8dHJhbnNpdGlvbj4gaXMgcGxhY2VkXG4gIC8vIGFzIHRoZSByb290IG5vZGUgb2YgYSBjaGlsZCBjb21wb25lbnQuIEluIHRoYXQgY2FzZSB3ZSBuZWVkIHRvIGNoZWNrXG4gIC8vIDx0cmFuc2l0aW9uPidzIHBhcmVudCBmb3IgYXBwZWFyIGNoZWNrLlxuICB2YXIgY29udGV4dCA9IGFjdGl2ZUluc3RhbmNlO1xuICB2YXIgdHJhbnNpdGlvbk5vZGUgPSBhY3RpdmVJbnN0YW5jZS4kdm5vZGU7XG4gIHdoaWxlICh0cmFuc2l0aW9uTm9kZSAmJiB0cmFuc2l0aW9uTm9kZS5wYXJlbnQpIHtcbiAgICB0cmFuc2l0aW9uTm9kZSA9IHRyYW5zaXRpb25Ob2RlLnBhcmVudDtcbiAgICBjb250ZXh0ID0gdHJhbnNpdGlvbk5vZGUuY29udGV4dDtcbiAgfVxuXG4gIHZhciBpc0FwcGVhciA9ICFjb250ZXh0Ll9pc01vdW50ZWQgfHwgIXZub2RlLmlzUm9vdEluc2VydDtcblxuICBpZiAoaXNBcHBlYXIgJiYgIWFwcGVhciAmJiBhcHBlYXIgIT09ICcnKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgc3RhcnRDbGFzcyA9IGlzQXBwZWFyID8gYXBwZWFyQ2xhc3MgOiBlbnRlckNsYXNzO1xuICB2YXIgYWN0aXZlQ2xhc3MgPSBpc0FwcGVhciA/IGFwcGVhckFjdGl2ZUNsYXNzIDogZW50ZXJBY3RpdmVDbGFzcztcbiAgdmFyIGJlZm9yZUVudGVySG9vayA9IGlzQXBwZWFyID8gKGJlZm9yZUFwcGVhciB8fCBiZWZvcmVFbnRlcikgOiBiZWZvcmVFbnRlcjtcbiAgdmFyIGVudGVySG9vayA9IGlzQXBwZWFyID8gKHR5cGVvZiBhcHBlYXIgPT09ICdmdW5jdGlvbicgPyBhcHBlYXIgOiBlbnRlcikgOiBlbnRlcjtcbiAgdmFyIGFmdGVyRW50ZXJIb29rID0gaXNBcHBlYXIgPyAoYWZ0ZXJBcHBlYXIgfHwgYWZ0ZXJFbnRlcikgOiBhZnRlckVudGVyO1xuICB2YXIgZW50ZXJDYW5jZWxsZWRIb29rID0gaXNBcHBlYXIgPyAoYXBwZWFyQ2FuY2VsbGVkIHx8IGVudGVyQ2FuY2VsbGVkKSA6IGVudGVyQ2FuY2VsbGVkO1xuXG4gIHZhciBleHBlY3RzQ1NTID0gY3NzICE9PSBmYWxzZSAmJiAhaXNJRTk7XG4gIHZhciB1c2VyV2FudHNDb250cm9sID1cbiAgICBlbnRlckhvb2sgJiZcbiAgICAvLyBlbnRlckhvb2sgbWF5IGJlIGEgYm91bmQgbWV0aG9kIHdoaWNoIGV4cG9zZXNcbiAgICAvLyB0aGUgbGVuZ3RoIG9mIG9yaWdpbmFsIGZuIGFzIF9sZW5ndGhcbiAgICAoZW50ZXJIb29rLl9sZW5ndGggfHwgZW50ZXJIb29rLmxlbmd0aCkgPiAxO1xuXG4gIHZhciBjYiA9IGVsLl9lbnRlckNiID0gb25jZShmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGV4cGVjdHNDU1MpIHtcbiAgICAgIHJlbW92ZVRyYW5zaXRpb25DbGFzcyhlbCwgYWN0aXZlQ2xhc3MpO1xuICAgIH1cbiAgICBpZiAoY2IuY2FuY2VsbGVkKSB7XG4gICAgICBpZiAoZXhwZWN0c0NTUykge1xuICAgICAgICByZW1vdmVUcmFuc2l0aW9uQ2xhc3MoZWwsIHN0YXJ0Q2xhc3MpO1xuICAgICAgfVxuICAgICAgZW50ZXJDYW5jZWxsZWRIb29rICYmIGVudGVyQ2FuY2VsbGVkSG9vayhlbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFmdGVyRW50ZXJIb29rICYmIGFmdGVyRW50ZXJIb29rKGVsKTtcbiAgICB9XG4gICAgZWwuX2VudGVyQ2IgPSBudWxsO1xuICB9KTtcblxuICBpZiAoIXZub2RlLmRhdGEuc2hvdykge1xuICAgIC8vIHJlbW92ZSBwZW5kaW5nIGxlYXZlIGVsZW1lbnQgb24gZW50ZXIgYnkgaW5qZWN0aW5nIGFuIGluc2VydCBob29rXG4gICAgbWVyZ2VWTm9kZUhvb2sodm5vZGUuZGF0YS5ob29rIHx8ICh2bm9kZS5kYXRhLmhvb2sgPSB7fSksICdpbnNlcnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgICAgIHZhciBwZW5kaW5nTm9kZSA9IHBhcmVudCAmJiBwYXJlbnQuX3BlbmRpbmcgJiYgcGFyZW50Ll9wZW5kaW5nW3Zub2RlLmtleV07XG4gICAgICBpZiAocGVuZGluZ05vZGUgJiZcbiAgICAgICAgICBwZW5kaW5nTm9kZS5jb250ZXh0ID09PSB2bm9kZS5jb250ZXh0ICYmXG4gICAgICAgICAgcGVuZGluZ05vZGUudGFnID09PSB2bm9kZS50YWcgJiZcbiAgICAgICAgICBwZW5kaW5nTm9kZS5lbG0uX2xlYXZlQ2IpIHtcbiAgICAgICAgcGVuZGluZ05vZGUuZWxtLl9sZWF2ZUNiKCk7XG4gICAgICB9XG4gICAgICBlbnRlckhvb2sgJiYgZW50ZXJIb29rKGVsLCBjYik7XG4gICAgfSwgJ3RyYW5zaXRpb24taW5zZXJ0Jyk7XG4gIH1cblxuICAvLyBzdGFydCBlbnRlciB0cmFuc2l0aW9uXG4gIGJlZm9yZUVudGVySG9vayAmJiBiZWZvcmVFbnRlckhvb2soZWwpO1xuICBpZiAoZXhwZWN0c0NTUykge1xuICAgIGFkZFRyYW5zaXRpb25DbGFzcyhlbCwgc3RhcnRDbGFzcyk7XG4gICAgYWRkVHJhbnNpdGlvbkNsYXNzKGVsLCBhY3RpdmVDbGFzcyk7XG4gICAgbmV4dEZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlbW92ZVRyYW5zaXRpb25DbGFzcyhlbCwgc3RhcnRDbGFzcyk7XG4gICAgICBpZiAoIWNiLmNhbmNlbGxlZCAmJiAhdXNlcldhbnRzQ29udHJvbCkge1xuICAgICAgICB3aGVuVHJhbnNpdGlvbkVuZHMoZWwsIHR5cGUsIGNiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGlmICh2bm9kZS5kYXRhLnNob3cpIHtcbiAgICBlbnRlckhvb2sgJiYgZW50ZXJIb29rKGVsLCBjYik7XG4gIH1cblxuICBpZiAoIWV4cGVjdHNDU1MgJiYgIXVzZXJXYW50c0NvbnRyb2wpIHtcbiAgICBjYigpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxlYXZlICh2bm9kZSwgcm0pIHtcbiAgdmFyIGVsID0gdm5vZGUuZWxtO1xuXG4gIC8vIGNhbGwgZW50ZXIgY2FsbGJhY2sgbm93XG4gIGlmIChlbC5fZW50ZXJDYikge1xuICAgIGVsLl9lbnRlckNiLmNhbmNlbGxlZCA9IHRydWU7XG4gICAgZWwuX2VudGVyQ2IoKTtcbiAgfVxuXG4gIHZhciBkYXRhID0gcmVzb2x2ZVRyYW5zaXRpb24odm5vZGUuZGF0YS50cmFuc2l0aW9uKTtcbiAgaWYgKCFkYXRhKSB7XG4gICAgcmV0dXJuIHJtKClcbiAgfVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoZWwuX2xlYXZlQ2IgfHwgZWwubm9kZVR5cGUgIT09IDEpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBjc3MgPSBkYXRhLmNzcztcbiAgdmFyIHR5cGUgPSBkYXRhLnR5cGU7XG4gIHZhciBsZWF2ZUNsYXNzID0gZGF0YS5sZWF2ZUNsYXNzO1xuICB2YXIgbGVhdmVBY3RpdmVDbGFzcyA9IGRhdGEubGVhdmVBY3RpdmVDbGFzcztcbiAgdmFyIGJlZm9yZUxlYXZlID0gZGF0YS5iZWZvcmVMZWF2ZTtcbiAgdmFyIGxlYXZlID0gZGF0YS5sZWF2ZTtcbiAgdmFyIGFmdGVyTGVhdmUgPSBkYXRhLmFmdGVyTGVhdmU7XG4gIHZhciBsZWF2ZUNhbmNlbGxlZCA9IGRhdGEubGVhdmVDYW5jZWxsZWQ7XG4gIHZhciBkZWxheUxlYXZlID0gZGF0YS5kZWxheUxlYXZlO1xuXG4gIHZhciBleHBlY3RzQ1NTID0gY3NzICE9PSBmYWxzZSAmJiAhaXNJRTk7XG4gIHZhciB1c2VyV2FudHNDb250cm9sID1cbiAgICBsZWF2ZSAmJlxuICAgIC8vIGxlYXZlIGhvb2sgbWF5IGJlIGEgYm91bmQgbWV0aG9kIHdoaWNoIGV4cG9zZXNcbiAgICAvLyB0aGUgbGVuZ3RoIG9mIG9yaWdpbmFsIGZuIGFzIF9sZW5ndGhcbiAgICAobGVhdmUuX2xlbmd0aCB8fCBsZWF2ZS5sZW5ndGgpID4gMTtcblxuICB2YXIgY2IgPSBlbC5fbGVhdmVDYiA9IG9uY2UoZnVuY3Rpb24gKCkge1xuICAgIGlmIChlbC5wYXJlbnROb2RlICYmIGVsLnBhcmVudE5vZGUuX3BlbmRpbmcpIHtcbiAgICAgIGVsLnBhcmVudE5vZGUuX3BlbmRpbmdbdm5vZGUua2V5XSA9IG51bGw7XG4gICAgfVxuICAgIGlmIChleHBlY3RzQ1NTKSB7XG4gICAgICByZW1vdmVUcmFuc2l0aW9uQ2xhc3MoZWwsIGxlYXZlQWN0aXZlQ2xhc3MpO1xuICAgIH1cbiAgICBpZiAoY2IuY2FuY2VsbGVkKSB7XG4gICAgICBpZiAoZXhwZWN0c0NTUykge1xuICAgICAgICByZW1vdmVUcmFuc2l0aW9uQ2xhc3MoZWwsIGxlYXZlQ2xhc3MpO1xuICAgICAgfVxuICAgICAgbGVhdmVDYW5jZWxsZWQgJiYgbGVhdmVDYW5jZWxsZWQoZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBybSgpO1xuICAgICAgYWZ0ZXJMZWF2ZSAmJiBhZnRlckxlYXZlKGVsKTtcbiAgICB9XG4gICAgZWwuX2xlYXZlQ2IgPSBudWxsO1xuICB9KTtcblxuICBpZiAoZGVsYXlMZWF2ZSkge1xuICAgIGRlbGF5TGVhdmUocGVyZm9ybUxlYXZlKTtcbiAgfSBlbHNlIHtcbiAgICBwZXJmb3JtTGVhdmUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBlcmZvcm1MZWF2ZSAoKSB7XG4gICAgLy8gdGhlIGRlbGF5ZWQgbGVhdmUgbWF5IGhhdmUgYWxyZWFkeSBiZWVuIGNhbmNlbGxlZFxuICAgIGlmIChjYi5jYW5jZWxsZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyByZWNvcmQgbGVhdmluZyBlbGVtZW50XG4gICAgaWYgKCF2bm9kZS5kYXRhLnNob3cpIHtcbiAgICAgIChlbC5wYXJlbnROb2RlLl9wZW5kaW5nIHx8IChlbC5wYXJlbnROb2RlLl9wZW5kaW5nID0ge30pKVt2bm9kZS5rZXldID0gdm5vZGU7XG4gICAgfVxuICAgIGJlZm9yZUxlYXZlICYmIGJlZm9yZUxlYXZlKGVsKTtcbiAgICBpZiAoZXhwZWN0c0NTUykge1xuICAgICAgYWRkVHJhbnNpdGlvbkNsYXNzKGVsLCBsZWF2ZUNsYXNzKTtcbiAgICAgIGFkZFRyYW5zaXRpb25DbGFzcyhlbCwgbGVhdmVBY3RpdmVDbGFzcyk7XG4gICAgICBuZXh0RnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgICByZW1vdmVUcmFuc2l0aW9uQ2xhc3MoZWwsIGxlYXZlQ2xhc3MpO1xuICAgICAgICBpZiAoIWNiLmNhbmNlbGxlZCAmJiAhdXNlcldhbnRzQ29udHJvbCkge1xuICAgICAgICAgIHdoZW5UcmFuc2l0aW9uRW5kcyhlbCwgdHlwZSwgY2IpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgbGVhdmUgJiYgbGVhdmUoZWwsIGNiKTtcbiAgICBpZiAoIWV4cGVjdHNDU1MgJiYgIXVzZXJXYW50c0NvbnRyb2wpIHtcbiAgICAgIGNiKCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVUcmFuc2l0aW9uIChkZWYkJDEpIHtcbiAgaWYgKCFkZWYkJDEpIHtcbiAgICByZXR1cm5cbiAgfVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAodHlwZW9mIGRlZiQkMSA9PT0gJ29iamVjdCcpIHtcbiAgICB2YXIgcmVzID0ge307XG4gICAgaWYgKGRlZiQkMS5jc3MgIT09IGZhbHNlKSB7XG4gICAgICBleHRlbmQocmVzLCBhdXRvQ3NzVHJhbnNpdGlvbihkZWYkJDEubmFtZSB8fCAndicpKTtcbiAgICB9XG4gICAgZXh0ZW5kKHJlcywgZGVmJCQxKTtcbiAgICByZXR1cm4gcmVzXG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZiQkMSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gYXV0b0Nzc1RyYW5zaXRpb24oZGVmJCQxKVxuICB9XG59XG5cbnZhciBhdXRvQ3NzVHJhbnNpdGlvbiA9IGNhY2hlZChmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4ge1xuICAgIGVudGVyQ2xhc3M6IChuYW1lICsgXCItZW50ZXJcIiksXG4gICAgbGVhdmVDbGFzczogKG5hbWUgKyBcIi1sZWF2ZVwiKSxcbiAgICBhcHBlYXJDbGFzczogKG5hbWUgKyBcIi1lbnRlclwiKSxcbiAgICBlbnRlckFjdGl2ZUNsYXNzOiAobmFtZSArIFwiLWVudGVyLWFjdGl2ZVwiKSxcbiAgICBsZWF2ZUFjdGl2ZUNsYXNzOiAobmFtZSArIFwiLWxlYXZlLWFjdGl2ZVwiKSxcbiAgICBhcHBlYXJBY3RpdmVDbGFzczogKG5hbWUgKyBcIi1lbnRlci1hY3RpdmVcIilcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIG9uY2UgKGZuKSB7XG4gIHZhciBjYWxsZWQgPSBmYWxzZTtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgIGZuKCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9lbnRlciAoXywgdm5vZGUpIHtcbiAgaWYgKCF2bm9kZS5kYXRhLnNob3cpIHtcbiAgICBlbnRlcih2bm9kZSk7XG4gIH1cbn1cblxudmFyIHRyYW5zaXRpb24gPSBpbkJyb3dzZXIgPyB7XG4gIGNyZWF0ZTogX2VudGVyLFxuICBhY3RpdmF0ZTogX2VudGVyLFxuICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSAodm5vZGUsIHJtKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAoIXZub2RlLmRhdGEuc2hvdykge1xuICAgICAgbGVhdmUodm5vZGUsIHJtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcm0oKTtcbiAgICB9XG4gIH1cbn0gOiB7fTtcblxudmFyIHBsYXRmb3JtTW9kdWxlcyA9IFtcbiAgYXR0cnMsXG4gIGtsYXNzLFxuICBldmVudHMsXG4gIGRvbVByb3BzLFxuICBzdHlsZSxcbiAgdHJhbnNpdGlvblxuXTtcblxuLyogICovXG5cbi8vIHRoZSBkaXJlY3RpdmUgbW9kdWxlIHNob3VsZCBiZSBhcHBsaWVkIGxhc3QsIGFmdGVyIGFsbFxuLy8gYnVpbHQtaW4gbW9kdWxlcyBoYXZlIGJlZW4gYXBwbGllZC5cbnZhciBtb2R1bGVzID0gcGxhdGZvcm1Nb2R1bGVzLmNvbmNhdChiYXNlTW9kdWxlcyk7XG5cbnZhciBwYXRjaCQxID0gY3JlYXRlUGF0Y2hGdW5jdGlvbih7IG5vZGVPcHM6IG5vZGVPcHMsIG1vZHVsZXM6IG1vZHVsZXMgfSk7XG5cbi8qKlxuICogTm90IHR5cGUgY2hlY2tpbmcgdGhpcyBmaWxlIGJlY2F1c2UgZmxvdyBkb2Vzbid0IGxpa2UgYXR0YWNoaW5nXG4gKiBwcm9wZXJ0aWVzIHRvIEVsZW1lbnRzLlxuICovXG5cbnZhciBtb2RlbGFibGVUYWdSRSA9IC9eaW5wdXR8c2VsZWN0fHRleHRhcmVhfHZ1ZS1jb21wb25lbnQtWzAtOV0rKC1bMC05YS16QS1aXy1dKik/JC87XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuaWYgKGlzSUU5KSB7XG4gIC8vIGh0dHA6Ly93d3cubWF0dHM0MTEuY29tL3Bvc3QvaW50ZXJuZXQtZXhwbG9yZXItOS1vbmlucHV0L1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3Rpb25jaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICBpZiAoZWwgJiYgZWwudm1vZGVsKSB7XG4gICAgICB0cmlnZ2VyKGVsLCAnaW5wdXQnKTtcbiAgICB9XG4gIH0pO1xufVxuXG52YXIgbW9kZWwgPSB7XG4gIGluc2VydGVkOiBmdW5jdGlvbiBpbnNlcnRlZCAoZWwsIGJpbmRpbmcsIHZub2RlKSB7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGlmICghbW9kZWxhYmxlVGFnUkUudGVzdCh2bm9kZS50YWcpKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgXCJ2LW1vZGVsIGlzIG5vdCBzdXBwb3J0ZWQgb24gZWxlbWVudCB0eXBlOiA8XCIgKyAodm5vZGUudGFnKSArIFwiPi4gXCIgK1xuICAgICAgICAgICdJZiB5b3UgYXJlIHdvcmtpbmcgd2l0aCBjb250ZW50ZWRpdGFibGUsIGl0XFwncyByZWNvbW1lbmRlZCB0byAnICtcbiAgICAgICAgICAnd3JhcCBhIGxpYnJhcnkgZGVkaWNhdGVkIGZvciB0aGF0IHB1cnBvc2UgaW5zaWRlIGEgY3VzdG9tIGNvbXBvbmVudC4nLFxuICAgICAgICAgIHZub2RlLmNvbnRleHRcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZub2RlLnRhZyA9PT0gJ3NlbGVjdCcpIHtcbiAgICAgIHZhciBjYiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0U2VsZWN0ZWQoZWwsIGJpbmRpbmcsIHZub2RlLmNvbnRleHQpO1xuICAgICAgfTtcbiAgICAgIGNiKCk7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmIChpc0lFIHx8IGlzRWRnZSkge1xuICAgICAgICBzZXRUaW1lb3V0KGNiLCAwKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFxuICAgICAgKHZub2RlLnRhZyA9PT0gJ3RleHRhcmVhJyB8fCBlbC50eXBlID09PSAndGV4dCcpICYmXG4gICAgICAhYmluZGluZy5tb2RpZmllcnMubGF6eVxuICAgICkge1xuICAgICAgaWYgKCFpc0FuZHJvaWQpIHtcbiAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY29tcG9zaXRpb25zdGFydCcsIG9uQ29tcG9zaXRpb25TdGFydCk7XG4gICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBvc2l0aW9uZW5kJywgb25Db21wb3NpdGlvbkVuZCk7XG4gICAgICB9XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmIChpc0lFOSkge1xuICAgICAgICBlbC52bW9kZWwgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgY29tcG9uZW50VXBkYXRlZDogZnVuY3Rpb24gY29tcG9uZW50VXBkYXRlZCAoZWwsIGJpbmRpbmcsIHZub2RlKSB7XG4gICAgaWYgKHZub2RlLnRhZyA9PT0gJ3NlbGVjdCcpIHtcbiAgICAgIHNldFNlbGVjdGVkKGVsLCBiaW5kaW5nLCB2bm9kZS5jb250ZXh0KTtcbiAgICAgIC8vIGluIGNhc2UgdGhlIG9wdGlvbnMgcmVuZGVyZWQgYnkgdi1mb3IgaGF2ZSBjaGFuZ2VkLFxuICAgICAgLy8gaXQncyBwb3NzaWJsZSB0aGF0IHRoZSB2YWx1ZSBpcyBvdXQtb2Ytc3luYyB3aXRoIHRoZSByZW5kZXJlZCBvcHRpb25zLlxuICAgICAgLy8gZGV0ZWN0IHN1Y2ggY2FzZXMgYW5kIGZpbHRlciBvdXQgdmFsdWVzIHRoYXQgbm8gbG9uZ2VyIGhhcyBhIG1hdGNoaW5nXG4gICAgICAvLyBvcHRpb24gaW4gdGhlIERPTS5cbiAgICAgIHZhciBuZWVkUmVzZXQgPSBlbC5tdWx0aXBsZVxuICAgICAgICA/IGJpbmRpbmcudmFsdWUuc29tZShmdW5jdGlvbiAodikgeyByZXR1cm4gaGFzTm9NYXRjaGluZ09wdGlvbih2LCBlbC5vcHRpb25zKTsgfSlcbiAgICAgICAgOiBiaW5kaW5nLnZhbHVlICE9PSBiaW5kaW5nLm9sZFZhbHVlICYmIGhhc05vTWF0Y2hpbmdPcHRpb24oYmluZGluZy52YWx1ZSwgZWwub3B0aW9ucyk7XG4gICAgICBpZiAobmVlZFJlc2V0KSB7XG4gICAgICAgIHRyaWdnZXIoZWwsICdjaGFuZ2UnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHNldFNlbGVjdGVkIChlbCwgYmluZGluZywgdm0pIHtcbiAgdmFyIHZhbHVlID0gYmluZGluZy52YWx1ZTtcbiAgdmFyIGlzTXVsdGlwbGUgPSBlbC5tdWx0aXBsZTtcbiAgaWYgKGlzTXVsdGlwbGUgJiYgIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKFxuICAgICAgXCI8c2VsZWN0IG11bHRpcGxlIHYtbW9kZWw9XFxcIlwiICsgKGJpbmRpbmcuZXhwcmVzc2lvbikgKyBcIlxcXCI+IFwiICtcbiAgICAgIFwiZXhwZWN0cyBhbiBBcnJheSB2YWx1ZSBmb3IgaXRzIGJpbmRpbmcsIGJ1dCBnb3QgXCIgKyAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKS5zbGljZSg4LCAtMSkpLFxuICAgICAgdm1cbiAgICApO1xuICAgIHJldHVyblxuICB9XG4gIHZhciBzZWxlY3RlZCwgb3B0aW9uO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IGVsLm9wdGlvbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgb3B0aW9uID0gZWwub3B0aW9uc1tpXTtcbiAgICBpZiAoaXNNdWx0aXBsZSkge1xuICAgICAgc2VsZWN0ZWQgPSBsb29zZUluZGV4T2YodmFsdWUsIGdldFZhbHVlKG9wdGlvbikpID4gLTE7XG4gICAgICBpZiAob3B0aW9uLnNlbGVjdGVkICE9PSBzZWxlY3RlZCkge1xuICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSBzZWxlY3RlZDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGxvb3NlRXF1YWwoZ2V0VmFsdWUob3B0aW9uKSwgdmFsdWUpKSB7XG4gICAgICAgIGlmIChlbC5zZWxlY3RlZEluZGV4ICE9PSBpKSB7XG4gICAgICAgICAgZWwuc2VsZWN0ZWRJbmRleCA9IGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmICghaXNNdWx0aXBsZSkge1xuICAgIGVsLnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYXNOb01hdGNoaW5nT3B0aW9uICh2YWx1ZSwgb3B0aW9ucykge1xuICBmb3IgKHZhciBpID0gMCwgbCA9IG9wdGlvbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgaWYgKGxvb3NlRXF1YWwoZ2V0VmFsdWUob3B0aW9uc1tpXSksIHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlIChvcHRpb24pIHtcbiAgcmV0dXJuICdfdmFsdWUnIGluIG9wdGlvblxuICAgID8gb3B0aW9uLl92YWx1ZVxuICAgIDogb3B0aW9uLnZhbHVlXG59XG5cbmZ1bmN0aW9uIG9uQ29tcG9zaXRpb25TdGFydCAoZSkge1xuICBlLnRhcmdldC5jb21wb3NpbmcgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBvbkNvbXBvc2l0aW9uRW5kIChlKSB7XG4gIGUudGFyZ2V0LmNvbXBvc2luZyA9IGZhbHNlO1xuICB0cmlnZ2VyKGUudGFyZ2V0LCAnaW5wdXQnKTtcbn1cblxuZnVuY3Rpb24gdHJpZ2dlciAoZWwsIHR5cGUpIHtcbiAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnSFRNTEV2ZW50cycpO1xuICBlLmluaXRFdmVudCh0eXBlLCB0cnVlLCB0cnVlKTtcbiAgZWwuZGlzcGF0Y2hFdmVudChlKTtcbn1cblxuLyogICovXG5cbi8vIHJlY3Vyc2l2ZWx5IHNlYXJjaCBmb3IgcG9zc2libGUgdHJhbnNpdGlvbiBkZWZpbmVkIGluc2lkZSB0aGUgY29tcG9uZW50IHJvb3RcbmZ1bmN0aW9uIGxvY2F0ZU5vZGUgKHZub2RlKSB7XG4gIHJldHVybiB2bm9kZS5jaGlsZCAmJiAoIXZub2RlLmRhdGEgfHwgIXZub2RlLmRhdGEudHJhbnNpdGlvbilcbiAgICA/IGxvY2F0ZU5vZGUodm5vZGUuY2hpbGQuX3Zub2RlKVxuICAgIDogdm5vZGVcbn1cblxudmFyIHNob3cgPSB7XG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQgKGVsLCByZWYsIHZub2RlKSB7XG4gICAgdmFyIHZhbHVlID0gcmVmLnZhbHVlO1xuXG4gICAgdm5vZGUgPSBsb2NhdGVOb2RlKHZub2RlKTtcbiAgICB2YXIgdHJhbnNpdGlvbiA9IHZub2RlLmRhdGEgJiYgdm5vZGUuZGF0YS50cmFuc2l0aW9uO1xuICAgIGlmICh2YWx1ZSAmJiB0cmFuc2l0aW9uICYmICFpc0lFOSkge1xuICAgICAgZW50ZXIodm5vZGUpO1xuICAgIH1cbiAgICB2YXIgb3JpZ2luYWxEaXNwbGF5ID0gZWwuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnID8gJycgOiBlbC5zdHlsZS5kaXNwbGF5O1xuICAgIGVsLnN0eWxlLmRpc3BsYXkgPSB2YWx1ZSA/IG9yaWdpbmFsRGlzcGxheSA6ICdub25lJztcbiAgICBlbC5fX3ZPcmlnaW5hbERpc3BsYXkgPSBvcmlnaW5hbERpc3BsYXk7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlIChlbCwgcmVmLCB2bm9kZSkge1xuICAgIHZhciB2YWx1ZSA9IHJlZi52YWx1ZTtcbiAgICB2YXIgb2xkVmFsdWUgPSByZWYub2xkVmFsdWU7XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAodmFsdWUgPT09IG9sZFZhbHVlKSB7IHJldHVybiB9XG4gICAgdm5vZGUgPSBsb2NhdGVOb2RlKHZub2RlKTtcbiAgICB2YXIgdHJhbnNpdGlvbiA9IHZub2RlLmRhdGEgJiYgdm5vZGUuZGF0YS50cmFuc2l0aW9uO1xuICAgIGlmICh0cmFuc2l0aW9uICYmICFpc0lFOSkge1xuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIGVudGVyKHZub2RlKTtcbiAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IGVsLl9fdk9yaWdpbmFsRGlzcGxheTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxlYXZlKHZub2RlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSB2YWx1ZSA/IGVsLl9fdk9yaWdpbmFsRGlzcGxheSA6ICdub25lJztcbiAgICB9XG4gIH1cbn07XG5cbnZhciBwbGF0Zm9ybURpcmVjdGl2ZXMgPSB7XG4gIG1vZGVsOiBtb2RlbCxcbiAgc2hvdzogc2hvd1xufTtcblxuLyogICovXG5cbi8vIFByb3ZpZGVzIHRyYW5zaXRpb24gc3VwcG9ydCBmb3IgYSBzaW5nbGUgZWxlbWVudC9jb21wb25lbnQuXG4vLyBzdXBwb3J0cyB0cmFuc2l0aW9uIG1vZGUgKG91dC1pbiAvIGluLW91dClcblxudmFyIHRyYW5zaXRpb25Qcm9wcyA9IHtcbiAgbmFtZTogU3RyaW5nLFxuICBhcHBlYXI6IEJvb2xlYW4sXG4gIGNzczogQm9vbGVhbixcbiAgbW9kZTogU3RyaW5nLFxuICB0eXBlOiBTdHJpbmcsXG4gIGVudGVyQ2xhc3M6IFN0cmluZyxcbiAgbGVhdmVDbGFzczogU3RyaW5nLFxuICBlbnRlckFjdGl2ZUNsYXNzOiBTdHJpbmcsXG4gIGxlYXZlQWN0aXZlQ2xhc3M6IFN0cmluZyxcbiAgYXBwZWFyQ2xhc3M6IFN0cmluZyxcbiAgYXBwZWFyQWN0aXZlQ2xhc3M6IFN0cmluZ1xufTtcblxuLy8gaW4gY2FzZSB0aGUgY2hpbGQgaXMgYWxzbyBhbiBhYnN0cmFjdCBjb21wb25lbnQsIGUuZy4gPGtlZXAtYWxpdmU+XG4vLyB3ZSB3YW50IHRvIHJlY3Vyc2l2ZWx5IHJldHJpZXZlIHRoZSByZWFsIGNvbXBvbmVudCB0byBiZSByZW5kZXJlZFxuZnVuY3Rpb24gZ2V0UmVhbENoaWxkICh2bm9kZSkge1xuICB2YXIgY29tcE9wdGlvbnMgPSB2bm9kZSAmJiB2bm9kZS5jb21wb25lbnRPcHRpb25zO1xuICBpZiAoY29tcE9wdGlvbnMgJiYgY29tcE9wdGlvbnMuQ3Rvci5vcHRpb25zLmFic3RyYWN0KSB7XG4gICAgcmV0dXJuIGdldFJlYWxDaGlsZChnZXRGaXJzdENvbXBvbmVudENoaWxkKGNvbXBPcHRpb25zLmNoaWxkcmVuKSlcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdm5vZGVcbiAgfVxufVxuXG5mdW5jdGlvbiBleHRyYWN0VHJhbnNpdGlvbkRhdGEgKGNvbXApIHtcbiAgdmFyIGRhdGEgPSB7fTtcbiAgdmFyIG9wdGlvbnMgPSBjb21wLiRvcHRpb25zO1xuICAvLyBwcm9wc1xuICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucy5wcm9wc0RhdGEpIHtcbiAgICBkYXRhW2tleV0gPSBjb21wW2tleV07XG4gIH1cbiAgLy8gZXZlbnRzLlxuICAvLyBleHRyYWN0IGxpc3RlbmVycyBhbmQgcGFzcyB0aGVtIGRpcmVjdGx5IHRvIHRoZSB0cmFuc2l0aW9uIG1ldGhvZHNcbiAgdmFyIGxpc3RlbmVycyA9IG9wdGlvbnMuX3BhcmVudExpc3RlbmVycztcbiAgZm9yICh2YXIga2V5JDEgaW4gbGlzdGVuZXJzKSB7XG4gICAgZGF0YVtjYW1lbGl6ZShrZXkkMSldID0gbGlzdGVuZXJzW2tleSQxXS5mbjtcbiAgfVxuICByZXR1cm4gZGF0YVxufVxuXG5mdW5jdGlvbiBwbGFjZWhvbGRlciAoaCwgcmF3Q2hpbGQpIHtcbiAgcmV0dXJuIC9cXGQta2VlcC1hbGl2ZSQvLnRlc3QocmF3Q2hpbGQudGFnKVxuICAgID8gaCgna2VlcC1hbGl2ZScpXG4gICAgOiBudWxsXG59XG5cbmZ1bmN0aW9uIGhhc1BhcmVudFRyYW5zaXRpb24gKHZub2RlKSB7XG4gIHdoaWxlICgodm5vZGUgPSB2bm9kZS5wYXJlbnQpKSB7XG4gICAgaWYgKHZub2RlLmRhdGEudHJhbnNpdGlvbikge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbn1cblxudmFyIFRyYW5zaXRpb24gPSB7XG4gIG5hbWU6ICd0cmFuc2l0aW9uJyxcbiAgcHJvcHM6IHRyYW5zaXRpb25Qcm9wcyxcbiAgYWJzdHJhY3Q6IHRydWUsXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyIChoKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLiRzbG90cy5kZWZhdWx0O1xuICAgIGlmICghY2hpbGRyZW4pIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGZpbHRlciBvdXQgdGV4dCBub2RlcyAocG9zc2libGUgd2hpdGVzcGFjZXMpXG4gICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoZnVuY3Rpb24gKGMpIHsgcmV0dXJuIGMudGFnOyB9KTtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIWNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gd2FybiBtdWx0aXBsZSBlbGVtZW50c1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIGNoaWxkcmVuLmxlbmd0aCA+IDEpIHtcbiAgICAgIHdhcm4oXG4gICAgICAgICc8dHJhbnNpdGlvbj4gY2FuIG9ubHkgYmUgdXNlZCBvbiBhIHNpbmdsZSBlbGVtZW50LiBVc2UgJyArXG4gICAgICAgICc8dHJhbnNpdGlvbi1ncm91cD4gZm9yIGxpc3RzLicsXG4gICAgICAgIHRoaXMuJHBhcmVudFxuICAgICAgKTtcbiAgICB9XG5cbiAgICB2YXIgbW9kZSA9IHRoaXMubW9kZTtcblxuICAgIC8vIHdhcm4gaW52YWxpZCBtb2RlXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiZcbiAgICAgICAgbW9kZSAmJiBtb2RlICE9PSAnaW4tb3V0JyAmJiBtb2RlICE9PSAnb3V0LWluJykge1xuICAgICAgd2FybihcbiAgICAgICAgJ2ludmFsaWQgPHRyYW5zaXRpb24+IG1vZGU6ICcgKyBtb2RlLFxuICAgICAgICB0aGlzLiRwYXJlbnRcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdmFyIHJhd0NoaWxkID0gY2hpbGRyZW5bMF07XG5cbiAgICAvLyBpZiB0aGlzIGlzIGEgY29tcG9uZW50IHJvb3Qgbm9kZSBhbmQgdGhlIGNvbXBvbmVudCdzXG4gICAgLy8gcGFyZW50IGNvbnRhaW5lciBub2RlIGFsc28gaGFzIHRyYW5zaXRpb24sIHNraXAuXG4gICAgaWYgKGhhc1BhcmVudFRyYW5zaXRpb24odGhpcy4kdm5vZGUpKSB7XG4gICAgICByZXR1cm4gcmF3Q2hpbGRcbiAgICB9XG5cbiAgICAvLyBhcHBseSB0cmFuc2l0aW9uIGRhdGEgdG8gY2hpbGRcbiAgICAvLyB1c2UgZ2V0UmVhbENoaWxkKCkgdG8gaWdub3JlIGFic3RyYWN0IGNvbXBvbmVudHMgZS5nLiBrZWVwLWFsaXZlXG4gICAgdmFyIGNoaWxkID0gZ2V0UmVhbENoaWxkKHJhd0NoaWxkKTtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIWNoaWxkKSB7XG4gICAgICByZXR1cm4gcmF3Q2hpbGRcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbGVhdmluZykge1xuICAgICAgcmV0dXJuIHBsYWNlaG9sZGVyKGgsIHJhd0NoaWxkKVxuICAgIH1cblxuICAgIHZhciBrZXkgPSBjaGlsZC5rZXkgPSBjaGlsZC5rZXkgPT0gbnVsbCB8fCBjaGlsZC5pc1N0YXRpY1xuICAgICAgPyAoXCJfX3ZcIiArIChjaGlsZC50YWcgKyB0aGlzLl91aWQpICsgXCJfX1wiKVxuICAgICAgOiBjaGlsZC5rZXk7XG4gICAgdmFyIGRhdGEgPSAoY2hpbGQuZGF0YSB8fCAoY2hpbGQuZGF0YSA9IHt9KSkudHJhbnNpdGlvbiA9IGV4dHJhY3RUcmFuc2l0aW9uRGF0YSh0aGlzKTtcbiAgICB2YXIgb2xkUmF3Q2hpbGQgPSB0aGlzLl92bm9kZTtcbiAgICB2YXIgb2xkQ2hpbGQgPSBnZXRSZWFsQ2hpbGQob2xkUmF3Q2hpbGQpO1xuXG4gICAgLy8gbWFyayB2LXNob3dcbiAgICAvLyBzbyB0aGF0IHRoZSB0cmFuc2l0aW9uIG1vZHVsZSBjYW4gaGFuZCBvdmVyIHRoZSBjb250cm9sIHRvIHRoZSBkaXJlY3RpdmVcbiAgICBpZiAoY2hpbGQuZGF0YS5kaXJlY3RpdmVzICYmIGNoaWxkLmRhdGEuZGlyZWN0aXZlcy5zb21lKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLm5hbWUgPT09ICdzaG93JzsgfSkpIHtcbiAgICAgIGNoaWxkLmRhdGEuc2hvdyA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9sZENoaWxkICYmIG9sZENoaWxkLmRhdGEgJiYgb2xkQ2hpbGQua2V5ICE9PSBrZXkpIHtcbiAgICAgIC8vIHJlcGxhY2Ugb2xkIGNoaWxkIHRyYW5zaXRpb24gZGF0YSB3aXRoIGZyZXNoIG9uZVxuICAgICAgLy8gaW1wb3J0YW50IGZvciBkeW5hbWljIHRyYW5zaXRpb25zIVxuICAgICAgdmFyIG9sZERhdGEgPSBvbGRDaGlsZC5kYXRhLnRyYW5zaXRpb24gPSBleHRlbmQoe30sIGRhdGEpO1xuXG4gICAgICAvLyBoYW5kbGUgdHJhbnNpdGlvbiBtb2RlXG4gICAgICBpZiAobW9kZSA9PT0gJ291dC1pbicpIHtcbiAgICAgICAgLy8gcmV0dXJuIHBsYWNlaG9sZGVyIG5vZGUgYW5kIHF1ZXVlIHVwZGF0ZSB3aGVuIGxlYXZlIGZpbmlzaGVzXG4gICAgICAgIHRoaXMuX2xlYXZpbmcgPSB0cnVlO1xuICAgICAgICBtZXJnZVZOb2RlSG9vayhvbGREYXRhLCAnYWZ0ZXJMZWF2ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzJDEuX2xlYXZpbmcgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzJDEuJGZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH0sIGtleSk7XG4gICAgICAgIHJldHVybiBwbGFjZWhvbGRlcihoLCByYXdDaGlsZClcbiAgICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gJ2luLW91dCcpIHtcbiAgICAgICAgdmFyIGRlbGF5ZWRMZWF2ZTtcbiAgICAgICAgdmFyIHBlcmZvcm1MZWF2ZSA9IGZ1bmN0aW9uICgpIHsgZGVsYXllZExlYXZlKCk7IH07XG4gICAgICAgIG1lcmdlVk5vZGVIb29rKGRhdGEsICdhZnRlckVudGVyJywgcGVyZm9ybUxlYXZlLCBrZXkpO1xuICAgICAgICBtZXJnZVZOb2RlSG9vayhkYXRhLCAnZW50ZXJDYW5jZWxsZWQnLCBwZXJmb3JtTGVhdmUsIGtleSk7XG4gICAgICAgIG1lcmdlVk5vZGVIb29rKG9sZERhdGEsICdkZWxheUxlYXZlJywgZnVuY3Rpb24gKGxlYXZlKSB7XG4gICAgICAgICAgZGVsYXllZExlYXZlID0gbGVhdmU7XG4gICAgICAgIH0sIGtleSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhd0NoaWxkXG4gIH1cbn07XG5cbi8qICAqL1xuXG4vLyBQcm92aWRlcyB0cmFuc2l0aW9uIHN1cHBvcnQgZm9yIGxpc3QgaXRlbXMuXG4vLyBzdXBwb3J0cyBtb3ZlIHRyYW5zaXRpb25zIHVzaW5nIHRoZSBGTElQIHRlY2huaXF1ZS5cblxuLy8gQmVjYXVzZSB0aGUgdmRvbSdzIGNoaWxkcmVuIHVwZGF0ZSBhbGdvcml0aG0gaXMgXCJ1bnN0YWJsZVwiIC0gaS5lLlxuLy8gaXQgZG9lc24ndCBndWFyYW50ZWUgdGhlIHJlbGF0aXZlIHBvc2l0aW9uaW5nIG9mIHJlbW92ZWQgZWxlbWVudHMsXG4vLyB3ZSBmb3JjZSB0cmFuc2l0aW9uLWdyb3VwIHRvIHVwZGF0ZSBpdHMgY2hpbGRyZW4gaW50byB0d28gcGFzc2VzOlxuLy8gaW4gdGhlIGZpcnN0IHBhc3MsIHdlIHJlbW92ZSBhbGwgbm9kZXMgdGhhdCBuZWVkIHRvIGJlIHJlbW92ZWQsXG4vLyB0cmlnZ2VyaW5nIHRoZWlyIGxlYXZpbmcgdHJhbnNpdGlvbjsgaW4gdGhlIHNlY29uZCBwYXNzLCB3ZSBpbnNlcnQvbW92ZVxuLy8gaW50byB0aGUgZmluYWwgZGlzaXJlZCBzdGF0ZS4gVGhpcyB3YXkgaW4gdGhlIHNlY29uZCBwYXNzIHJlbW92ZWRcbi8vIG5vZGVzIHdpbGwgcmVtYWluIHdoZXJlIHRoZXkgc2hvdWxkIGJlLlxuXG52YXIgcHJvcHMgPSBleHRlbmQoe1xuICB0YWc6IFN0cmluZyxcbiAgbW92ZUNsYXNzOiBTdHJpbmdcbn0sIHRyYW5zaXRpb25Qcm9wcyk7XG5cbmRlbGV0ZSBwcm9wcy5tb2RlO1xuXG52YXIgVHJhbnNpdGlvbkdyb3VwID0ge1xuICBwcm9wczogcHJvcHMsXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIgKGgpIHtcbiAgICB2YXIgdGFnID0gdGhpcy50YWcgfHwgdGhpcy4kdm5vZGUuZGF0YS50YWcgfHwgJ3NwYW4nO1xuICAgIHZhciBtYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHZhciBwcmV2Q2hpbGRyZW4gPSB0aGlzLnByZXZDaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW47XG4gICAgdmFyIHJhd0NoaWxkcmVuID0gdGhpcy4kc2xvdHMuZGVmYXVsdCB8fCBbXTtcbiAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuID0gW107XG4gICAgdmFyIHRyYW5zaXRpb25EYXRhID0gZXh0cmFjdFRyYW5zaXRpb25EYXRhKHRoaXMpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYXdDaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGMgPSByYXdDaGlsZHJlbltpXTtcbiAgICAgIGlmIChjLnRhZykge1xuICAgICAgICBpZiAoYy5rZXkgIT0gbnVsbCAmJiBTdHJpbmcoYy5rZXkpLmluZGV4T2YoJ19fdmxpc3QnKSAhPT0gMCkge1xuICAgICAgICAgIGNoaWxkcmVuLnB1c2goYyk7XG4gICAgICAgICAgbWFwW2Mua2V5XSA9IGNcbiAgICAgICAgICA7KGMuZGF0YSB8fCAoYy5kYXRhID0ge30pKS50cmFuc2l0aW9uID0gdHJhbnNpdGlvbkRhdGE7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgIHZhciBvcHRzID0gYy5jb21wb25lbnRPcHRpb25zO1xuICAgICAgICAgIHZhciBuYW1lID0gb3B0c1xuICAgICAgICAgICAgPyAob3B0cy5DdG9yLm9wdGlvbnMubmFtZSB8fCBvcHRzLnRhZylcbiAgICAgICAgICAgIDogYy50YWc7XG4gICAgICAgICAgd2FybigoXCI8dHJhbnNpdGlvbi1ncm91cD4gY2hpbGRyZW4gbXVzdCBiZSBrZXllZDogPFwiICsgbmFtZSArIFwiPlwiKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJldkNoaWxkcmVuKSB7XG4gICAgICB2YXIga2VwdCA9IFtdO1xuICAgICAgdmFyIHJlbW92ZWQgPSBbXTtcbiAgICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IHByZXZDaGlsZHJlbi5sZW5ndGg7IGkkMSsrKSB7XG4gICAgICAgIHZhciBjJDEgPSBwcmV2Q2hpbGRyZW5baSQxXTtcbiAgICAgICAgYyQxLmRhdGEudHJhbnNpdGlvbiA9IHRyYW5zaXRpb25EYXRhO1xuICAgICAgICBjJDEuZGF0YS5wb3MgPSBjJDEuZWxtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBpZiAobWFwW2MkMS5rZXldKSB7XG4gICAgICAgICAga2VwdC5wdXNoKGMkMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVtb3ZlZC5wdXNoKGMkMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMua2VwdCA9IGgodGFnLCBudWxsLCBrZXB0KTtcbiAgICAgIHRoaXMucmVtb3ZlZCA9IHJlbW92ZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGgodGFnLCBudWxsLCBjaGlsZHJlbilcbiAgfSxcblxuICBiZWZvcmVVcGRhdGU6IGZ1bmN0aW9uIGJlZm9yZVVwZGF0ZSAoKSB7XG4gICAgLy8gZm9yY2UgcmVtb3ZpbmcgcGFzc1xuICAgIHRoaXMuX19wYXRjaF9fKFxuICAgICAgdGhpcy5fdm5vZGUsXG4gICAgICB0aGlzLmtlcHQsXG4gICAgICBmYWxzZSwgLy8gaHlkcmF0aW5nXG4gICAgICB0cnVlIC8vIHJlbW92ZU9ubHkgKCFpbXBvcnRhbnQsIGF2b2lkcyB1bm5lY2Vzc2FyeSBtb3ZlcylcbiAgICApO1xuICAgIHRoaXMuX3Zub2RlID0gdGhpcy5rZXB0O1xuICB9LFxuXG4gIHVwZGF0ZWQ6IGZ1bmN0aW9uIHVwZGF0ZWQgKCkge1xuICAgIHZhciBjaGlsZHJlbiA9IHRoaXMucHJldkNoaWxkcmVuO1xuICAgIHZhciBtb3ZlQ2xhc3MgPSB0aGlzLm1vdmVDbGFzcyB8fCAoKHRoaXMubmFtZSB8fCAndicpICsgJy1tb3ZlJyk7XG4gICAgaWYgKCFjaGlsZHJlbi5sZW5ndGggfHwgIXRoaXMuaGFzTW92ZShjaGlsZHJlblswXS5lbG0sIG1vdmVDbGFzcykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIHdlIGRpdmlkZSB0aGUgd29yayBpbnRvIHRocmVlIGxvb3BzIHRvIGF2b2lkIG1peGluZyBET00gcmVhZHMgYW5kIHdyaXRlc1xuICAgIC8vIGluIGVhY2ggaXRlcmF0aW9uIC0gd2hpY2ggaGVscHMgcHJldmVudCBsYXlvdXQgdGhyYXNoaW5nLlxuICAgIGNoaWxkcmVuLmZvckVhY2goY2FsbFBlbmRpbmdDYnMpO1xuICAgIGNoaWxkcmVuLmZvckVhY2gocmVjb3JkUG9zaXRpb24pO1xuICAgIGNoaWxkcmVuLmZvckVhY2goYXBwbHlUcmFuc2xhdGlvbik7XG5cbiAgICAvLyBmb3JjZSByZWZsb3cgdG8gcHV0IGV2ZXJ5dGhpbmcgaW4gcG9zaXRpb25cbiAgICB2YXIgZiA9IGRvY3VtZW50LmJvZHkub2Zmc2V0SGVpZ2h0OyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cbiAgICBjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XG4gICAgICBpZiAoYy5kYXRhLm1vdmVkKSB7XG4gICAgICAgIHZhciBlbCA9IGMuZWxtO1xuICAgICAgICB2YXIgcyA9IGVsLnN0eWxlO1xuICAgICAgICBhZGRUcmFuc2l0aW9uQ2xhc3MoZWwsIG1vdmVDbGFzcyk7XG4gICAgICAgIHMudHJhbnNmb3JtID0gcy5XZWJraXRUcmFuc2Zvcm0gPSBzLnRyYW5zaXRpb25EdXJhdGlvbiA9ICcnO1xuICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKHRyYW5zaXRpb25FbmRFdmVudCwgZWwuX21vdmVDYiA9IGZ1bmN0aW9uIGNiIChlKSB7XG4gICAgICAgICAgaWYgKCFlIHx8IC90cmFuc2Zvcm0kLy50ZXN0KGUucHJvcGVydHlOYW1lKSkge1xuICAgICAgICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0cmFuc2l0aW9uRW5kRXZlbnQsIGNiKTtcbiAgICAgICAgICAgIGVsLl9tb3ZlQ2IgPSBudWxsO1xuICAgICAgICAgICAgcmVtb3ZlVHJhbnNpdGlvbkNsYXNzKGVsLCBtb3ZlQ2xhc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGhhc01vdmU6IGZ1bmN0aW9uIGhhc01vdmUgKGVsLCBtb3ZlQ2xhc3MpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKCFoYXNUcmFuc2l0aW9uKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2hhc01vdmUgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faGFzTW92ZVxuICAgICAgfVxuICAgICAgYWRkVHJhbnNpdGlvbkNsYXNzKGVsLCBtb3ZlQ2xhc3MpO1xuICAgICAgdmFyIGluZm8gPSBnZXRUcmFuc2l0aW9uSW5mbyhlbCk7XG4gICAgICByZW1vdmVUcmFuc2l0aW9uQ2xhc3MoZWwsIG1vdmVDbGFzcyk7XG4gICAgICByZXR1cm4gKHRoaXMuX2hhc01vdmUgPSBpbmZvLmhhc1RyYW5zZm9ybSlcbiAgICB9XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNhbGxQZW5kaW5nQ2JzIChjKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoYy5lbG0uX21vdmVDYikge1xuICAgIGMuZWxtLl9tb3ZlQ2IoKTtcbiAgfVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKGMuZWxtLl9lbnRlckNiKSB7XG4gICAgYy5lbG0uX2VudGVyQ2IoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWNvcmRQb3NpdGlvbiAoYykge1xuICBjLmRhdGEubmV3UG9zID0gYy5lbG0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5VHJhbnNsYXRpb24gKGMpIHtcbiAgdmFyIG9sZFBvcyA9IGMuZGF0YS5wb3M7XG4gIHZhciBuZXdQb3MgPSBjLmRhdGEubmV3UG9zO1xuICB2YXIgZHggPSBvbGRQb3MubGVmdCAtIG5ld1Bvcy5sZWZ0O1xuICB2YXIgZHkgPSBvbGRQb3MudG9wIC0gbmV3UG9zLnRvcDtcbiAgaWYgKGR4IHx8IGR5KSB7XG4gICAgYy5kYXRhLm1vdmVkID0gdHJ1ZTtcbiAgICB2YXIgcyA9IGMuZWxtLnN0eWxlO1xuICAgIHMudHJhbnNmb3JtID0gcy5XZWJraXRUcmFuc2Zvcm0gPSBcInRyYW5zbGF0ZShcIiArIGR4ICsgXCJweCxcIiArIGR5ICsgXCJweClcIjtcbiAgICBzLnRyYW5zaXRpb25EdXJhdGlvbiA9ICcwcyc7XG4gIH1cbn1cblxudmFyIHBsYXRmb3JtQ29tcG9uZW50cyA9IHtcbiAgVHJhbnNpdGlvbjogVHJhbnNpdGlvbixcbiAgVHJhbnNpdGlvbkdyb3VwOiBUcmFuc2l0aW9uR3JvdXBcbn07XG5cbi8qICAqL1xuXG4vLyBpbnN0YWxsIHBsYXRmb3JtIHNwZWNpZmljIHV0aWxzXG5WdWUkMi5jb25maWcuaXNVbmtub3duRWxlbWVudCA9IGlzVW5rbm93bkVsZW1lbnQ7XG5WdWUkMi5jb25maWcuaXNSZXNlcnZlZFRhZyA9IGlzUmVzZXJ2ZWRUYWc7XG5WdWUkMi5jb25maWcuZ2V0VGFnTmFtZXNwYWNlID0gZ2V0VGFnTmFtZXNwYWNlO1xuVnVlJDIuY29uZmlnLm11c3RVc2VQcm9wID0gbXVzdFVzZVByb3A7XG5cbi8vIGluc3RhbGwgcGxhdGZvcm0gcnVudGltZSBkaXJlY3RpdmVzICYgY29tcG9uZW50c1xuZXh0ZW5kKFZ1ZSQyLm9wdGlvbnMuZGlyZWN0aXZlcywgcGxhdGZvcm1EaXJlY3RpdmVzKTtcbmV4dGVuZChWdWUkMi5vcHRpb25zLmNvbXBvbmVudHMsIHBsYXRmb3JtQ29tcG9uZW50cyk7XG5cbi8vIGluc3RhbGwgcGxhdGZvcm0gcGF0Y2ggZnVuY3Rpb25cblZ1ZSQyLnByb3RvdHlwZS5fX3BhdGNoX18gPSBpbkJyb3dzZXIgPyBwYXRjaCQxIDogbm9vcDtcblxuLy8gd3JhcCBtb3VudFxuVnVlJDIucHJvdG90eXBlLiRtb3VudCA9IGZ1bmN0aW9uIChcbiAgZWwsXG4gIGh5ZHJhdGluZ1xuKSB7XG4gIGVsID0gZWwgJiYgaW5Ccm93c2VyID8gcXVlcnkoZWwpIDogdW5kZWZpbmVkO1xuICByZXR1cm4gdGhpcy5fbW91bnQoZWwsIGh5ZHJhdGluZylcbn07XG5cbi8vIGRldnRvb2xzIGdsb2JhbCBob29rXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gIGlmIChjb25maWcuZGV2dG9vbHMpIHtcbiAgICBpZiAoZGV2dG9vbHMpIHtcbiAgICAgIGRldnRvb2xzLmVtaXQoJ2luaXQnLCBWdWUkMik7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiZcbiAgICAgIGluQnJvd3NlciAmJiAvQ2hyb21lXFwvXFxkKy8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgICApIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAnRG93bmxvYWQgdGhlIFZ1ZSBEZXZ0b29scyBmb3IgYSBiZXR0ZXIgZGV2ZWxvcG1lbnQgZXhwZXJpZW5jZTpcXG4nICtcbiAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS92dWVqcy92dWUtZGV2dG9vbHMnXG4gICAgICApO1xuICAgIH1cbiAgfVxufSwgMCk7XG5cbm1vZHVsZS5leHBvcnRzID0gVnVlJDI7XG4iLCIvKipcbiAqIHZ1ZXggdjIuMC4wXG4gKiAoYykgMjAxNiBFdmFuIFlvdVxuICogQGxpY2Vuc2UgTUlUXG4gKi9cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgKGdsb2JhbC5WdWV4ID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGV2dG9vbEhvb2sgPVxuICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICB3aW5kb3cuX19WVUVfREVWVE9PTFNfR0xPQkFMX0hPT0tfX1xuXG5mdW5jdGlvbiBkZXZ0b29sUGx1Z2luIChzdG9yZSkge1xuICBpZiAoIWRldnRvb2xIb29rKSB7IHJldHVybiB9XG5cbiAgc3RvcmUuX2RldnRvb2xIb29rID0gZGV2dG9vbEhvb2tcblxuICBkZXZ0b29sSG9vay5lbWl0KCd2dWV4OmluaXQnLCBzdG9yZSlcblxuICBkZXZ0b29sSG9vay5vbigndnVleDp0cmF2ZWwtdG8tc3RhdGUnLCBmdW5jdGlvbiAodGFyZ2V0U3RhdGUpIHtcbiAgICBzdG9yZS5yZXBsYWNlU3RhdGUodGFyZ2V0U3RhdGUpXG4gIH0pXG5cbiAgc3RvcmUuc3Vic2NyaWJlKGZ1bmN0aW9uIChtdXRhdGlvbiwgc3RhdGUpIHtcbiAgICBkZXZ0b29sSG9vay5lbWl0KCd2dWV4Om11dGF0aW9uJywgbXV0YXRpb24sIHN0YXRlKVxuICB9KVxufVxuXG5mdW5jdGlvbiBhcHBseU1peGluIChWdWUpIHtcbiAgdmFyIHZlcnNpb24gPSBOdW1iZXIoVnVlLnZlcnNpb24uc3BsaXQoJy4nKVswXSlcblxuICBpZiAodmVyc2lvbiA+PSAyKSB7XG4gICAgdmFyIHVzZXNJbml0ID0gVnVlLmNvbmZpZy5fbGlmZWN5Y2xlSG9va3MuaW5kZXhPZignaW5pdCcpID4gLTFcbiAgICBWdWUubWl4aW4odXNlc0luaXQgPyB7IGluaXQ6IHZ1ZXhJbml0IH0gOiB7IGJlZm9yZUNyZWF0ZTogdnVleEluaXQgfSlcbiAgfSBlbHNlIHtcbiAgICAvLyBvdmVycmlkZSBpbml0IGFuZCBpbmplY3QgdnVleCBpbml0IHByb2NlZHVyZVxuICAgIC8vIGZvciAxLnggYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG4gICAgdmFyIF9pbml0ID0gVnVlLnByb3RvdHlwZS5faW5pdFxuICAgIFZ1ZS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgaWYgKCBvcHRpb25zID09PSB2b2lkIDAgKSBvcHRpb25zID0ge307XG5cbiAgICAgIG9wdGlvbnMuaW5pdCA9IG9wdGlvbnMuaW5pdFxuICAgICAgICA/IFt2dWV4SW5pdF0uY29uY2F0KG9wdGlvbnMuaW5pdClcbiAgICAgICAgOiB2dWV4SW5pdFxuICAgICAgX2luaXQuY2FsbCh0aGlzLCBvcHRpb25zKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBWdWV4IGluaXQgaG9vaywgaW5qZWN0ZWQgaW50byBlYWNoIGluc3RhbmNlcyBpbml0IGhvb2tzIGxpc3QuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHZ1ZXhJbml0ICgpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuJG9wdGlvbnNcbiAgICAvLyBzdG9yZSBpbmplY3Rpb25cbiAgICBpZiAob3B0aW9ucy5zdG9yZSkge1xuICAgICAgdGhpcy4kc3RvcmUgPSBvcHRpb25zLnN0b3JlXG4gICAgfSBlbHNlIGlmIChvcHRpb25zLnBhcmVudCAmJiBvcHRpb25zLnBhcmVudC4kc3RvcmUpIHtcbiAgICAgIHRoaXMuJHN0b3JlID0gb3B0aW9ucy5wYXJlbnQuJHN0b3JlXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG1hcFN0YXRlIChzdGF0ZXMpIHtcbiAgdmFyIHJlcyA9IHt9XG4gIG5vcm1hbGl6ZU1hcChzdGF0ZXMpLmZvckVhY2goZnVuY3Rpb24gKHJlZikge1xuICAgIHZhciBrZXkgPSByZWYua2V5O1xuICAgIHZhciB2YWwgPSByZWYudmFsO1xuXG4gICAgcmVzW2tleV0gPSBmdW5jdGlvbiBtYXBwZWRTdGF0ZSAoKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHZhbC5jYWxsKHRoaXMsIHRoaXMuJHN0b3JlLnN0YXRlLCB0aGlzLiRzdG9yZS5nZXR0ZXJzKVxuICAgICAgICA6IHRoaXMuJHN0b3JlLnN0YXRlW3ZhbF1cbiAgICB9XG4gIH0pXG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gbWFwTXV0YXRpb25zIChtdXRhdGlvbnMpIHtcbiAgdmFyIHJlcyA9IHt9XG4gIG5vcm1hbGl6ZU1hcChtdXRhdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKHJlZikge1xuICAgIHZhciBrZXkgPSByZWYua2V5O1xuICAgIHZhciB2YWwgPSByZWYudmFsO1xuXG4gICAgcmVzW2tleV0gPSBmdW5jdGlvbiBtYXBwZWRNdXRhdGlvbiAoKSB7XG4gICAgICB2YXIgYXJncyA9IFtdLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgd2hpbGUgKCBsZW4tLSApIGFyZ3NbIGxlbiBdID0gYXJndW1lbnRzWyBsZW4gXTtcblxuICAgICAgcmV0dXJuIHRoaXMuJHN0b3JlLmNvbW1pdC5hcHBseSh0aGlzLiRzdG9yZSwgW3ZhbF0uY29uY2F0KGFyZ3MpKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBtYXBHZXR0ZXJzIChnZXR0ZXJzKSB7XG4gIHZhciByZXMgPSB7fVxuICBub3JtYWxpemVNYXAoZ2V0dGVycykuZm9yRWFjaChmdW5jdGlvbiAocmVmKSB7XG4gICAgdmFyIGtleSA9IHJlZi5rZXk7XG4gICAgdmFyIHZhbCA9IHJlZi52YWw7XG5cbiAgICByZXNba2V5XSA9IGZ1bmN0aW9uIG1hcHBlZEdldHRlciAoKSB7XG4gICAgICBpZiAoISh2YWwgaW4gdGhpcy4kc3RvcmUuZ2V0dGVycykpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcigoXCJbdnVleF0gdW5rbm93biBnZXR0ZXI6IFwiICsgdmFsKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLiRzdG9yZS5nZXR0ZXJzW3ZhbF1cbiAgICB9XG4gIH0pXG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gbWFwQWN0aW9ucyAoYWN0aW9ucykge1xuICB2YXIgcmVzID0ge31cbiAgbm9ybWFsaXplTWFwKGFjdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKHJlZikge1xuICAgIHZhciBrZXkgPSByZWYua2V5O1xuICAgIHZhciB2YWwgPSByZWYudmFsO1xuXG4gICAgcmVzW2tleV0gPSBmdW5jdGlvbiBtYXBwZWRBY3Rpb24gKCkge1xuICAgICAgdmFyIGFyZ3MgPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgIHdoaWxlICggbGVuLS0gKSBhcmdzWyBsZW4gXSA9IGFyZ3VtZW50c1sgbGVuIF07XG5cbiAgICAgIHJldHVybiB0aGlzLiRzdG9yZS5kaXNwYXRjaC5hcHBseSh0aGlzLiRzdG9yZSwgW3ZhbF0uY29uY2F0KGFyZ3MpKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVNYXAgKG1hcCkge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShtYXApXG4gICAgPyBtYXAubWFwKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuICh7IGtleToga2V5LCB2YWw6IGtleSB9KTsgfSlcbiAgICA6IE9iamVjdC5rZXlzKG1hcCkubWFwKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuICh7IGtleToga2V5LCB2YWw6IG1hcFtrZXldIH0pOyB9KVxufVxuXG5mdW5jdGlvbiBpc09iamVjdCAob2JqKSB7XG4gIHJldHVybiBvYmogIT09IG51bGwgJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCdcbn1cblxuZnVuY3Rpb24gaXNQcm9taXNlICh2YWwpIHtcbiAgcmV0dXJuIHZhbCAmJiB0eXBlb2YgdmFsLnRoZW4gPT09ICdmdW5jdGlvbidcbn1cblxuZnVuY3Rpb24gYXNzZXJ0IChjb25kaXRpb24sIG1zZykge1xuICBpZiAoIWNvbmRpdGlvbikgeyB0aHJvdyBuZXcgRXJyb3IoKFwiW3Z1ZXhdIFwiICsgbXNnKSkgfVxufVxuXG52YXIgVnVlIC8vIGJpbmQgb24gaW5zdGFsbFxuXG52YXIgU3RvcmUgPSBmdW5jdGlvbiBTdG9yZSAob3B0aW9ucykge1xuICB2YXIgdGhpcyQxID0gdGhpcztcbiAgaWYgKCBvcHRpb25zID09PSB2b2lkIDAgKSBvcHRpb25zID0ge307XG5cbiAgYXNzZXJ0KFZ1ZSwgXCJtdXN0IGNhbGwgVnVlLnVzZShWdWV4KSBiZWZvcmUgY3JlYXRpbmcgYSBzdG9yZSBpbnN0YW5jZS5cIilcbiAgYXNzZXJ0KHR5cGVvZiBQcm9taXNlICE9PSAndW5kZWZpbmVkJywgXCJ2dWV4IHJlcXVpcmVzIGEgUHJvbWlzZSBwb2x5ZmlsbCBpbiB0aGlzIGJyb3dzZXIuXCIpXG5cbiAgdmFyIHN0YXRlID0gb3B0aW9ucy5zdGF0ZTsgaWYgKCBzdGF0ZSA9PT0gdm9pZCAwICkgc3RhdGUgPSB7fTtcbiAgdmFyIHBsdWdpbnMgPSBvcHRpb25zLnBsdWdpbnM7IGlmICggcGx1Z2lucyA9PT0gdm9pZCAwICkgcGx1Z2lucyA9IFtdO1xuICB2YXIgc3RyaWN0ID0gb3B0aW9ucy5zdHJpY3Q7IGlmICggc3RyaWN0ID09PSB2b2lkIDAgKSBzdHJpY3QgPSBmYWxzZTtcblxuICAvLyBzdG9yZSBpbnRlcm5hbCBzdGF0ZVxuICB0aGlzLl9vcHRpb25zID0gb3B0aW9uc1xuICB0aGlzLl9jb21taXR0aW5nID0gZmFsc2VcbiAgdGhpcy5fYWN0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgdGhpcy5fbXV0YXRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICB0aGlzLl93cmFwcGVkR2V0dGVycyA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgdGhpcy5fcnVudGltZU1vZHVsZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHRoaXMuX3N1YnNjcmliZXJzID0gW11cbiAgdGhpcy5fd2F0Y2hlclZNID0gbmV3IFZ1ZSgpXG5cbiAgICAvLyBiaW5kIGNvbW1pdCBhbmQgZGlzcGF0Y2ggdG8gc2VsZlxuICB2YXIgc3RvcmUgPSB0aGlzXG4gIHZhciByZWYgPSB0aGlzO1xuICB2YXIgZGlzcGF0Y2ggPSByZWYuZGlzcGF0Y2g7XG4gIHZhciBjb21taXQgPSByZWYuY29tbWl0O1xuICB0aGlzLmRpc3BhdGNoID0gZnVuY3Rpb24gYm91bmREaXNwYXRjaCAodHlwZSwgcGF5bG9hZCkge1xuICAgIHJldHVybiBkaXNwYXRjaC5jYWxsKHN0b3JlLCB0eXBlLCBwYXlsb2FkKVxuICAgIH1cbiAgICB0aGlzLmNvbW1pdCA9IGZ1bmN0aW9uIGJvdW5kQ29tbWl0ICh0eXBlLCBwYXlsb2FkLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGNvbW1pdC5jYWxsKHN0b3JlLCB0eXBlLCBwYXlsb2FkLCBvcHRpb25zKVxuICB9XG5cbiAgLy8gc3RyaWN0IG1vZGVcbiAgdGhpcy5zdHJpY3QgPSBzdHJpY3RcblxuICAvLyBpbml0IHJvb3QgbW9kdWxlLlxuICAvLyB0aGlzIGFsc28gcmVjdXJzaXZlbHkgcmVnaXN0ZXJzIGFsbCBzdWItbW9kdWxlc1xuICAvLyBhbmQgY29sbGVjdHMgYWxsIG1vZHVsZSBnZXR0ZXJzIGluc2lkZSB0aGlzLl93cmFwcGVkR2V0dGVyc1xuICBpbnN0YWxsTW9kdWxlKHRoaXMsIHN0YXRlLCBbXSwgb3B0aW9ucylcblxuICAvLyBpbml0aWFsaXplIHRoZSBzdG9yZSB2bSwgd2hpY2ggaXMgcmVzcG9uc2libGUgZm9yIHRoZSByZWFjdGl2aXR5XG4gIC8vIChhbHNvIHJlZ2lzdGVycyBfd3JhcHBlZEdldHRlcnMgYXMgY29tcHV0ZWQgcHJvcGVydGllcylcbiAgcmVzZXRTdG9yZVZNKHRoaXMsIHN0YXRlKVxuXG4gIC8vIGFwcGx5IHBsdWdpbnNcbiAgcGx1Z2lucy5jb25jYXQoZGV2dG9vbFBsdWdpbikuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luKSB7IHJldHVybiBwbHVnaW4odGhpcyQxKTsgfSlcbn07XG5cbnZhciBwcm90b3R5cGVBY2Nlc3NvcnMgPSB7IHN0YXRlOiB7fSB9O1xuXG5wcm90b3R5cGVBY2Nlc3NvcnMuc3RhdGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5fdm0uc3RhdGVcbn07XG5cbnByb3RvdHlwZUFjY2Vzc29ycy5zdGF0ZS5zZXQgPSBmdW5jdGlvbiAodikge1xuICBhc3NlcnQoZmFsc2UsIFwiVXNlIHN0b3JlLnJlcGxhY2VTdGF0ZSgpIHRvIGV4cGxpY2l0IHJlcGxhY2Ugc3RvcmUgc3RhdGUuXCIpXG59O1xuXG5TdG9yZS5wcm90b3R5cGUuY29tbWl0ID0gZnVuY3Rpb24gY29tbWl0ICh0eXBlLCBwYXlsb2FkLCBvcHRpb25zKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgLy8gY2hlY2sgb2JqZWN0LXN0eWxlIGNvbW1pdFxuICBpZiAoaXNPYmplY3QodHlwZSkgJiYgdHlwZS50eXBlKSB7XG4gICAgb3B0aW9ucyA9IHBheWxvYWRcbiAgICBwYXlsb2FkID0gdHlwZVxuICAgIHR5cGUgPSB0eXBlLnR5cGVcbiAgfVxuICB2YXIgbXV0YXRpb24gPSB7IHR5cGU6IHR5cGUsIHBheWxvYWQ6IHBheWxvYWQgfVxuICB2YXIgZW50cnkgPSB0aGlzLl9tdXRhdGlvbnNbdHlwZV1cbiAgaWYgKCFlbnRyeSkge1xuICAgIGNvbnNvbGUuZXJyb3IoKFwiW3Z1ZXhdIHVua25vd24gbXV0YXRpb24gdHlwZTogXCIgKyB0eXBlKSlcbiAgICByZXR1cm5cbiAgfVxuICB0aGlzLl93aXRoQ29tbWl0KGZ1bmN0aW9uICgpIHtcbiAgICBlbnRyeS5mb3JFYWNoKGZ1bmN0aW9uIGNvbW1pdEl0ZXJhdG9yIChoYW5kbGVyKSB7XG4gICAgICBoYW5kbGVyKHBheWxvYWQpXG4gICAgfSlcbiAgfSlcbiAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLnNpbGVudCkge1xuICAgIHRoaXMuX3N1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24gKHN1YikgeyByZXR1cm4gc3ViKG11dGF0aW9uLCB0aGlzJDEuc3RhdGUpOyB9KVxuICB9XG59O1xuXG5TdG9yZS5wcm90b3R5cGUuZGlzcGF0Y2ggPSBmdW5jdGlvbiBkaXNwYXRjaCAodHlwZSwgcGF5bG9hZCkge1xuICAvLyBjaGVjayBvYmplY3Qtc3R5bGUgZGlzcGF0Y2hcbiAgaWYgKGlzT2JqZWN0KHR5cGUpICYmIHR5cGUudHlwZSkge1xuICAgIHBheWxvYWQgPSB0eXBlXG4gICAgdHlwZSA9IHR5cGUudHlwZVxuICB9XG4gIHZhciBlbnRyeSA9IHRoaXMuX2FjdGlvbnNbdHlwZV1cbiAgaWYgKCFlbnRyeSkge1xuICAgIGNvbnNvbGUuZXJyb3IoKFwiW3Z1ZXhdIHVua25vd24gYWN0aW9uIHR5cGU6IFwiICsgdHlwZSkpXG4gICAgcmV0dXJuXG4gIH1cbiAgcmV0dXJuIGVudHJ5Lmxlbmd0aCA+IDFcbiAgICA/IFByb21pc2UuYWxsKGVudHJ5Lm1hcChmdW5jdGlvbiAoaGFuZGxlcikgeyByZXR1cm4gaGFuZGxlcihwYXlsb2FkKTsgfSkpXG4gICAgOiBlbnRyeVswXShwYXlsb2FkKVxufTtcblxuU3RvcmUucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uIHN1YnNjcmliZSAoZm4pIHtcbiAgdmFyIHN1YnMgPSB0aGlzLl9zdWJzY3JpYmVyc1xuICBpZiAoc3Vicy5pbmRleE9mKGZuKSA8IDApIHtcbiAgICBzdWJzLnB1c2goZm4pXG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaSA9IHN1YnMuaW5kZXhPZihmbilcbiAgICBpZiAoaSA+IC0xKSB7XG4gICAgICBzdWJzLnNwbGljZShpLCAxKVxuICAgIH1cbiAgfVxufTtcblxuU3RvcmUucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24gd2F0Y2ggKGdldHRlciwgY2IsIG9wdGlvbnMpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBhc3NlcnQodHlwZW9mIGdldHRlciA9PT0gJ2Z1bmN0aW9uJywgXCJzdG9yZS53YXRjaCBvbmx5IGFjY2VwdHMgYSBmdW5jdGlvbi5cIilcbiAgcmV0dXJuIHRoaXMuX3dhdGNoZXJWTS4kd2F0Y2goZnVuY3Rpb24gKCkgeyByZXR1cm4gZ2V0dGVyKHRoaXMkMS5zdGF0ZSk7IH0sIGNiLCBvcHRpb25zKVxufTtcblxuU3RvcmUucHJvdG90eXBlLnJlcGxhY2VTdGF0ZSA9IGZ1bmN0aW9uIHJlcGxhY2VTdGF0ZSAoc3RhdGUpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICB0aGlzLl93aXRoQ29tbWl0KGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzJDEuX3ZtLnN0YXRlID0gc3RhdGVcbiAgfSlcbn07XG5cblN0b3JlLnByb3RvdHlwZS5yZWdpc3Rlck1vZHVsZSA9IGZ1bmN0aW9uIHJlZ2lzdGVyTW9kdWxlIChwYXRoLCBtb2R1bGUpIHtcbiAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykgeyBwYXRoID0gW3BhdGhdIH1cbiAgYXNzZXJ0KEFycmF5LmlzQXJyYXkocGF0aCksIFwibW9kdWxlIHBhdGggbXVzdCBiZSBhIHN0cmluZyBvciBhbiBBcnJheS5cIilcbiAgdGhpcy5fcnVudGltZU1vZHVsZXNbcGF0aC5qb2luKCcuJyldID0gbW9kdWxlXG4gIGluc3RhbGxNb2R1bGUodGhpcywgdGhpcy5zdGF0ZSwgcGF0aCwgbW9kdWxlKVxuICAvLyByZXNldCBzdG9yZSB0byB1cGRhdGUgZ2V0dGVycy4uLlxuICByZXNldFN0b3JlVk0odGhpcywgdGhpcy5zdGF0ZSlcbn07XG5cblN0b3JlLnByb3RvdHlwZS51bnJlZ2lzdGVyTW9kdWxlID0gZnVuY3Rpb24gdW5yZWdpc3Rlck1vZHVsZSAocGF0aCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHsgcGF0aCA9IFtwYXRoXSB9XG4gIGFzc2VydChBcnJheS5pc0FycmF5KHBhdGgpLCBcIm1vZHVsZSBwYXRoIG11c3QgYmUgYSBzdHJpbmcgb3IgYW4gQXJyYXkuXCIpXG4gICAgZGVsZXRlIHRoaXMuX3J1bnRpbWVNb2R1bGVzW3BhdGguam9pbignLicpXVxuICB0aGlzLl93aXRoQ29tbWl0KGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcGFyZW50U3RhdGUgPSBnZXROZXN0ZWRTdGF0ZSh0aGlzJDEuc3RhdGUsIHBhdGguc2xpY2UoMCwgLTEpKVxuICAgIFZ1ZS5kZWxldGUocGFyZW50U3RhdGUsIHBhdGhbcGF0aC5sZW5ndGggLSAxXSlcbiAgfSlcbiAgcmVzZXRTdG9yZSh0aGlzKVxufTtcblxuU3RvcmUucHJvdG90eXBlLmhvdFVwZGF0ZSA9IGZ1bmN0aW9uIGhvdFVwZGF0ZSAobmV3T3B0aW9ucykge1xuICB1cGRhdGVNb2R1bGUodGhpcy5fb3B0aW9ucywgbmV3T3B0aW9ucylcbiAgcmVzZXRTdG9yZSh0aGlzKVxufTtcblxuU3RvcmUucHJvdG90eXBlLl93aXRoQ29tbWl0ID0gZnVuY3Rpb24gX3dpdGhDb21taXQgKGZuKSB7XG4gIHZhciBjb21taXR0aW5nID0gdGhpcy5fY29tbWl0dGluZ1xuICB0aGlzLl9jb21taXR0aW5nID0gdHJ1ZVxuICBmbigpXG4gIHRoaXMuX2NvbW1pdHRpbmcgPSBjb21taXR0aW5nXG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyggU3RvcmUucHJvdG90eXBlLCBwcm90b3R5cGVBY2Nlc3NvcnMgKTtcblxuZnVuY3Rpb24gdXBkYXRlTW9kdWxlICh0YXJnZXRNb2R1bGUsIG5ld01vZHVsZSkge1xuICBpZiAobmV3TW9kdWxlLmFjdGlvbnMpIHtcbiAgICB0YXJnZXRNb2R1bGUuYWN0aW9ucyA9IG5ld01vZHVsZS5hY3Rpb25zXG4gIH1cbiAgaWYgKG5ld01vZHVsZS5tdXRhdGlvbnMpIHtcbiAgICB0YXJnZXRNb2R1bGUubXV0YXRpb25zID0gbmV3TW9kdWxlLm11dGF0aW9uc1xuICB9XG4gIGlmIChuZXdNb2R1bGUuZ2V0dGVycykge1xuICAgIHRhcmdldE1vZHVsZS5nZXR0ZXJzID0gbmV3TW9kdWxlLmdldHRlcnNcbiAgfVxuICBpZiAobmV3TW9kdWxlLm1vZHVsZXMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gbmV3TW9kdWxlLm1vZHVsZXMpIHtcbiAgICAgIGlmICghKHRhcmdldE1vZHVsZS5tb2R1bGVzICYmIHRhcmdldE1vZHVsZS5tb2R1bGVzW2tleV0pKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBcIlt2dWV4XSB0cnlpbmcgdG8gYWRkIGEgbmV3IG1vZHVsZSAnXCIgKyBrZXkgKyBcIicgb24gaG90IHJlbG9hZGluZywgXCIgK1xuICAgICAgICAgICdtYW51YWwgcmVsb2FkIGlzIG5lZWRlZCdcbiAgICAgICAgKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHVwZGF0ZU1vZHVsZSh0YXJnZXRNb2R1bGUubW9kdWxlc1trZXldLCBuZXdNb2R1bGUubW9kdWxlc1trZXldKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZXNldFN0b3JlIChzdG9yZSkge1xuICBzdG9yZS5fYWN0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgc3RvcmUuX211dGF0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgc3RvcmUuX3dyYXBwZWRHZXR0ZXJzID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICB2YXIgc3RhdGUgPSBzdG9yZS5zdGF0ZVxuICAvLyBpbml0IHJvb3QgbW9kdWxlXG4gIGluc3RhbGxNb2R1bGUoc3RvcmUsIHN0YXRlLCBbXSwgc3RvcmUuX29wdGlvbnMsIHRydWUpXG4gIC8vIGluaXQgYWxsIHJ1bnRpbWUgbW9kdWxlc1xuICBPYmplY3Qua2V5cyhzdG9yZS5fcnVudGltZU1vZHVsZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGluc3RhbGxNb2R1bGUoc3RvcmUsIHN0YXRlLCBrZXkuc3BsaXQoJy4nKSwgc3RvcmUuX3J1bnRpbWVNb2R1bGVzW2tleV0sIHRydWUpXG4gIH0pXG4gIC8vIHJlc2V0IHZtXG4gIHJlc2V0U3RvcmVWTShzdG9yZSwgc3RhdGUpXG59XG5cbmZ1bmN0aW9uIHJlc2V0U3RvcmVWTSAoc3RvcmUsIHN0YXRlKSB7XG4gIHZhciBvbGRWbSA9IHN0b3JlLl92bVxuXG4gIC8vIGJpbmQgc3RvcmUgcHVibGljIGdldHRlcnNcbiAgc3RvcmUuZ2V0dGVycyA9IHt9XG4gIHZhciB3cmFwcGVkR2V0dGVycyA9IHN0b3JlLl93cmFwcGVkR2V0dGVyc1xuICB2YXIgY29tcHV0ZWQgPSB7fVxuICBPYmplY3Qua2V5cyh3cmFwcGVkR2V0dGVycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGZuID0gd3JhcHBlZEdldHRlcnNba2V5XVxuICAgIC8vIHVzZSBjb21wdXRlZCB0byBsZXZlcmFnZSBpdHMgbGF6eS1jYWNoaW5nIG1lY2hhbmlzbVxuICAgIGNvbXB1dGVkW2tleV0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiBmbihzdG9yZSk7IH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc3RvcmUuZ2V0dGVycywga2V5LCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHN0b3JlLl92bVtrZXldOyB9XG4gICAgfSlcbiAgfSlcblxuICAvLyB1c2UgYSBWdWUgaW5zdGFuY2UgdG8gc3RvcmUgdGhlIHN0YXRlIHRyZWVcbiAgLy8gc3VwcHJlc3Mgd2FybmluZ3MganVzdCBpbiBjYXNlIHRoZSB1c2VyIGhhcyBhZGRlZFxuICAvLyBzb21lIGZ1bmt5IGdsb2JhbCBtaXhpbnNcbiAgdmFyIHNpbGVudCA9IFZ1ZS5jb25maWcuc2lsZW50XG4gIFZ1ZS5jb25maWcuc2lsZW50ID0gdHJ1ZVxuICBzdG9yZS5fdm0gPSBuZXcgVnVlKHtcbiAgICBkYXRhOiB7IHN0YXRlOiBzdGF0ZSB9LFxuICAgIGNvbXB1dGVkOiBjb21wdXRlZFxuICB9KVxuICBWdWUuY29uZmlnLnNpbGVudCA9IHNpbGVudFxuXG4gIC8vIGVuYWJsZSBzdHJpY3QgbW9kZSBmb3IgbmV3IHZtXG4gIGlmIChzdG9yZS5zdHJpY3QpIHtcbiAgICBlbmFibGVTdHJpY3RNb2RlKHN0b3JlKVxuICB9XG5cbiAgaWYgKG9sZFZtKSB7XG4gICAgLy8gZGlzcGF0Y2ggY2hhbmdlcyBpbiBhbGwgc3Vic2NyaWJlZCB3YXRjaGVyc1xuICAgIC8vIHRvIGZvcmNlIGdldHRlciByZS1ldmFsdWF0aW9uLlxuICAgIHN0b3JlLl93aXRoQ29tbWl0KGZ1bmN0aW9uICgpIHtcbiAgICAgIG9sZFZtLnN0YXRlID0gbnVsbFxuICAgIH0pXG4gICAgVnVlLm5leHRUaWNrKGZ1bmN0aW9uICgpIHsgcmV0dXJuIG9sZFZtLiRkZXN0cm95KCk7IH0pXG4gIH1cbn1cblxuZnVuY3Rpb24gaW5zdGFsbE1vZHVsZSAoc3RvcmUsIHJvb3RTdGF0ZSwgcGF0aCwgbW9kdWxlLCBob3QpIHtcbiAgdmFyIGlzUm9vdCA9ICFwYXRoLmxlbmd0aFxuICB2YXIgc3RhdGUgPSBtb2R1bGUuc3RhdGU7XG4gIHZhciBhY3Rpb25zID0gbW9kdWxlLmFjdGlvbnM7XG4gIHZhciBtdXRhdGlvbnMgPSBtb2R1bGUubXV0YXRpb25zO1xuICB2YXIgZ2V0dGVycyA9IG1vZHVsZS5nZXR0ZXJzO1xuICB2YXIgbW9kdWxlcyA9IG1vZHVsZS5tb2R1bGVzO1xuXG4gIC8vIHNldCBzdGF0ZVxuICBpZiAoIWlzUm9vdCAmJiAhaG90KSB7XG4gICAgdmFyIHBhcmVudFN0YXRlID0gZ2V0TmVzdGVkU3RhdGUocm9vdFN0YXRlLCBwYXRoLnNsaWNlKDAsIC0xKSlcbiAgICB2YXIgbW9kdWxlTmFtZSA9IHBhdGhbcGF0aC5sZW5ndGggLSAxXVxuICAgIHN0b3JlLl93aXRoQ29tbWl0KGZ1bmN0aW9uICgpIHtcbiAgICAgIFZ1ZS5zZXQocGFyZW50U3RhdGUsIG1vZHVsZU5hbWUsIHN0YXRlIHx8IHt9KVxuICAgIH0pXG4gIH1cblxuICBpZiAobXV0YXRpb25zKSB7XG4gICAgT2JqZWN0LmtleXMobXV0YXRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJlZ2lzdGVyTXV0YXRpb24oc3RvcmUsIGtleSwgbXV0YXRpb25zW2tleV0sIHBhdGgpXG4gICAgfSlcbiAgfVxuXG4gIGlmIChhY3Rpb25zKSB7XG4gICAgT2JqZWN0LmtleXMoYWN0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZWdpc3RlckFjdGlvbihzdG9yZSwga2V5LCBhY3Rpb25zW2tleV0sIHBhdGgpXG4gICAgfSlcbiAgfVxuXG4gIGlmIChnZXR0ZXJzKSB7XG4gICAgd3JhcEdldHRlcnMoc3RvcmUsIGdldHRlcnMsIHBhdGgpXG4gIH1cblxuICBpZiAobW9kdWxlcykge1xuICAgIE9iamVjdC5rZXlzKG1vZHVsZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgaW5zdGFsbE1vZHVsZShzdG9yZSwgcm9vdFN0YXRlLCBwYXRoLmNvbmNhdChrZXkpLCBtb2R1bGVzW2tleV0sIGhvdClcbiAgICB9KVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyTXV0YXRpb24gKHN0b3JlLCB0eXBlLCBoYW5kbGVyLCBwYXRoKSB7XG4gIGlmICggcGF0aCA9PT0gdm9pZCAwICkgcGF0aCA9IFtdO1xuXG4gIHZhciBlbnRyeSA9IHN0b3JlLl9tdXRhdGlvbnNbdHlwZV0gfHwgKHN0b3JlLl9tdXRhdGlvbnNbdHlwZV0gPSBbXSlcbiAgZW50cnkucHVzaChmdW5jdGlvbiB3cmFwcGVkTXV0YXRpb25IYW5kbGVyIChwYXlsb2FkKSB7XG4gICAgaGFuZGxlcihnZXROZXN0ZWRTdGF0ZShzdG9yZS5zdGF0ZSwgcGF0aCksIHBheWxvYWQpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyQWN0aW9uIChzdG9yZSwgdHlwZSwgaGFuZGxlciwgcGF0aCkge1xuICBpZiAoIHBhdGggPT09IHZvaWQgMCApIHBhdGggPSBbXTtcblxuICB2YXIgZW50cnkgPSBzdG9yZS5fYWN0aW9uc1t0eXBlXSB8fCAoc3RvcmUuX2FjdGlvbnNbdHlwZV0gPSBbXSlcbiAgdmFyIGRpc3BhdGNoID0gc3RvcmUuZGlzcGF0Y2g7XG4gIHZhciBjb21taXQgPSBzdG9yZS5jb21taXQ7XG4gIGVudHJ5LnB1c2goZnVuY3Rpb24gd3JhcHBlZEFjdGlvbkhhbmRsZXIgKHBheWxvYWQsIGNiKSB7XG4gICAgdmFyIHJlcyA9IGhhbmRsZXIoe1xuICAgICAgZGlzcGF0Y2g6IGRpc3BhdGNoLFxuICAgICAgY29tbWl0OiBjb21taXQsXG4gICAgICBnZXR0ZXJzOiBzdG9yZS5nZXR0ZXJzLFxuICAgICAgc3RhdGU6IGdldE5lc3RlZFN0YXRlKHN0b3JlLnN0YXRlLCBwYXRoKSxcbiAgICAgIHJvb3RTdGF0ZTogc3RvcmUuc3RhdGVcbiAgICB9LCBwYXlsb2FkLCBjYilcbiAgICBpZiAoIWlzUHJvbWlzZShyZXMpKSB7XG4gICAgICByZXMgPSBQcm9taXNlLnJlc29sdmUocmVzKVxuICAgIH1cbiAgICBpZiAoc3RvcmUuX2RldnRvb2xIb29rKSB7XG4gICAgICByZXR1cm4gcmVzLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgc3RvcmUuX2RldnRvb2xIb29rLmVtaXQoJ3Z1ZXg6ZXJyb3InLCBlcnIpXG4gICAgICAgIHRocm93IGVyclxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc1xuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gd3JhcEdldHRlcnMgKHN0b3JlLCBtb2R1bGVHZXR0ZXJzLCBtb2R1bGVQYXRoKSB7XG4gIE9iamVjdC5rZXlzKG1vZHVsZUdldHRlcnMpLmZvckVhY2goZnVuY3Rpb24gKGdldHRlcktleSkge1xuICAgIHZhciByYXdHZXR0ZXIgPSBtb2R1bGVHZXR0ZXJzW2dldHRlcktleV1cbiAgICBpZiAoc3RvcmUuX3dyYXBwZWRHZXR0ZXJzW2dldHRlcktleV0pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoKFwiW3Z1ZXhdIGR1cGxpY2F0ZSBnZXR0ZXIga2V5OiBcIiArIGdldHRlcktleSkpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgc3RvcmUuX3dyYXBwZWRHZXR0ZXJzW2dldHRlcktleV0gPSBmdW5jdGlvbiB3cmFwcGVkR2V0dGVyIChzdG9yZSkge1xuICAgICAgcmV0dXJuIHJhd0dldHRlcihcbiAgICAgICAgZ2V0TmVzdGVkU3RhdGUoc3RvcmUuc3RhdGUsIG1vZHVsZVBhdGgpLCAvLyBsb2NhbCBzdGF0ZVxuICAgICAgICBzdG9yZS5nZXR0ZXJzLCAvLyBnZXR0ZXJzXG4gICAgICAgIHN0b3JlLnN0YXRlIC8vIHJvb3Qgc3RhdGVcbiAgICAgIClcbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIGVuYWJsZVN0cmljdE1vZGUgKHN0b3JlKSB7XG4gIHN0b3JlLl92bS4kd2F0Y2goJ3N0YXRlJywgZnVuY3Rpb24gKCkge1xuICAgIGFzc2VydChzdG9yZS5fY29tbWl0dGluZywgXCJEbyBub3QgbXV0YXRlIHZ1ZXggc3RvcmUgc3RhdGUgb3V0c2lkZSBtdXRhdGlvbiBoYW5kbGVycy5cIilcbiAgfSwgeyBkZWVwOiB0cnVlLCBzeW5jOiB0cnVlIH0pXG59XG5cbmZ1bmN0aW9uIGdldE5lc3RlZFN0YXRlIChzdGF0ZSwgcGF0aCkge1xuICByZXR1cm4gcGF0aC5sZW5ndGhcbiAgICA/IHBhdGgucmVkdWNlKGZ1bmN0aW9uIChzdGF0ZSwga2V5KSB7IHJldHVybiBzdGF0ZVtrZXldOyB9LCBzdGF0ZSlcbiAgICA6IHN0YXRlXG59XG5cbmZ1bmN0aW9uIGluc3RhbGwgKF9WdWUpIHtcbiAgaWYgKFZ1ZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAnW3Z1ZXhdIGFscmVhZHkgaW5zdGFsbGVkLiBWdWUudXNlKFZ1ZXgpIHNob3VsZCBiZSBjYWxsZWQgb25seSBvbmNlLidcbiAgICApXG4gICAgcmV0dXJuXG4gIH1cbiAgVnVlID0gX1Z1ZVxuICBhcHBseU1peGluKFZ1ZSlcbn1cblxuLy8gYXV0byBpbnN0YWxsIGluIGRpc3QgbW9kZVxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WdWUpIHtcbiAgaW5zdGFsbCh3aW5kb3cuVnVlKVxufVxuXG52YXIgaW5kZXggPSB7XG4gIFN0b3JlOiBTdG9yZSxcbiAgaW5zdGFsbDogaW5zdGFsbCxcbiAgbWFwU3RhdGU6IG1hcFN0YXRlLFxuICBtYXBNdXRhdGlvbnM6IG1hcE11dGF0aW9ucyxcbiAgbWFwR2V0dGVyczogbWFwR2V0dGVycyxcbiAgbWFwQWN0aW9uczogbWFwQWN0aW9uc1xufVxuXG5yZXR1cm4gaW5kZXg7XG5cbn0pKSk7IiwiPHN0eWxlPlxuPC9zdHlsZT5cblxuPHRlbXBsYXRlPlxuXHQ8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XG5cdFx0PGgxPlZ1ZSBUT0RPPC9oMT5cblx0XHQ8ZGl2PlxuXHRcdFx0PHRhc2stZm9ybSA6dGFzaz1cIm5ld1Rhc2tcIj48L3Rhc2stZm9ybT5cblx0XHQ8L2Rpdj5cblx0XHQ8aHIgLz5cblx0XHQ8ZGl2IGNsYXNzPVwidGFza0xpc3RPcGVyYXRvclwiPlxuXHRcdFx0PGJ1dHRvbiB2LW9uOmNsaWNrPVwiZGVsZXRlX2NsaWNrXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIj5EZWxldGUgZmluaXNoZWQgdGFza3M8L2J1dHRvbj5cblx0XHQ8L2Rpdj5cblx0XHQ8ZGl2IGNsYXNzPVwibGlzdC1ncm91cFwiPlxuXHRcdFx0PHRhc2staXRlbSB2LWZvcj1cInRhc2sgaW4gdGFza3NcIiA6dGFzaz1cInRhc2tcIj48L3Rhc2staXRlbT5cblx0XHRcdDxwIHYtc2hvdz1cInRhc2tzLmxlbmd0aCA8IDFcIiBjbGFzcz1cInRleHQtbXV0ZWRcIj5ObyB0YXNrcy4gWWF5ITwvcD5cblx0XHQ8L2Rpdj5cblx0PC9kaXY+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuY29uc3QgdGFza0Zvcm0gPSByZXF1aXJlKCcuL1Rhc2tGb3JtLnZ1ZScpO1xuY29uc3QgdGFza0l0ZW0gPSByZXF1aXJlKCcuL1Rhc2tJdGVtLnZ1ZScpO1xuY29uc3Qgc3RvcmUgPSByZXF1aXJlKCcuL3N0b3JlLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRjb21wb25lbnRzOiB7XG5cdFx0dGFza0Zvcm06IHRhc2tGb3JtLFxuXHRcdHRhc2tJdGVtOiB0YXNrSXRlbSxcblx0fSxcblx0ZGF0YTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHN0b3JlLnN0YXRlO1xuXHR9LFxuXHRjb21wdXRlZDoge1xuXHR9LFxuXHRtZXRob2RzOiB7XG5cdFx0ZGVsZXRlX2NsaWNrOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0dGhpcy50YXNrcyA9IHRoaXMudGFza3MuZmlsdGVyKHY9PiF2LmZpbmlzaGVkKTtcblx0XHR9LFxuXHR9LFxufTtcbjwvc2NyaXB0PlxuIiwiPHN0eWxlPlxuPC9zdHlsZT5cblxuPHRlbXBsYXRlPlxuXHQ8Zm9ybSB2LW9uOnN1Ym1pdC5wcmV2ZW50PVwiZm9ybV9zdWJtaXRcIj5cblx0XHQ8ZGl2IGNsYXNzPVwiaW5wdXQtZ3JvdXBcIj5cblx0XHRcdDxpbnB1dCB2LW1vZGVsPVwidGFzay5uYW1lXCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiQnV5IG1pbGsgMkxcIj5cblx0XHRcdDxzcGFuIGNsYXNzPVwiaW5wdXQtZ3JvdXAtYnRuXCI+XG5cdFx0XHRcdDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5BZGQgbmV3IHRhc2s8L2J1dHRvbj5cblx0XHRcdDwvc3Bhbj5cblx0XHQ8L2Rpdj5cblx0PC9mb3JtPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbmNvbnN0IHN0b3JlID0gcmVxdWlyZSgnLi9zdG9yZS5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0cHJvcHM6IFtcblx0XHQndGFzaycsXG5cdF0sXG5cdG1ldGhvZHM6IHtcblx0XHRmb3JtX3N1Ym1pdDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGlmICghdGhpcy50YXNrLm5hbWUpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRzdG9yZS5jb21taXQoJ2FkZCcpO1xuXHRcdH0sXG5cdH0sXG59O1xuPC9zY3JpcHQ+XG4iLCI8c3R5bGU+XG48L3N0eWxlPlxuXG48dGVtcGxhdGU+XG5cdDxsYWJlbCBjbGFzcz1cImxpc3QtZ3JvdXAtaXRlbVwiPlxuXHRcdDxzcGFuIHYtb246Y2xpY2sucHJldmVudD1cImVkaXRfY2xpY2tcIiBjbGFzcz1cInB1bGwtcmlnaHQgYnRuIGJ0bi1saW5rXCI+RWRpdDwvc3Bhbj5cblx0XHQ8aW5wdXQgdi1tb2RlbD1cInRhc2suZmluaXNoZWRcIiB0eXBlPVwiY2hlY2tib3hcIj5cblx0XHR7e3Rhc2submFtZX19XG5cdDwvbGFiZWw+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHByb3BzOiBbXG5cdFx0J3Rhc2snLFxuXHRdLFxuXHRtZXRob2RzOiB7XG5cdFx0ZWRpdF9jbGljazogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdC8vIHVwZGF0ZSBpZiBub3QgY2FuY2VsZWRcblx0XHRcdHZhciBuZXdOYW1lID0gd2luZG93LnByb21wdCgnVGFzayBOYW1lJywgdGhpcy50YXNrLm5hbWUpO1xuXHRcdFx0aWYgKHR5cGVvZiBuZXdOYW1lID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHR0aGlzLnRhc2submFtZSA9IG5ld05hbWU7XG5cdFx0XHR9XG5cdFx0fSxcblx0fSxcbn07XG48L3NjcmlwdD5cbiIsImNvbnN0IFZ1ZSA9IHJlcXVpcmUoJ3Z1ZScpO1xuY29uc3QgVnVleCA9IHJlcXVpcmUoJ3Z1ZXgnKTtcblZ1ZS51c2UoVnVleCk7XG5cbmNvbnN0IEFwcCA9IHJlcXVpcmUoJy4vQXBwLnZ1ZScpO1xuXG5uZXcgVnVlKHtcblx0ZWw6ICcjYXBwJyxcblx0cmVuZGVyOiBmdW5jdGlvbihjcmVhdGVFbGVtZW50KSB7XG5cdFx0cmV0dXJuIGNyZWF0ZUVsZW1lbnQoQXBwKTtcblx0fSxcbn0pO1xuIiwiY29uc3QgVnVleCA9IHJlcXVpcmUoJ3Z1ZXgnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVnVleC5TdG9yZSh7XG5cdHN0YXRlOiB7XG5cdFx0bmV3VGFzazogeyBmaW5pc2hlZDogZmFsc2UsIG5hbWU6ICcnIH0sXG5cdFx0dGFza3M6IFtcblx0XHRcdHsgZmluaXNoZWQ6IGZhbHNlLCBuYW1lOiAnQnV5IG1pbGsgMkwnIH0sXG5cdFx0XHR7IGZpbmlzaGVkOiBmYWxzZSwgbmFtZTogJ0NhbGwgdG8gQWxpY2UnIH0sXG5cdFx0XHR7IGZpbmlzaGVkOiBmYWxzZSwgbmFtZTogJ1JldHVybiBib29rcycgfSxcblx0XHRdLFxuXHR9LFxuXHRtdXRhdGlvbnM6IHtcblx0XHRhZGQ6IGZ1bmN0aW9uKHN0YXRlKSB7XG5cdFx0XHRzdGF0ZS50YXNrcy51bnNoaWZ0KHN0YXRlLm5ld1Rhc2spO1xuXHRcdFx0c3RhdGUubmV3VGFzayA9IHsgZmluaXNoZWQ6IGZhbHNlLCBuYW1lOiAnJyB9O1xuXHRcdH0sXG5cdH0sXG59KTtcbiJdfQ==
