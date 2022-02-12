import React from "react";
import { Helmet } from "react-helmet-async";

import HeaderContainer from "../containers/common/HeaderContainer";
import LoginContainer from "../containers/login/LoginContainer";
import FooterContainer from "../containers/common/FooterContainer";

const LoginPage = () => {
  return (
    <>
      <Helmet>
        <title>Sign In • Hamza's Chess Club</title>
      </Helmet>
      <HeaderContainer />
      <LoginContainer />
      <FooterContainer />
    </>
  );
};

export default LoginPage;
