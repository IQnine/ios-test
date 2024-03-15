import { View, Text, TouchableOpacity, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import FastImage from 'react-native-fast-image'
import { Icons, Images } from '../../../assets/Images'
import { Colors } from '../../../common/Colors'
import * as InstituteServices from '../../../services/prospect/institutes/InstituteServices';
import { Utils } from '../../../common/Utils'
import { useSelector } from 'react-redux'


const AmbassadorHeader = (props: any) => {
    const [collegeName, setCollegeName] = useState('');
    const [collegeLogo, setCollegeLogo] = useState();
    const [color, setColor] = useState();

    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    const primaryColor = instituteInfo.college_data[0].font_color;

    useEffect(() => {
        getCollege()
    }, [])

    const getCollege = async () => {
        let college_id = await Utils.getData('ambassador_college_id');
        try {
            let t: any = await InstituteServices.get_colleges_by_id(college_id)
            if (t.statusCode == 200) {
                setCollegeName(t.data[0]?.name);
                setCollegeLogo(t.data[0]?.logo)
                setColor(t.data[0]?.font_color);
            }

        } catch (error) {
            console.log(error);

        }
    }

    const header = () => {
        return (
            <View className={`flex flex-row  w-full justify-between items-center pl-4 pr-2 h-[80px]`} style={{ backgroundColor: primaryColor }}>
                <View className='flex w-[85%]'>
                    {/* <Text className='text-whiteColor text-[9px] leading-5 tracking-[0.44px] font-InterRegular'>Active institution</Text> */}
                    <View className='flex flex-row items-center'>
                        <FastImage source={{ uri: collegeLogo }} resizeMode='center' className=' w-[20px] h-full' />
                        {/* <Text className='text-whiteColor text-xl ml-1 mt-2 font-Helvetica'>{collegeName}</Text> */}
                        {/* <Text className={`text-whiteColor text-[20px]  ${modalVisible ? 'rotate-90 ml-3' : '-rotate-90 ml-1'}`}>‹</Text> */}
                        <View className='flex flex-row items-center'>
                            <Text numberOfLines={1} className='text-whiteColor text-xl ml-1 font-Helvetica font-bold'>{instituteInfo?.college_data[0]?.name}</Text>
                        </View>
                    </View>
                </View>
                <View className='flex mt-2'>
                    {/* <TouchableOpacity onPress={() => { }}>
                        <FastImage source={Icons.IcNotification} resizeMode='center' className='w-[23px] h-[25px]' />
                    </TouchableOpacity> */}
                    <TouchableOpacity onPress={() => { props.navigation.navigate('AmbassadorMenu') }}>
                        <FastImage source={Icons.IcHamburger} resizeMode='center' className='w-[40px] h-[40px]' tintColor={'white'} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    return (
        <View>
            <StatusBar backgroundColor={primaryColor} />
            {header()}
        </View>
    )
}

export default AmbassadorHeader