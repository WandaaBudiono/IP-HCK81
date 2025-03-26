import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import logo from "../assets/WizardingWorld.png";

export function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div className="navbar bg-base-100 text-primary border-b ">
      <div className="flex-1">
        <Link
          to="/character"
          className="normal-case text-xl flex items-center justify-center gap-2 "
        >
          <img
            src={logo}
            alt="Wizarding World"
            className="w-10 h-10 object-contain shadow-lg"
          />
          <span className="hidden md:inline-block shadow-lg text-white">
            Wizarding World
          </span>
        </Link>
      </div>

      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          {isLoggedIn ? (
            <>
              <li>
                <Link to="/favorite" className="hover:bg-secondary">
                  Favorite
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:bg-secondary">
                  Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-error ml-2"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                <Link to="/login" className="btn btn-sm bg-[#5758FF]  border-0">
                  Login
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
