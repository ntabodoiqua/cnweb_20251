import React, { useState } from 'react';
import { Button, Col, DatePicker, Divider, Form, Input, notification, Row, Typography } from 'antd';
import { createUserApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';
import logo from '../assets/logo.png';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        const { username, password, firstName, lastName, dob, email, phone } = values;

        // Format date to YYYY-MM-DD
        const formattedDob = dob ? dayjs(dob).format('YYYY-MM-DD') : null;

        const res = await createUserApi(username, password, firstName, lastName, formattedDob, email, phone);

        setLoading(false);

        if (res && res.code === 1000) {
            notification.success({
                message: "Đăng ký thành công!",
                description: "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.",
                duration: 3
            });
            navigate("/login");
        } else {
            notification.error({
                message: "Đăng ký thất bại",
                description: res?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
                duration: 3
            })
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <Row justify="center" style={{ width: '100%', maxWidth: '1200px' }}>
                <Col xs={24} sm={22} md={18} lg={14} xl={10}>
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        padding: '40px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative circles */}
                        <div style={{
                            position: 'absolute',
                            top: '-50px',
                            right: '-50px',
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            opacity: '0.1'
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            bottom: '-30px',
                            left: '-30px',
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            opacity: '0.1'
                        }}></div>

                        {/* Logo and Title */}
                        <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
                            <img 
                                src={logo} 
                                alt="Logo" 
                                style={{ 
                                    height: '80px',
                                    marginBottom: '20px',
                                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                                }} 
                            />
                            <Title level={2} style={{ 
                                margin: '0 0 10px 0',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: '700',
                                fontSize: '32px'
                            }}>
                                Đăng Ký Tài Khoản
                            </Title>
                            <Text type="secondary" style={{ fontSize: '16px' }}>
                                Tạo tài khoản mới để bắt đầu mua sắm
                            </Text>
                        </div>

                        <Form
                            name="register"
                            onFinish={onFinish}
                            autoComplete="off"
                            layout="vertical"
                            size="large"
                        >
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label={<span style={{ fontWeight: '600' }}>Tên</span>}
                                        name="firstName"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập tên!',
                                            },
                                        ]}
                                    >
                                        <Input 
                                            prefix={<UserOutlined style={{ color: '#667eea' }} />}
                                            placeholder="Nhập tên của bạn"
                                            style={{ borderRadius: '8px' }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label={<span style={{ fontWeight: '600' }}>Họ và tên đệm</span>}
                                        name="lastName"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập họ và tên đệm!',
                                            },
                                        ]}
                                    >
                                        <Input 
                                            prefix={<UserOutlined style={{ color: '#667eea' }} />}
                                            placeholder="Nhập họ và tên đệm"
                                            style={{ borderRadius: '8px' }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label={<span style={{ fontWeight: '600' }}>Tên đăng nhập</span>}
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập tên đăng nhập!',
                                    },
                                    {
                                        min: 3,
                                        message: 'Tên đăng nhập phải có ít nhất 3 ký tự!'
                                    }
                                ]}
                            >
                                <Input 
                                    prefix={<UserOutlined style={{ color: '#667eea' }} />}
                                    placeholder="Nhập tên đăng nhập"
                                    style={{ borderRadius: '8px' }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: '600' }}>Email</span>}
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập email!',
                                    },
                                    {
                                        type: 'email',
                                        message: 'Email không hợp lệ!',
                                    }
                                ]}
                            >
                                <Input 
                                    prefix={<MailOutlined style={{ color: '#667eea' }} />}
                                    placeholder="example@email.com"
                                    style={{ borderRadius: '8px' }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: '600' }}>Số điện thoại</span>}
                                name="phone"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập số điện thoại!',
                                    },
                                    {
                                        pattern: /^[0-9]{10}$/,
                                        message: 'Số điện thoại phải có 10 chữ số!',
                                    }
                                ]}
                            >
                                <Input 
                                    prefix={<PhoneOutlined style={{ color: '#667eea' }} />}
                                    placeholder="0123456789"
                                    style={{ borderRadius: '8px' }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: '600' }}>Ngày sinh</span>}
                                name="dob"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn ngày sinh!',
                                    },
                                ]}
                            >
                                <DatePicker 
                                    style={{ width: '100%', borderRadius: '8px' }}
                                    placeholder="Chọn ngày sinh"
                                    format="DD/MM/YYYY"
                                    suffixIcon={<CalendarOutlined style={{ color: '#667eea' }} />}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: '600' }}>Mật khẩu</span>}
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập mật khẩu!',
                                    },
                                    {
                                        min: 6,
                                        message: 'Mật khẩu phải có ít nhất 6 ký tự!'
                                    }
                                ]}
                            >
                                <Input.Password 
                                    prefix={<LockOutlined style={{ color: '#667eea' }} />}
                                    placeholder="Nhập mật khẩu"
                                    style={{ borderRadius: '8px' }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: '600' }}>Xác nhận mật khẩu</span>}
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng xác nhận mật khẩu!',
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password 
                                    prefix={<LockOutlined style={{ color: '#667eea' }} />}
                                    placeholder="Nhập lại mật khẩu"
                                    style={{ borderRadius: '8px' }}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginTop: '24px', marginBottom: '16px' }}>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    loading={loading}
                                    block
                                    style={{
                                        height: '48px',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                                    }}
                                >
                                    Đăng ký
                                </Button>
                            </Form.Item>
                        </Form>

                        <Divider style={{ margin: '24px 0' }} />

                        <div style={{ textAlign: 'center' }}>
                            <Link to="/" style={{ 
                                color: '#667eea',
                                fontWeight: '500',
                                fontSize: '15px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <ArrowLeftOutlined /> Quay lại trang chủ
                            </Link>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Text style={{ fontSize: '15px' }}>
                                Đã có tài khoản? {' '}
                                <Link to="/login" style={{ 
                                    color: '#667eea',
                                    fontWeight: '600'
                                }}>
                                    Đăng nhập ngay
                                </Link>
                            </Text>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default RegisterPage;