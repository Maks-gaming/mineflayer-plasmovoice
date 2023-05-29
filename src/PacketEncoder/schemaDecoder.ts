import CursoredBuffer from './cursoredBuffer'
import { typeNameToMethod } from './typeNameToMethod'

export default class SchemaDecoder {
	public schema: object;

    constructor(schema: object) {
        this.schema = schema
    }

    decode(buffer: CursoredBuffer | Buffer) {
        let cursored_buffer: CursoredBuffer;
        if (! (buffer instanceof CursoredBuffer)) {
            cursored_buffer = new CursoredBuffer(buffer, null)
        } else {
            cursored_buffer = buffer
        }
        let decoded_info : any = {}
        for (const tuple of Object.entries(this.schema)) {
            
            let key: string = tuple[0]
            let value: string = tuple[1]

            let method_name : string = typeNameToMethod[value]
            let decoded_value : any = (cursored_buffer as any)['read' + method_name]()
            decoded_info[key] = decoded_value
        }
        return decoded_info
    }
}