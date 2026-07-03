"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

const HOLD_MS = 1800;
const CORNER_SIZE = 64;

/**
 * Same purpose as VolumeKeyHandler (hidden shortcut back to the scenario
 * picker for a demoer), but works everywhere — the volume key never reaches
 * page JS on iOS Safari at all, so real-device demos need a touch-based
 * fallback. Press and hold the top-left corner for HOLD_MS to jump to "/".
 * The hit target is invisible (no border, no background) so it never reads
 * as a button to a participant watching the screen.
 */
export default function CornerHoldHandler() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    timerRef.current = setTimeout(() => router.push("/"), HOLD_MS);
  }
  function cancel() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  return (
    <div
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `calc(${CORNER_SIZE}px + env(safe-area-inset-left))`,
        height: `calc(${CORNER_SIZE}px + env(safe-area-inset-top))`,
        zIndex: 9999,
        touchAction: "none",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    />
  );
}
