import { useState } from 'react';
import { createModel } from 'hox';
import Axios from 'axios';

export class IFriend {
    public id: string = ''
    public nickname: string = ''
    public isTop: boolean = false
    public isBlack: boolean = false
    public createAt: Date = new Date()
}

export default createModel(() => {

    const [friends, setFriends] = useState<Array<IFriend>>([]);
    const [loading, setLoading] = useState(false);

    const friendService = 'friend/';

    const isFriend = (id: string) => {
        if (!friends) return false;

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
        instruction: string
    ) => {

        const params = {
            user_id: user_id,
            friend_id: friend_id,
            u_name: u_name,
            instruction: instruction
        };
        Axios.post(friendService + 'application', params).then();

    };

    const deleteFriend = (
        user_id: string,
        friend_id: string) => {
        const params = {
            user_id: user_id,
            friend_id: friend_id,
        };
        Axios.delete(friendService, { params: params }).then();
    };

    const getFriendList = (
        user_id: string
    ) => {
        Axios.get(friendService + user_id).then((res) => {
            const tempFriendList: Array<IFriend> = [];
            for (let f of res.data['result']) {
                const tempFriend = new IFriend();
                tempFriend.createAt = f['create_at'];
                tempFriend.id = f['user_id'];
                tempFriend.nickname = f['nickname'];
                tempFriend.isTop = f['is_top'];
                tempFriend.isBlack = f['is_black'];
            }
            setFriends(tempFriendList)
        })
    };

    const getFriendDetail = (
        friend_id: string
    ) => {

    }


    return {
        IFriend, friends, setFriends, isFriend,
        addFriend, deleteFriend, getFriendList,getFriendDetail
    };
});
