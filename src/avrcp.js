const dbus = require('dbus-native');
const MediaControl = require('./mediacontrol');

const TAG = "[AVRCP]"
const ADAPTER = 'hci0';

const bus = dbus.systemBus();

async function getPeripherals(bus, adapter) {
    if (!adapter) {
        adapter = ADAPTER;
    }

    return new Promise((resolve, reject) => {
        bus.invoke({
            destination: 'org.bluez',
            path: '/org/bluez/' + adapter,
            interface: 'org.freedesktop.DBus.Introspectable',
            member: 'Introspect',
        }, (err, obj) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(obj.nodes);
        });
    })
}

async function main() {
    const peripherals = await getPeripherals(bus);
    if (!peripherals || peripherals.length === 0) {
        console.warn(TAG, "No devices connected");
        return 0;
    }

    const peripheral = peripherals[0];
    const control = new MediaControl(bus, ADAPTER, peripheral);

    const result = await control.Play();
    console.log(TAG, result);
}

main();
