// Mock data cho profile components

export const mockUserData = {
  id: "85d0a935-7dfd-4611-a672-191fa408a8b9",
  username: "admin",
  firstName: "Nguyễn Văn",
  lastName: "An",
  dob: "1990-05-15",
  phone: "0123456789",
  email: "admin@gmail.com",
  avatarName: null,
  avatarUrl: null,
  enabled: true,
  isVerified: true,
  createdAt: "2025-10-22T01:48:01.730009",
  updatedAt: "2025-10-22T01:48:01.730009",
  roles: [
    {
      name: "ADMIN",
      description: "Administrator role with full access",
    },
  ],
  addresses: [],
  gender: "MALE",
  sellerProfile: null,
};

export const mockSellerData = {
  shopName: "Cửa hàng điện tử ABC",
  shopLogo: null,
  businessName: "Công ty TNHH Thương Mại ABC",
  businessAddress: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  taxCode: "0123456789",
  description:
    "Chuyên cung cấp các sản phẩm điện tử chính hãng với giá cả cạnh tranh. Cam kết bảo hành tốt nhất thị trường.",
  contactPhone: "0987654321",
  contactEmail: "shop@abc.com",
  totalProducts: 156,
  totalOrders: 1243,
  rating: 4.8,
  totalRevenue: 2450000000,
};

export const mockOrders = [
  {
    id: "ORD-2025-001",
    orderDate: "2025-11-10T10:30:00",
    status: "shipping",
    totalAmount: 15990000,
    products: [
      {
        name: "iPhone 15 Pro Max 256GB",
        image: "https://via.placeholder.com/80",
        quantity: 1,
        price: 15990000,
      },
    ],
  },
  {
    id: "ORD-2025-002",
    orderDate: "2025-11-08T14:20:00",
    status: "completed",
    totalAmount: 8990000,
    products: [
      {
        name: "Samsung Galaxy S24 Ultra",
        image: "https://via.placeholder.com/80",
        quantity: 1,
        price: 8990000,
      },
    ],
  },
  {
    id: "ORD-2025-003",
    orderDate: "2025-11-05T09:15:00",
    status: "pending",
    totalAmount: 12500000,
    products: [
      {
        name: "MacBook Air M2 2024",
        image: "https://via.placeholder.com/80",
        quantity: 1,
        price: 12500000,
      },
    ],
  },
  {
    id: "ORD-2025-004",
    orderDate: "2025-11-03T16:45:00",
    status: "confirmed",
    totalAmount: 5990000,
    products: [
      {
        name: "iPad Air 5th Gen",
        image: "https://via.placeholder.com/80",
        quantity: 1,
        price: 5990000,
      },
    ],
  },
  {
    id: "ORD-2025-005",
    orderDate: "2025-11-01T11:00:00",
    status: "cancelled",
    totalAmount: 3490000,
    products: [
      {
        name: "AirPods Pro 2nd Gen",
        image: "https://via.placeholder.com/80",
        quantity: 2,
        price: 1745000,
      },
    ],
  },
];

export const mockAddresses = [
  {
    id: "ADDR-001",
    recipientName: "Nguyễn Văn An",
    phone: "0123456789",
    province: "Hồ Chí Minh",
    district: "Quận 1",
    ward: "Phường Bến Nghé",
    detailAddress: "123 Nguyễn Huệ",
    isDefault: true,
  },
  {
    id: "ADDR-002",
    recipientName: "Nguyễn Văn An",
    phone: "0123456789",
    province: "Hà Nội",
    district: "Quận Hoàn Kiếm",
    ward: "Phường Hàng Bài",
    detailAddress: "456 Tràng Tiền",
    isDefault: false,
  },
  {
    id: "ADDR-003",
    recipientName: "Trần Thị Bình",
    phone: "0987654321",
    province: "Đà Nẵng",
    district: "Quận Hải Châu",
    ward: "Phường Thạch Thang",
    detailAddress: "789 Lê Duẩn",
    isDefault: false,
  },
];

export const mockTransactions = [
  {
    id: "TXN-2025-001",
    date: "2025-11-10T10:30:00",
    type: "payment",
    amount: 15990000,
    description: "Thanh toán đơn hàng ORD-2025-001",
  },
  {
    id: "TXN-2025-002",
    date: "2025-11-08T14:20:00",
    type: "payment",
    amount: 8990000,
    description: "Thanh toán đơn hàng ORD-2025-002",
  },
  {
    id: "TXN-2025-003",
    date: "2025-11-07T09:00:00",
    type: "refund",
    amount: 3490000,
    description: "Hoàn tiền đơn hàng ORD-2025-005",
  },
  {
    id: "TXN-2025-004",
    date: "2025-11-05T09:15:00",
    type: "payment",
    amount: 12500000,
    description: "Thanh toán đơn hàng ORD-2025-003",
  },
  {
    id: "TXN-2025-005",
    date: "2025-11-03T16:45:00",
    type: "payment",
    amount: 5990000,
    description: "Thanh toán đơn hàng ORD-2025-004",
  },
  {
    id: "TXN-2025-006",
    date: "2025-11-01T11:00:00",
    type: "payment",
    amount: 3490000,
    description: "Thanh toán đơn hàng ORD-2025-005",
  },
  {
    id: "TXN-2025-007",
    date: "2025-10-28T15:30:00",
    type: "refund",
    amount: 2990000,
    description: "Hoàn tiền sản phẩm lỗi",
  },
  {
    id: "TXN-2025-008",
    date: "2025-10-25T10:00:00",
    type: "payment",
    amount: 7990000,
    description: "Thanh toán đơn hàng",
  },
];
