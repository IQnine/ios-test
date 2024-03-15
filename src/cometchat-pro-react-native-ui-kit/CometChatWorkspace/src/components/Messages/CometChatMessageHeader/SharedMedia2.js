import { View, Text } from 'react-native'
import React from 'react'

const SharedMedia2 = () => {
    return (
        <View className='flex flex-1'>
            <CometChatSharedMedia
                theme={this.theme}
                containerHeight={50}
                showMessage={(type, message) => {
                    this.dropDownAlertRef?.showMessage(type, message);
                }}
                item={this.state.item}
                user={this.state.user}
                type={params.type}
                actionGenerated={this.actionHandler}
                navigation={this.props.navigation}
            />
        </View>
    )
}

export default SharedMedia2