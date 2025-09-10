"use client";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="px-4 py-2 rounded-lg border border-white/20"
    >
      Выйти
    </button>
  );
}
