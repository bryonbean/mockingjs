'use strict';

import assert from 'assert';
import Profile from './src/profile';

class MockingJS {
    constructor (target, opts = {}) {
        this.track = {}; // where profile information is kept
        this.strict = opts.strict; // strict comparison setting
        this._propertyCache = [];

        MockingJS
            .getReflectionProperties(target)
            .forEach((prop) => {
                
                let isMethod = target[prop] instanceof Function,
                    descriptor = Object.getOwnPropertyDescriptor(target, prop),
                    _prop = `_${prop}`;

                this[_prop] = target[prop];
                this._propertyCache.push(prop);

                if (descriptor) {
                    descriptor.set = function (value) {
                        if (!this.track[prop]) {
                            this.track[prop] = {
                                count: 0,
                                values: [],
                            }
                        }
                        this.track[prop].values.push(value);
                        this[_prop] = value;
                    }

                    descriptor.get = function () {
                        if (!this.track[prop]) {
                            this.track[prop] = {
                                count: 0,
                                values: [],
                            }
                        }
                        this.track[prop].count += 1;
                        return this[_prop];
                    }

                    delete descriptor.writable;
                    delete descriptor.value;

                    Object.defineProperty(this, prop, descriptor);
                } else if (isMethod && prop !== 'constructor') {
                    let profile = 
                        this.track[prop] = {
                            count: 0,
                            withArgs: [],
                            returnValues: []
                        }
                    
                    this[prop] = function () {
                        let value = profile.returnValues[profile.count];
                        profile.count += 1;
                        profile.withArgs.push([...arguments]);
                        return value;
                    };
                }
            });
    }

    hasProp (prop) {
        let hasProp = this._propertyCache.indexOf(prop);
        return !!++hasProp;
    }

    method (prop) {
        if (this.hasOwnProperty(prop) && typeof this[prop] === 'function') {
            const tracker = this.track[prop];
            return this._createProfileInstance(tracker);
        }

        throw new Error('Property does not exist or is not a method');
    }

    prop (prop) {
        if (this.hasProp(prop)) {
            const tracker = this.track[prop];
            return this._createProfileInstance(tracker);
        }

        throw new Error('Property does not exist');
    }

    _createProfileInstance (tracker = {}) {
        return Object.create(MockingJS.ProfileClass.prototype,{
            profile: { value: tracker },
            strict: { value: this.strict }
        });
    }
}

MockingJS.ProfileClass = Profile;
MockingJS.setProfileClass = function (ProfileClass) {
    MockingJS.ProfileClass = ProfileClass;
}

MockingJS.getReflectionProperties = function (o) {
    // http://stackoverflow.com/a/31055217/1373710
    var props = [];

    do {
        if (o.isPrototypeOf(Object)) break;
        props = props.concat(Object.getOwnPropertyNames(o));
    } while(o = Object.getPrototypeOf(o));

    return props;    
}

module.exports = MockingJS;