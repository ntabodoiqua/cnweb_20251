
import React, { useContext } from 'react';
import { Button, Card, Col, Divider, Form, Input, notification, Row, Typography } from 'antd';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { ArrowLeftOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { THEME_COLORS } from '../styles/theme';

const { Title, Text } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);

    const onFinish = async (values) => {
        const { email, password } = values;

        const res = await loginApi(email, password);

        if (res && res.EC === 0) {
            localStorage.setItem("access_token", res.access_token)
            notification.success({
                message: "Đăng nhập thành công",
                description: "Chào mừng bạn quay trở lại!"
            });
            setAuth({
                isAuthenticated: true,
                user: {
                    email: res?.user?.email ?? "",
                    name: res?.user?.name ?? ""
                }
            })
            navigate("/");

        } else {
            notification.error({
                message: "Đăng nhập thất bại",
                description: res?.EM ?? "Vui lòng kiểm tra lại thông tin đăng nhập"
            })
        }

    };

    return (
        <div style={{
            minHeight: '100vh',
            background: THEME_COLORS.gradientPrimary,
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
                            <Title level={2} style={{ marginBottom: '8px' }}>Đăng Nhập</Title>
                            <Text type="secondary">Chào mừng bạn quay trở lại!</Text>
                        </div>

                        <Form
                            name="login"
                            onFinish={onFinish}
                            autoComplete="off"
                            layout="vertical"
                            size="large"
                        >
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
                                    Đăng Nhập
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
                            <Text>Chưa có tài khoản? </Text>
                            <Link to="/register">Đăng ký tại đây</Link>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default LoginPage;