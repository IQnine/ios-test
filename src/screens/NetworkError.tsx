import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import FastImage from 'react-native-fast-image'
import { Images } from '../assets/Images'
import { useSelector } from 'react-redux'
import { Colors } from '../common/Colors'

const NetworkError = () => {
    const [loeading, setIsLoading] = useState(false);

    const isConnected = useSelector((state: any) => {
        return state.internetReducer.isConnected
    })

    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })

    const primaryColor = instituteInfo?.college_data[0]?.font_color;
    console.log(isConnected);

    const onPressTryAgain = () => {
        setIsLoading(true);
        let t = setTimeout((t) => {
            setIsLoading(false)
            clearTimeout(t)
        }, 10000)
    }
    return (
        <View className='flex flex-1 bg-bgGrayColor'>
            <View className='flex w-full py-5' style={{ backgroundColor: primaryColor }}></View>
            <View className='flex flex-1 justify-center items-center'>
                <View className='w-[280px] h-[280px]'>
                    <FastImage source={Images.networkissue} resizeMode='center' className='w-full h-full' />
                </View>
                <Text className='text-greyBorder text-xl text-center font-bold leading-8 tracking-[0.15px]'>Oops...</Text>
                <Text className='text-greyBorder text-[16px] text-center font-normal leading-4 tracking-[0.44px]'>Seems we are unable to reach our servers.</Text>
                {
                    loeading ?
                        <ActivityIndicator size={'large'} color={Colors.primaryColor} />
                        :
                        <TouchableOpacity className='flex justify-center items-center px-16 py-4 rounded-[4px] mt-7' style={{ backgroundColor: primaryColor }} onPress={() => { onPressTryAgain() }}>
                            <Text className='text-whiteColor text-[14px] leading-5 tracking-[0.44px] text-left font-medium'>Try again</Text>
                        </TouchableOpacity>
                }
            </View>
        </View>
    )
}

export default NetworkError