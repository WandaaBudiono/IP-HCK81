import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAnswer, resetAnswers } from "../../Store/sortingHatSlice";
import { useNavigate } from "react-router";
import axios from "axios";
import backgroundImage from "../../../public/assets/Question4.jpg";
import Swal from "sweetalert2";

export default function Question4() {
  const [answer, setAnswer] = useState("");
  const answers = useSelector((state) => state.sortingHat.answers);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      Swal.fire({
        icon: "error",
        text: "Please provide an answer",
      });
      return;
    }

    dispatch(addAnswer(answer));
    const finalAnswers = [...answers, answer];

    try {
      const response = await axios.post(
        "https://wizardingworldip.franzzwan.site/fav/sortHat",
        { answers: finalAnswers },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      const { house, explanation } = response.data;
      dispatch(resetAnswers());

      if (!house) {
        Swal.fire({
          icon: "error",
          text: "Uknown house, please try again",
        });
        return;
      }

      navigate(`/house/${house.toLowerCase()}`, { state: { explanation } });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        text: "Failed to submit an answer",
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <div className="relative z-10 w-full max-w-xl p-8 bg-gray-800/70 rounded shadow-lg text-white">
        <h1 className="text-2xl font-bold mb-4">
          4️⃣ What does your ideal friend look like?
        </h1>
        <textarea
          className="textarea textarea-bordered w-full h-24 bg-gray-800 bg-opacity-70 text-white placeholder-gray-400 border-gray-600 focus:border-blue-500"
          placeholder="Type your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
