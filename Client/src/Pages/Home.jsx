import React from "react";

export default function Home() {
  return (
    <div
      className="hero min-h-screen"
      style={{
        backgroundImage: `url('../assets/home.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="hero-overlay bg-black/50"></div>

      <div className="hero-content text-center text-base-content">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">
            Welcome to the Wizarding World
          </h1>
          <p className="mb-5 text-lg">
            Explore the realm of endless enchantments
          </p>
        </div>
      </div>
    </div>
  );
}
