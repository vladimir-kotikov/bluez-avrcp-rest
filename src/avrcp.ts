import * as dbus from "dbus-native";
import { MediaControl } from "./bluez/MediaControl";

const TAG = "[AVRCP]"
const ADAPTER = "hci0";

const systemBus = dbus.systemBus();

async function getPeripherals(bus: any, adapter: string = ADAPTER): Promise<string[] | undefined> {
    return new Promise<string[]>((resolve, reject) => {
        bus.invoke({
            destination: "org.bluez",
            path: "/org/bluez/" + adapter,
            interface: "org.freedesktop.DBus.Introspectable",
            member: "Introspect",
        }, (err: any, obj: { nodes?: string[] }) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(obj.nodes);
        });
    })
}

async function main() {
    const peripherals = await getPeripherals(systemBus, ADAPTER);
    if (!peripherals || peripherals.length === 0) {
        console.warn(TAG, "No devices connected");
        return 0;
    }

    const peripheral = peripherals[0];
    const control = new MediaControl(systemBus, ADAPTER, peripheral);

    const result = await control.Play();
    console.log(TAG, result);
}

main().then(res => process.exit(res));