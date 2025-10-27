import { CrownOutlined, LockOutlined, SafetyOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Card, Col, Result, Row, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
    return (
        <div style={{ 
            padding: '40px 20px',
            background: 'linear-gradient(to bottom, #f0f2f5 0%, #ffffff 100%)',
            minHeight: 'calc(100vh - 64px)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <Result
                    icon={<CrownOutlined style={{ fontSize: '72px', color: '#1890ff' }} />}
                    title={
                        <Title level={2}>
                            JSON Web Token (JWT) Authentication
                        </Title>
                    }
                    subTitle={
                        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
                            Hệ thống xác thực người dùng an toàn với React & Node.js
                        </Paragraph>
                    }
                />

                <Row gutter={[24, 24]} style={{ marginTop: '40px' }}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card 
                            hoverable
                            style={{ 
                                textAlign: 'center',
                                height: '100%',
                                borderRadius: '8px'
                            }}
                        >
                            <SafetyOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                            <Title level={4}>Bảo Mật Cao</Title>
                            <Paragraph type="secondary">
                                Sử dụng JWT để bảo vệ dữ liệu và xác thực người dùng
                            </Paragraph>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card 
                            hoverable
                            style={{ 
                                textAlign: 'center',
                                height: '100%',
                                borderRadius: '8px'
                            }}
                        >
                            <ThunderboltOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                            <Title level={4}>Hiệu Suất Cao</Title>
                            <Paragraph type="secondary">
                                Xử lý nhanh chóng với kiến trúc hiện đại
                            </Paragraph>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card 
                            hoverable
                            style={{ 
                                textAlign: 'center',
                                height: '100%',
                                borderRadius: '8px'
                            }}
                        >
                            <LockOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                            <Title level={4}>Dễ Sử Dụng</Title>
                            <Paragraph type="secondary">
                                Giao diện thân thiện, dễ dàng đăng ký và đăng nhập
                            </Paragraph>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card 
                            hoverable
                            style={{ 
                                textAlign: 'center',
                                height: '100%',
                                borderRadius: '8px'
                            }}
                        >
                            <CrownOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: '16px' }} />
                            <Title level={4}>Modern Stack</Title>
                            <Paragraph type="secondary">
                                React, Node.js và Ant Design - công nghệ mới nhất
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>

                <Card 
                    style={{ 
                        marginTop: '40px',
                        textAlign: 'center',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}
                    bordered={false}
                >
                    <Title level={3} style={{ color: 'white' }}>
                        Bắt Đầu Ngay Hôm Nay
                    </Title>
                    <Paragraph style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)' }}>
                        Tạo tài khoản miễn phí và trải nghiệm hệ thống của chúng tôi
                    </Paragraph>
                    <Space size="large" style={{ marginTop: '20px' }}>
                        <Link to="/register">
                            <Button type="primary" size="large" style={{ background: 'white', color: '#667eea', borderColor: 'white' }}>
                                Đăng Ký Ngay
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="large" style={{ background: 'transparent', color: 'white', borderColor: 'white' }}>
                                Đăng Nhập
                            </Button>
                        </Link>
                    </Space>
                </Card>

                <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px' }}>
                    <Text type="secondary">
                        Created by @hoidanit | Powered by React & Ant Design
                    </Text>
                </div>
            </div>
        </div>
    )
}

export default HomePage;