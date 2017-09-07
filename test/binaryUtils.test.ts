import * as assert from "assert";
import { readBit, readBits } from "../src/can/binaryUtils";

describe("Binary operations", () => {
    it("Should be able to take first bit of number", () => {
        assert.equal(readBits(0, 0, 0b1), 0b1);
    });

    it("Should be able to take arbitrary bit of number", () => {
        assert.equal(readBits(1, 1, 0b10), 0b1);
        assert.equal(readBits(13, 13, 0xc000), 0);
        assert.equal(readBits(14, 14, 0xc000), 1);
        assert.equal(readBits(15, 15, 0xc000), 1);
        assert.equal(readBit(1, 0b10), 0b1);
    });

    it("Should be able to read a sequence of bits", () => {
        assert.equal(readBits(0, 1, 0b110), 0b10);
        assert.equal(readBits(4, 7, 0b00000110), 0);
    });
});



