import * as path from "path";
import * as Serial from "serialport";

import { CanMessage } from "../src/CanMessage";
import { FilterCollection } from "../src/FiltersCollection";

const TAG = "[main]";
const DEBUG = process.argv.indexOf("--debug") >= 2;
const FILTER_FILE = path.resolve("./.canfilters");
const DEFAULT_PORT: { [platform: string]: string } = {
    win32: "COM3",
    darwin: "/dev/cu.SLAB_USBtoUART",
    linux: "/dev/ttyUSB0",
};

const filters = new FilterCollection(FILTER_FILE);
const serial = new Serial(DEFAULT_PORT[process.platform], {
    baudRate: 57600,
    autoOpen: true
});

serial.on("open", () => console.log(TAG, "Port is opened"));
serial.on("error", err => console.error(err));
serial.on("data", (data: Buffer) => {
    if (DEBUG) {
        console.log(TAG, "Raw parcel", data.toString("hex"));
        console.log(TAG, `LEN: ${data.readUInt16BE(0)} IDH: ${data.readUInt16BE(2)} IDL: ${data.readUInt16BE(4)}`);
    }

    const message = CanMessage.fromRawParcel(data);
    if (!filters.passes(message)) {
        return;
    }

    let str = `EcuID: ${message.ecuId.toString(16)} : ${message.dataAsHexString()}`;

    if (message.extended) {
        str += " EXT: 1"
    }

    if (message.rtr) {
        str += " RTR: 1"
    }

    console.log(str);
});
