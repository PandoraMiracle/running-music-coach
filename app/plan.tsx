import { router } from "expo-router";

import { InfoCard } from "@/components/info-card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenScaffold } from "@/components/screen-scaffold";
import { formatPace } from "@/constants/format";
import { ROUTES } from "@/constants/routes";
import { RUNNING_PLANS } from "@/data";
import { DEFAULT_PLAN } from "@/store/defaults";

export default function PlanScreen() {
  return (
    <ScreenScaffold
      title="Running Plan"
      subtitle="Choose a plan and target pace. No training-plan editor in this prototype."
      footer={
        <PrimaryButton
          label="Continue to Playlist"
          onPress={() => router.push(ROUTES.playlist)}
        />
      }
    >
      {RUNNING_PLANS.map((plan) => (
        <InfoCard
          key={plan.id}
          title={plan.name}
          subtitle={plan.description}
          meta={`Target pace ${formatPace(plan.targetPaceSecPerKm)} · ${plan.distanceKm} km`}
          selected={plan.id === DEFAULT_PLAN.id}
        />
      ))}
    </ScreenScaffold>
  );
}
