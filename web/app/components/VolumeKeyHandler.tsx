"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * On real devices viewed through a mobile browser (e.g. via ngrok during a
 * demo), the hardware volume-up key surfaces to page JS as a keydown with
 * key "AudioVolumeUp" on the browsers that forward it at all. We use it as
 * a hidden shortcut back to the scenario picker ("/") so a demoer can jump
 * between user statuses without hunting for a back button mid-flow.
 */
export default function VolumeKeyHandler() {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "AudioVolumeUp" || e.code === "AudioVolumeUp") {
        router.push("/");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return null;
}
