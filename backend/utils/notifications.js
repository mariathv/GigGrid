const fetch = require('node-fetch');

async function sendNewOrderNotification(expoPushToken, gigTitle) {
    if (!expoPushToken) {
        console.warn('No push token provided for notification');
        return null;
    }

    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'New Order Received',
        body: `You have received a new order for "${gigTitle}". Check it out!`,
        data: { type: 'new_order' },
    };

    try {
        console.log('Sending push notification:', message);
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const responseData = await response.json();
        console.log('Push notification response:', responseData);

        if (!response.ok) {
            throw new Error(`Push notification failed: ${responseData.message || response.statusText}`);
        }

        return responseData;
    } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
}

async function sendOrderCompletionNotification(expoPushToken, orderTitle) {
    if (!expoPushToken) {
        console.warn('No push token provided for notification');
        return null;
    }

    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Order Completed',
        body: `Your order "${orderTitle}" has been completed by the freelancer. Check it out!`,
        data: { type: 'order_completion' },
    };

    try {
        console.log('Sending completion notification:', message);
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const responseData = await response.json();
        console.log('Push notification response:', responseData);

        if (!response.ok) {
            throw new Error(`Push notification failed: ${responseData.message || response.statusText}`);
        }

        return responseData;
    } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
}

module.exports = {
    sendNewOrderNotification,
    sendOrderCompletionNotification
}; 