import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions, Platform } from "react-native";
import Navigator from "./src/navigation/Navigator";
import { Provider } from "react-redux"
import { store } from "./src/redux/Store";
import { CLARITY_ID, COMETCHAT_CONSTANTS } from "./src/CONSTS";
import { CometChat } from '@cometchat-pro/react-native-chat';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Utils } from "./src/common/Utils";
import { Colors } from "./src/common/Colors";
import { LogLevel, initialize } from 'react-native-clarity';
import analytics from '@react-native-firebase/analytics';
import SpInAppUpdates, { IAUUpdateKind } from 'sp-react-native-in-app-updates';

const appID = COMETCHAT_CONSTANTS.APP_ID;
const region = COMETCHAT_CONSTANTS.REGION;

const appSetting = new CometChat.AppSettingsBuilder()
  .subscribePresenceForAllUsers()
  .setRegion(region)
  .build();
CometChat.init(appID, appSetting).then(
  () => {
    console.log('Initialization completed successfully');
  },
  (error) => {
    console.log('Initialization failed with error:', error);
  },
);

let clarityConfig = {
  logLevel: LogLevel.Verbose,
  allowMeteredNetworkUsage: true
}

initialize(CLARITY_ID);

const inAppUpdates = new SpInAppUpdates(
  false
);


const App = () => {
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    // checkCodePushUpdate();
    checkPermission();
    firebaseAnalytics()
    checkUpdates()
  }, [])

  const firebaseAnalytics = async () => {
    analytics().logAppOpen().then((o: any) => {
    })
    //  let t =  await firebase.app().analytics();   
  }

  const checkPermission = async () => {
    const enabled = await messaging().hasPermission();
    if (enabled) {
      getToken();
    } else {
      requestPermission();
    }
  };

  const getToken = async () => {
    let fcmToken = await messaging().getToken();
    console.log('Fcm Token ----------', fcmToken);
    console.log('app token---------->', await Utils.getData('app_token'))
    if (fcmToken) {
      let token = await Utils.storeData('fcm_token', fcmToken)
    }
  };

  PushNotification.configure({
    onRegister: function (token) {
    },

    // (required) Called when a remote is received or opened, or local notification is opened
    onNotification: function (notification) {
      console.log('fetched')
      console.log("NOTIFICATION:", notification);

      // process the notification

      // (required) Called when a remote is received or opened, or local notification is opened
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
    onAction: function (notification) {
      console.log("ACTION:", notification.action);
      console.log("NOTIFICATION:", notification);

      // process the action
    },

    // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
    onRegistrationError: function (err) {
      console.error(err.message, err);
    },

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    // Should the initial notification be popped automatically
    // default: true
    popInitialNotification: true,

    /**
     * (optional) default: true
     * - Specified if permissions (ios) and token (android and ios) will requested or not,
     * - if not, you must call PushNotificationsHandler.requestPermissions() later
     * - if you are not using remote notification or do not have Firebase installed, use this:
     *     requestPermissions: Platform.OS === 'ios'
     */
    requestPermissions: true,
  });

  const requestPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      // console.log('Authorization status:', authStatus);
      getToken()
    }
  };


  const checkUpdates = () => {
    try {
      inAppUpdates.checkNeedsUpdate().then((result) => {
        // console.log("result ppppppppp", result, AppState);
        if (result.shouldUpdate) {
          let updateOptions = {};
          if (Platform.OS === 'android') {
            updateOptions = {
              updateType: IAUUpdateKind.IMMEDIATE,
            };
          }
          inAppUpdates.startUpdate(updateOptions); // https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/master/src/types.ts#L78
        }
      });

    } catch (e) {
      console.log(e);
    }

  }


  return (
    <Provider store={store}>
      <Navigator />
    </Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: Colors.white,
    marginTop: Dimensions.get('window').height / 3,
    width: 300,
    height: 150,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 10
  },
  messages: {
    marginTop: 10,
    textAlign: "center",
    color: Colors.green,
    fontSize: 20
  },
})

export default App

