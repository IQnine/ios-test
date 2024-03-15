/// <reference types="nativewind/types" />
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
declare module "*.svg" {
    import React from "react";
    import { SvgProps } from "react-native-svg";
    const content: React.FC<SvgProps>;
    export default content;
}

export type RootStackParamList = {
    Login: any,
    Signup: any,
    AmbassadorStack: any,
    ProspectStack: any,
    Calendar: any,
    Conversation: any,
    BottomTabsNavigator: any,
    ProsBottomTabsNavigator: any,
    AddAvailability: any,
    Otp: any,
    Ambassadors: any,
    Conversations: any,
    Scheduler: any,
    Institution: any,
    AddInstitute: any,
    AmbassadorProfile: any,
    Menu: any,
    ProspectConversations: any,
    ScheduleChat: any,
    Profile: any,
    Notification: any,
    CometChatMessages: any,
    CometChatConversationListWithMessages: any,
    ConversationComponent: any,
    Conversation: any,
    Group: any,
    GroupComponent: any,
    Users: any,
    UsersComponent: any,
    CometChatMessages: any,
    EditProfile: any,
    CometChatSharedMedia: any,
    Splash: any
    SplashStack: any
    AuthStack: any,
    CompleteProfile:any,
    AmbassadorMenu:any,
    AmbassadorPrfoile:any,
    AmbassPrfoile:any,
    AmbassadorEditProfile:any,
    BlockListUsers:any,
    Notes:any,
    NewNotes:any,
    SharedMedia2:any,
    CometchatProfile:any,
    CometChatUserProfile:any,
    OptionalField:any
    Filter:any,
    NetworkError:any
}
export type RootBottomParamList = {
    AnalyticsBar: any,
    ConversationBar: any,
    MyScheduleBar: any,
    TimesheetBar: any,
    AnalyticsStack: any,
    CalendarBar: any,
    ProsAmbassadorsBar: any,
    ProsConversationBar: any,
    ProSchedulerBar: any
}

export type NavigationProp = CompositeNavigationProp<
    NativeStackScreenProps<
        RootStackParamList,
        'Login',
        'Signup',
        'Ambassadors',
        'Availablity',
        'Bookings',
        'Timesheet',
        'Schedule',
        'MainSchedule',
        'AddAvailability'>,
    BottomTabNavigationProp<
        RootBottomParamList,
        'AnalyticsBar',
        'ConversationBar',
        'MyScheduleBar',
        'TimesheetBar'
    >
> 