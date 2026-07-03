"use client";

import { useRouter } from "next/navigation";
import { useRef, type PointerEvent } from "react";

const HOLD_MS = 1800;
const CORNER_SIZE = 64;

/**
 * Same purpose as VolumeKeyHandler (hidden shortcut back to the scenario
 * picker for a demoer), but works everywhere — the volume key never reaches
 * page JS on iOS Safari at all, so real-device demos need a touch-based
 * fallback. Press and hold the top-left corner for HOLD_MS to jump to "/".
 * The hit target is invisible (no border, no background) so it never reads
 * as a button to a participant watching the screen.
 *
 * This corner also happens to be exactly where every screen's real back
 * button lives, so a short tap here — one that doesn't reach the hold
 * threshold — is forwarded as a synthetic click to whatever's underneath
 * (via elementFromPoint with ourselves briefly set to pointer-events:none).
 * Without that forwarding this div would silently swallow every tap on the
 * actual back button.
 */
export default function CornerHoldHandler() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    timerRef.current = setTimeout(() => router.push("/"), HOLD_MS);
  }
  /** Clears the pending hold timer. Returns true if it was still pending
   *  (a short tap that never reached HOLD_MS) — false if it already fired
   *  (navigation already happened) or there was nothing to cancel. */
  function cancel(): boolean {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      return true;
    }
    return false;
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!cancel()) return; // hold already completed and navigated — nothing to forward
    const el = e.currentTarget;
    const { clientX, clientY } = e;
    el.style.pointerEvents = "none";
    const target = document.elementFromPoint(clientX, clientY);
    el.style.pointerEvents = "";
    target?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window, clientX, clientY }));
  }

  return (
    <div
      onPointerDown={start}
      onPointerUp={onPointerUp}
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
