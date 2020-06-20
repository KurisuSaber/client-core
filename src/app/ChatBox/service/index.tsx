import {useState, useEffect} from 'react';
import {createModel} from 'hox';
import {message} from 'antd';
import {getDB} from 'utils';
import useService, { TABS } from 'app/Service';

export interface IMsgRecord {
    msgId: string,
    senderId: string,
    senderAvatar: string,
    type: 'text' | 'photo' | 'file',
    content: string,
    name?: string,
    date: Date,
};

export interface IMsgList {
    // userId or groupId
    [id: string]: {
        msgs: Array<IMsgRecord>;
    };
};

export class MsgItem {
    public id: string = ''
    public name: string = ''
    public avatar: string = ''
};

const initMsgList = async (): Promise<IMsgList> => {
    const db = await getDB();
    if (!db) return {};

    return new Promise((resolve, reject) => {
        const a:Array<IMsgRecord> = [];
        const b:Array<IMsgRecord> = [];
        a.push({
            msgId: '1',
            senderId: '114',
            senderAvatar: '',
            type: 'text',
            content: '123',
            date: new Date('2020-08-10'),
        })
        b.push({
            msgId: '2',
            senderId: '514',
            senderAvatar: '',
            type: 'text',
            content: '321',
            date: new Date('1919-08-10'),
        })
        let msgList: IMsgList = {
            '514':{'msgs':b},
            '114':{'msgs':a}
        };
        const msgListStore = db.transaction('msgList', 'readonly').objectStore('msgList');
        const getRequest = msgListStore.getAll();

        getRequest.onsuccess = (e: any) => {
            const msgs = e.target.result as Array<{ id: string, msgs: Array<IMsgRecord> }>;
            msgs.forEach((msg) => msgList[msg.id.toString()] = { msgs: msg.msgs});
            resolve(msgList);
        }

        getRequest.onerror = (e: any) => {
            resolve({});
        }
    });
};

export default createModel(() => {
    const [msgList, setMsgList] = useState<IMsgList>({});
    const [sortedMsgList, setSortedMsgList] = useState<Array<string>>([]);
    const [chatList, setChatList] = useState<Array<MsgItem>>([]);
    const {setChatBoxId} = useService();
    const {setTabBar} = useService();

    useEffect(() => {
        initMsgList().then(res => {
            setMsgList(res);
        });
        const sortedIdList = Object.keys(msgList).sort((a, b) => {
            const msg1 = msgList[a]['msgs'];
            const msg2 = msgList[b]['msgs'];
            const date1 = msg1[msg1.length-1].date;
            const date2 = msg2[msg2.length-1].date;
            if(date1 < date2) return -1;
            else if(date1 === date2) return 0;
            else return 1;
        });
        setSortedMsgList(sortedIdList);
    }, []);

    const createChat = (id: string) => {
        const index = sortedMsgList.indexOf(id);
        if(index !== -1) sortedMsgList.splice(index, 1);
        sortedMsgList.unshift(id);
        setChatBoxId(id);
        setTabBar(TABS.CHAT);
    }

    const addMsg = (id: string, msg: IMsgRecord) => {
        const index = sortedMsgList.indexOf(id);
        if(index !== -1) sortedMsgList.splice(index, 1);
        sortedMsgList.unshift(id);
        getDB().then(db => {
            if (db) {
                const msgListStore = db.transaction('msgList', 'readwrite').objectStore('msgList');
                let addMsgRequest: IDBRequest<IDBValidKey>;

                if (id in msgList) {
                    let msgs = msgList[id].msgs;
                    msgs.push(msg);

                    addMsgRequest = msgListStore.put({ id, msgs });
                    addMsgRequest.onsuccess = ((e: Event) => {
                        setMsgList(prev => ({
                            ...prev,
                            [id]: {msgs},
                        }));
                    });
                } else {
                    addMsgRequest = msgListStore.add({ id, msgs: [msg] });
                    addMsgRequest.onsuccess = ((e: Event) => {
                        setMsgList(prev => ({
                            ...prev,
                            [id]: { msgs: [msg] },
                        }));
                    });
                }

                addMsgRequest.onerror = ((e: Event) => {
                    message.error('数据更新失败');
                });
            } else {
                if (id in msgList) {
                    let msgs = msgList[id].msgs;
                    msgs.push(msg);

                    setMsgList(prev => ({
                        ...prev,
                        [id]: {msgs},
                    }));
                } else {
                    setMsgList(prev => ({
                        ...prev,
                        [id]: { msgs: [msg] },
                    }));
                }
            }
        });
    }

    return {msgList, addMsg, sortedMsgList, createChat,
        setChatList, chatList,
    };
});
