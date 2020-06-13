import React, {CSSProperties, useState} from 'react';
import useService, {TABS} from 'app/Service';
import {Menu, Dropdown, Button, Avatar, Modal, Form, Input, Select, DatePicker, Upload, message} from 'antd';
import {DownOutlined} from '@ant-design/icons';
import {UserOutlined} from '@ant-design/icons';
import { UploadOutlined } from '@ant-design/icons';
import {BellOutlined, CommentOutlined, TeamOutlined} from '@ant-design/icons/lib';
import useUserService from 'app/Service/userService'
import useGroupService from 'app/Service/groupService'
import './headbar.css'
import {uploader, beforeImgUpload, beforeFileUpload} from 'app/ChatBox/InputBox/upload';
import { UploadChangeParam } from 'antd/lib/upload';
/**
 * 顶部栏，包含了头像以及头像引发的下拉菜单，三个按钮
 * 三个按钮的跳转逻辑已完成
 * todo: 1.头像配饰 2.头像下拉菜单及其逻辑
 * @param propStyle
 */

const {Option} = Select;
const {TextArea} = Input;

export default (propStyle: CSSProperties) => {
    const {tabBar, setTabBar} = useService()
    const {SubMenu} = Menu;
    const {user, logout, updateProfile} = useUserService();
    const {createGroup} = useGroupService();
    
    const style: CSSProperties = {
        ...propStyle,
        display: "flex",
    }

    const [state,setState] = useState(false);
    const [gstate,setGState] = useState(false);

    const showModal = () => {
        setState(true);
    };

    const showGModal = () => {
        setGState(true);
    };

    const handleCancel = () => {
        setState(false);
        setGState(false);
    };

    const [imgUploading, setImgUploading] = useState(false);
    const [img, setImg] = useState('');

    const onImgUploadChange = (info: UploadChangeParam) => {
        if (info.file.status === 'uploading') {
            setImgUploading(true);
        } else if (info.file.status === 'done') {
            const imgUrl = 'http://cdn.loheagn.com/' + (info.file.response.key as string);
            setImg(imgUrl);
            setImgUploading(false);
        } else if (info.file.status === 'error') {
            message.error('发送图片失败');
        }

    }

    const menu = (
        <Menu>
            <Menu.ItemGroup title="Group title">
                <Menu.Item>1st menu item</Menu.Item>
                <Menu.Item>2nd menu item</Menu.Item>
            </Menu.ItemGroup>
            <Menu.Item onClick={showGModal}>
                创建群聊
            </Menu.Item>
            <Menu.Item onClick={showModal}>
                修改个人信息
            </Menu.Item>
            <Menu.Item onClick={logout}>
                退出登录
            </Menu.Item>
        </Menu>
    );

    const handleSubmit = (fieldValue: any) => {
        const values = {
            ...fieldValue,
            'birthday': fieldValue['birthday'] === undefined ? undefined:fieldValue['birthday'].format('YYYY-MM-DD'),
            'sex': fieldValue['sex'] === undefined ? undefined : fieldValue['sex'] === '男' ? false : true,
            'avatar': img
        }
        for(var key in values) {
            if(values[key] === undefined || values[key] === '') {
                delete values[key]
            }
        }
        console.log(values)
        updateProfile(values);
    };

    const handleCreateGroup = (fieldValue: any) => {
        const values = {
            'owner': user.userId,
            ...fieldValue,
            'avatar': img
        }
        for(var key in values) {
            if(values[key] === undefined || values[key] === '') {
                delete values[key]
            }
        }
        console.log(values)
        createGroup(values)
    };

    return (
        <div style={style}>
            <Dropdown overlay={menu}>
                <div style={{marginLeft: "1.2rem",marginTop:"-0.5%"}}>
                    <Avatar
                        src={user.userAvatar}
                        size={"large"}
                        style={{marginRight: "1rem"}}
                    />
                    <DownOutlined/>
                </div>
            </Dropdown>
            <Button
                style={{marginLeft: "30%"}}
                type={tabBar === TABS.CHAT ? "primary" : "dashed"}
                shape="circle"
                icon={<CommentOutlined/>}
                onClick={() => setTabBar(TABS.CHAT)}
            />
            <Button
                style={{marginLeft: "2%"}}
                type={tabBar === TABS.LIST ? "primary": "dashed"}
                shape="circle"
                icon={<TeamOutlined/>}
                onClick={() => setTabBar(TABS.LIST)}
            />
            <Button style={{marginLeft: "2%"}}
                    type={tabBar === TABS.MESSAGE ? "primary" : "dashed"}
                    shape="circle"
                    icon={<BellOutlined />}
                    onClick={() => setTabBar(TABS.MESSAGE)}
            />

                <Modal
                    centered={true}
                    visible={state}
                    onCancel={handleCancel}
                    footer={null}
                >
                    <Form onFinish={handleSubmit} className='modify-form'>
                        <Form.Item
                            name =  'phone'
                            label = '手机'
                            rules = {[
                                {
                                    pattern: new RegExp('^(1[3-9])\\d{9}$')
                                }
                            ]}
                        >
                            <Input
                                placeholder='请输入手机号'
                            />
                        </Form.Item>
                        <Form.Item
                            name='email'
                            label='邮箱'
                        >
                                <Input
                                    placeholder='请输入邮箱'
                                />
                        </Form.Item>
                        <Form.Item
                            name='nickname'
                            label='昵称'
                        >
                                <Input
                                    placeholder='请输入昵称'
                                />
                        </Form.Item>
                        <Form.Item
                            label='头像'
                            name='avatar'
                        >
                            <Upload
                                data={() => uploader.getToken()}
                                beforeUpload={beforeImgUpload}
                                showUploadList={false}
                                onChange={onImgUploadChange}
                                disabled={imgUploading}
                                accept=".jpeg, .png"
                                action="http://up-z1.qiniup.com"
                            >
                                <Button>
                                    <UploadOutlined /> Click to Upload
                                </Button>
                            </Upload>
                        </Form.Item>
                        <Form.Item
                            name='sex'
                            label='性别'
                        >
                                <Select
                                    placeholder="请选择性别"
                                    allowClear
                                >

                                    <Option value="female">女</Option>
                                    <Option value="male">男</Option>
                                </Select>
                        </Form.Item>
                        <Form.Item
                            name='signature'
                            label='签名'
                        >
                                <Input
                                    placeholder='请输入签名'
                                />
                        </Form.Item>
                        <Form.Item
                            name='loaction'
                            label='地点'
                        >
                                <Input
                                    placeholder='请输入地点'
                                />
                        </Form.Item>
                        <Form.Item
                            name='birthday'
                            label='生日'
                        >
                            <DatePicker />
                        </Form.Item>
                        <Button className = 'modify-button' type='primary' htmlType='submit'>
                                提交
                        </Button>
                        <Button className = 'modify-cancel-button' onClick={handleCancel}>
                                取消
                        </Button>
                    </Form>
                </Modal>

                <Modal
                    centered={true}
                    visible={gstate}
                    onCancel={handleCancel}
                    footer={null}
                >
                    <Form onFinish={handleCreateGroup} className='modify-form'>
                        <Form.Item
                            name='name'
                            label='群名称'
                        >
                                <Input
                                    placeholder='请输入群名称'
                                />
                        </Form.Item>
                        <Form.Item
                            label='群头像'
                            name='avatar'
                        >
                            <Upload
                                data={() => uploader.getToken()}
                                beforeUpload={beforeImgUpload}
                                showUploadList={false}
                                onChange={onImgUploadChange}
                                disabled={imgUploading}
                                accept=".jpeg, .png"
                                action="http://up-z1.qiniup.com"
                            >
                                <Button>
                                    <UploadOutlined /> Click to Upload
                                </Button>
                            </Upload>
                        </Form.Item>
                        <Form.Item
                            name='signature'
                            label='群简介'
                        >
                                <TextArea
                                    rows={4}
                                    placeholder='请输入简介'
                                />
                        </Form.Item>
                        <Button className = 'modify-button' type='primary' htmlType='submit'>
                                提交
                        </Button>
                        <Button className = 'modify-cancel-button' onClick={handleCancel}>
                                取消
                        </Button>
                    </Form>
                </Modal>
        </div>
    )
}
