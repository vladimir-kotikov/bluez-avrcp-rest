import * as assert from "assert";
import { CanMessage } from "../src/can/CanMessage";
import { ChangingFilter } from "../src/can/filters/ChangingFilter";

const parcels = [
    CanMessage.fromRawParcel(Buffer.from([0x31, 0x01, 0x00, 0x00, 0x06, 0x25, 0x01])),
    CanMessage.fromRawParcel(Buffer.from([0x31, 0x01, 0x00, 0x00, 0x06, 0x25, 0x08])),
]

describe("ChangingFilter", () => {
    let f: ChangingFilter;
    const c = console.log;

    beforeEach(() => {
        console.log = () => { };
        f = new ChangingFilter();
        console.log = c;
    });

    it("Should filter out the same message appeared twice", () => {
        assert(f.passes(parcels[0]));
        assert(!f.passes(parcels[0])); // should not pass second time
    });

    it("Should not filter out the message with the same id but different content", () => {
        assert(f.passes(parcels[0]));
        assert(f.passes(parcels[1]));
    });

    it("Should reset filter for the first match after second match appears", () => {
        assert(f.passes(parcels[0]));
        assert(f.passes(parcels[1]));
        assert(f.passes(parcels[0]));
    });
});
