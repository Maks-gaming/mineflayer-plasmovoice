export default class Utils {
    static uuidStrToSigBits(uuid: string) {
        const parts = uuid.split("-").map((p) => `0x${p}`);
        if (parts.length !== 5) throw new Error(`Invalid UUID string: '${uuid}'`);
      
        return {
            mostSignificantBits: (BigInt(parts[0]) << 32n) | (BigInt(parts[1]) << 16n) | BigInt(parts[2]),
            lessSignificantBits: (BigInt(parts[3]) << 48n) | BigInt(parts[4])
        };
      }
}