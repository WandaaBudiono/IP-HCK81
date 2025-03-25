const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(answers) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a Sorting Hat AI that classifies users into Hogwarts houses. 
        Your response **MUST** be a valid JSON **array**, nothing else.

        STRICTLY return in this format:
        ["house_name", "explanation"]

        Example:
        ["Ravenclaw", "Your intelligence and curiosity make you a perfect fit for Ravenclaw."]

        **RULES:**
        - The first item **must be only the house name** ("Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin").
        - The second item **must be a short explanation** (1-2 sentences).
        - **DO NOT** return extra text, markdown, or line breaks.
        - **DO NOT** wrap the response in an object.
        - **ONLY return the JSON array.**
        
        If you fail to follow this format, the Sorting Hat will be **destroyed in a fire**.`,
      },
      {
        role: "user",
        content: `Based on these answers, which Hogwarts house is the best fit? ${answers.join(
          ", "
        )}`,
      },
    ],
    model: "whisper-large-v3-turbo",
    response_format: "json",
  });
}

module.exports = { getGroqChatCompletion };
