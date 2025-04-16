'use client';

import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  // const { data: session, status } = useSession();
  // const router = useRouter();
  // const [isMounted, setIsMounted] = useState(false);

  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  // useEffect(() => {
  //   if (isMounted) {
  //     if (status === "authenticated") {
  //       router.push("/profile");
  //     } else if (status === "unauthenticated") {
  //       signIn("google");
  //     }
  //   }
  // }, [isMounted, status, router]);

  return (
    <div>
      <h1>SelfTest allows students to test their knowledge leveraging custom, AI-generated questions.</h1>
    </div>
  );
}
