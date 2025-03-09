import { Stack } from "expo-router";

const screenTitles: Record<string, string> = {
  settings: "Settings",
  addGig: "New Gig",
  profile: "Profile",
};

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={({ route }) => ({
        presentation: "modal",
        animation: "fade",
        title: screenTitles[route.name] || route.name,
        gestureEnabled: !["login", "register"].includes(route.name),
      })}
    />
  );
}

