// Types
import { Bot } from "mineflayer";
import { debug } from "./PlasmoVoice";

export default class Utils {
    static uuidStrToSigBits(uuid: string): UUID {
        const parts = uuid.split("-").map((p) => `0x${p}`);
        if (parts.length !== 5) throw new Error(`Invalid UUID string: '${uuid}'`);
        
        return {
            mostSignificantBits: (BigInt(parts[0]) << 32n) | (BigInt(parts[1]) << 16n) | BigInt(parts[2]),
            lessSignificantBits: (BigInt(parts[3]) << 48n) | BigInt(parts[4])
        };
    }

    static uuidBytesToString(uuid: UUID) {
        // split each field of uuid
        const part1 = (uuid.mostSignificantBits >> 32n & 0xFFFFFFFFn).toString(16).padStart(8, '0');
        const part2 = (uuid.mostSignificantBits >> 16n & 0xFFFFn).toString(16).padStart(4, '0');
        const part3 = (uuid.mostSignificantBits & 0xFFFFn).toString(16).padStart(4, '0');
        const part4 = (uuid.lessSignificantBits >> 48n & 0xFFFFn).toString(16).padStart(4, '0');
        const part5 = (uuid.lessSignificantBits & 0xFFFFFFFFFFFFn).toString(16).padStart(12, '0');
    
        // concat with '-'
        return `${part1}-${part2}-${part3}-${part4}-${part5}`;
    }

    static debug(text: any) {
        if (debug) {
            console.log(text);
        }
    }

    static getHost(bot: Bot) {
        // @ts-ignore
        return bot._client.socket && bot._client.socket._host ? bot._client.socket._host : null;
    }

    /*static findPlayerBySourceId(uuid: UUID) {
        return PacketManager.sourceById.find(item => Utils.objectEquals(item.sourceId, uuid));
    }

    static findPlayerByPlayerId(uuid: UUID) {
        return PacketManager.players.find(item => Utils.objectEquals(item.playerId, uuid));
    }*/

    /*
    static objectEquals(x: any, y: any): boolean {
        'use strict';
    
        if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
        // after this just checking type of one would be enough
        if (x.constructor !== y.constructor) { return false; }
        // if they are functions, they should exactly refer to same one (because of closures)
        if (x instanceof Function) { return x === y; }
        // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
        if (x instanceof RegExp) { return x === y; }
        if (x === y || x.valueOf() === y.valueOf()) { return true; }
        if (Array.isArray(x) && x.length !== y.length) { return false; }
    
        // if they are dates, they must had equal valueOf
        if (x instanceof Date) { return false; }
    
        // if they are strictly equal, they both need to be object at least
        if (!(x instanceof Object)) { return false; }
        if (!(y instanceof Object)) { return false; }
    
        // recursive object equality check
        var p = Object.keys(x);
        return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) &&
            p.every(function (i) { return Utils.objectEquals(x[i], y[i]); });
    }
    */
}