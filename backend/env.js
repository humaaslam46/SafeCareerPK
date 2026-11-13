const dotenv = require("dotenv");
const result = dotenv.config();

console.log("Working folder:", process.cwd());
console.log("dotenv error:", result.error ? result.error.message : "none");
console.log("Variable names found in .env:", Object.keys(result.parsed || {}));
console.log("GEMINI_API_KEY loaded:", !!process.env.GEMINI_API_KEY);