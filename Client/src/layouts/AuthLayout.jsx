import { Navigate, Outlet } from "react-router";
import { Navbar } from "../components/Navbar";

export default function AuthLayout() {
  const accessToken = localStorage.getItem("access_token");

  if (accessToken) {
    return (
      <div>
        <Navbar />
        <Outlet />
      </div>
    );
  }

  return <Navigate to="/login" />;
}
