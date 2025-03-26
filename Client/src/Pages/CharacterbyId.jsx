// src/pages/CharacterDetail.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "axios";

export default function CharacterDetail() {
  const { CharacterId } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/fav/${CharacterId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        setCharacter(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch character details");
        setLoading(false);
      });
  }, [CharacterId]);

  if (loading) {
    return <p className="text-center text-white">Loading...</p>;
  }
  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div
      className="hero min-h-screen"
      style={{
        backgroundImage: `url('../assets/Character.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="hero-overlay bg-black/60"></div>

      <div className="hero-content flex-col lg:flex-row gap-8 px-4 py-8">
        <img
          src={character.imageUrl}
          alt={character.name}
          className="max-w-sm rounded-lg shadow-2xl object-cover"
        />

        <div className="text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-4">{character.name}</h1>

          <div className="space-y-2 text-lg">
            <p>
              <span className="font-semibold">House:</span> {character.house}
            </p>
            <p>
              <span className="font-semibold">Species:</span>{" "}
              {character.species}
            </p>
            <p>
              <span className="font-semibold">Gender:</span> {character.gender}
            </p>
            <p>
              <span className="font-semibold">Patronus:</span>{" "}
              {character.patronus}
            </p>
            <p>
              <span className="font-semibold">Actor:</span> {character.actor}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
