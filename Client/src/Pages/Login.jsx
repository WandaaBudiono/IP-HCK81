import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import Swal from "sweetalert2";
import { phase2Api } from "../helpers/http-client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await phase2Api.post("/users/login", {
        email,
        password,
      });
      localStorage.setItem("access_token", response.data.access_token);
      navigate("/character");
    } catch (error) {
      console.error("Login failed:", error);
      Swal.fire({
        icon: "error",
        title: error.response?.status,
        text: error.response?.data?.message,
      });
    }
  };

  const handleGoogleLogin = async (googleToken) => {
    try {
      const response = await phase2Api.post("/users/googleLogin", {
        googleToken,
      });
      localStorage.setItem("access_token", response.data.access_token);
      navigate("/character");
    } catch (error) {
      console.error("Google Login failed:", error);
      Swal.fire({
        icon: "error",
        title: error.response?.status,
        text: error.response?.data?.message,
      });
    }
  };

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        console.log("Encoded JWT ID token: " + response.credential);
        await handleGoogleLogin(response.credential);
      },
    });
    google.accounts.id.renderButton(document.getElementById("buttonDiv"), {
      theme: "outline",
      size: "large",
    });
    google.accounts.id.prompt();
  }, []);

  return (
    <div
      className="hero min-h-screen"
      style={{
        backgroundImage: `url('/src/assets/Login.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="hero-overlay bg-black/50"></div>
      <div className="hero-content flex-col lg:flex-row-reverse w-full justify-center">
        <div className="card w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            <h2 className="text-3xl font-bold text-center mb-4">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Email Address</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  placeholder="Enter your email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="form-control mt-6">
                <button className="btn btn-primary w-full" type="submit">
                  Log In
                </button>
              </div>
            </form>
            <div id="buttonDiv" className="mt-2"></div>
            <p className="text-center mt-4">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-bold ml-1">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
