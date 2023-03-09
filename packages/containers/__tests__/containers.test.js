'use strict';

const containers = require('..');
const assert = require('assert').strict;

assert.strictEqual(containers(), 'Hello from containers');
console.info('containers tests passed');
