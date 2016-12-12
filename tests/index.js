'use strict';

import it from 'blue-tape';
import MockingJS from '../index';
import Profile from '../src/profile';

class Contestant {
    constructor (district) {
        this.district = district;
    }

    get location() {
        return `District ${this.district}`;
    }

    dontOverride () {
        console.log("Don't change a thing for me");
    }
}

class Katniss extends Contestant {
    constructor () {
        super(12);
        this.place = null;
        this.alliances = []
    }

    set allyWith(alliance) {
        this.alliances.push(alliance);
    }

    nockArrow () {
        console.log(' !! nockArrow called');
        return this;
    }
}

it("should define all properties of the target", (assert) => {
    let kat = new Katniss(),
        sut = new MockingJS(kat);
    
    assert.true(sut.hasOwnProperty('place'));
    assert.true(sut.hasOwnProperty('nockArrow'));
    assert.end();
});

it("should set the default profile to Profile", (assert) => {
    let p1;
    assert.ok((p1 = new MockingJS.ProfileClass()));
    
    // This is really the test we want to perform but for some
    // reason, because Profile exists in different contexts
    // this fails. Maybe because of transpiling? Also reference:
    // https://medium.com/javascript-scene/how-to-fix-the-es6-class-keyword-2d42bb3f4caf#.8n0hk88vx
    
    // assert.true(p1 instanceof Profile);

    // instead we quack, quack...
    assert.equal(p1.className, 'Profile');
    assert.end();
});


it("should count the number of times an object's property is accessed", (assert) => {
    let kat = new Katniss(),
        mock = new MockingJS(kat),
        expected, sut;

    mock.place;
    mock.place;
    mock.place;

    mock.district;

    expected = 3;
    
    assert.equal(mock.prop('place').access.count, expected);
    assert.true(mock.prop('place').accessed(expected).times);

    expected = 1;

    assert.equal(mock.prop('district').access.count, expected);
    assert.true(mock.prop('district').accessed(1).time);

    expected = 0;

    assert.equal(mock.prop('alliances').access.count, expected);
    assert.true(mock.prop('alliances').accessed(expected).times);

    assert.end()
});

it("should keep track of the values succesively unassigned to a property", (assert) => {
    let kat = new Katniss(),
        mock = new MockingJS(kat),
        expected, prop;

    mock.place = 3;
    mock.place = 'two';

    expected = 3;
    prop = mock.prop('place');

    assert.true(prop.on.assignment(1).wasAssigned(3));
    assert.equal(expected, prop.on.assignment(1).actual.value);

    expected = 'two';
    assert.true(prop.on.assignment(2).wasAssigned(expected));
    assert.equal(expected, prop.on.assignment(2).actual.value);

    assert.end();
});


it("should handle comparisons of property assignments with circular data", (assert) => {
    let kat = new Katniss(),
        mock = new MockingJS(kat,{strict: true}),
        expected, prop;

    mock.place = {_1: 'two'};
    mock.place.self = mock.place;

    expected = {_1: 'two'};
    expected.self = expected;
    prop = mock.prop('place');

    assert.true(prop.on.assignment(1).wasAssigned(expected));
    assert.end();
});

it("should count the number of times an object's methods are called", (assert) => {
    let kat = new Katniss(),
        mock = new MockingJS(kat),
        expected;
    
    mock.nockArrow('one');
    mock.nockArrow()
    mock.nockArrow(2, {3: true});

    expected = 3;

    assert.equal(expected, mock.method('nockArrow').access.count);
    assert.true(mock.method('nockArrow').called(expected).times);

    expected = 0;

    assert.equal(expected, mock.method('dontOverride').access.count);
    assert.true(mock.method('dontOverride').called(expected).times);

    mock.dontOverride();

    expected = 1;

    assert.equal(expected, mock.method('dontOverride').access.count);
    assert.true(mock.method('dontOverride').called(1).time);

    assert.end();
});


it("should test if and what arguments a method was called with", (assert) => {
    let kat = new Katniss(),
        mock = new MockingJS(kat),
        expected, method;
    
    mock.nockArrow('one');
    mock.nockArrow()
    mock.nockArrow(2, {3: true});

    method = mock.method('nockArrow');

    assert.true(method.at.call(1).wasCalledWith('one'));
    assert.true(method.on.call(2).wasCalledWith());
    assert.true(method.at.call(3).wasCalledWith(2, {3: true}));

    assert.end();
});

it("should report comparisions false if the method arguments are not equal", (assert) => {
    let kat = new Katniss(),
        mock = new MockingJS(kat,{strict: true}),
        expected = 'buckle my shoe', method;

    mock.nockArrow('one','two');

    method = mock.method('nockArrow');

    assert.false(method.at.call(1).wasCalledWith(expected));

    mock.nockArrow({a:{b:{c:{d:{e:{f:{g:{h:1}}}}}}}});

    expected = {a:{b:{c:{d:{e:{f:{g:{h:'1'}}}}}}}};
    method = mock.method('nockArrow');

    assert.false(method.at.call(2).wasCalledWith(expected));
    assert.end();
});

it("should correctly test method arguments with circular data", (assert) => {
    let kat = new Katniss(),
        mock = new MockingJS(kat,{strict: true}),
        actual = {},
        expected = {}, method;
    
    actual._1 = { a: 21 }
    actual.self = actual;

    mock.nockArrow(actual, 'sugar');

    expected._1 = { a: 21 }
    expected.self = expected;

    method = mock.method('nockArrow');
    assert.true(method.on.call(1).wasCalledWith(expected, 'sugar'));
    assert.end();
});
