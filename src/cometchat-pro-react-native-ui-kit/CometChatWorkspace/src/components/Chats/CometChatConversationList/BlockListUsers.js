import { View, Text, BackHandler } from 'react-native'
import React, { useEffect } from 'react'
import { CometChatUserListWithMessages } from '../../Users'
import { useSelector } from 'react-redux';

export default  BlockListUsers = (props) => {
    let theme = props.route.params.theme;
    const instituteInfo = useSelector((state) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    const primaryColor = instituteInfo.college_data[0].font_color;

    useEffect(() => {
        const backAction = () => {
            props.navigation.goBack()
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, [props.navigation]);

    return (
        <View className='flex flex-1 bg-bgGrayColor'>
            <CometChatUserListWithMessages
                theme={theme}
                navigation={props.navigation}
                primaryColor={primaryColor}
                closeModal={props.closeModal}
            />
        </View>
    )
}