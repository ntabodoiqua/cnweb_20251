import { createContext, useState } from "react";

export const AuthContext = createContext({
  isAuthenticated: false,
  user: {
    username: "",
    email: "",
    name: "",
    role: "",
    firstName: "",
    lastName: "",
    avatarUrl: "",
  },
  appLoading: true,
});

export const AuthWrapper = (props) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: {
      username: "",
      email: "",
      name: "",
      role: "",
      firstName: "",
      lastName: "",
      avatarUrl: "",
    },
  });

  const [appLoading, setAppLoading] = useState(true);

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        appLoading,
        setAppLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};
