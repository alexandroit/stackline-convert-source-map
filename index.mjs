import convert from './index.js';

export const commentRegex = convert.commentRegex;
export const mapFileCommentRegex = convert.mapFileCommentRegex;
export const fromObject = convert.fromObject;
export const fromJSON = convert.fromJSON;
export const fromURI = convert.fromURI;
export const fromBase64 = convert.fromBase64;
export const fromComment = convert.fromComment;
export const fromMapFileComment = convert.fromMapFileComment;
export const fromSource = convert.fromSource;
export const fromMapFileSource = convert.fromMapFileSource;
export const removeComments = convert.removeComments;
export const removeMapFileComments = convert.removeMapFileComments;
export const generateMapFileComment = convert.generateMapFileComment;

export default convert;
