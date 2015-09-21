var http = require('http'),
    https = require('https'),
    util = require('util');

function agentFactory(BaseAgent) {
    function Agent(options) {
        BaseAgent.call(this, options);
        this.agentName = options.name;
    }

    util.inherits(Agent, BaseAgent);

    Agent.prototype.removeSocket = function() {
        var res = Agent.super_.prototype.removeSocket.apply(this, arguments);

        if (Object.keys(this.requests).length === 0 && Object.keys(this.sockets).length === 0) {
            delete Agent.pool[this.agentName];
        }

        this.emit('socketRemoved');

        return res;
    };

    Agent.pool = {};

    Agent.factory = function(options) {
        if ( ! this.pool[options.name]) {
            this.pool[options.name] = new Agent(options);
        }
        return this.pool[options.name];
    };

    return Agent;
}

exports = module.exports = AdvancedAgent;

exports.httpAgent = agentFactory(http.Agent);
exports.httpsAgent = agentFactory(https.Agent);

/**
 * @param {Object} options
 * @param {String} [options.name]
 * @param {String} options.protocol
 * @param {Number} options.maxSocket
 * @constructor
 */
function AdvancedAgent(options) {
    var protocol = options.protocol;

    if (protocol[protocol.length - 1] === ':') {
        protocol = protocol.substring(0, protocol.length - 1);
    }

    if ( ! options.name || options.name === 'globalAgent') {
        return protocol === 'https' ? https.globalAgent : http.globalAgent;
    } else {
        var agentCls = protocol === 'https' ? exports.httpsAgent : exports.httpAgent;
        return agentCls.factory(options);
    }
}
