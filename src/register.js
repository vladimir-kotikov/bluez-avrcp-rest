const DBus = require("dbus");

const AGENT_PATH = '/io/github/vlkoti/bthpairer';
const AGENT_CAPABILITY = 'DisplayYesNo';

const systemBus = DBus.getBus('system');
systemBus.getInterface('org.bluez',
    '/org/bluez', 'org.bluez.AgentManager1', (err, agentManager) => {

        if (err) {
            throw err;
        }

        console.log('org.bluez', '/org/bluez', 'org.bluez.AgentManager1');
        agentManager.RegisterAgent(AGENT_PATH, AGENT_CAPABILITY, (err, result) => {
            if (err) {
                // throw err;
                console.error(err);
            }

            console.log('agentManager.RegisterAgent', AGENT_PATH, AGENT_CAPABILITY, result);
            agentManager.RequestDefaultAgent(AGENT_PATH, (err, result) => {
                if (err) {
                    // throw err;
                    console.error(err);
                }

                console.log('agentManager.RequestDefaultAgent', AGENT_PATH, result);
            });
        });
    });
