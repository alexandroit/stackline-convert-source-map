import convert, {
  fromJSON,
  fromMapFileComment,
  fromObject,
  SourceMapConverter
} from '../..';
import * as convertNamespace from '../..';

interface MapShape {
  version: number;
  sources: string[];
}

const typed: SourceMapConverter<MapShape> = fromObject({ version: 3, sources: ['a.js'] });
const version: number = typed.toObject().version;
const json: string = typed.toJSON(2);
const fromDefault = convert.fromJSON(json);
const fromNamed = fromJSON(json);
const fromNamespace = convertNamespace.fromJSON(json);
const sync = fromMapFileComment('//# sourceMappingURL=x.map', () => json);
const asyncResult = fromMapFileComment('//# sourceMappingURL=x.map', async () => json);

void version;
void fromDefault;
void fromNamed;
void fromNamespace;
void sync;
void asyncResult;
