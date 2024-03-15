import PushNotification from "react-native-push-notification";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { Platform } from "react-native";

export default (remoteMessage) => {
  if (Platform.OS === 'android') {
    PushNotification.channelExists("truleague_fcm", async function (exists) {
      if (!exists) {
        let d = await createChannel()
        PushNotification.localNotification({
          channelId: "truleague_fcm",
          message: remoteMessage?.data?.body,
          title: remoteMessage?.data?.title,
          largeIconUrl: remoteMessage?.data?.imageUrl,
          when:Date.now(),
        });
      } else {
        PushNotification.localNotification({
          channelId: "truleague_fcm",
          message: remoteMessage?.data?.body,
          title: remoteMessage?.data?.title,
          largeIconUrl: remoteMessage?.data?.imageUrl,
          when:Date.now(),
        });
      }
    });

  } else {
    PushNotificationIOS.addNotificationRequest({
      id: new Date().toString(),
      alertBody: remoteMessage?.data?.body,
      alertTitle: remoteMessage?.data?.title
    });
  }
};

async function createChannel() {
  return new Promise(resolve => {
    PushNotification.createChannel(
      {
        channelId: "truleague_fcm", // (required)
        channelName: "Truleague", // (required)
        channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
        playSound: true, // (optional) default: true
        soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
        importance: 4, // (optional) default: 4. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
      },
      (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
    resolve(true)
  })
}
