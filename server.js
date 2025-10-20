import app from "./app.js";       // <-- import your Express app
import serverless from "serverless-http";

// Export for Vercel serverless function
export const handler = serverless(app);
