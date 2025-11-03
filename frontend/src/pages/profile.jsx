// javascript
import React, { useContext, useState } from "react";
import {
    Card,
    Form,
    Input,
    Button,
    Row,
    Col,
    Avatar,
    Radio,
    Select,
    Space,
    Typography,
    Upload,
    Descriptions,
    Tag,
} from "antd";
import { UserOutlined, DeleteOutlined } from "@ant-design/icons";
import { AuthContext } from "../components/context/auth.context";
import { getRoleName, ROLES } from "../constants/roles";
import logo from "../assets/logo.png";

const { Text } = Typography;
const { Option } = Select;

const maskEmail = (email) => {
    if (!email) return "N/A";
    const [local, domain] = email.split("@");
    const maskedLocal = local.length <= 2 ? local : local[0] + "*******" + local.slice(-1);
    return `${maskedLocal}@${domain}`;
};
const maskPhone = (phone) => {
    if (!phone) return "N/A";
    const s = phone.replace(/\D/g, "");
    if (s.length <= 4) return "****";
    return "*".repeat(Math.max(0, s.length - 2)) + s.slice(-2);
};

const beforeUploadValidate = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
        return Upload.LIST_IGNORE;
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
        return Upload.LIST_IGNORE;
    }
    return false; // valid file -> prevent auto upload, we'll preview manually
};

