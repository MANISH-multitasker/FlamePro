import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);

// export async function GET() {
  
 
//   return Response.json({ message: "GET request received" });
// }