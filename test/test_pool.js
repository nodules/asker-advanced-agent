var http = require('http'),
    mitm = require('mitm'),
    chai = require('chai'),
    AdvancedAgent = require('../');

var expect = chai.expect;

describe('Agent Pool', function() {
    before(function() {
        this.mitm = mitm();
    });

    after(function() {
        this.mitm.disable();
    });

    beforeEach(function() {
        // reset pools before each test
        Object.keys(AdvancedAgent.httpAgent.pool).forEach(function(agentName) {
            delete this.pool[agentName];
        }, AdvancedAgent.httpAgent);

        Object.keys(AdvancedAgent.httpsAgent.pool).forEach(function(agentName) {
            delete this.pool[agentName];
        }, AdvancedAgent.httpsAgent);
    });

    it('should create a new instance if no agent with passed name exists in the pool', function() {
        var agent1 = AdvancedAgent({ protocol: 'http:', name: 'agent' }),
            agent2 = AdvancedAgent({ protocol: 'http:', name: 'agent' }),
            agent3 = AdvancedAgent({ protocol: 'http:', name: 'newAgent' });

        expect(agent1).to.equal(agent2);
        expect(agent1).to.not.equal(agent3);
    });

    it('should remove free agents from pool', function(done) {
        const NUM_HTTP_CALLS = 4;

        var agent = AdvancedAgent({
                protocol: 'http:',
                name: 'agent1',
                maxSocket: 1
            }),
            reqOpts = {
                protocol: 'http:',
                host: 'example.org',
                agent: agent
            };

        var requestResolved = 0,
            socketRemoveEmitted = 0;

        agent.on('socketRemoved', function onSocketRemoved() {
            socketRemoveEmitted++;
        });

        this.mitm.on('request', function onTestRequest(req, res) {
            expect(AdvancedAgent.httpAgent.pool[agent.name]).not.to.be.undefined;

            res.statusCode = 501;
            res.end();
        });

        function onTestResponse() {
            if (++requestResolved === NUM_HTTP_CALLS) {
                setImmediate(onTestFinish);
            }
        }

        function onTestFinish() {
            expect(socketRemoveEmitted).to.equal(NUM_HTTP_CALLS,
                'socketRemoved emitted on each inappropriate response');
            expect(AdvancedAgent.httpAgent.pool[agent.name]).to.be.undefined;

            done();
        }

        function runHttp() {
            var req = http.request(reqOpts, function(res) {
                // @note: Node.js<0.12 doesn't abort inappropriate request automatically
                req.abort();
                onTestResponse(res);
            });
            req.end();
            return req;
        }

        for (var i = 0; i < NUM_HTTP_CALLS; i++) {
            runHttp();
        }
    });
});
