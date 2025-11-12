import { ProfileSellerInfo, mockSellerData } from "../../components/profile";

const ProfileSellerPage = () => {
  // Pass null to show registration form, or mockSellerData to show seller profile
  return <ProfileSellerInfo sellerData={null} />;
};

export default ProfileSellerPage;
