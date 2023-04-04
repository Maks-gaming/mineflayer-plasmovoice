import CursoredBuffer from "./cursoredBuffer"
import { typeNameToMethod } from './typeNameToMethod'
import { Buffer } from 'node:buffer';

export default class SchemaEncoder {
    public schema: object;

    constructor(schema: object) {
        this.schema = schema
    }

    encode(data: any) {
        let cursored_buffer = new CursoredBuffer(Buffer.alloc(1000000), null)
        
        for (const [key, value] of Object.entries(this.schema)) {
            let method_name : string = typeNameToMethod[value];
            (cursored_buffer as any)['write' + method_name](data[key])
        }
        return cursored_buffer.buffer.subarray(0, cursored_buffer._offset)
    }
}
