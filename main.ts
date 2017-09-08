import { CanMessage } from "./src/can/CanMessage";
import { VehicleService } from "./src/VehicleService";
import { BluetoothService } from "./src/BluetoothService";

const VEHICLE_DEFAULT_PORT: { [platform: string]: string } = {
    win32: "COM3",
    darwin: "/dev/cu.SLAB_USBtoUART",
    linux: "/dev/ttyUSB0",
};

const v = new VehicleService(VEHICLE_DEFAULT_PORT[process.platform]).connect();
const b = new BluetoothService();
b.registerAgent();

enum ButtonStatus {
    RELEASED,
    PRESSED
}

let arrowUp: ButtonStatus = 0;
let arrowDown: ButtonStatus = 0;

v.on("message", (message: CanMessage) => {
    // 0x175 is ecuId of CIM module
    if (!message.extended && message.ecuId === 0x175) {
        if (message.data[5] === 0) {
            // all buttons released
            if (arrowUp === ButtonStatus.PRESSED) {
                // Was pressed, now released - handle as a single press
                b.next();
            }

            if (arrowDown === ButtonStatus.PRESSED) {
                // Was pressed, now released - handle as a single press
                b.prev();
            }

            arrowUp = ButtonStatus.RELEASED;
            arrowDown = ButtonStatus.RELEASED;
        }

        if (message.data[5] === 4) {
            // arrow up pressed
            if (arrowUp === ButtonStatus.PRESSED) {
                // Was pressed, still pressed - handle as holded
                b.fastFwd();
            }
        }
        if (message.data[5] === 5) {
            // arrow down pressed
            if (arrowDown === ButtonStatus.PRESSED) {
                // Was pressed, still pressed - handle as holded
                b.rewind();
            }
        }
    }
});
