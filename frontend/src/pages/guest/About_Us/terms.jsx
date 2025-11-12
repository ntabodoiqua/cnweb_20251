import React from "react";
import "../../../styles/terms.css";
import useScrollToTop from "../../../hooks/useScrollToTop";
import {
  SafetyOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  UserOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import logo from "../../../assets/logo.png";

const Terms = () => {
  useScrollToTop();

  const lastUpdated = "01/11/2025";

  const sections = [
    {
      id: 1,
      icon: <FileTextOutlined />,
      title: "1. Giới thiệu",
      content: [
        "Chào mừng bạn đến với HUSTBuy - nền tảng thương mại điện tử hàng đầu Việt Nam.",
        "Bằng việc truy cập và sử dụng website HUSTBuy, bạn đồng ý tuân thủ và chịu ràng buộc bởi các điều khoản và điều kiện sử dụng sau đây.",
        "Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.",
      ],
    },
    {
      id: 2,
      icon: <UserOutlined />,
      title: "2. Tài khoản người dùng",
      content: [
        "Để sử dụng một số tính năng của HUSTBuy, bạn cần tạo tài khoản bằng cách cung cấp thông tin chính xác và đầy đủ.",
        "Bạn có trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình. Mọi hoạt động diễn ra dưới tài khoản của bạn đều là trách nhiệm của bạn.",
        "Bạn phải thông báo ngay cho chúng tôi nếu phát hiện bất kỳ truy cập trái phép nào vào tài khoản của bạn.",
        "Chúng tôi có quyền đình chỉ hoặc chấm dứt tài khoản của bạn nếu phát hiện vi phạm điều khoản sử dụng.",
      ],
    },
    {
      id: 3,
      icon: <ShoppingOutlined />,
      title: "3. Sử dụng dịch vụ",
      content: [
        "Bạn đồng ý sử dụng dịch vụ của HUSTBuy cho mục đích hợp pháp và phù hợp với các quy định pháp luật hiện hành.",
        "Bạn không được sử dụng dịch vụ để:",
        "• Đăng tải, truyền tải hoặc phân phối bất kỳ nội dung vi phạm pháp luật, xúc phạm, hoặc gây hại",
        "• Giả mạo hoặc sử dụng thông tin của người khác mà không được phép",
        "• Can thiệp hoặc phá hoại hệ thống, mạng hoặc dữ liệu của HUSTBuy",
        "• Thu thập thông tin người dùng khác mà không được phép",
        "• Sử dụng robot, crawler hoặc các công cụ tự động khác để truy cập dịch vụ",
      ],
    },
    {
      id: 4,
      icon: <CreditCardOutlined />,
      title: "4. Đặt hàng và thanh toán",
      content: [
        "Khi đặt hàng trên HUSTBuy, bạn cam kết cung cấp thông tin chính xác và đầy đủ.",
        "Giá cả và thông tin sản phẩm có thể thay đổi mà không cần thông báo trước. Chúng tôi sẽ cố gắng cập nhật thông tin kịp thời.",
        "Chúng tôi có quyền từ chối hoặc hủy bỏ đơn hàng trong các trường hợp:",
        "• Thông tin đặt hàng không chính xác hoặc không đầy đủ",
        "• Sản phẩm hết hàng hoặc không còn kinh doanh",
        "• Phát hiện gian lận hoặc hoạt động đáng ngờ",
        "• Lỗi kỹ thuật dẫn đến giá cả hoặc thông tin sản phẩm không chính xác",
        "Thanh toán được thực hiện thông qua các cổng thanh toán an toàn và uy tín.",
      ],
    },
    {
      id: 5,
      icon: <SafetyOutlined />,
      title: "5. Chính sách đổi trả và hoàn tiền",
      content: [
        "Sản phẩm có thể được đổi trả trong vòng 7 ngày kể từ ngày nhận hàng nếu:",
        "• Sản phẩm bị lỗi do nhà sản xuất",
        "• Sản phẩm không đúng như mô tả",
        "• Sản phẩm bị hư hỏng trong quá trình vận chuyển",
        "Sản phẩm đổi trả phải còn nguyên vẹn, chưa qua sử dụng, còn đầy đủ bao bì và phụ kiện.",
        "Hoàn tiền sẽ được xử lý trong vòng 7-14 ngày làm việc sau khi chúng tôi nhận được sản phẩm hoàn trả.",
      ],
    },
    {
      id: 6,
      icon: <WarningOutlined />,
      title: "6. Sở hữu trí tuệ",
      content: [
        "Tất cả nội dung trên website HUSTBuy, bao gồm nhưng không giới hạn ở văn bản, hình ảnh, logo, biểu tượng, và phần mềm, đều thuộc quyền sở hữu của HUSTBuy hoặc các bên cấp phép.",
        "Bạn không được sao chép, phân phối, sửa đổi, hoặc sử dụng bất kỳ nội dung nào của chúng tôi mà không có sự cho phép bằng văn bản.",
        "Việc vi phạm quyền sở hữu trí tuệ có thể dẫn đến các hành động pháp lý.",
      ],
    },
    {
      id: 7,
      icon: <CheckCircleOutlined />,
      title: "7. Giới hạn trách nhiệm",
      content: [
        "HUSTBuy cung cấp dịch vụ trên cơ sở 'nguyên trạng' và 'sẵn có'.",
        "Chúng tôi không đảm bảo rằng dịch vụ sẽ hoạt động liên tục, không bị gián đoạn, hoặc không có lỗi.",
        "Chúng tôi không chịu trách nhiệm về:",
        "• Bất kỳ tổn thất hoặc thiệt hại nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ",
        "• Thông tin không chính xác hoặc không đầy đủ về sản phẩm",
        "• Hành vi của người bán hoặc người mua khác trên nền tảng",
        "• Virus hoặc phần mềm độc hại có thể xâm nhập vào thiết bị của bạn khi sử dụng dịch vụ",
      ],
    },
    {
      id: 8,
      icon: <FileTextOutlined />,
      title: "8. Thay đổi điều khoản",
      content: [
        "HUSTBuy có quyền thay đổi, sửa đổi hoặc cập nhật các điều khoản sử dụng này bất cứ lúc nào.",
        "Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website.",
        "Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.",
        "Chúng tôi khuyến khích bạn thường xuyên kiểm tra trang này để cập nhật các thay đổi.",
      ],
    },
    {
      id: 9,
      icon: <UserOutlined />,
      title: "9. Luật áp dụng",
      content: [
        "Các điều khoản này được điều chỉnh và giải thích theo pháp luật Việt Nam.",
        "Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng. Nếu không đạt được thỏa thuận, tranh chấp sẽ được đưa ra Tòa án có thẩm quyền tại Việt Nam.",
      ],
    },
    {
      id: 10,
      icon: <SafetyOutlined />,
      title: "10. Liên hệ",
      content: [
        "Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào về các điều khoản sử dụng này, vui lòng liên hệ với chúng tôi:",
        "• Email: anhnta2004@gmail.com",
        "• Điện thoại: 0966 277 109",
        "• Địa chỉ: Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
      ],
    },
  ];

  return (
    <div className="terms-container">
      {/* Hero Section */}
      <div className="terms-hero">
        <div className="hero-background">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
        <div className="hero-content">
          <img src={logo} alt="HUSTBuy Logo" className="hero-logo" />
          <h1 className="hero-title">Điều Khoản Sử Dụng</h1>
          <div className="hero-subtitle">
            Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ
          </div>
          <div className="last-updated">
            Cập nhật lần cuối: {lastUpdated}
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="terms-intro">
        <p>
          Các điều khoản và điều kiện sau đây quy định việc sử dụng dịch vụ của
          HUSTBuy. Bằng cách truy cập và sử dụng website, bạn đồng ý tuân thủ
          các điều khoản này. Nếu bạn không đồng ý, vui lòng không sử dụng dịch
          vụ của chúng tôi.
        </p>
      </div>

      {/* Terms Sections */}
      <div className="terms-content">
        {sections.map((section) => (
          <div key={section.id} className="terms-section">
            <div className="section-header">
              <div className="section-icon">{section.icon}</div>
              <h2>{section.title}</h2>
            </div>
            <div className="section-content">
              {section.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Important Notice */}
      <div className="terms-notice">
        <WarningOutlined className="notice-icon" />
        <div className="notice-content">
          <h3>Lưu ý quan trọng</h3>
          <p>
            Bằng việc sử dụng dịch vụ của HUSTBuy, bạn xác nhận rằng đã đọc,
            hiểu và đồng ý với tất cả các điều khoản và điều kiện được nêu
            trong tài liệu này. Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ
            với chúng tôi trước khi sử dụng dịch vụ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
