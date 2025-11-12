import { useState, useEffect } from "react";
import { ProfileAddresses } from "../../components/profile";
import { getMyInfoApi } from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const ProfileAddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await getMyInfoApi();

        if (response && response.code === 1000) {
          setAddresses(response.result.addresses || []);
        }
      } catch (err) {
        console.error("Error fetching addresses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return <ProfileAddresses addresses={addresses} />;
};

export default ProfileAddressesPage;
