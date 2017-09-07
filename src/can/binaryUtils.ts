
export function readBits(startBit: number, endBit: number, value: number) {
    let mask = 0;
    for (let i = startBit; i <= endBit; i++) {
        mask |= 1 << i;
    }

    return (value & mask) >> startBit;
}

export function readBit(bitNo: number, value: number) {
    return readBits(bitNo, bitNo, value);
}
