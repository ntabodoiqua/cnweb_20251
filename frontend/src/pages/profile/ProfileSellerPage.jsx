import { useState, useEffect } from "react";
import { ProfileSellerInfo } from "../../components/profile";
import { getMyInfoApi } from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const ProfileSellerPage = () => {
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await getMyInfoApi();

        if (response && response.code === 1000) {
          // Pass sellerProfile from API, or null to show registration form
          setSellerData(response.result.sellerProfile);
        }
      } catch (err) {
        console.error("Error fetching seller data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return <ProfileSellerInfo sellerData={sellerData} />;
};

export default ProfileSellerPage;
