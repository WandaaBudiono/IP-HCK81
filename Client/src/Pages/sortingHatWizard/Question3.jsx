import { useState } from "react";
import { useDispatch } from "react-redux";
import { addAnswer } from "../../Store/sortingHatSlice";
import { useNavigate } from "react-router";

export default function Question3() {
  const [answer, setAnswer] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleNext = () => {
    if (!answer.trim()) {
      return alert("Please provide an answer!");
    }
    dispatch(addAnswer(answer));
    navigate("/sorting-hat/4");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        3️⃣ If you had magical powers, how would you use them?
      </h1>
      <textarea
        className="textarea textarea-bordered w-full h-24"
        placeholder="Type your answer..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <div className="mt-4">
        <button className="btn btn-primary" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}
