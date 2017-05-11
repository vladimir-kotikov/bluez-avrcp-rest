const DBus = require("dbus");

const AGENT_PATH = '/io/github/vlkoti/bthpairer';
const AGENT_CAPABILITY = 'KeyboardDisplay';

let pairingService = DBus.registerService('system', 'io.github.vlkoti.bthpairer');
let paringServiceObj = pairingService.createObject(AGENT_PATH);
let pairingServiceImpl = paringServiceObj.createInterface('org.bluez.Agent1');

// See https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/test/simple-agent
// for reference implementation in Python
(() => {
    pairingServiceImpl.addMethod('Release', {}, (callback) => {
        // Not implemented
        callback();
    });

    pairingServiceImpl.addMethod('AuthorizeService', {
        in: [DBus.Define(String), DBus.Define(String)]
    }, (device, uuid, callback) => {
        // Not implemented
        console.log('AuthorizeService', device, uuid);
        callback();
    });

    // @dbus.service.method(AGENT_INTERFACE, in_signature = "o", out_signature = "s")
    // def RequestPinCode(self, device):
    pairingServiceImpl.addMethod('RequestPinCode', {
        in: [DBus.Define(String)],
        out: DBus.Define(String)
    }, (device, callback) => {
        // Not implemented
        console.log('RequestPinCode', device);
        callback('1234');
    });

    // @dbus.service.method(AGENT_INTERFACE, in_signature = "o", out_signature = "u")
    // def RequestPasskey(self, device):
    pairingServiceImpl.addMethod('RequestPasskey', {
        in: [DBus.Define(String)],
        out: DBus.Define(Number)
    }, (device, callback) => {
        // Not implemented
        console.log('RequestPasskey', device);
        callback(1234);
    });

    // @dbus.service.method(AGENT_INTERFACE, in_signature = "ouq", out_signature = "")
    // def DisplayPasskey(self, device, passkey, entered):
    pairingServiceImpl.addMethod('DisplayPasskey', {
        in: [DBus.Define(String), DBus.Define(Number), DBus.Define(Number)]
    }, (device, passkey, entered, callback) => {
        // Not implemented
        console.log('DisplayPasskey', device, passkey, entered);
        callback();
    });

    // @dbus.service.method(AGENT_INTERFACE, in_signature = "os", out_signature = "")
    // def DisplayPinCode(self, device, pincode):
    pairingServiceImpl.addMethod('DisplayPinCode', {
        in: [DBus.Define(String), DBus.Define(String)]
    }, (device, pincode, callback) => {
        // Not implemented
        console.log('DisplayPinCode', device, pincode);
        callback();
    });

    // @dbus.service.method(AGENT_INTERFACE, in_signature = "ou", out_signature = "")
    // def RequestConfirmation(self, device, passkey):
    pairingServiceImpl.addMethod('RequestConfirmation', {
        in: [DBus.Define(String), DBus.Define(Number)]
    }, (device, passkey, callback) => {
        // Not implemented
        console.log('RequestConfirmation', device, passkey);
        callback();
    });

    // @dbus.service.method(AGENT_INTERFACE, in_signature = "o", out_signature = "")
    // def RequestAuthorization(self, device):
    pairingServiceImpl.addMethod('RequestAuthorization', {
        in: [DBus.Define(String)]
    }, (device, callback) => {
        // Not implemented
        console.log('RequestAuthorization', device);
        callback();
    });

    // @dbus.service.method(AGENT_INTERFACE, in_signature = "", out_signature = "")
    // def Cancel(self):
    pairingServiceImpl.addMethod('Cancel', {}, (callback) => {
        // Not implemented
        console.log('Cancel');
        callback();
    });

    pairingServiceImpl.update();

})()

const systemBus = DBus.getBus('system');
let bluez = systemBus.getInterface('org.bluez', '/org/bluez', 'org.bluez.AgentManager1', (err, agentManager) => {
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
