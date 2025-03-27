import React from "react";
import { useLocation } from "react-router";

export default function SlytherinPage() {
  const location = useLocation();
  const explanation = location.state?.explanation || "No explanation provided";

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative p-4"
      style={{ backgroundImage: `url("/assets/aiPage.jpg")` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <div className="relative z-10 max-w-4xl w-full bg-gray-800/80 rounded shadow-lg p-8 text-white flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0">
          <img
            src="/assets/Slytherin.png"
            alt="Slytherin Logo"
            className="w-40 h-auto"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4">Slytherin</h1>
          <p className="text-base">{explanation}</p>
        </div>
      </div>
    </div>
  );
}
