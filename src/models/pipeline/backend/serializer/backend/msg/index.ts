import { ISerializedContentMsg } from 'models/msg';
import ISerializer from 'models/pipeline/backend/serializer/ISerializer';
import { msg, google } from 'models/pipeline/backend/serializer/backend/msg/msg';


const getTimeStamp = (ms: number) =>
    google.protobuf.Timestamp.fromObject({
        seconds: ms / 1000,
        nanos: (ms % 1000) * 1e6,
    });

const getMs = (ts: google.protobuf.ITimestamp) =>
    (ts.seconds as number ) * 1000 + (ts.nanos as number) / 1e6;

export default class ProtoBufSerializer implements ISerializer {
    public serialize(item: any): any {
        const converted: msg.Msg = msg.Msg.create({
            ...item, createAt: getTimeStamp(item.createAt) });
        return msg.Msg.encode(converted).finish();
    }

    public deserialize(data: Uint8Array): ISerializedContentMsg {
        const deserialized: msg.Msg = msg.Msg.decode(data);
        return { ...deserialized, createAt: getMs(deserialized.createAt) }
    }
}
