import { useMemo } from "react";
import { Platform, Vibration } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

export type RunGestureHandlers = {
  onDoubleTap: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  onLongPress: () => void;
};

/** Built-in Vibration — no new haptic dependency. */
export function pulseHaptic(
  pattern: "light" | "confirm" | "strong" = "light",
) {
  try {
    if (Platform.OS === "web") return;
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

export type UseRunGesturesOptions = {
  /**
   * When false, recognized run gestures are ignored (Pocket Guard).
   * Music and run state are unchanged; no accepted-gesture feedback.
   */
  gesturesEnabled?: boolean;
};

/**
 * One-finger Running gestures (frozen mapping).
 * Exclusive composition avoids tap/swipe/long-press collisions.
 * Pocket Guard: set gesturesEnabled=false to ignore all handlers centrally.
 */
export function useRunGestures(
  handlers: RunGestureHandlers,
  options: UseRunGesturesOptions = {},
) {
  const gesturesEnabled = options.gesturesEnabled !== false;

  return useMemo(() => {
    const onDoubleTap = () => {
      if (!gesturesEnabled) return;
      handlers.onDoubleTap();
    };
    const onSwipeLeft = () => {
      if (!gesturesEnabled) return;
      handlers.onSwipeLeft();
    };
    const onSwipeRight = () => {
      if (!gesturesEnabled) return;
      handlers.onSwipeRight();
    };
    const onSwipeUp = () => {
      if (!gesturesEnabled) return;
      handlers.onSwipeUp();
    };
    const onLongPress = () => {
      if (!gesturesEnabled) return;
      handlers.onLongPress();
    };

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .maxDuration(280)
      .onEnd((_event, success) => {
        "worklet";
        if (success) {
          runOnJS(onDoubleTap)();
        }
      });

    const longPress = Gesture.LongPress()
      .minDuration(1250)
      .maxDistance(18)
      .onStart(() => {
        "worklet";
        runOnJS(onLongPress)();
      });

    const pan = Gesture.Pan()
      .minDistance(36)
      .onEnd((event) => {
        "worklet";
        const { translationX, translationY } = event;
        const absX = Math.abs(translationX);
        const absY = Math.abs(translationY);

        if (absX < 36 && absY < 36) return;

        if (absX >= absY) {
          if (translationX < 0) {
            runOnJS(onSwipeLeft)();
          } else {
            runOnJS(onSwipeRight)();
          }
          return;
        }

        if (translationY < 0) {
          runOnJS(onSwipeUp)();
        }
      });

    return Gesture.Exclusive(longPress, pan, doubleTap);
  }, [
    gesturesEnabled,
    handlers.onDoubleTap,
    handlers.onLongPress,
    handlers.onSwipeLeft,
    handlers.onSwipeRight,
    handlers.onSwipeUp,
  ]);
}
