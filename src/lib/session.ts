import "server-only";
import { cookies } from "next/headers";
import { getUser } from "./data";

// Fake auth: a cookie holds the "logged in" user id. The header's user
// switcher changes it. No passwords, no OAuth, no setup.
export async function getSession() {
  const jar = await cookies();
  const user = getUser(jar.get("uid")?.value);
  const beta = jar.get("beta")?.value === "1";
  return { user, beta };
}
