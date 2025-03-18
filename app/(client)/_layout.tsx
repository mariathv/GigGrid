import Ionicons from '@expo/vector-icons/build/Ionicons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';

export default function ClientTabLayout() {
    return (
        <Tabs screenOptions={({ route }) => ({
            tabBarActiveTintColor: `#4B7172`,
            headerShown: shouldShowHeader(route.name),
            headerRight: () => <HeaderIcons route={route.name} />,
            headerTitle: getTabTitle(route.name),
        })}>
            <Tabs.Screen name="index" options={{
                title: 'Home',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                ),
            }} />
            <Tabs.Screen name="browse" options={{
                title: 'Browse',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? 'search-sharp' : 'search-outline'} color={color} size={24} />
                ),
            }} />
            <Tabs.Screen name="orders" options={{
                title: 'Orders',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? 'cube-sharp' : 'cube-outline'} color={color} size={24} />
                ),
            }} />
            <Tabs.Screen name="messages" options={{
                title: 'Messages',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? 'chatbubble-ellipses-sharp' : 'chatbubble-ellipses-outline'} color={color} size={24} />
                ),
            }} />
            <Tabs.Screen name="profile" options={{
                title: 'Profile',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? 'person-circle-sharp' : 'person-circle-outline'} color={color} size={24} />
                ),
            }} />
        </Tabs>
    );
}

const getTabTitle = (routeName: string) => {
    const titles: { [key: string]: string } = {
        index: "Home",
        browse: "Browse Gigs",
        orders: "My Orders",
        profile: "Profile",
        messages: "Messages",
    };
    return titles[routeName] || "GidGrid"; // Default if undefined
};

const shouldShowHeader = (routeName: string) => {
    return !['notifications', 'settings', 'index', 'browse', 'orders'].includes(routeName);
};

const HeaderIcons = ({ route }: { route: string }) => {
    const router = useRouter();

    return (
        <Pressable style={{ flexDirection: "row", gap: 15, marginRight: 15 }}>
            {route === "messages" && (
                <Ionicons
                    name="notifications-outline"
                    size={24}
                    color="white"
                    onPress={() => router.push('/notifications')}
                />
            )}
            {route === "profile" && (
                <Ionicons
                    name="settings-outline"
                    size={24}
                    color="white"
                    onPress={() => router.push('/settings')}
                />
            )}
        </Pressable>
    );
};
