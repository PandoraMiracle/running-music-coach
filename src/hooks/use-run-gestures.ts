import { useEffect, useMemo } from "react";
import { Platform, Vibration } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";

export type RunGestureHandlers = {
  onDoubleTap: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  onLongPress: () => void;
};

/** Built-in Vibration — no new haptic dependency. */
export function pulseHaptic(
  pattern: "light" | "confirm" | "strong" | "alert" = "light",
) {
  try {
    if (Platform.OS === "web") return;
    if (pattern === "alert") {
      // Immediate (safety/navigation) delivery — insistent triple pulse so
      // it reads as urgent even with earbuds in, distinct from pause/resume.
      Vibration.vibrate(
        Platform.OS === "android" ? [0, 70, 60, 70, 60, 70] : 55,
      );
      return;
    }
    if (pattern === "strong") {
      // Pause Run — stronger confirmation so eyes-free pause is recognizable.
      Vibration.vibrate(
        Platform.OS === "android" ? [0, 55, 50, 55] : 55,
      );
      return;
    }
    if (pattern === "confirm") {
      // Resume Run — clear confirmation, lighter than pause.
      Vibration.vibrate(
        Platform.OS === "android" ? [0, 35, 30, 35] : 35,
      );
      return;
    }
    Vibration.vibrate(Platform.OS === "android" ? 18 : 10);
  } catch {
    // Graceful no-op when vibration is unavailable.
  }
}

/**
 * One-finger Running gestures (frozen mapping).
 * Exclusive composition avoids tap/swipe/long-press collisions.
 *
 * `enabled` gates every handler at the worklet level (via a shared value) so
 * Pocket Guard can truthfully suppress gestures — not just hide the result.
 */
export function useRunGestures(
  handlers: RunGestureHandlers,
  enabled: boolean = true,
) {
  const enabledShared = useSharedValue(enabled);

  useEffect(() => {
    enabledShared.value = enabled;
  }, [enabled, enabledShared]);

  return useMemo(() => {
    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .maxDuration(280)
      .onEnd((_event, success) => {
        "worklet";
        if (success && enabledShared.value) {
          runOnJS(handlers.onDoubleTap)();
        }
      });

    const longPress = Gesture.LongPress()
      .minDuration(1250)
      .maxDistance(18)
      .onStart(() => {
        "worklet";
        if (enabledShared.value) {
          runOnJS(handlers.onLongPress)();
        }
      });

    const pan = Gesture.Pan()
      .minDistance(36)
      .onEnd((event) => {
        "worklet";
        if (!enabledShared.value) return;
        const { translationX, translationY } = event;
        const absX = Math.abs(translationX);
        const absY = Math.abs(translationY);

        if (absX < 36 && absY < 36) return;

        if (absX >= absY) {
          if (translationX < 0) {
            runOnJS(handlers.onSwipeLeft)();
          } else {
            runOnJS(handlers.onSwipeRight)();
          }
          return;
        }

        if (translationY < 0) {
          runOnJS(handlers.onSwipeUp)();
        }
      });

    return Gesture.Exclusive(longPress, pan, doubleTap);
  }, [
    enabledShared,
    handlers.onDoubleTap,
    handlers.onLongPress,
    handlers.onSwipeLeft,
    handlers.onSwipeRight,
    handlers.onSwipeUp,
  ]);
}
