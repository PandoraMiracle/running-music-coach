import { Redirect } from "expo-router";

import { ROUTES } from "@/constants/routes";

/** Default entry is research Test Setup so study/demo starts there. */
export default function Index() {
  return <Redirect href={ROUTES.testSetup} />;
}