const formatDob = (user) => {
    if (!user?.dob) return "N/A";
    const d = new Date(user.dob);
    if (Number.isNaN(d.getTime())) return user.dob;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`;
};

const formatCreated = (ts) => {
    if (!ts) return "N/A";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    return d.toLocaleString();
};

const ProfilePage = () => {
    const { auth } = useContext(AuthContext);
    const user = auth?.user ?? {};
    const [form] = Form.useForm();
    const [avatarPreview, setAvatarPreview] = useState(user.avatar_url || null);
    const [uploadKey, setUploadKey] = useState(Date.now()); // to reset Upload input
    const [editAll, setEditAll] = useState(false);

    const onSave = (values) => {
        // TODO: call API to update profile
        console.log("Save profile values:", values);
        setEditAll(false);
    };

    const handleUploadChange = (info) => {
        const file = info?.file?.originFileObj || info?.file;
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => setAvatarPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setUploadKey(Date.now());
    };

    const dob = user.dob ? new Date(user.dob) : null;
    const initialDob = {
        day: dob ? dob.getDate() : undefined,
        month: dob ? dob.getMonth() + 1 : undefined,
        year: dob ? dob.getFullYear() : undefined,
    };

    // initialize form values when component mounts / user changes
    React.useEffect(() => {
        form.setFieldsValue({
            username: user.username,
            name: user.first_name || user.name || "",
            email: user.email,
            phone: user.phone,
            gender: user.gender || user.sex || "",
            ...initialDob,
        });
    }, [user]);

    return (
        <div
            style={{
                padding: 32,
                maxWidth: 1100,
                margin: "0 auto",
                background:
                    "linear-gradient(180deg, rgba(250,250,252,1) 0%, rgba(245,247,250,1) 100%)",
                minHeight: "100vh",
            }}
        >
            <Row align="middle" gutter={16} style={{ marginBottom: 18 }}>
                <Col>
                    <img src={logo} alt="logo" style={{ height: 48, width: 48, objectFit: "contain" }} />
                </Col>
                <Col flex="auto">
                    <h2 style={{ margin: 0 }}>Hồ Sơ Của Tôi</h2>
                    <div style={{ color: "#666" }}>Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col xs={24} lg={16}>
                    <Card
                        style={{
                            borderRadius: 12,
                            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
                            border: "none",
                        }}
                        bodyStyle={{ padding: 24 }}
                    >
                        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                            <Col>
                                <h3 style={{ margin: 0 }}>Thông tin cá nhân</h3>
                            </Col>
                            <Col>
                                {editAll ? (
                                    <Space>
                                        <Button onClick={() => { form.resetFields(); setEditAll(false); }}>Hủy</Button>
                                        <Button type="primary" onClick={() => form.submit()} style={{ background: "#ff6b3c", borderColor: "#ff6b3c" }}>
                                            Lưu
                                        </Button>
                                    </Space>
                                ) : (
                                    <Button type="primary" onClick={() => setEditAll(true)} style={{ background: "#1890ff", borderColor: "#1890ff" }}>
                                        Chỉnh sửa
                                    </Button>
                                )}
                            </Col>
                        </Row>

                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{
                                username: user.username,
                                name: user.first_name || user.name || "",
                                email: user.email,
                                phone: user.phone,
                                gender: user.gender || user.sex || "",
                                ...initialDob,
                            }}
                            onFinish={onSave}
                        >
                            <Descriptions bordered column={1} size="middle">
                                <Descriptions.Item label="Tên đăng nhập">
                                    {!editAll ? (
                                        <Text>{user.username || "—"}</Text>
                                    ) : (
                                        <Form.Item name="username" noStyle>
                                            <Input />
                                        </Form.Item>
                                    )}
                                </Descriptions.Item>

                                <Descriptions.Item label="Họ và tên">
                                    {!editAll ? (
                                        <Text>{user.first_name || user.name || "—"}</Text>
                                    ) : (
                                        <Form.Item name="name" noStyle>
                                            <Input />
                                        </Form.Item>
                                    )}
                                </Descriptions.Item>

                                <Descriptions.Item label="Email">
                                    {!editAll ? (
                                        <Text>{maskEmail(user.email)}</Text>
                                    ) : (
                                        <Form.Item name="email" noStyle rules={[{ type: "email", message: "Email không hợp lệ" }]}>
                                            <Input />
                                        </Form.Item>
                                    )}
                                </Descriptions.Item>

                                <Descriptions.Item label="Số điện thoại">
                                    {!editAll ? (
                                        <Text>{maskPhone(user.phone)}</Text>
                                    ) : (
                                        <Form.Item
                                            name="phone"
                                            noStyle
                                            rules={[{ pattern: /^\+?\d{6,}$/, message: "Số điện thoại không hợp lệ" }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    )}
                                </Descriptions.Item>

                                <Descriptions.Item label="Giới tính">
                                    {!editAll ? (
                                        <Text>{(user.gender || user.sex) ? (String(user.gender || user.sex).toUpperCase()) : "—"}</Text>
                                    ) : (
                                        <Form.Item name="gender" noStyle>
                                            <Radio.Group>
                                                <Radio value="male">Nam</Radio>
                                                <Radio value="female">Nữ</Radio>
                                                <Radio value="other">Khác</Radio>
                                            </Radio.Group>
                                        </Form.Item>
                                    )}
                                </Descriptions.Item>

                                <Descriptions.Item label="Ngày sinh">
                                    {!editAll ? (
                                        <Text>{formatDob(user)}</Text>
                                    ) : (
                                        <Space>
                                            <Form.Item name="day" noStyle>
                                                <Select placeholder="Day" style={{ width: 100 }}>
                                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                                        <Option key={d} value={d}>
                                                            {d}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item name="month" noStyle>
                                                <Select placeholder="Month" style={{ width: 120 }}>
                                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                                        <Option key={m} value={m}>
                                                            {m}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item name="year" noStyle>
                                                <Select placeholder="Year" style={{ width: 120 }}>
                                                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                                        <Option key={y} value={y}>
                                                            {y}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Space>
                                    )}
                                </Descriptions.Item>

                                <Descriptions.Item label="Tiểu sử">
                                    {!editAll ? (
                                        <Text>{user.bio || user.description || "—"}</Text>
                                    ) : (
                                        <Form.Item name="bio" noStyle>
                                            <Input.TextArea rows={3} />
                                        </Form.Item>
                                    )}
                                </Descriptions.Item>

                                <Descriptions.Item label="Ngày tạo tài khoản">
                                    <Text>{formatCreated(user.created_at || user.createdAt || user.date_joined)}</Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Trạng thái">
                                    {user.is_active ? <Tag color="success">Đang hoạt động</Tag> : <Tag>Không hoạt động</Tag>}
                                </Descriptions.Item>
                            </Descriptions>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        style={{
                            borderRadius: 12,
                            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
                            border: "none",
                            textAlign: "center",
                            position: "relative",
                            overflow: "hidden",
                        }}
                        bodyStyle={{ padding: 24 }}
                    >
                        {/* subtle logo watermark */}
                        <img
                            src={logo}
                            alt=""
                            style={{
                                position: "absolute",
                                right: -20,
                                top: -20,
                                width: 120,
                                height: 120,
                                opacity: 0.06,
                                transform: "rotate(-15deg)",
                                pointerEvents: "none",
                            }}
                        />

                        <div style={{ marginBottom: 12 }}>
                            <Avatar
                                size={112}
                                src={avatarPreview}
                                icon={!avatarPreview && <UserOutlined />}
                                style={{
                                    border: "4px solid rgba(255,107,60,0.12)",
                                    boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                                }}
                            />
                        </div>

                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Upload
                                key={uploadKey}
                                beforeUpload={beforeUploadValidate}
                                showUploadList={false}
                                customRequest={({ file, onSuccess }) => {
                                    setTimeout(() => onSuccess && onSuccess("ok"), 0);
                                }}
                                onChange={handleUploadChange}
                                accept=".jpg,.jpeg,.png"
                            >
                                <Button type="primary" style={{ background: "#ff6b3c", borderColor: "#ff6b3c" }}>
                                    Chọn Ảnh
                                </Button>
                            </Upload>

                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleRemoveAvatar}
                                style={{ margin: "0 auto" }}
                                type="text"
                            >
                                Xóa ảnh
                            </Button>

                            <div style={{ marginTop: 4, color: "#999", fontSize: 13 }}>
                                Dung lượng tối đa 1 MB • JPEG, PNG
                            </div>

                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary">Vai trò: </Text>
                                <Text>{getRoleName(user.role)} </Text>
                            </div>

                            <div style={{ marginTop: 12, textAlign: "center" }}>
                                <Button type="primary" style={{ width: "100%", background: "#1677ff", borderColor: "#1677ff" }}>
                                    Đổi mật khẩu
                                </Button>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProfilePage;
