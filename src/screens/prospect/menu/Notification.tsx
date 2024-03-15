import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Icons } from '../../../assets/Images'
import FastImage from 'react-native-fast-image'
import { Colors } from '../../../common/Colors'

type NotificationDataType = {
    id: number,
    title: string,
    isSeen: number
}

const Notification = (props: any) => {
    const [unSeenNotification, setUnseenNotification] = useState(Number);

    let DATA: NotificationDataType[] = [
        {
            id: 1,
            title: 'New chat initiated between Anjali Mehta and RahulSingh',
            isSeen: 0
        },
        {
            id: 2,
            title: 'New chat initiated between Anjali Mehta and RahulSingh',
            isSeen: 0
        },
        {
            id: 3,
            title: 'New chat initiated between Anjali Mehta and RahulSingh',
            isSeen: 1
        },
        {
            id: 4,
            title: 'New chat initiated between Anjali Mehta and RahulSingh',
            isSeen: 1
        },
        {
            id: 5,
            title: 'New chat initiated between Anjali Mehta and RahulSingh',
            isSeen: 1
        },
        {
            id: 6,
            title: 'New chat initiated between Anjali Mehta and RahulSingh',
            isSeen: 0
        },
        {
            id: 7,
            title: 'New chat initiated between Anjali Mehta and RahulSingh',
            isSeen: 0
        }
    ]

    useEffect(() => {
        getCount();
    }, [])
    const renderNotification = ({ item }: { item: NotificationDataType }) => {
        return (
            <TouchableOpacity className={`w-full h-[70px] px-4 py-3 ${item.isSeen === 0 ? 'bg-greyColor25' : 'bg-bgGrayColor'} flex border-b-[1px] border-b-greyColor25 justify-center`}>
                <Text className={`${item.isSeen == 0 ? 'font-InterSemiBold  tracking-[0.25px]' : 'font-InterRegular tracking-[0.44px]'} text-textColor text-[12px] leading-5`}>{item.title}</Text>
            </TouchableOpacity>
        )
    }

    const getCount = () => {
        let count = 0;
        let t = DATA.map((o: any) => {
            if (o.isSeen == 0) {
                count++;
            }
            return count
        })
        setUnseenNotification(count);
    }

    return (
        <View className='flex flex-1 bg-bgGrayColor'>
            <View className='flex flex-row items-center bg-primaryColor px-2 py-5'>
                <TouchableOpacity onPress={() => { props.navigation.goBack() }}>
                    <FastImage source={Icons.IcBackBtn} className='w-[42px] h-[42px]' tintColor={Colors.white} />
                </TouchableOpacity>
                <Text className='text-whiteColor text-[20px] leading-8 tracking-[0.44px] font-HelveticaRegular font-normal ml-1'>Notifications ({unSeenNotification})</Text>
            </View>

            <FlatList
                showsVerticalScrollIndicator={false}
                data={DATA}
                renderItem={renderNotification}
                keyExtractor={(item: any) => item.id}
            />
        </View>
    )
}

export default Notification