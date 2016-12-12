(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// import Proxy from 'node-proxy';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _forwardingHandler = require('./src/forwarding-handler');

var _forwardingHandler2 = _interopRequireDefault(_forwardingHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MockingJS = function () {

    // From: Harmony Proxies: Tutorial 
    // http://soft.vub.ac.be/~tvcutsem/proxies/
    // © 2010 Tom Van Cutsem
    // Creative Commons Attribution-ShareAlike 2.5 General License 
    function MockingJS(target) {
        var _this = this,
            _arguments = arguments;

        _classCallCheck(this, MockingJS);

        this.target = target;
        this.forwarder = new _forwardingHandler2.default(target);
        this.count = Object.create(null);
        this.args = {};

        this.forwarder.get = function (rcvr, name) {
            var idx = _this.count[name] = (_this.count[name] || 0) + 1;

            if (typeof _this.target[name] === 'function') {
                if (!_this.args[name]) {
                    _this.args[name] = [];
                }
                _this.args[name][idx] = [].concat(Array.prototype.slice.call(_arguments));
            }

            return _this.target[name];
        };
    }

    _createClass(MockingJS, [{
        key: 'getMock',
        value: function getMock() {
            return Proxy.create(this.forwarder, Object.getPrototypeOf(this.target));
        }
    }, {
        key: 'getCount',
        value: function getCount(property) {
            return property ? this.count[property] : this.count;
        }
    }, {
        key: 'getArgumentsAt',
        value: function getArgumentsAt(name, idx) {
            return this.args[name] ? this.args[name][idx] : undefined;
        }
    }]);

    return MockingJS;
}();

exports.default = MockingJS;


window.MockingJS = MockingJS;

},{"./src/forwarding-handler":2}],2:[function(require,module,exports){
// Copyright (C) 2010-2011 Software Languages Lab, Vrije Universiteit Brussel
// This code is dual-licensed under both the Apache License and the MPL

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is a default forwarding handler for Harmony Proxies.
 *
 * The Initial Developer of the Original Code is
 * Tom Van Cutsem, Vrije Universiteit Brussel.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 */

// A no-op forwarding Proxy Handler
// based on the draft version for standardization:
// http://wiki.ecmascript.org/doku.php?id=harmony:proxy_defaulthandler
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function ForwardingHandler(target) {
  this.target = target;
}

ForwardingHandler.prototype = {
  // Object.getOwnPropertyDescriptor(proxy, name) -> pd | undefined
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(name) {
    var desc = Object.getOwnPropertyDescriptor(this.target, name);
    //TODO(tvcutsem): not required when using FixedHandler
    //if (desc !== undefined) { desc.configurable = true; }
    return desc;
  },

  // Object.getPropertyDescriptor(proxy, name) -> pd | undefined
  getPropertyDescriptor: function getPropertyDescriptor(name) {
    // Note: this function does not exist in ES5
    // var desc = Object.getPropertyDescriptor(this.target, name);
    // fall back on manual prototype-chain-walk:
    var desc = Object.getOwnPropertyDescriptor(this.target, name);
    var parent = Object.getPrototypeOf(this.target);
    while (desc === undefined && parent !== null) {
      desc = Object.getOwnPropertyDescriptor(parent, name);
      parent = Object.getPrototypeOf(parent);
    }
    //TODO(tvcutsem): not required when using FixedHandler
    //if (desc !== undefined) { desc.configurable = true; }
    return desc;
  },

  // Object.getOwnPropertyNames(proxy) -> [ string ]
  getOwnPropertyNames: function getOwnPropertyNames() {
    return Object.getOwnPropertyNames(this.target);
  },

  // Object.getPropertyNames(proxy) -> [ string ]
  getPropertyNames: function getPropertyNames() {
    // Note: this function does not exist in ES5
    // return Object.getPropertyNames(this.target);
    // fall back on manual prototype-chain-walk:
    var props = Object.getOwnPropertyNames(this.target);
    var parent = Object.getPrototypeOf(this.target);
    while (parent !== null) {
      props = props.concat(Object.getOwnPropertyNames(parent));
      parent = Object.getPrototypeOf(parent);
    }
    // FIXME: remove duplicates from props
    // sketch:
    //   var aggregate = Object.create(null);
    //   for (var p in props) { aggregate[p] = true; }
    //   return Object.getOwnPropertyNames(aggregate);
    return props;
  },

  // Object.defineProperty(proxy, name, pd) -> boolean
  defineProperty: function defineProperty(name, desc) {
    Object.defineProperty(this.target, name, desc);
    return true;
  },

  // delete proxy[name] -> boolean
  'delete': function _delete(name) {
    return delete this.target[name];
  },

  // Object.{freeze|seal|preventExtensions}(proxy) -> proxy
  fix: function fix() {
    // As long as target is not frozen, the proxy won't allow itself to be fixed
    if (!Object.isFrozen(this.target)) return undefined;
    var props = {};
    var handler = this;
    Object.getOwnPropertyNames(this.target).forEach(function (name) {
      var desc = Object.getOwnPropertyDescriptor(handler.target, name);
      // turn descriptor into a trapping accessor property
      props[name] = {
        get: function get() {
          return handler.get(this, name);
        },
        set: function set(v) {
          return handler.set(this, name, v);
        },
        enumerable: desc.enumerable,
        configurable: desc.configurable
      };
    });
    return props;
  },

  // name in proxy -> boolean
  has: function has(name) {
    return name in this.target;
  },

  // ({}).hasOwnProperty.call(proxy, name) -> boolean
  hasOwn: function hasOwn(name) {
    return {}.hasOwnProperty.call(this.target, name);
  },

  // proxy[name] -> any
  get: function get(receiver, name) {
    return this.target[name];
  },

  // proxy[name] = val -> val
  set: function set(receiver, name, val) {
    this.target[name] = val;
    // bad behavior when set fails in non-strict mode
    return true;
  },

  // for (var name in Object.create(proxy)) { ... }
  enumerate: function enumerate() {
    var result = [];
    for (var name in this.target) {
      result.push(name);
    };
    return result;
  },

  // for (var name in proxy) { ... }
  // Note: non-standard trap
  iterate: function iterate() {
    var props = this.enumerate();
    var i = 0;
    return {
      next: function next() {
        if (i === props.length) throw StopIteration;
        return props[i++];
      }
    };
  },

  // Object.keys(proxy) -> [ string ]
  keys: function keys() {
    return Object.keys(this.target);
  }
};

// monkey-patch Proxy.Handler if it's not defined yet
if ((typeof Proxy === "undefined" ? "undefined" : _typeof(Proxy)) === "object" && !Proxy.Handler) {
  Proxy.Handler = ForwardingHandler;
}

exports.default = ForwardingHandler;

},{}]},{},[1]);
