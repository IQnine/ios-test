import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import FastImage from 'react-native-fast-image'
import { Icons, Images } from '../../../assets/Images'
import { useSelector } from 'react-redux'
import UpcomingSchedules from './UpcomingSchedules'
import PastSchedules from './PastSchedules'


const Schedules = (props: any) => {
    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    const primaryColor = instituteInfo.college_data[0].font_color;
    const [active, setActive] = useState(false);
    const [tabId, setTabId] = useState(1);

    return (
        <View className='flex flex-1 bg-bgGrayColor'>
            <View className='flex flex-row justify-between items-center mt-6 w-full px-4'>
                <TouchableOpacity
                    onPress={() => { setTabId(1) }}
                    className={`px-[2px] w-[48%] py-3 flex justify-center items-center rounded-[40px] ${tabId == 1 ? 'border-[1.5px]' : 'border-none'} bg-whiteColor`} style={{ borderColor: primaryColor }}>
                    <Text className={`text-[14px]  font-Helvetica ${tabId == 1 ? 'text-textColor' : 'text-greyBorder'}`}>Upcoming Schedules</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => { setTabId(2) }}
                    className={`px-1 w-[47%] py-3 flex justify-center items-center rounded-[40px] ${tabId == 2 ? 'border-[1.5px]' : 'border-none'} bg-whiteColor`} style={{ borderColor: primaryColor }}>
                    <Text className={`text-[14px]  font-Helvetica ${tabId == 2 ? 'text-textColor' : 'text-greyBorder'}`}>Past Schedules</Text>
                </TouchableOpacity>
            </View>

            {
                tabId == 1 ?
                    <UpcomingSchedules navigation={props.navigation} />
                    :
                    <PastSchedules navigation={props.navigation} />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    mainCard: {
        elevation: 3,
    }
})

export default Schedules