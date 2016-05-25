// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var utilities = require('../src/utilities'),
    expect = require('chai').expect;

describe('utilities', function () {
    describe('caseInsensitiveProperty', function () {
        var target = {
            'AbC': 'AbC',
            'abC': 'abC',
            'Undef': undefined,
            'undef': 'undef'
        };

        it('finds first case insensitive match from object', function () {
            expect(utilities.caseInsensitiveProperty(target, 'abc')).to.equal('AbC');
            expect(utilities.caseInsensitiveProperty(target, 'undef')).to.be.undefined;
        });

        it('returns undefined if no match is found', function () {
            expect(utilities.caseInsensitiveProperty(target, 'abcd')).to.be.undefined;
        });
    });
});
