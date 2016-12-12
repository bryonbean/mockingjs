'use strict';

import assert from 'assert';

/* Class: Profile
 * 
 * Usage:
 * const propTracker = {count: 2, values: ['some-value','another-value']};
 * const propProfile = new Profile(propTracker, true);
 * 
 * assert.true(propProfile.at.assignment(1).wasAssigned('some-value')); // passes
 * assert.false(propProfile.at.assignment(2).wasAssigned('some-value')); // passes
 * assert.true(propProfile.on.assignment(2).wasAssigned('another-value')); // passes
 * 
 * const methTracker = { count: 3, withArgs: [['breaker 10-4'],[],[33, {a:{b:{c:{d:2}}}}]] };
 * const methProfile = new Profile(methTracker, false);
 * 
 * assert.true(methProfile.at.call(1).calledWith('breaker 10-4')); //passes
 * assert.true(methProfile.on.call(2).calledWithoutArgs); //passes
 * assert.true(methProfile.on.call(3).calledWith(33, {a:{b:{c:{d:"2"}}}})); // passes
 * methProfile.strict = true;
 * assert.true(methProfile.on.call(3).calledWith(33, {a:{b:{c:{d:"2"}}}})); // fails
 * */
export default class Profile {
    /* Represents a profile
     * 
     * @constructor
     * @param {Object} profile - the profile of the mocked object
     * @param {Boolean} strict - flag indicating strict equality in comparisons
     * @returns {Profile}
     * 
     * */
    constructor (profile = {}, strict = false) {
        this.profile = profile;
        this.strict = strict;
    }

    /* Getter: access
     * returns an object with a count parameter indicating
     * the number of times a property was accessed.
     * 
     * @returns {Object}
     * 
     * */
    get access () {
        return {count: this.profile.count || 0};
    }

    /* Method: accessed
     * Accepts `n' as a parameter and returns an object with 
     * the properties time and times both equal to true if
     * this.access.count equals `n' or false if the count is
     * not equal to `n'.
     * 
     * @param {Number} n - the number to compare against the count
     * @returns {Boolean}
     * 
     * */
    accessed (n) {
        let accessed = {},
            result = (this.access.count === n);
        accessed.times = accessed.time = result;
        return accessed;
    }

    /* Method: assignment
     * Accepts `n' as the parameter and returns an object with
     * the properties wasAssigned, value and actual.value 
     * (value and actual.value are equal and provided for the
     * purpose of preferred symantics over the other). The
     * property wasAssigned is a method that returns the a 
     * boolean indicating if its arguments compared to that of 
     * the cached values at index `n' are equal. comparisons
     * will be made according to the Profile.strict setting.
     * 
     * @param {Number} n - the index of the cached arguments
     * @returns {Object}
     * 
     * */
    assignment (n) {
        const value = this.profile.values[n-1],
              wasAssigned = (value) => {
                let a1 = this.profile.values[n-1];
                return this.equals(value, a1);
            };

        return {
            wasAssigned: wasAssigned,
            value: value,
            actual: { value: value }
        }
    }

    /* Getter: at
     * Returns the symantically appropriate object for either
     * a method or property. Methods are returned an object
     * with a call property while properties are returned
     * an object with an assignment property.
     * 
     * @returns {Object}
     * */
    get at () {
        // the withArgs property indicates the profiled  
        // property is a method, quack, quack.
        if (this.profile.withArgs) {
            return {call: this.call.bind(this) }
        } else {
            return {assignment: this.assignment.bind(this)}
        }
    }

    /* Method: call
     * Accepts the `n' argument indicating the nth time that the
     * method was called and returns an object with the properties
     * wasCalledwith and calledWithoutArgs. The wasCalledWith
     * property is a method that accepts arguments to compare with
     * the cached during the nth call of the mocked or stubbed 
     * method. The calledWithoutArgs property is a boolean indicating
     * true if the method was called without arguments.
     * 
     * @param {Number} n - The nth time the method was called
     * @returns {Object}
     *  
     * */
    call (n) {
        const args = this.profile.withArgs[n-1],
              calledWithoutArgs = args.length === 0,
              wasCalledWith = function () {
                  let a1 = [...arguments];
                  return this.equals(args, a1);
              }.bind(this);
        
        return {
            wasCalledWith: wasCalledWith,
            calledWithoutArgs: calledWithoutArgs 
        }
    }

    /* Method: called
     * Alias for accessed method
     * 
     * @param {Number} n - the number to compare against the execution count
     * @returns {Object}
     * */
    called (n) {
        return this.accessed(n);
    }

    /* Getter: className
     * Returns the string value of the class name
     * 
     * @returns {String}
     * */
    get className () {
        return "Profile";
    }

    /* Method: equals
     * Given two arguments this method compares them and returns a boolean
     * indicating whether or not the arguments are equal.
     * 
     * @param {*} a 
     * @param {*} b
     * @returns {Boolean}
     * */
    equals (a, b) {
        const cmp = this.strict? assert.deepStrictEqual : assert.deepEqual;
        try {
            cmp(a, b);
        } catch(error) {
            if (error.name = 'AssertionError') {
                return false;
            }
            throw error;
        }
        return true;
    }

    /* Getter: on
     * Alias for at
     * 
     * @return {Object}
     * */
    get on () {
        return this.at;
    }
}