import { Redirect } from "expo-router"

export default function Page() {
  // Redirect to login page on app startup
  return <Redirect href="/login" />
}

// import ClientHomeScreen from "./(client)"

// export default function Page() {
//   return <ClientHomeScreen />
// }


