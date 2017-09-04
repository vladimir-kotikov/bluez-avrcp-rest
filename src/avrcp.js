const dbus = require('dbus-native');

const bus = dbus.systemBus();
bus.getInterface("/org/bluez", "org.bluez", "org.freedesktop.DBus.Introspectable",
    introspectable => {
        introspectable.Introspect();
    });

