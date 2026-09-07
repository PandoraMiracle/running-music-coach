import * as Haptics from "expo-haptics";
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

/**
 * Fire the vibration motor immediately. Do not await expo-haptics first —
 * some Android Expo Go builds hang or no-op that promise, which previously
 * swallowed the fallback. Web has no haptic hardware.
 */
export function pulseHaptic(
  pattern: "light" | "confirm" | "strong" | "alert" = "light",
) {
  if (Platform.OS === "web") return;

  try {
    if (Platform.OS === "android") {
      if (pattern === "alert") {
        Vibration.vibrate([0, 140, 80, 140, 80, 180]);
      } else if (pattern === "strong") {
        Vibration.vibrate([0, 110, 50, 110]);
      } else if (pattern === "confirm") {
        Vibration.vibrate([0, 70, 40, 70]);
      } else {
        Vibration.vibrate(90);
      }
    } else {
      Vibration.vibrate();
    }
  } catch {
    // Continue to expo-haptics below.
  }

  void playNativeHaptics(pattern);
}

async function playNativeHaptics(
  pattern: "light" | "confirm" | "strong" | "alert",
) {
  try {
    if (Platform.OS === "android") {
      const type =
        pattern === "alert"
          ? Haptics.AndroidHaptics.Reject
          : pattern === "strong"
            ? Haptics.AndroidHaptics.Long_Press
            : Haptics.AndroidHaptics.Confirm;
      await Haptics.performAndroidHapticsAsync(type);
      return;
    }

    if (pattern === "alert") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }
    if (pattern === "strong") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }
    if (pattern === "confirm") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Motor already fired above when possible.
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
