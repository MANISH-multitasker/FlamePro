import { auth } from "@/lib/auth";

import { redirect } from "next/navigation";
import { authClient } from "./auth-client";


export function requireAuth() {
  const { data: session } = authClient.useSession();
      if(!session?.user){
        redirect("/")
      }

  return session;
}