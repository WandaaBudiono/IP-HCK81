import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCharacters,
  setSearchQuery,
  setHouseFilter,
  setCurrentPage,
} from "../Store/charactersSlice";

const baseURL = "https://wizardingworldip.franzzwan.site/fav";

export default function CharacterList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchInput, setSearchInput] = useState("");

  const { characters, loading, error, searchQuery, houseFilter, pagination } =
    useSelector((state) => state.characters);

  useEffect(() => {
    dispatch(fetchCharacters());
  }, [dispatch, searchQuery, houseFilter, pagination.currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setSearchQuery(searchInput));
  };

  const handleHouseChange = (e) => {
    dispatch(setHouseFilter(e.target.value));
  };

  const handlePageChange = (pageNumber) => {
    dispatch(setCurrentPage(pageNumber));
  };

  const handleAddFavorite = async (characterId) => {
    try {
      await axios.post(
        `${baseURL}/${characterId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      alert("Character added to favorites!");
    } catch (err) {
      console.error(err);
      alert("Failed to add favorite");
    }
  };

  const handleDetail = (characterId) => {
    navigate(`/character/${characterId}`);
  };

  const houseOptions = [
    { label: "All Houses", value: "" },
    { label: "Gryffindor", value: "Gryffindor" },
    { label: "Ravenclaw", value: "Ravenclaw" },
    { label: "Hufflepuff", value: "Hufflepuff" },
    { label: "Slytherin", value: "Slytherin" },
  ];

  return (
    <div className="p-4">
      <form
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row gap-2 mb-4"
      >
        <input
          type="text"
          placeholder="Search character..."
          className="input input-bordered w-full md:w-1/3"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          className="select select-bordered w-full md:w-1/6"
          value={houseFilter}
          onChange={handleHouseChange}
        >
          {houseOptions.map((h) => (
            <option key={h.value} value={h.value}>
              {h.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && characters.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {characters.map((char) => {
            const houseName = char.house === "" ? "No House" : char.house;
            return (
              <div key={char.id} className="card bg-base-100 shadow-xl">
                <figure>
                  <img
                    src={char.image}
                    alt={char.name}
                    className="h-48 w-full object-cover"
                  />
                </figure>
                <div className="card-body">
                  <h2 className="card-title text-lg font-bold">{char.name}</h2>
                  <p className="text-sm text-gray-300">House: {houseName}</p>
                  <div className="card-actions justify-end mt-2">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAddFavorite(char.id)}
                    >
                      Add to Favorite
                    </button>
                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() => handleDetail(char.id)}
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && characters.length === 0 && (
        <p className="text-center">No character found</p>
      )}

      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <button
            className="btn btn-outline mr-2"
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            Previous
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (num) => (
              <button
                key={num}
                className={`btn mx-1 ${
                  pagination.currentPage === num ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => handlePageChange(num)}
              >
                {num}
              </button>
            )
          )}

          <button
            className="btn btn-outline ml-2"
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
