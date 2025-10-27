import React from 'react';
import { Button, Card, Col, Divider, Form, Input, notification, Row, Typography } from 'antd';
import { createUserApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        const { name, email, password } = values;

        const res = await createUserApi(name, email, password);

        if (res) {
            notification.success({
                message: "Đăng ký thành công",
                description: "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập!"
            });
            navigate("/login");

        } else {
            notification.error({
                message: "Đăng ký thất bại",
                description: "Đã có lỗi xảy ra. Vui lòng thử lại!"
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
            <Row justify="center" style={{ width: '100%' }}>
                <Col xs={24} sm={20} md={16} lg={10} xl={8}>
                    <Card
                        style={{
                            borderRadius: '10px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <Title level={2} style={{ marginBottom: '8px' }}>Đăng Ký Tài Khoản</Title>
                            <Text type="secondary">Tạo tài khoản mới để bắt đầu</Text>
                        </div>

                        <Form
                            name="register"
                            onFinish={onFinish}
                            autoComplete="off"
                            layout="vertical"
                            size="large"
                        >
                            <Form.Item
                                label="Họ và tên"
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập họ và tên!',
                                    },
                                ]}
                            >
                                <Input 
                                    prefix={<UserOutlined />}
                                    placeholder="Nhập họ và tên của bạn"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Email"
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
                                    prefix={<MailOutlined />}
                                    placeholder="Nhập email của bạn"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Mật khẩu"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập mật khẩu!',
                                    },
                                    {
                                        min: 6,
                                        message: 'Mật khẩu phải có ít nhất 6 ký tự!',
                                    }
                                ]}
                            >
                                <Input.Password 
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập mật khẩu của bạn"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    block
                                    style={{ height: '45px', fontSize: '16px' }}
                                >
                                    Đăng Ký
                                </Button>
                            </Form.Item>
                        </Form>

                        <div style={{ marginTop: '20px' }}>
                            <Link to="/">
                                <ArrowLeftOutlined /> Quay lại trang chủ
                            </Link>
                        </div>

                        <Divider />

                        <div style={{ textAlign: 'center' }}>
                            <Text>Đã có tài khoản? </Text>
                            <Link to="/login">Đăng nhập</Link>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default RegisterPage;