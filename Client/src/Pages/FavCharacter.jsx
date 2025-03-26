import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

export default function Favorite() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/fav/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        setFavorites(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch favorites");
        setLoading(false);
      });
  }, []);

  const handleRemoveFavorite = async (CharacterId) => {
    try {
      await axios.delete(`http://localhost:3000/fav/${CharacterId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setFavorites((prev) =>
        prev.filter((fav) => fav.CharacterId !== CharacterId)
      );
    } catch (err) {
      alert("Failed to remove favorite");
      console.error(err);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Favorite Characters</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {favorites.map((fav) => (
          <div key={fav.id} className="card bg-base-100 shadow-xl">
            <figure>
              <img
                src={fav.imageUrl}
                alt={fav.characterName}
                className="h-48 w-full object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-lg font-bold">
                {fav.characterName}
              </h2>
              <p className="text-sm text-gray-300">
                House: {fav.house === "" ? "No House" : fav.house}
              </p>
              <div className="card-actions justify-end mt-2">
                <button
                  onClick={() => navigate(`/character/${fav.CharacterId}`)}
                  className="btn btn-secondary btn-sm"
                >
                  Detail
                </button>
                <button
                  onClick={() => handleRemoveFavorite(fav.CharacterId)}
                  className="btn btn-error btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
