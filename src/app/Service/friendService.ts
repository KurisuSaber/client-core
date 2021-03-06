import { useState, useEffect } from 'react';
import { createModel } from 'hox';
import Axios from 'axios';
import { getDB } from 'utils'
import { IUserInfo, IFriend, IUser } from 'app/Service/utils/IUserInfo'
import { Modal } from "antd";
import useChatService from 'app/ChatBox/service';

const deleteFriendFromDb = (friendid: string) => {
    getDB().then(db => {
        if (db) {
            const userInfoStore = db.transaction('user', 'readwrite').objectStore('user');
            const getRequest = userInfoStore.getAll();

            getRequest.onsuccess = (e: any) => {
                const res = e.target.result as Array<{ id: string, info: IUserInfo }>;
                if (res.length !== 0) {
                    let newInfo = res[0].info
                    newInfo = {
                        ...newInfo,
                        friends: newInfo.friends.filter(item => item.id !== friendid)
                    }
                    userInfoStore.put({
                        id: res[0].id,
                        info: newInfo
                    })
                }

                // delete
                const msgStore = db.transaction('msgList', 'readwrite').objectStore('msgList');
                msgStore.delete(friendid);
            };

        }
    })
}

const updateDb = (newList: Array<IFriend>) => {
    getDB().then(db => {
        if (db) {
            const userInfoStore = db.transaction('user', 'readwrite').objectStore('user');
            const getRequest = userInfoStore.getAll();

            getRequest.onsuccess = (e: any) => {
                const res = e.target.result as Array<{ id: string, info: IUserInfo }>;
                if (res.length !== 0) {
                    let newInfo = res[0].info
                    newInfo['friends'] = newList
                    userInfoStore.put({
                        id: res[0].id,
                        info: newInfo
                    })
                }
            };
        }
    })
}

const changeNicknameFromDb = (friendid: string, nickname: string) => {
    getDB().then(db => {
        if (db) {
            const userInfoStore = db.transaction('user', 'readwrite').objectStore('user');
            const getRequest = userInfoStore.getAll();

            getRequest.onsuccess = (e: any) => {
                const res = e.target.result as Array<{ id: string, info: IUserInfo }>;
                if (res.length !== 0) {
                    let newInfo = res[0].info
                    let newfriends = newInfo.friends
                    newfriends.forEach(item => {
                        if (item.id === friendid) {
                            item.nickname = nickname;
                        }
                    });
                    newInfo = {
                        ...newInfo,
                        friends: newfriends
                    }
                    userInfoStore.put({
                        id: res[0].id,
                        info: newInfo
                    })
                }
            };
        }
    })
}


const friendService = 'friend/';

export default createModel(() => {
    const [friends, setFriends] = useState<Array<IFriend>>([]);
    const { setSortedMsgList } = useChatService();

    const updateSorted = (friendId: string) => {
        setSortedMsgList(prev => {
            const index = prev.indexOf(friendId);
            const newList = [...prev];
            if (index !== -1) {
                newList.splice(index, 1);
            }
            return newList;
        });
    }

    const isFriend = (id: string, userId: string) => {
        if (!friends) return false;
        if (id === userId) return true;
        for (let friend of friends) {
            if (friend.id === id) {
                return true;
            }
        }
        return false;
    };

    const addFriend = (
        user_id: string,
        friend_id: string,
        u_name: string,
        instruction: string) => {
        console.log('add friend')
        const params = {
            user_id: user_id,
            friend_id: friend_id,
            u_name: u_name,
            instruction: instruction
        };

        Axios.post(friendService + 'application', params).then((res) => {
            if (res && res.data && res.data['success']) {
                Modal.success({
                    content: '发送好友申请成功！'
                })
            } else {
                Modal.error({
                    content: '添加失败！'
                })
            }
        }
        );
    };

    const deleteFriend = (
        user_id: string,
        friend_id: string) => {
        const params = {
            user_id: user_id,
            friend_id: friend_id,
        };
        Axios.delete('friend', { data: params }).then((res) => {
            deleteFriendFromDb(friend_id);
            updateSorted(params.friend_id);
            let tempFriends = friends.filter(item => item.id !== friend_id)
            setFriends(tempFriends)
        });
    };

    const changeNickname = (
        user_id: string,
        friend_id: string,
        nickname: string
    ) => {
        const params = {
            user_id: user_id,
            friend_id: friend_id,
            nickname: nickname
        };
        Axios.patch(friendService + 'nickname', params).then((res) => {
            console.log(res)

            changeNicknameFromDb(friend_id, nickname)

            let newfriends = friends
            newfriends.forEach(item => {
                if (item.id === friend_id) {
                    item.nickname = nickname;
                }
            });
            setFriends(newfriends)

        });
    };

    const updateFriends = (id: string) => {
        Axios.get(friendService + id).then((res) => {
            console.log('update friends')
            console.log(res)
            const friendList: Array<IFriend> = [];
            for (let f of res.data['result']) {
                const tempFriend = new IFriend()
                tempFriend.id = f['friend']
                tempFriend.nickname = f['nickname']
                tempFriend.createAt = f['createdAt']
                tempFriend.isBlack = f['isBlack']
                tempFriend.isTop = f['isTop']
                tempFriend.avatar = f['avatar']
                friendList.push(tempFriend)
            }
            setFriends(friendList)
            updateDb(friendList)
        })
    };

    return {
        IFriend, friends, setFriends, isFriend,
        addFriend, deleteFriend, changeNickname, updateFriends
    };
});
