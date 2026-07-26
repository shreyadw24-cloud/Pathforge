require("dotenv").config();

const { generateCareerAdvice } = require("./utils/aiClient");

async function test() {
  try {
    const result = await generateCareerAdvice({
      skills: ["C++", "JavaScript", "Node.js"],
      interests: ["AI", "Backend Development"],
      background: "B.Tech Computer Science",
    });

    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

test();