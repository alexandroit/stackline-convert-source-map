export interface SourceMapConverter<T = any> {
  sourcemap: T;
  toObject(): T;
  toJSON(space?: string | number): string;
  toURI(): string;
  toBase64(): string;
  toComment(options?: CommentOptions): string;
  addProperty(key: PropertyKey, value: any): SourceMapConverter<T>;
  setProperty(key: PropertyKey, value: any): SourceMapConverter<T>;
  getProperty(key: PropertyKey): any;
}

export interface CommentOptions {
  multiline?: boolean;
  encoding?: 'uri';
}

export type SyncReadMap = (filename: string) => string;
export type AsyncReadMap = (filename: string) => PromiseLike<string>;

export const commentRegex: RegExp;
export const mapFileCommentRegex: RegExp;
export function fromObject<T = any>(object: T): SourceMapConverter<T>;
export function fromJSON(json: string): SourceMapConverter;
export function fromURI(uri: string): SourceMapConverter;
export function fromBase64(base64: string): SourceMapConverter;
export function fromComment(comment: string): SourceMapConverter;
export function fromMapFileComment(comment: string, readMap: SyncReadMap): SourceMapConverter;
export function fromMapFileComment(comment: string, readMap: AsyncReadMap): PromiseLike<SourceMapConverter>;
export function fromSource(content: string): SourceMapConverter | null;
export function fromMapFileSource(content: string, readMap: SyncReadMap): SourceMapConverter | null;
export function fromMapFileSource(content: string, readMap: AsyncReadMap): PromiseLike<SourceMapConverter> | null;
export function removeComments(source: string): string;
export function removeMapFileComments(source: string): string;
export function generateMapFileComment(file: string, options?: Pick<CommentOptions, 'multiline'>): string;
