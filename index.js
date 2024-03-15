/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Text, TextInput } from 'react-native'
import messaging from '@react-native-firebase/messaging';
import PushNotification from "react-native-push-notification";
import FirebaseBackgroundTask from "./FirebaseBackgroundTask";

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.autoCorrect = false;
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

messaging().setBackgroundMessageHandler(async remoteMessage => {
    // Handle the message, display a local notification
    // console.log('onMessage in the closed!');
    // if (remoteMessage.data || (remoteMessage.android && remoteMessage.android.notification)) {
    //     const notificationData = remoteMessage.data || remoteMessage.android.notification;
    //     PushNotification.localNotification({
    //         channelId: "truleague_fcm",
    //         message: notificationData.body,
    //         title: notificationData.title,
    //         largeIconUrl: notificationData.imageUrl,
    //         when: Date.now(),
    //     });
    //     // return Promise.resolve();
    // }
    // return Promise.resolve();
});

messaging().onMessage(async remoteMessage => {
    console.log('onMessage in the background!', remoteMessage);
    if (remoteMessage != null) {
        FirebaseBackgroundTask(remoteMessage);
    }
});


// console.warn = function () { }
// console.log = function () { }
// console.error = function () { }

AppRegistry.registerComponent(appName, () => App);
