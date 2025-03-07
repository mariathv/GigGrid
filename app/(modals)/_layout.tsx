import { Stack } from "expo-router"

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={({ route }) => ({
        presentation: "modal",
        animation: "fade",
        // Prevent dismissing login/register screens by swipe
        gestureEnabled: !["login", "register"].includes(route.name),
      })}
    />
  )
}

