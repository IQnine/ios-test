import { View, Text, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Icons } from '../../../../../../assets/Images'
import { Colors } from '../../../../../../common/Colors'
import FastImage from 'react-native-fast-image'
import Entypo from 'react-native-vector-icons/Entypo';
import Octicons from 'react-native-vector-icons/Octicons';
import * as  _COMET_SERVICES from '../../../../../../services/ambassador/conversation/CometchatServices';
import { useIsFocused } from '@react-navigation/native'
import { Utils } from '../../../../../../common/Utils'
import moment from 'moment'

const Notes = (props) => {
    const isFocuesd = useIsFocused();
    const [notes, setNotes] = useState([]);
    const [loader, setLoader] = useState(false);

    const instituteInfo = useSelector((state) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    const primaryColor = instituteInfo.college_data[0].font_color;

    useEffect(() => {
        get_notes()
    }, [isFocuesd])

    const get_notes = async () => {
        setLoader(true)
        let amb_id = await Utils.getData('ambassador_id');
        let cometchatuid = props.route.params.uid;
        let collegeId = await Utils.getData('ambassador_college_id');
        try {
            let note = await _COMET_SERVICES.get_notes(amb_id, cometchatuid, collegeId);
            console.log("notes:", note);
            if (note.statusCode == 200) {
                setNotes(note.data)
                setLoader(false)
            }
        } catch (error) {
            console.log("NOTES ERROR:", error);
        }
    }


    const renderNotes = ({ item }) => {
        return (
            <View className='bg-whiteColor px-5 py-5 rounded-[6px] mt-4'>
                <View className='w-full flex flex-row items-center'>
                    <Octicons name='calendar' color={Colors.greyBorder} size={16} />
                    <Text className='text-greyBorder text-[12px] ml-2'>{moment(item.create_at).format('ll')}</Text>
                </View>
                <View className='mt-4'>
                    <Text className='text-textColor'>{item.note_text}</Text>
                </View>
            </View>
        )
    }
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;

    return (
        <View className='flex flex-1 bg-bgGrayColor'>
            <View className={`flex flex-row items-center justify-between pl-2 pr-3 h-[70px] w-full`} style={{ backgroundColor: primaryColor }}>
                <View className='w-[50%] flex flex-row items-center'>
                    <TouchableOpacity onPress={() => { props.navigation.goBack() }}>
                        <FastImage source={Icons.IcBackBtn} className='w-[42px] h-[42px]' tintColor={Colors.white} />
                    </TouchableOpacity>
                    <Text className='text-whiteColor text-[20px] leading-8 tracking-[0.44px] font-normal ml-1'>Notes</Text>
                </View>

                <View className='w-[50%] flex items-end'>
                    <TouchableOpacity onPress={() => { props.navigation.navigate('NewNotes', { uid: props.route.params.uid }) }} className='h-[40px] border-[1px] border-whiteColor flex flex-row justify-between items-center px-3 rounded-[4px]'>
                        <Entypo name='plus' size={18} color={Colors.white} />
                        <Text className='text-whiteColor text-[14px] leading-8 tracking-[0.44px] font-normal ml-3'>Add new note</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className='px-[30px] mt-4 flex flex-1 pb-5'>
                {

                    loader ?
                        <View className='flex flex-1 items-center justify-center'>
                            <ActivityIndicator size={'large'} color={primaryColor} />
                        </View>
                        :
                        notes.length > 0 ?
                            < FlatList
                                data={notes}
                                renderItem={renderNotes}
                                keyExtractor={(item) => item.id}
                            />
                            :
                            <View className='flex flex-1 justify-center items-center'>
                                <FastImage source={Icons.IcBlankNotes} className='w-[100px] h-[100px]' />
                                <Text className='text-greyBorder text-[20px] leading-8 font-bold font-HelveticaBold text-center'>No notes yet</Text>
                            </View>
                }
            </View>
        </View>
    )
}

export default Notes