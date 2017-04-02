
import DBus from 'dbus';

// const BLUEZ_SERVICE_NAME = 'org.bluez';
// const BLUEZ_ROOT_OBJECT = '/org/bluez';
// const INTROSPECTABLE = 'org.freedesktop.DBus.Introspectable';
// const INTROSPECTABLE_INTROSPECT = 'org.freedesktop.DBus.Introspectable.Introspect';

// let systemBus = DBus.getBus('system');
// systemBus.getInterface(BLUEZ_SERVICE_NAME, BLUEZ_ROOT_OBJECT)

const systemBus = DBus.getBus('system');
systemBus.getInterface<dbus.Introspectable>(
    'org.bluez',
    '/org/bluez/hci0/dev_98_01_A7_AE_52_5C',
    'org.freedesktop.DBus.Introspectable',
    (err, iface) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        iface.Introspect(null, { timeout: 1000 }, (err, result) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }

            console.log(result);
        });
    });

