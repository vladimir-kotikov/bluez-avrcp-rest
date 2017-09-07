import { EventEmitter } from "events";
import * as Serial from "serialport";

import { CanMessage } from "../src/can/CanMessage";

const TAG = "[VHCL]";
const DEBUG = process.argv.indexOf("--debug") >= 2;

export class VehicleService extends EventEmitter {
    // Maximum pause to wait for before attempting to reconnect, in seconds
    private static MAX_RECONNECT_INTERVAL: number = 30;
    private reconnectAttempt: number = 0;
    private serial: Serial;

    constructor(port: string) {
        super();

        this.serial = new Serial(port, { baudRate: 57600 });

        this.serial.on("open", () => console.log(TAG, `Vehicle connected on ${port}`));
        this.serial.on("data", (data: Buffer) => {
            if (DEBUG) {
                console.log(TAG, "Raw parcel", data.toString("hex"));
            }

            const message = CanMessage.fromRawParcel(data);
            this.emit("message", message);
        });

        this.serial.on("error", err => {
            console.error(TAG, err);
            this.recover();
        });
    }

    public connect(): this {
        if (this.serial.isOpen()) {
            console.error(TAG, "Vehicle already connected");
            return this;
        }

        this.serial.open();
        return this;
    }

    private recover() {
        let reconnectInterval = 2 ** this.reconnectAttempt;
        if (reconnectInterval > VehicleService.MAX_RECONNECT_INTERVAL) {
            reconnectInterval = VehicleService.MAX_RECONNECT_INTERVAL
        }

        console.warn(TAG, `Attempting reconnect in ${reconnectInterval} seconds`);
        ++this.reconnectAttempt

        setTimeout(() => {
            this.connect();
        }, reconnectInterval * 1000);
    }
}





