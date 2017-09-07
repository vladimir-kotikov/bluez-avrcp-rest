import { readBit, readBits } from "./binaryUtils";

function padLeft(str: string, expectedWidth: number, char: string = " ") {
    let result = str;
    while (result.length < expectedWidth) {
        result = char + result;
    }

    return result;
}
export class CanMessage {
    public extended: boolean = false;
    public rtr: boolean = false;
    public arbitrationId: number = 0;
    public ecuId: number = 0;
    public length: number = 0;
    public data: number[] = [];

    public static fromRawParcel(parcel: Buffer): CanMessage {
        let result = new CanMessage();

        const canExtByte = parcel.readUInt8(0);
        result.extended = readBit(7, canExtByte) === 1;
        result.rtr = readBit(7, canExtByte) === 1;

        result.length = parcel.readUInt8(1);

        const header = (parcel.readUInt16BE(2) << 16) | parcel.readUInt16BE(4);
        result.ecuId = readBits(0, 11, header);
        if (result.extended) {
            result.arbitrationId = readBits(12, 29, header);
        }

        for (let i = 0; i < result.length; i++) {
            result.data[i] = parcel.readUInt8(6 + i);
        }

        return result;
    }

    public dataAsHexString(): string {
        return this.data
            .map(byte => byte.toString(16))
            .map(repr => padLeft(repr, 2, "0"))
            .join(" ");
    }
}
