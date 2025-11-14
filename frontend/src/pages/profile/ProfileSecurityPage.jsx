import { useState } from "react";
import ProfileSecurity from "../../components/profile/ProfileSecurity";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "../Profile.module.css";

/**
 * ProfileSecurityPage - Security and password management page
 */
const ProfileSecurityPage = () => {
  const [loading] = useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="profile-section">
      <ProfileSecurity />
    </div>
  );
};

export default ProfileSecurityPage;
