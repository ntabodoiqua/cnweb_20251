import React from "react";
import styles from "../../../styles/privacy.module.css";
import useScrollToTop from "../../../hooks/useScrollToTop";
import {
  LockOutlined,
  SafetyOutlined,
  EyeOutlined,
  DatabaseOutlined,
  UserOutlined,
  GlobalOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import logo from "../../../assets/logo.png";

const Privacy = () => {
  useScrollToTop();

  const lastUpdated = "01/11/2025";

  const sections = [
    {
      id: 1,
      icon: <DatabaseOutlined />,
      title: "1. Thông tin chúng tôi thu thập",
      content: [
        "HUSTBuy thu thập các loại thông tin sau để cung cấp dịch vụ tốt nhất cho bạn:",
        "• Thông tin cá nhân: Họ tên, địa chỉ email, số điện thoại, địa chỉ giao hàng",
        "• Thông tin tài khoản: Tên đăng nhập, mật khẩu (được mã hóa)",
        "• Thông tin giao dịch: Lịch sử mua hàng, phương thức thanh toán",
        "• Thông tin kỹ thuật: Địa chỉ IP, loại trình duyệt, hệ điều hành, cookies",
        "• Thông tin tương tác: Sản phẩm đã xem, tìm kiếm, đánh giá và nhận xét",
        "Chúng tôi chỉ thu thập thông tin cần thiết để cung cấp và cải thiện dịch vụ.",
      ],
    },
    {
      id: 2,
      icon: <EyeOutlined />,
      title: "2. Cách chúng tôi sử dụng thông tin",
      content: [
        "Thông tin của bạn được sử dụng cho các mục đích sau:",
        "• Xử lý đơn hàng và giao hàng cho bạn",
        "• Gửi thông báo về đơn hàng, khuyến mãi và cập nhật dịch vụ",
        "• Cá nhân hóa trải nghiệm mua sắm của bạn",
        "• Cải thiện chất lượng dịch vụ và website",
        "• Phân tích hành vi người dùng để tối ưu hóa sản phẩm",
        "• Phòng chống gian lận và bảo vệ an ninh",
        "• Tuân thủ các yêu cầu pháp lý",
        "Chúng tôi cam kết không sử dụng thông tin của bạn cho mục đích khác mà không có sự đồng ý của bạn.",
      ],
    },
    {
      id: 3,
      icon: <SafetyOutlined />,
      title: "3. Bảo vệ thông tin",
      content: [
        "HUSTBuy áp dụng các biện pháp bảo mật nghiêm ngặt để bảo vệ thông tin của bạn:",
        "• Mã hóa SSL/TLS cho tất cả các giao dịch và truyền tải dữ liệu",
        "• Mã hóa mật khẩu bằng thuật toán băm an toàn",
        "• Tường lửa và hệ thống phát hiện xâm nhập",
        "• Kiểm soát truy cập nghiêm ngặt đối với dữ liệu nhạy cảm",
        "• Sao lưu dữ liệu thường xuyên",
        "• Đào tạo nhân viên về bảo mật thông tin",
        "• Kiểm tra và cập nhật bảo mật định kỳ",
        "Tuy nhiên, không có phương pháp truyền tải hoặc lưu trữ dữ liệu nào là 100% an toàn. Chúng tôi khuyến khích bạn bảo vệ thông tin tài khoản của mình.",
      ],
    },
    {
      id: 4,
      icon: <GlobalOutlined />,
      title: "4. Chia sẻ thông tin",
      content: [
        "Chúng tôi có thể chia sẻ thông tin của bạn với các bên thứ ba trong các trường hợp sau:",
        "• Đối tác vận chuyển: Để giao hàng cho bạn",
        "• Đối tác thanh toán: Để xử lý giao dịch (ZaloPay, VNPay, v.v.)",
        "• Nhà cung cấp dịch vụ: Email, SMS, analytics, cloud hosting",
        "• Cơ quan pháp luật: Khi có yêu cầu hợp pháp",
        "• Các bên liên quan trong giao dịch sáp nhập hoặc mua bán doanh nghiệp",
        "Chúng tôi yêu cầu tất cả các bên thứ ba phải bảo vệ thông tin của bạn và chỉ sử dụng cho mục đích được chỉ định.",
      ],
    },
    {
      id: 5,
      icon: <LockOutlined />,
      title: "5. Cookies và công nghệ theo dõi",
      content: [
        "HUSTBuy sử dụng cookies và các công nghệ tương tự để:",
        "• Ghi nhớ thông tin đăng nhập và tùy chọn của bạn",
        "• Phân tích lưu lượng truy cập và hành vi người dùng",
        "• Cá nhân hóa nội dung và quảng cáo",
        "• Cải thiện hiệu suất website",
        "Bạn có thể quản lý cookies thông qua cài đặt trình duyệt. Tuy nhiên, việc vô hiệu hóa cookies có thể ảnh hưởng đến trải nghiệm sử dụng website.",
        "Chúng tôi sử dụng Google Analytics và các công cụ phân tích khác để hiểu rõ hơn về người dùng.",
      ],
    },
    {
      id: 6,
      icon: <UserOutlined />,
      title: "6. Quyền của người dùng",
      content: [
        "Bạn có các quyền sau đối với thông tin cá nhân của mình:",
        "• Quyền truy cập: Yêu cầu xem thông tin chúng tôi đang lưu trữ về bạn",
        "• Quyền chỉnh sửa: Cập nhật hoặc sửa đổi thông tin không chính xác",
        "• Quyền xóa: Yêu cầu xóa thông tin của bạn trong một số trường hợp nhất định",
        "• Quyền hạn chế: Yêu cầu hạn chế việc xử lý thông tin của bạn",
        "• Quyền di chuyển dữ liệu: Yêu cầu chuyển dữ liệu của bạn sang nhà cung cấp khác",
        "• Quyền phản đối: Phản đối việc xử lý thông tin cho mục đích tiếp thị",
        "Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua email: anhnta2004@gmail.com",
      ],
    },
    {
      id: 7,
      icon: <SafetyOutlined />,
      title: "7. Lưu trữ và xóa thông tin",
      content: [
        "Chúng tôi lưu trữ thông tin của bạn trong thời gian cần thiết để:",
        "• Cung cấp dịch vụ cho bạn",
        "• Tuân thủ các nghĩa vụ pháp lý",
        "• Giải quyết tranh chấp",
        "• Thực thi các thỏa thuận của chúng tôi",
        "Khi bạn xóa tài khoản, chúng tôi sẽ xóa hoặc ẩn danh hóa thông tin cá nhân của bạn, trừ khi pháp luật yêu cầu lưu trữ.",
        "Thông tin giao dịch có thể được lưu trữ lâu hơn để tuân thủ quy định về thuế và kế toán.",
      ],
    },
    {
      id: 8,
      icon: <WarningOutlined />,
      title: "8. Thông tin trẻ em",
      content: [
        "Dịch vụ của chúng tôi không nhắm đến trẻ em dưới 16 tuổi.",
        "Chúng tôi không cố ý thu thập thông tin cá nhân của trẻ em dưới 16 tuổi.",
        "Nếu bạn là cha mẹ hoặc người giám hộ và phát hiện con bạn đã cung cấp thông tin cho chúng tôi, vui lòng liên hệ để chúng tôi có thể xóa thông tin đó.",
      ],
    },
    {
      id: 9,
      icon: <GlobalOutlined />,
      title: "9. Liên kết đến website khác",
      content: [
        "Website của chúng tôi có thể chứa liên kết đến các website của bên thứ ba.",
        "Chúng tôi không chịu trách nhiệm về chính sách bảo mật hoặc nội dung của các website này.",
        "Chúng tôi khuyến khích bạn đọc chính sách bảo mật của các website bên thứ ba trước khi cung cấp thông tin cá nhân.",
      ],
    },
    {
      id: 10,
      icon: <LockOutlined />,
      title: "10. Thay đổi chính sách",
      content: [
        "HUSTBuy có quyền cập nhật chính sách bảo mật này để phản ánh:",
        "• Thay đổi trong hoạt động kinh doanh",
        "• Thay đổi pháp lý hoặc quy định",
        "• Cải tiến trong việc bảo vệ quyền riêng tư",
        "Các thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trên website.",
        "Chúng tôi khuyến khích bạn thường xuyên xem lại chính sách này để cập nhật thông tin mới nhất.",
      ],
    },
    {
      id: 11,
      icon: <UserOutlined />,
      title: "11. Liên hệ với chúng tôi",
      content: [
        "Nếu bạn có bất kỳ câu hỏi, thắc mắc hoặc yêu cầu nào về chính sách bảo mật này, vui lòng liên hệ:",
        "• Email: anhnta2004@gmail.com",
        "• Điện thoại: 0966 277 109",
        "• Địa chỉ: Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
        "Chúng tôi cam kết phản hồi mọi yêu cầu trong vòng 7 ngày làm việc.",
      ],
    },
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={`${styles.heroCircle} ${styles.heroCircle1}`}></div>
          <div className={`${styles.heroCircle} ${styles.heroCircle2}`}></div>
          <div className={`${styles.heroCircle} ${styles.heroCircle3}`}></div>
        </div>
        <div className={styles.heroContent}>
          <img src={logo} alt="HUSTBuy Logo" className={styles.heroLogo} />
          <h1 className={styles.heroTitle}>Chính Sách Bảo Mật</h1>
          <div className={styles.heroSubtitle}>
            Cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn
          </div>
          <div className={styles.lastUpdated}>
            Cập nhật lần cuối: {lastUpdated}
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className={styles.privacyIntro}>
        <LockOutlined className={styles.introIcon} />
        <div className={styles.introContent}>
          <h3>Quyền riêng tư của bạn rất quan trọng với chúng tôi</h3>
          <p>
            Chính sách bảo mật này giải thích cách HUSTBuy thu thập, sử dụng,
            bảo vệ và chia sẻ thông tin cá nhân của bạn khi sử dụng dịch vụ của
            chúng tôi. Chúng tôi cam kết bảo vệ quyền riêng tư của bạn và tuân
            thủ các quy định pháp luật về bảo vệ dữ liệu cá nhân.
          </p>
        </div>
      </div>

      {/* Privacy Sections */}
      <div className={styles.privacyContent}>
        {sections.map((section) => (
          <div key={section.id} className={styles.privacySection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>{section.icon}</div>
              <h2>{section.title}</h2>
            </div>
            <div className={styles.sectionContent}>
              {section.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badge */}
      <div className={styles.privacyBadge}>
        <SafetyOutlined className={styles.badgeIcon} />
        <div className={styles.badgeContent}>
          <h3>Cam kết bảo mật</h3>
          <p>
            HUSTBuy sử dụng các công nghệ bảo mật tiên tiến và tuân thủ nghiêm
            ngặt các tiêu chuẩn quốc tế về bảo vệ dữ liệu. Chúng tôi không bao
            giờ bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;