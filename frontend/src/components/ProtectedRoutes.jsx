import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProtectedRoutes = ({ roles, children }) => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  useEffect(() => {
    // if(!user){
    //     navigate("/login");
    // }

    console.log(
      "user",
      user,
      roles,
      user?.role && !roles?.includes(user?.role)
    );
    if (!roles?.includes(user?.role)) {
      navigate("/login");
    }
  }, []);
  return <>{children}</>;
};

export default ProtectedRoutes;
