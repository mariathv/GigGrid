import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const settings = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <View>
                <Text>settings</Text>
            </View>
        </Stack>
    )
}

export default settings