require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(answers) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a Sorting Hat AI that classifies users into Hogwarts houses.
        Your response **MUST** be a valid JSON object, nothing else.

        STRICTLY return in this format:
        {
          "house": "HouseName",
          "explanation": "A short explanation of why they fit this house."
        }

        Example:
        {
          "house": "Ravenclaw",
          "explanation": "Your intelligence and curiosity make you a perfect fit for Ravenclaw."
        }

        **RULES:**
        - "house" must be one of: "Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin".
        - "explanation" must be a short string (1-2 sentences).
        - **DO NOT** return extra text, markdown, or line breaks.
        - **DO NOT** return an array.
        - **ONLY return the JSON object.**
        `,
      },
      {
        role: "user",
        content: `Based on these answers, which Hogwarts house is the best fit? ${JSON.stringify(
          answers
        )}`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" }, // Ini memastikan output selalu objek
  });
}

module.exports = { getGroqChatCompletion };
