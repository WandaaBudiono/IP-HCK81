import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAnswer } from "../../Store/sortingHatSlice";
import { useNavigate } from "react-router";
import axios from "axios";

export default function Question4() {
  const [answer, setAnswer] = useState("");
  const answers = useSelector((state) => state.sortingHat.answers);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!answer.trim()) return alert("Please provide an answer!");

    dispatch(addAnswer(answer));
    const finalAnswers = [...answers, answer];

    try {
      const response = await axios.post(
        "http://localhost:3000/fav/sortHat",
        { answers: finalAnswers },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      alert(
        `You got house: ${response.data.house}\nRedirecting to /character...`
      );
      dispatch(resetAnswers());
      navigate("/character");
    } catch (err) {
      console.error(err);
      alert("Failed to submit answers");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        4️⃣ What does your ideal friend look like?
      </h1>
      <textarea
        className="textarea textarea-bordered w-full h-24"
        placeholder="Type your answer..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <div className="mt-4">
        <button className="btn btn-primary" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}
