import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin/dashboard");
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-deep via-ocean to-sky p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lift">
        <Image src="/logo.jpg" alt="TravelBeast Tourism" width={120} height={120} className="mx-auto h-28 w-28 object-contain" priority />
        <h1 className="mt-2 text-center text-2xl">Admin Login</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Sign in to manage your website.</p>
        <LoginForm />
      </div>
    </main>
  );
}
