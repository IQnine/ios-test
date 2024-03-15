import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image'
import { Icons } from '../assets/Images'
import { Colors } from '../common/Colors'

const MenuFoolter = (props: any) => {
    return (
        <View className='flex flex-row border-t-[1px] border-t-greyColor25 px-5 py-5 items-center justify-between w-full'>
            <TouchableOpacity
                onPress={() => props.setAwesomeModal(true)}
                className='flex flex-row items-center'>
                {
                    props.logoutIcon == true ?
                        <FastImage source={Icons.IcLogout} resizeMode='center' className='w-[23px] h-[24px]' tintColor={Colors.errorColor} />
                        : null
                }
                <Text className='text-errorColor text-[20px] font-Helvetica mt-[2px]  ml-7'>Log out</Text>
            </TouchableOpacity>

            <View className='flex flex-col items-center pb-2'>
                <Text className='text-fieldTextColor text-[8px] font-Helvetica'>App version</Text>
                <Text className='text-textColor text-[16px] font-InterBold'>v1.0.4</Text>
            </View>
        </View>
    )
}

export default MenuFoolter