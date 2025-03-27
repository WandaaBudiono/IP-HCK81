import { useState } from "react";
import { useDispatch } from "react-redux";
import { addAnswer } from "../../Store/sortingHatSlice";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";

export default function Question1() {
  const [answer, setAnswer] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleNext = (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      Swal.fire({
        icon: "error",
        text: "Please provide an answer",
      });
      return;
    }
    dispatch(addAnswer(answer));
    navigate("/sorting-hat/2");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url("/assets/Question1.jpg")` }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <div className="relative z-10 w-full max-w-xl p-8 bg-gray-800/70 rounded shadow-lg text-white">
        <h1 className="text-2xl font-bold mb-4">
          1️⃣ If you find yourself in a dangerous situation, what would you do?
        </h1>
        <textarea
          className="textarea textarea-bordered w-full h-24 bg-gray-800 bg-opacity-70 text-white placeholder-gray-400 border-gray-600 focus:border-blue-500"
          placeholder="Type your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
