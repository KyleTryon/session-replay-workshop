import { ProfileForm } from "@/components/profile-form";
import { getSession } from "@/lib/session";

export default async function AccountPage() {
  const { user } = await getSession();
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display font-semibold tracking-tight text-4xl">Your account</h1>
      <p className="mt-2 text-ink/60">Signed in as {user.name}. Role: {user.role}.</p>
      <ProfileForm user={user} />
    </div>
  );
}
