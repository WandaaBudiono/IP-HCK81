import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { phase2Api } from "../helpers/http-client";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await phase2Api.post("/users/register", form);
      navigate("/login");
    } catch (error) {
      console.error(error);
      let message = error.message || "Registration failed!";
      if (error.response) {
        message = error.response.data.message;
      }
      Swal.fire({
        icon: "error",
        title: error.response?.status,
        text: message,
      });
    }
  };

  const handleGoogleRegister = async (googleToken) => {
    try {
      const response = await phase2Api.post("/users/googleLogin", {
        googleToken,
      });
      localStorage.setItem("access_token", response.data.access_token);
      navigate("/character");
    } catch (error) {
      console.error("Google Register failed:", error);
      Swal.fire({
        icon: "error",
        title: error.response?.status,
        text: error.response?.data?.message,
      });
    }
  };

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        console.log("Encoded JWT ID token: " + response.credential);
        await handleGoogleRegister(response.credential);
      },
    });
    google.accounts.id.renderButton(
      document.getElementById("googleButtonDiv"),
      { theme: "outline", size: "large" }
    );
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
      <div className="hero-content flex-col w-full justify-center">
        <div className="card w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            <h2 className="text-3xl font-bold text-center mb-4">
              Register User
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="form-control mt-4">
                <button type="submit" className="btn btn-primary w-full">
                  Register
                </button>
              </div>
            </form>
            <div id="googleButtonDiv" className="mt-2"></div>
            <div className="form-control mt-2">
              <button
                type="button"
                className="btn btn-accent w-full"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
