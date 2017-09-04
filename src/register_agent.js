const dbus = require('dbus-native');
const Agent = require('./agent');

const TAG = "[REGSVC]"
const AGENT_PATH = '/io/github/vlkoti/bthagent';
const AGENT_NAME = 'io.github.vlkoti.bthagent';
const AGENT_CAPABILITY = 'NoInputNoOutput';

const bus = dbus.systemBus();
const bluez = bus.getService('org.bluez');

bus.requestName(AGENT_NAME, 0, () => {
    bus.exportInterface(Agent.AgenImpl, AGENT_PATH, Agent.AgentIface);

    bluez.getInterface("/org/bluez", "org.bluez.AgentManager1", (err, agentManager) => {
        if (err) {
            console.error(TAG, err);
            return;
        }

        agentManager.RegisterAgent(AGENT_PATH, AGENT_CAPABILITY, (err) => {
            agentManager.RequestDefaultAgent(AGENT_PATH, (err, res) => {
                console.log(TAG, "Agent registered");
            });
        });
    });
});
