import { useState, useEffect } from "react";
import { ProfileGeneralInfo } from "../../components/profile";
import { getMyInfoApi } from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const ProfileGeneralPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await getMyInfoApi();

        if (response && response.code === 1000) {
          setUserData(response.result);
        } else {
          console.error("API returned error code:", response);
          setError("Không thể tải thông tin người dùng");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Đã xảy ra lỗi khi tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Show loading spinner while fetching data
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <div className="profile-error">
        <h2>⚠️ {error}</h2>
        <p>Vui lòng thử lại sau hoặc liên hệ với bộ phận hỗ trợ.</p>
      </div>
    );
  }

  // Don't render if no user data
  if (!userData) {
    return null;
  }

  return <ProfileGeneralInfo userData={userData} />;
};

export default ProfileGeneralPage;
