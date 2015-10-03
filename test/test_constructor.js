var http = require('http'),
    https = require('https'),
    chai = require('chai'),
    AdvancedAgent = require('../');

var expect = chai.expect;

describe('Agent Constructor', function() {
    it('should return globalAgent for http if no name passed', function() {
        var agent = AdvancedAgent({ protocol: 'http:' });
        expect(agent).to.equal(http.globalAgent);
    });

    it('should return globalAgent for http if name is "globalAgent"', function() {
        var agent = AdvancedAgent({ protocol: 'http:', name: 'globalAgent' });
        expect(agent).to.equal(http.globalAgent);
    });

    it('should return globalAgent for https if no name passed', function() {
        var agent = AdvancedAgent({ protocol: 'https:' });
        expect(agent).to.equal(https.globalAgent);
    });

    it('should return globalAgent for https if name is "globalAgent"', function() {
        var agent = AdvancedAgent({ protocol: 'https:', name: 'globalAgent' });
        expect(agent).to.equal(https.globalAgent);
    });

    it('should return instance of Advanced httpAgent for https if name passed', function() {
        var agent = AdvancedAgent({ protocol: 'http:', name: 'agent1' });
        expect(agent).to.be.instanceof(AdvancedAgent.httpAgent);
        expect(agent).to.be.instanceof(http.Agent);
    });

    it('should return instance of Advanced httpsAgent for https if name passed', function() {
        var agent = AdvancedAgent({ protocol: 'https:', name: 'agent1' });
        expect(agent).to.be.instanceof(AdvancedAgent.httpsAgent);
        expect(agent).to.be.instanceof(https.Agent);
    });
});
