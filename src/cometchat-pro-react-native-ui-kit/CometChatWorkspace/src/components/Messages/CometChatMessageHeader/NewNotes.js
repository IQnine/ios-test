import { View, Text, TouchableOpacity, Dimensions, TextInput, ToastAndroid, ActivityIndicator, ScrollView, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Icons } from '../../../../../../assets/Images'
import { Colors } from '../../../../../../common/Colors'
import FastImage from 'react-native-fast-image'
import Entypo from 'react-native-vector-icons/Entypo';
import GradientButton from '../../../../../../components/Gradientbtn'
import * as  _COMET_SERVICES from '../../../../../../services/ambassador/conversation/CometchatServices';
import { Utils } from '../../../../../../common/Utils'

const NewNotes = (props) => {
    const [notes, setNotes] = useState('');
    const [loader, setLoader] = useState(false);

    const instituteInfo = useSelector((state) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    const primaryColor = instituteInfo.college_data[0].font_color;
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;

    const onSaveNote = async () => {
        setLoader(true)
        let amb_id = await Utils.getData('ambassador_id');
        let cometchatuid = props.route.params.uid;
        let collegeId = await Utils.getData('ambassador_college_id');
        let send_data = {
            college_id: collegeId,
            prospect_id: cometchatuid,
            ambassadors_id: amb_id,
            note_text: notes
        }
        try {
            let response = await _COMET_SERVICES.add_notes(send_data);
            if (response.statusCode == 200) {
                props.navigation.navigate('Notes', { uid: props.route.params.uid })
                setLoader(false);
            } else {
                ToastAndroid.showWithGravity(response.message, ToastAndroid.SHORT, ToastAndroid.CENTER);
                setLoader(false);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <View className='flex flex-1 bg-bgGrayColor'>
            <View className={`flex flex-row items-center px-2 h-[70px] w-full`} style={{ backgroundColor: primaryColor }}>
                <TouchableOpacity onPress={() => { props.navigation.goBack() }}>
                    <FastImage source={Icons.IcBackBtn} className='w-[42px] h-[42px]' tintColor={Colors.white} />
                </TouchableOpacity>
                <Text className='text-whiteColor text-[20px] leading-8 tracking-[0.44px] font-normal ml-1'>Add new note</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={true} keyboardShouldPersistTaps='handled' >
                <View className='px-8'>
                    <View className='mt-7 ml-1'>
                        <Text className='text-textColor font-InterRegular text-[14px] tracking-[0.44px] leading-5'>Write note</Text>
                    </View>
                    <View className='bg-greyColor25 w-full rounded-[4px] mt-2' style={{ height: (screenHeight * 3 / 4) - 50, width: screenWidth * 5 / 6 }}>
                        <TextInput
                            style={{ width: screenWidth * 5 / 6, height: '100%', alignItems: 'flex-start', textAlign: 'left', textAlignVertical: 'top' }}
                            className='px-[10px] text-textColor tracking-[0.44px] leading-5'
                            value={notes}
                            multiline={true}
                            autoFocus={false}
                            onBlur={(e) => { Keyboard.dismiss() }}
                            onChangeText={(e) => { setNotes(e) }}
                            scrollEnabled={true}
                            placeholder='You may leave notes about your conversation for the admin team to review.'
                            placeholderTextColor={Colors.grey1}
                            selectionColor={Colors.grey1}
                        />
                    </View>
                    <View className='mt-4'>
                        {
                            loader ?
                                <ActivityIndicator size={'large'} color={primaryColor} />
                                :
                                <GradientButton
                                    onPress={onSaveNote}
                                    text="Save Note"
                                    colors={[primaryColor, primaryColor]}
                                    disable={notes == null || notes.trim() === ''||notes==='' ? true : false}
                                />
                        }
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default NewNotes