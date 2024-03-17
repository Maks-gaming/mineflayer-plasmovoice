declare class ProtodefValidator {
	constructor(typesSchemas: unknown);
	public createAjvInstance(typesSchemas): void;
	public addDefaultTypes(): void;
	public addTypes(schemas): void;
	public typeToSchemaName(name: string): string;
	public addType(name: string, schema: unknown): void;
	public validateType(type: unknown): void;
	public validateTypeGoingInside(type: unknown): void;
	public validateProtocol(protocol: unknown): void;
}

declare class ProtodefBasecompiler {
	public primitiveTypes: unknown;
	public native: unknown;
	public context: unknown;
	public types: unknown;
	public scopeStack: unknown[];
	public parameterizableTypes: unknown;
	constructor();
	public addNativeType(type: unknown, fn: unknown): void;
	public addContextType(type: unknown, fn: unknown): void;
	public addParametrizableType(type: unknown, maker: unknown): void;
	public addTypes(types: unknown): void;
	public addTypesToCompile(types: unknown): void;
	public addProtocol(protocolData: unknown, path: unknown): void;
	public indent(code: string, indent: string): string;
	public getField(name: string): unknown;
	public generate(): string;
	public compile(code: unknown): unknown;
}

declare class ProtodefReadCompiler extends ProtodefBasecompiler {
	constructor();
	public compileType(type: unknown): unknown;
	public wrapCode(code: unknown, args: unknown[]): unknown;
	public callType(
		type: unknown,
		offsetExpr: string,
		args: unknown[],
	): unknown;
}

declare class ProtodefWriteCompiler extends ProtodefBasecompiler {
	constructor();
	public compileType(type: unknown): unknown;
	public wrapCode(code: unknown, args: unknown[]): unknown;
	public callType(
		type: unknown,
		offsetExpr: string,
		args: unknown[],
	): unknown;
}

declare class ProtodefSizeOfCompiler extends ProtodefBasecompiler {
	constructor();
	public addNativeType(type: unknown, fn: unknown): void;
	public compileType(type: unknown): unknown;
	public wrapCode(code: unknown, args: unknown[]): unknown;
	public callType(
		type: unknown,
		offsetExpr: string,
		args: unknown[],
	): unknown;
}

declare class ProtodefCompiler {
	public readCompiler: ProtodefReadCompiler;
	public writeCompiler: ProtodefWriteCompiler;
	public sizeOfCompiler: ProtodefSizeOfCompiler;
	constructor();
	public addTypes(types: unknown): void;
	public addTypesToCompile(types: unknown): void;
	public addProtocol(protocolData: unknown, path: unknown): void;
	public addVariable(key: unknown, val: unknown): void;
	public compileProtoDefSync(options?: unknown): unknown;
}

declare class CompiledProtodef {
	public sizeOfCtx: unknown;
	public writeCtx: unknown;
	public readCtx: unknown;
	constructor(sizeOfCtx: unknown, writeCtx: unknown, readCtx: unknown);
	public read(buffer: unknown, cursor: unknown, type: unknown): unknown;
	public write(
		value: unknown,
		buffer: unknown,
		cursor: unknown,
		type: unknown,
	): unknown;
	public setVariable(key: unknown, val: unknown): void;
	public sizeOf(value: unknown, type: unknown): unknown;
	public createPacketBuffer(type: unknown, packet: unknown): unknown;
	public parsePacketBuffer(
		type: unknown,
		buffer: unknown,
		offset: number,
	): unknown;
}

declare class ProtodefExtendableError extends Error {
	constructor(message: unknown);
}

declare class ProtodefPartialError extends Error {
	public partialReadError: boolean;
	constructor(message: unknown);
}

declare module "protodef" {
	import { Transform } from "readable-stream";
	class ProtoDef {
		constructor(validate: boolean);
		public types: unknown;
		public validator: ProtodefValidator;
		public addDefaultTypes(): void;
		public addProtocol(protocolData: unknown, path: unknown): void;
		public addType(
			name: unknown,
			functions: unknown,
			validate: boolean,
		): void;
		public addTypes(types: unknown): void;
		public setVariable(key: unknown, value: unknown): void;
		public read(
			buffer: Buffer,
			cursor: unknown,
			_fieldInfo: unknown,
			rootNodes: unknown,
		): unknown;
		public write(
			value: unknown,
			buffer: Buffer,
			offset: number,
			_fieldInfo: unknown,
			rootNode: unknown,
		): unknown;
		public sizeOf(
			value: unknown,
			_fieldInfo: unknown,
			rootNode: unknown,
		): unknown;
		public createPacketBuffer(type: unknown, packet: unknown): Buffer;
		public parsePacketBuffer(type: unknown, buffer: Buffer): any;
	}
	class Serializer extends Transform {
		public proto: unknown;
		public mainType: unknown;
		public queue: unknown;
		constructor(proto: unknown, mainType: unknown);
		public createPacketBuffer(packet: unknown): unknown;
		public _transform(chunk: unknown, enc: unknown, cb: unknown): unknown;
	}
	class Parser extends Transform {
		public proto: unknown;
		public mainType: unknown;
		public queue: unknown;
		constructor(proto: unknown, mainType: unknown);
		public parsePacketBuffer(packet: unknown): unknown;
		public _transform(chunk: unknown, enc: unknown, cb: unknown): unknown;
	}
	class FullPacketParser {
		public proto: unknown;
		public mainType: unknown;
		public noErrorLogging: unknown;
		constructor(proto: unknown, mainType: unknown);
		public parsePacketBuffer(packet: unknown): unknown;
		public _transform(chunk: unknown, enc: unknown, cb: unknown): unknown;
	}
	const Compiler: {
		ReadCompiler: typeof ProtodefReadCompiler;
		WriteCompiler: typeof ProtodefWriteCompiler;
		SizeOfCompiler: typeof ProtodefSizeOfCompiler;
		ProtoDefCompiler: typeof ProtodefCompiler;
		CompiledProtodef: typeof CompiledProtodef;
	};
	const types: {
		varint: [
			(buf: Buffer, offset: number) => { value: number; size: number },
			(length: number, buffer: Buffer, num: number) => void,
			(chunk: number) => number,
		];
	};
	const utils: {
		getField(countField: unknown, context: unknown): unknown;
		getFieldInfo(fieldInfo: unknown): unknown;
		getCount(
			buffer: unknown,
			offset: unknown,
			options: unknown,
			rootNode: unknown,
		): unknown;
		sendCount(
			len: unknown,
			buffer: unknown,
			offset: unknown,
			options: unknown,
			rootNode: unknown,
		): unknown;
		calcCount(len: unknown, options: unknown, rootNode: unknown): unknown;
		addErrorField(e: unknown, field: unknown): void;
		tryCatch(tryfn: unknown, catchfn: unknown): void;
		PartialReadError: ProtodefPartialError;
	};
}
