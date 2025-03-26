import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/users/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        setProfile(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load profile");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-white">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

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

      <div className="hero-content flex-col">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">User Profile</h2>
            <div className="mb-3">
              <span className="font-bold">Username: </span>
              {profile.username}
            </div>
            <div className="mb-3">
              <span className="font-bold">Email: </span>
              {profile.email}
            </div>
            <div className="mb-3 flex items-center">
              <span className="font-bold mr-2">House: </span>
              <span>{profile.house}</span>
              <button
                className="btn btn-sm btn-secondary ml-auto"
                onClick={() => navigate("/sorting-hat/1")}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
