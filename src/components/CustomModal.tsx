import { View, Text, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import Modal from 'react-native-modal'
import { useSelector } from 'react-redux'
import FastImage from 'react-native-fast-image'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { Colors } from '../common/Colors'
import { Icons } from '../assets/Images'
import { Button } from 'react-native-elements'
import { Fonts } from '../common/Fonts'
const CustomModal = (props: any) => {
    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    const primaryColor = instituteInfo?.college_data[0]?.font_color;
    const [modalVisible, setModalVisible] = useState(props.AwesomeModal)

    return (
        <View className='flex flex-1 justify-center items-center'>
            <Modal
                isVisible={modalVisible}
                animationIn={'zoomIn'}
                animationInTiming={1}
                animationOutTiming={1}
                animationOut={'zoomOut'}

            >
                <View className='h-full w-full bg-transparent items-center justify-center'>
                    <View className='w-[100%] bg-bgGrayColor  rounded-[4px] px-4 py-4'>
                        <View className='flex-row w-full justify-between items-center'>
                            <Text className=' text-textColor text-[30px] leading-[44px] font-Helvetica tracking-[0.44px]'>
                                {props.title}
                            </Text>
                            <TouchableOpacity className='justify-center items-center border-[1px] border-greyBorder w-[26px] h-[26px] rounded-[4px] mb-1' onPress={() => { setModalVisible(false); props.closeModal() }} >
                                {/* <MaterialIcons name='cancel' size={30} color={primaryColor} /> */}
                                <FastImage source={Icons.IcCross} className='w-[9px] h-[9px]' />
                            </TouchableOpacity>
                        </View>
                        <View className='justify-center py-6'>
                            <Text className=' text-[16px] text-textColor tracking-[0.44px] leading-4 font-InterRegular font-normal'>{props.message}</Text>
                        </View>
                        <View className='flex-row  w-full justify-between mt-4'>
                            <View className=' flex w-[140px] py-3 px-1 items-center justify-center  rounded-[5px]' style={{ backgroundColor: primaryColor }} >
                                <TouchableOpacity onPress={() => { setModalVisible(false); props.closeModal() }}>
                                    <Text className=' text-whiteColor text-lg text-[12px] font-InterSemiBold font-normal leading-5 tracking-[0.44px]'>{props.no} </Text>
                                </TouchableOpacity>
                            </View>
                            {
                                props.isLoading ?
                                    <View className=' flex w-[140px] py-3 px-3 border-greyBorder border  items-center justify-center rounded-[5px] bg-whiteColor'>
                                        <Text className='text-greyBorder text-lg text-[12px] font-InterSemiBold font-normal leading-5 tracking-[0.44px]'>Loading...</Text>
                                    </View>
                                    : <TouchableOpacity onPress={() => { props.onYesClick() }} className=' flex w-[140px] py-3 px-3 border-greyBorder border  items-center justify-center rounded-[5px] bg-whiteColor'>
                                        <Text className='text-greyBorder text-lg text-[12px] font-InterSemiBold font-normal leading-5 tracking-[0.44px]'>{props.yes}</Text>
                                    </TouchableOpacity>
                            }
                        </View>
                    </View>

                </View>
            </Modal>
        </View>
    )
}

export default CustomModal