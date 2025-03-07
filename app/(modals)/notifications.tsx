import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function NotificationsScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
            <Stack.Screen options={{ title: "Notifications" }} />
            <Text>Notifications</Text>
        </View>
    );
}
