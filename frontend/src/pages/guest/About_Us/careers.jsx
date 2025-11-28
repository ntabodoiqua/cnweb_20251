import React, { useState } from "react";
import styles from "../../../styles/careers.module.css";
import useScrollToTop from "../../../hooks/useScrollToTop";
import {
  RocketOutlined,
  TeamOutlined,
  TrophyOutlined,
  HeartOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  RightOutlined,
  GiftOutlined,
  SafetyOutlined,
  CoffeeOutlined,
  CalendarOutlined,
  StarOutlined,
  FireOutlined,
} from "@ant-design/icons";
import logo from "../../../assets/logo.png";

const Careers = () => {
  useScrollToTop();

  const [selectedJob, setSelectedJob] = useState(null);

  // Danh sách các vị trí tuyển dụng
  const jobPositions = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Hà Nội",
      type: "Full-time",
      salary: "25-35 triệu VNĐ",
      level: "Senior",
      description:
        "Chúng tôi đang tìm kiếm một Senior Frontend Developer có kinh nghiệm với React.js để xây dựng giao diện người dùng tuyệt vời cho nền tảng thương mại điện tử của chúng tôi.",
      requirements: [
        "3+ năm kinh nghiệm với React.js, Redux",
        "Thành thạo HTML5, CSS3, JavaScript (ES6+)",
        "Kinh nghiệm với responsive design và mobile-first approach",
        "Hiểu biết về UX/UI design principles",
        "Kinh nghiệm làm việc với RESTful APIs",
        "Có kinh nghiệm với Git và Agile methodology",
      ],
      responsibilities: [
        "Phát triển và duy trì các tính năng frontend cho website",
        "Tối ưu hóa hiệu suất và trải nghiệm người dùng",
        "Làm việc chặt chẽ với team design và backend",
        "Code review và mentoring junior developers",
        "Tham gia vào việc thiết kế kiến trúc frontend",
      ],
      hot: true,
    },
    {
      id: 2,
      title: "Backend Engineer (Java/Spring Boot)",
      department: "Engineering",
      location: "Hà Nội",
      type: "Full-time",
      salary: "30-45 triệu VNĐ",
      level: "Senior",
      description:
        "Tham gia xây dựng và phát triển hệ thống microservices cho nền tảng e-commerce quy mô lớn với hàng triệu người dùng.",
      requirements: [
        "4+ năm kinh nghiệm với Java và Spring Boot",
        "Thành thạo microservices architecture",
        "Kinh nghiệm với MySQL, PostgreSQL, MongoDB",
        "Hiểu biết về Redis, RabbitMQ/Kafka",
        "Kinh nghiệm với Docker, Kubernetes",
        "Có kinh nghiệm với cloud platforms (AWS, Azure)",
      ],
      responsibilities: [
        "Thiết kế và phát triển RESTful APIs",
        "Xây dựng và tối ưu hóa microservices",
        "Đảm bảo hiệu suất và khả năng mở rộng của hệ thống",
        "Tích hợp với các dịch vụ bên thứ ba",
        "Xử lý và tối ưu hóa database queries",
      ],
      hot: true,
    },
    {
      id: 3,
      title: "DevOps Engineer",
      department: "Infrastructure",
      location: "Hà Nội / Remote",
      type: "Full-time",
      salary: "28-40 triệu VNĐ",
      level: "Middle/Senior",
      description:
        "Xây dựng và duy trì infrastructure cho hệ thống e-commerce, đảm bảo uptime cao và khả năng scale tốt.",
      requirements: [
        "2+ năm kinh nghiệm DevOps/SRE",
        "Thành thạo Docker, Kubernetes",
        "Kinh nghiệm với CI/CD tools (Jenkins, GitLab CI)",
        "Hiểu biết về monitoring tools (Prometheus, Grafana)",
        "Kinh nghiệm với cloud platforms",
        "Có kiến thức về security best practices",
      ],
      responsibilities: [
        "Quản lý và tối ưu hóa cloud infrastructure",
        "Xây dựng và duy trì CI/CD pipelines",
        "Monitoring và troubleshooting production issues",
        "Đảm bảo security và compliance",
        "Automation và infrastructure as code",
      ],
      hot: false,
    },
    {
      id: 4,
      title: "Product Manager",
      department: "Product",
      location: "Hà Nội",
      type: "Full-time",
      salary: "35-50 triệu VNĐ",
      level: "Senior",
      description:
        "Định hướng và phát triển sản phẩm, làm việc với các team đa chức năng để mang lại giá trị tốt nhất cho người dùng.",
      requirements: [
        "3+ năm kinh nghiệm Product Management",
        "Kinh nghiệm trong lĩnh vực e-commerce là lợi thế",
        "Kỹ năng phân tích và ra quyết định dựa trên dữ liệu",
        "Khả năng giao tiếp và thuyết trình tốt",
        "Hiểu biết về agile/scrum methodology",
        "Tiếng Anh giao tiếp tốt",
      ],
      responsibilities: [
        "Định hướng và phát triển product roadmap",
        "Thu thập và phân tích feedback từ users",
        "Làm việc với stakeholders để prioritize features",
        "Quản lý product backlog và sprint planning",
        "Phân tích metrics và đưa ra insights",
      ],
      hot: false,
    },
    {
      id: 5,
      title: "UX/UI Designer",
      department: "Design",
      location: "Hà Nội",
      type: "Full-time",
      salary: "18-28 triệu VNĐ",
      level: "Middle",
      description:
        "Thiết kế trải nghiệm người dùng tuyệt vời cho nền tảng e-commerce, từ research đến prototype và final designs.",
      requirements: [
        "2+ năm kinh nghiệm UX/UI design",
        "Thành thạo Figma, Adobe XD, Sketch",
        "Hiểu biết về user-centered design",
        "Portfolio thể hiện design thinking process",
        "Kinh nghiệm với user research và testing",
        "Kỹ năng prototyping và wireframing",
      ],
      responsibilities: [
        "Nghiên cứu và phân tích user behavior",
        "Thiết kế user flows và wireframes",
        "Tạo high-fidelity mockups và prototypes",
        "Làm việc với developers để implement designs",
        "Conduct usability testing và iterate designs",
      ],
      hot: true,
    },
    {
      id: 6,
      title: "Data Analyst",
      department: "Data",
      location: "Hà Nội",
      type: "Full-time",
      salary: "20-30 triệu VNĐ",
      level: "Middle",
      description:
        "Phân tích dữ liệu để đưa ra insights giúp cải thiện business decisions và user experience.",
      requirements: [
        "2+ năm kinh nghiệm data analysis",
        "Thành thạo SQL và Excel",
        "Kinh nghiệm với Python/R cho data analysis",
        "Hiểu biết về statistical analysis",
        "Kinh nghiệm với visualization tools (Tableau, Power BI)",
        "Kỹ năng communication và presentation",
      ],
      responsibilities: [
        "Thu thập và phân tích dữ liệu business",
        "Tạo reports và dashboards",
        "Identify trends và patterns",
        "Đưa ra recommendations dựa trên data",
        "Hợp tác với các teams để improve metrics",
      ],
      hot: false,
    },
  ];

  // Danh sách lợi ích khi làm việc tại công ty
  const benefits = [
    {
      icon: <DollarOutlined />,
      title: "Lương thưởng hấp dẫn",
      description: "Mức lương cạnh tranh + thưởng theo hiệu suất",
      color: "#52c41a",
    },
    {
      icon: <SafetyOutlined />,
      title: "Bảo hiểm đầy đủ",
      description: "BHXH, BHYT, BHTN + Bảo hiểm sức khỏe cao cấp",
      color: "#1890ff",
    },
    {
      icon: <CalendarOutlined />,
      title: "Nghỉ phép linh hoạt",
      description: "12 ngày phép năm + nghỉ lễ theo quy định",
      color: "#722ed1",
    },
    {
      icon: <CoffeeOutlined />,
      title: "Môi trường năng động",
      description: "Văn hóa startup, làm việc linh hoạt",
      color: "#fa8c16",
    },
    {
      icon: <TrophyOutlined />,
      title: "Cơ hội phát triển",
      description: "Đào tạo & thăng tiến rõ ràng",
      color: "#eb2f96",
    },
    {
      icon: <GiftOutlined />,
      title: "Phúc lợi khác",
      description: "Team building, du lịch, happy hour",
      color: "#13c2c2",
    },
  ];

  // Danh sách các giá trị văn hóa công ty
  const cultureValues = [
    {
      icon: <RocketOutlined />,
      title: "Đổi mới sáng tạo",
      description: "Khuyến khích thử nghiệm và học hỏi từ thất bại",
    },
    {
      icon: <TeamOutlined />,
      title: "Tinh thần đội nhóm",
      description: "Cùng nhau xây dựng và phát triển",
    },
    {
      icon: <HeartOutlined />,
      title: "Tận tâm với khách hàng",
      description: "Đặt khách hàng làm trung tâm mọi quyết định",
    },
    {
      icon: <StarOutlined />,
      title: "Xuất sắc trong công việc",
      description: "Luôn cố gắng đạt tiêu chuẩn cao nhất",
    },
  ];

  const handleJobClick = (job) => {
    setSelectedJob(selectedJob?.id === job.id ? null : job);
  };

  const handleApply = (jobTitle) => {
    alert(`Cảm ơn bạn đã quan tâm đến vị trí: ${jobTitle}\nTính năng ứng tuyển đang được phát triển.`);
  };

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
          <h1 className={styles.heroTitle}>Cơ Hội Nghề Nghiệp</h1>
          <div className={styles.heroSubtitle}>
            Tham gia cùng chúng tôi để xây dựng tương lai của thương mại điện tử
          </div>
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>50+</div>
              <div className={styles.statLabel}>Nhân viên</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>6</div>
              <div className={styles.statLabel}>Vị trí mở</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>4.8</div>
              <div className={styles.statLabel}>Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Join Us Section */}
      <div className={styles.whyJoinSection}>
        <h2 className={styles.sectionTitle}>Tại Sao Nên Tham Gia HUSTBuy?</h2>
        <div className={styles.cultureGrid}>
          {cultureValues.map((value, index) => (
            <div key={index} className={styles.cultureCard}>
              <div className={styles.cultureIcon}>{value.icon}</div>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className={styles.benefitsSection}>
        <h2 className={styles.sectionTitle}>Phúc Lợi & Đãi Ngộ</h2>
        <div className={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <div key={index} className={styles.benefitCard}>
              <div className={styles.benefitIcon} style={{ color: benefit.color }}>
                {benefit.icon}
              </div>
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Openings Section */}
      <div className={styles.jobsSection}>
        <h2 className={styles.sectionTitle}>
          <FireOutlined style={{ marginRight: "12px" }} />
          Vị Trí Đang Tuyển Dụng
        </h2>
        <div className={styles.jobsList}>
          {jobPositions.map((job) => (
            <div
              key={job.id}
              className={`${styles.jobCard} ${selectedJob?.id === job.id ? styles.expanded : ""}`}
            >
              <div className={styles.jobHeader} onClick={() => handleJobClick(job)}>
                <div className={styles.jobHeaderLeft}>
                  <div className={styles.jobTitleRow}>
                    <h3 className={styles.jobTitle}>{job.title}</h3>
                    {job.hot && <span className={styles.hotBadge}>🔥 HOT</span>}
                  </div>
                  <div className={styles.jobMeta}>
                    <span className={styles.jobMetaItem}>
                      <TeamOutlined /> {job.department}
                    </span>
                    <span className={styles.jobMetaItem}>
                      <EnvironmentOutlined /> {job.location}
                    </span>
                    <span className={styles.jobMetaItem}>
                      <ClockCircleOutlined /> {job.type}
                    </span>
                    <span className={`${styles.jobMetaItem} ${styles.salary}`}>
                      <DollarOutlined /> {job.salary}
                    </span>
                  </div>
                </div>
                <div className={styles.jobHeaderRight}>
                  <span className={styles.jobLevel}>{job.level}</span>
                  <RightOutlined
                    className={`${styles.expandIcon} ${selectedJob?.id === job.id ? styles.rotated : ""}`}
                  />
                </div>
              </div>

              {selectedJob?.id === job.id && (
                <div className={styles.jobDetails}>
                  <div className={styles.jobDescription}>
                    <h4>Mô tả công việc</h4>
                    <p>{job.description}</p>
                  </div>

                  <div className={styles.jobRequirements}>
                    <h4>Yêu cầu</h4>
                    <ul>
                      {job.requirements.map((req, index) => (
                        <li key={index}>
                          <CheckCircleOutlined className={styles.checkIcon} />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.jobResponsibilities}>
                    <h4>Trách nhiệm</h4>
                    <ul>
                      {job.responsibilities.map((resp, index) => (
                        <li key={index}>
                          <CheckCircleOutlined className={styles.checkIcon} />
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.jobActions}>
                    <button
                      className={styles.applyBtn}
                      onClick={() => handleApply(job.title)}
                    >
                      Ứng tuyển ngay
                    </button>
                    <button className={styles.shareBtn}>Chia sẻ</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className={styles.ctaSection}>
        <h2>Không tìm thấy vị trí phù hợp?</h2>
        <p>
          Gửi CV của bạn đến chúng tôi, chúng tôi sẽ liên hệ khi có cơ hội phù hợp!
        </p>
        <button className={styles.ctaBtn} onClick={() => handleApply("Ứng tuyển chung")}>
          Gửi CV của bạn
        </button>
      </div>
    </div>
  );
};

export default Careers;