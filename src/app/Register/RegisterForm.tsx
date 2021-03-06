import React, { useState, FocusEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useRouter from 'use-react-router'
import { Form, Input, Button, message, Select } from 'antd';
import {PhoneOutlined, UserOutlined, UnlockOutlined, CheckOutlined, MailOutlined} from '@ant-design/icons'

import Vcode from './VerifyCode'

import useUserService, { IRegisterParam } from 'app/Service/userService'

import './RegisterForm.css';

const {Option} = Select;

const RegisterForm = () => {
    const [confirmDirty, setConfirmDirty] = useState(false);
    const [verifycodevalue, setverifycodeValue] = useState('');
    const {register, userLoading} = useUserService()
    const{history} = useRouter();

    const handleSubmit = (values: any) => {
        const code: string = values['verify'];
        if(code !== verifycodevalue){
            message.config({top: 75});
            message.error('验证码错误');
            return;
        }
        const gender = values['gender'] === '男' ? false : true;
        const params: IRegisterParam = {
            email: values['email'] as string,
            phone: values['username'] as string,
            password: values['password'] as string,
            nickname: values['nickname'] as string,
            sex: gender
        }
        register(params)
    };

    const {user} = useUserService();

    useEffect(() => {
        if(user.userId !== '') {
            history.push('/')
        }
    },[user])


    const handleConfirmBlur = (e: FocusEvent<HTMLInputElement>) => {
        const value = e.target;
        setConfirmDirty(confirmDirty || !!value);
    };

    return (
        <Form onFinish={handleSubmit} className='register-form'>
            <Form.Item
                name =  'username'
                rules = {[
                    {
                        required: true, message: '请输入正确手机号!', whitespace: true,
                        pattern: new RegExp('^(1[3-9])\\d{9}$')
                    }
                ]}
            >
                    <Input
                        prefix={<PhoneOutlined twoToneColor='blue'/>}
                        placeholder='手机号'
                    />
            </Form.Item>
            <Form.Item
                name =  'email'
                rules = {[
                    {
                        required: true, message: '请输入正确邮箱!', whitespace: true,
                    }
                ]}
            >
                    <Input
                        prefix={<MailOutlined twoToneColor='blue'/>}
                        placeholder='邮箱'
                    />
            </Form.Item>
            <Form.Item
                name='nickname'
                rules = {[
                    {
                        required: true, message: '请输入昵称!', whitespace: true
                    }
                ]}
            >
                    <Input
                        prefix={<UserOutlined twoToneColor='blue'/>}
                        placeholder='昵称'
                    />
            </Form.Item>
            <Form.Item name="gender" rules={[{ required: true }]}>
                <Select
                    placeholder="请选择性别"
                    allowClear
                >

                    <Option value="female">女</Option>
                    <Option value="male">男</Option>
                </Select>
            </Form.Item>
            <Form.Item
                name='password'
                hasFeedback
                rules = {[
                    {
                        required: true,
                        message: '请输入密码!',
                    }
                ]}
            >
                <Input.Password
                    prefix={<UnlockOutlined />}
                    type='password'
                    placeholder='密码'
                />
            </Form.Item>
            <Form.Item
                hasFeedback
                name='confirm'
                rules={[
                    {
                        required: true,
                        message: '请确认密码!',
                    },({getFieldValue}) => ({
                        validator(rule, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject('确认密码错误');
                        }
                    })
                ]}
            >
                    <Input.Password
                        onBlur={handleConfirmBlur}
                        prefix={<UnlockOutlined />}
                        type='password'
                        placeholder='确认密码'
                    />
            </Form.Item>
            <div id='verify-form'>
                <div id='verify-text'>
                    <Form.Item
                        name='verify'
                        rules={[
                            {
                                required: true, message: '请输入验证码'
                            },({getFieldValue}) => ({
                                validator(rule, value) {
                                    if (value.length === 4 && verifycodevalue !== value) {
                                        return Promise.reject('验证码错误');
                                    }
                                    return Promise.resolve();
                                }
                            })
                        ]}
                    >
                            <Input
                                prefix={<CheckOutlined />}
                                placeholder='验证码'
                            />
                    </Form.Item>
                </div>
                <div id='verify-vcode'>
                    <Vcode
                        width={115}
                        height={32}
                        onChange={(v: any) => setverifycodeValue(v)}
                    />
                </div>
            </div>
            <div>
                <Button
                    className='register-button'
                    type='primary'
                    loading={userLoading}
                    htmlType='submit'
                >
                    注册
                </Button>
                <span className='register-button'>
                    已有账号？
                    <Link to='/login'>登录</Link>
                </span>
            </div>
        </Form>
    )
}

export default RegisterForm;
