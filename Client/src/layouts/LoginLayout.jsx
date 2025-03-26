import { Navigate, Outlet } from "react-router";

export default function LoginLayout() {
  const accessToken = localStorage.getItem("access_token");

  if (accessToken) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}
