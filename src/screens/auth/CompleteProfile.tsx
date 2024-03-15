import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, StyleSheet, TouchableOpacity, Linking, ToastAndroid, PermissionsAndroid, Keyboard, ActivityIndicator, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import FastImage from 'react-native-fast-image'
import { Icons, Images } from '../../assets/Images'
import { Colors } from '../../common/Colors'
import * as AmbassadorServices from '../../services/prospect/ambassadors/AmbassadorsServices';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import GradientButton from '../../components/Gradientbtn'
import { TERMS_AND_CONDITIONS } from '../../CONSTS'
import { useIsFocused } from '@react-navigation/native'
import * as ProfileServices from '../../services/prospect/profile/ProfileServices'
import * as AuthServices from '../../services/auth/AuthServices'
import { DEGREE_LEVEL, GENDER, USER_TYPE } from '../prospect/menu/Dropdowndata'
import { useSelector } from 'react-redux'
import Modal from "react-native-modal";
import BottomSheet from '@gorhom/bottom-sheet';
import ImageCroper from '../prospect/menu/ImageCroper'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import IonIcon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather'
import moment from 'moment'
import { Utils } from '../../common/Utils'
import { CometChat } from '@cometchat-pro/react-native-chat'

const tommorow = new Date().setDate(new Date().getDate() + 1)

type OptionData = {
    label: string,
    value: number
}
type MandatoryDataType = {
    gender: number
    profile_picture: number
    date_of_birth: number
    application_stage: number
    anticipated_enrollment_term: number
    area_of_study: number
    state: number
    program_of_interest: number
    phone_number: number
    languages: number
    degree_level: number
    industry: number
    hobbies_and_interests: number
    nationality: number
    topic_of_inquiry: number,
    clubs_and_organizations: number,
    program: number,
    user_type: number,
    concentration_major: number,
    previous_qualification: number,
    year_of_graduation: number,
    student_id: number,
    favorite_spot_on_campus: number,
    pronouns: number
}

const CompleteProfile = (props: any) => {
    let email = props.route.params.email
    let uid = props.route.params.uid
    const bottomSheetRef = React.useRef<BottomSheet>(null);
    const isFocused = useIsFocused();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('')
    const [profilePic, setProfilePic] = useState();
    const [modalVisible, setModalVisible] = useState(false);
    const [bottomSheetVisiblity, setBottomsheetVisibility] = useState(false);
    const [profilePic2, setProfilePic2] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [profilePicUrl, setProfilePicUrl] = useState(String);
    const [mandatory, setMandatory] = useState([]);
    const [majorValue, setMajorValue] = useState();
    const [isFocus, setIsFocus] = useState(false);
    const [about, setAbout] = useState('');

    useEffect(() => {
        getfield();
    }, [isFocused])

    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })

    const primaryColor = instituteInfo?.college_data[0].font_color ? instituteInfo.college_data[0].font_color : Utils.getData('primaryColor')

    const CompletePorfile = async () => {
        setIsLoading(true)
        let collegId = await Utils.getData('ambassador_college_id')
        let send_data = {
            email: props.route.params.email,
            college_id: collegId,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            program: majorValue?.['program'],
            profile_picture: profilePicUrl,
            about_me: about.trim(),
            affiliation_with_institution: majorValue?.['affiliation_with_institution']
        }
        try {
            await AuthServices.ambassador_complete_profile(send_data).then(async (res: any) => {
                if (res.statusCode == 200) {
                    var user = new CometChat.User(uid);
                    let n = AuthServices.encrypt(firstName);
                    user.setName(n);
                    user.setAvatar(profilePicUrl);
                    CometChat.updateCurrentUserDetails(user).then(
                        user => {
                            console.log("Complete profile mandatory successfull", res);
                            setIsLoading(false)
                            props.navigation.navigate('OptionalField')
                        }, error => {
                            console.log("error", error);
                        }
                    )
                } else {
                    setIsLoading(false)
                    console.log("error sending mandatory data complete profile ambassador", res);
                }
            })
        } catch (error) {
            setIsLoading(false)
            console.log(error);
        }
    }


    const getfield = async () => {
        setIsLoading(true)
        try {
            await AuthServices.ambassador_complete_profile_fields().then((res: any) => {
                if (res.statusCode == 200) {
                    setMandatory(res.data.mandatory_fields)
                    let first_name = res.data.mandatory_fields.filter((t: any) => (t.field_key === 'first_name'))
                    let last_name = res.data.mandatory_fields.filter((t: any) => (t.field_key === 'last_name'))
                    setFirstName(first_name[0]?.field_value);
                    setLastName(last_name[0]?.field_value)
                    setIsLoading(false)
                }
            })
        } catch (error) {
            setIsLoading(false)

            console.log(error);
        }
    }

    // function showDatePicker() {
    //     setDatePicker(true);
    // };

    // function onDateSelected(event: any, value: any) {
    //     const currentDate = value || tommorow;
    //     if (new Date(currentDate) == new Date(tommorow)) {
    //         // setDob('dd/mm/yyyy')
    //         setDob(moment(currentDate).format('ll'))
    //         return
    //     }
    //     setDate(currentDate);
    //     setDatePicker(false);
    //     let tempDate = new Date(currentDate);
    //     // let fDate = tempDate.getDate() + '/' + (tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
    //     // setDob(fDate)
    //     setDob(moment(tempDate).format('ll'))

    // };

    const pickImage = async () => {
        setModalVisible(true)
        setBottomsheetVisibility(true)
    };

    const closeModal = (uri: any, image_url: any) => {
        setModalVisible(false);
        if (uri !== null) {
            setProfilePic(uri)
            setProfilePicUrl(image_url)
        }
    }

    const takePhoto = async () => {
        try {
            let granted = null;
            if (Platform.OS === 'android') {
                granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'TruLeague Camera Permission',
                        message: 'TruLeague needs access to your camera ',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
            }

            if (Platform.OS === 'ios' || granted === PermissionsAndroid.RESULTS.GRANTED) {
                const result: any = await launchCamera({
                    mediaType: 'photo',
                    presentationStyle:'fullScreen'
                });
                if (result && result.assets) {
                    setBottomsheetVisibility(false)
                    setModalVisible(true);
                    setProfilePic(result.assets[0].uri)
                }
            }

        } catch (error) {
            console.log("Camera Error: ", error);

        }

    };

    const TakePhotoOption = () => {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 25 }}
                onPress={takePhoto} >
                <EvilIcon name="camera" size={40} color={Colors.blackColor50} />
                <Text style={{ fontSize: 18, marginLeft: 10, fontWeight: '500', color: Colors.blackColor50, marginTop: 3 }}>
                    Take Photo
                </Text>
            </TouchableOpacity>
        );
    }

    const PhotoLibraryOption = () => {
        return (
            <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginLeft: 5 }}
                onPress={openGalary} >
                <IonIcon name="image-outline" size={30} color={Colors.blackColor50} />

                <Text
                    style={{
                        fontSize: 18,
                        marginLeft: 14,
                        fontWeight: '500',
                        color: Colors.blackColor50
                    }}>
                    Photo Library
                </Text>
            </TouchableOpacity>
        );
    }

    const openGalary = async () => {
        const result: any = await launchImageLibrary({
            mediaType: 'photo'
        });
        if (result && result.assets) {
            setBottomsheetVisibility(false)
            setModalVisible(true);
            setProfilePic(result.assets[0].uri)
        }
    }

    // const openWebsite = (url: any) => {
    //     Linking.openURL(url)
    //         .catch((err) => console.error('An error occurred:', err));
    // };

    const onFinish = async () => {
        Keyboard.dismiss()
        // props.navigation.navigate('AmbassadorStack', { screen: 'BottomTabsNavigator' })
        CompletePorfile()
    }

    function notNull(val: any) {
        return (
            val !== null &&
            val !== undefined &&
            val !== 'NULL' &&
            val !== 'null' &&
            val !== 'undefined' &&
            val !== 'UNDEFINED' &&
            (val + '').trim() !== ''
        );
    }

    const isFormValid = () => {
        return (
            notNull(firstName)
            && notNull(email)
            && notNull(about)
            && notNull(majorValue?.['program'])
            && notNull(USER_TYPE)
            && notNull(profilePicUrl)
        )
    }
    const screenWidth = Dimensions.get('window').width;

    const TextField = (item: any) => {
        return (
            <View key={item.field_key}>
                <View className='mt-7 ml-1'>
                    <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}*</Text>
                </View>
                <TextInput
                    className={`w-full h-[50px] text-textColor leading-4 bg-fieldGrayColor px-3 rounded-[4px] mt-1`}
                    value={item.field_key == "first_name" ? firstName : lastName}
                    // placeholder='Enter your first name'
                    placeholder={item.field_placeholder}
                    onChangeText={(e: any) => {
                        const cleanedValue: any = e.replace(/^\s+|\s+$|\s+(?=\s)/g, " ");
                        if (cleanedValue) {
                            setAbout(cleanedValue)
                            item.field_key == "first_name" ? setFirstName(cleanedValue) : setLastName(cleanedValue)
                        } else {
                            item.field_key == "first_name" ? setFirstName(e) : setLastName(e)
                        }
                    }}
                    placeholderTextColor={Colors.greyBorder}
                    autoComplete='off'
                />
            </View>
        )
    }
    const EmailField = (item: any) => {
        return (
            <View key={item.field_key}>
                <View className='mt-7 ml-1'>
                    <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}*</Text>
                </View>
                <TextInput
                    className={`w-full text-textColor leading-4 h-[50px] bg-fieldGrayColor px-3 rounded-[4px] mt-1 opacity-60`}
                    value={email}
                    // placeholder='Enter your email'
                    placeholder={item.field_placeholder}
                    placeholderTextColor={Colors.greyBorder}
                    autoComplete='off'
                    editable={false}
                />
            </View>
        )
    }
    const Dropdownelemant = (item: any) => {
        let option: OptionData[] = [];
        item.field_options.data?.map((o: any) => {
            let item = {
                label: o.name,
                value: o.id
            }
            option.push({ label: o.name, value: o.id })
        })
        return (
            <View key={item.field_key} >
                <View className='mt-7 ml-1'>
                    <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}*</Text>
                </View>
                <Dropdown
                    selectedTextProps={{ numberOfLines: 1 }}
                    style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                    placeholderStyle={{
                        fontSize: 16,
                        color: Colors.greyBorder
                    }}
                    selectedTextStyle={{
                        fontSize: 16,
                        color: Colors.textColor
                    }}
                    inputSearchStyle={{
                        height: 40,
                        fontSize: 16,
                        color: Colors.textColor,
                    }}
                    iconStyle={{
                        width: 20,
                        height: 20,
                    }}
                    itemContainerStyle={{ backgroundColor: Colors.bgGrayColor }}
                    itemTextStyle={{ color: Colors.textColor }}
                    data={option}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    autoScroll={false}
                    inverted={false}
                    dropdownPosition='auto'
                    // placeholder={!isFocus ? `Select ${item.field_label?.toLowerCase()}` : ''}
                    placeholder={item.field_placeholder}
                    searchPlaceholder="Search..."
                    value={majorValue?.[`${item.field_key}`]}
                    onFocus={() => Keyboard.dismiss()}
                    onChange={(o: any) => {
                        setMajorValue((prevValues: any) => ({
                            ...prevValues,
                            [item.field_key]: o.value
                        }));
                    }}
                    renderRightIcon={() => {
                        return (
                            <AntDesign name='caretdown' size={8} color={Colors.greyBorder} style={{ paddingRight: 10 }} />
                        )
                    }}
                />
            </View>)

    }
    const Profile = (item: any) => {
        return (
            <View key={item.field_key}>
                <View className='mt-7 ml-1'>
                    <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}*</Text>
                </View>
                <TouchableOpacity className='flex flex-row mt-2 max-w-full py-4 px-2 justify-start items-center rounded-lg' style={{ backgroundColor: Colors.fieldGrayColor }} onPress={pickImage}>
                    <TouchableOpacity onPress={() => { }}>
                        <Feather name='upload' size={16} color={Colors.greyBorder} />
                    </TouchableOpacity>
                    <View className=' ml-2 pr-2'>
                        <Text className='text-textColor' numberOfLines={1}>{profilePicUrl}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    const AboutField = (item: any) => {
        return (
            <View key={item.field_key}>
                <View className='mt-7 ml-1'>
                    <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}*</Text>
                </View>
                <TextInput
                    style={{ height: 100, alignItems: 'flex-start', textAlign: 'left', textAlignVertical: 'top' }}
                    placeholder={item.field_placeholder}
                    placeholderTextColor={Colors.greyBorder}
                    className='flex flex-row mt-3 min-w-full py-2 px-3 text-left rounded-lg justify-start items-start text-textColor leading-4 bg-fieldGrayColor tracking-[0.44px] font-InterRegular font-normal'
                    value={about}
                    onChangeText={(e: any) => {
                        const cleanedValue: any = e.replace(/^\s+|\s+$|\s+(?=\s)/g, " ");
                        if (cleanedValue) {
                            setAbout(cleanedValue)
                        } else {
                            setAbout(e)
                        }
                    }}
                    multiline={true}
                />
            </View>
        )
    }
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className='flex flex-1 bg-bgGrayColor w-full items-center relative' style={{ zIndex: 10 }}>
            <Modal
                isVisible={modalVisible}
                onBackButtonPress={() => closeModal(profilePic2, profilePic2)}
                onBackdropPress={() => closeModal(profilePic2, profilePic2)}
                animationIn={'slideInUp'}
                animationOut={'slideOutDown'}
                animationInTiming={1}
                animationOutTiming={1}
                coverScreen={true}
                style={{
                    margin: 0,
                    flex: 1,
                    justifyContent: 'flex-start'
                }}>
                {
                    bottomSheetVisiblity ?
                        <BottomSheet
                            ref={bottomSheetRef}
                            snapPoints={['25%', '25%']}
                            // borderRadius={30}
                            index={1}
                            enablePanDownToClose={true}
                        >
                            <View>
                                {TakePhotoOption()}
                                {PhotoLibraryOption()}
                            </View>
                        </BottomSheet>
                        :
                        <ImageCroper closeModal={closeModal} profilePic={profilePic} profilePic2={profilePic2} primaryColor={primaryColor} setProfilePic={setProfilePic} type={'_A_SIGNUP'} />
                }

            </Modal>
            <View className='flex w-full justify-center items-center'>
                <View className='w-[120px] h-[92px] mt-10'>
                    <FastImage source={Images.truleaguelogo} resizeMode='contain' className='w-full h-full' />
                </View>
            </View>
            {
                isLoading ?
                    <View style={{ zIndex: 50, width: screenWidth * 8.5 / 10 }} className='flex bg-whiteColor h-[65%] px-[20px] items-center rounded-[4px] pt-[30px] pb-[10px] absolute top-[20%]' >
                        <View className='flex flex-1 justify-center items-center'>
                            <ActivityIndicator size={'large'} color={primaryColor} />
                        </View>
                    </View>
                    :
                    <View style={{ zIndex: 50, width: screenWidth * 8.5 / 10 }} className='flex bg-whiteColor h-[65%] px-[20px] items-center rounded-[4px] pt-[30px] pb-[10px] absolute top-[20%]' >
                        <View>
                            <Text className='text-textColor text-[30px] font-Helvetica leading-10 tracking-[-0.44px]'>Ambassador sign up</Text>
                        </View>
                        <ScrollView keyboardShouldPersistTaps='always' >
                            <View className='h-full max-w-fit flex flex-1 mt-3 mx-[10px]'>
                                {
                                    mandatory.map((e: any, i: any) => {
                                        if (e.field_type === 'text') {
                                            return (
                                                TextField(e)
                                            )
                                        }

                                        if (e.field_type === 'email') {
                                            return (
                                                EmailField(e)
                                            )
                                        }
                                        if (e.field_type === 'select_one') {
                                            return (
                                                Dropdownelemant(e)
                                            )
                                        }
                                        if (e.field_type === 'file') {
                                            return (
                                                Profile(e)
                                            )
                                        }
                                        if (e.field_type === 'textarea') {
                                            return (
                                                AboutField(e)
                                            )
                                        }
                                    }
                                    )
                                }
                            </View>
                            {
                                isLoading ?
                                    <View className='mt-10'>
                                        <ActivityIndicator size={'large'} color={Colors.textColor} />
                                    </View>
                                    :
                                    isFormValid() ?
                                        <TouchableOpacity onPress={onFinish} className='flex-auto flex-row min-w-[70%] mb-[10px] mt-[30px] h-[55px] mx-[10px] items-center justify-center rounded-[4px]' style={{ backgroundColor: primaryColor }}  >
                                            <Text className='px-10 text-[16px]  font-InterRegular text-white' numberOfLines={1}>Next step</Text>
                                            <AntDesign name='caretdown' size={8} color={Colors.white} style={{ transform: [{ rotate: '-90deg' }], position: 'absolute', right: 15, top: 25 }} />
                                        </TouchableOpacity>
                                        : <View className='flex-auto flex-row min-w-[70%]  mb-[10px] mt-[35px] h-[55px] items-center mx-[10px] justify-center  opacity-50 rounded-[4px]' style={{ backgroundColor: primaryColor }} >
                                            <Text className='px-10 text-[16px]  font-InterRegular text-white' numberOfLines={1}>Next step</Text>
                                            <AntDesign name='caretdown' size={8} color={Colors.white} style={{ transform: [{ rotate: '-90deg' }], position: 'absolute', right: 15, top: 25 }} />
                                        </View>
                            }
                        </ScrollView>
                    </View>

            }
            <View style={{ backgroundColor: primaryColor }} className='flex px-[30px] absolute bottom-0 w-full h-[32%] ' >
                <View className='items-center justify-center top-[60%]'>
                    <Text className='text-[16px]  font-InterRegular text-white '>Already have an account?</Text>
                    <TouchableOpacity onPress={() => props.navigation.replace('AuthStack', { screen: 'Login' })} className='border-b-[1px] border-whiteColor ' >
                        <Text className='text-[16px]  font-InterRegular text-white '>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 16,
        marginTop: 16
    },
    itemContainer: {
        // color: Colors.textColor
        backgroundColor: Colors.bgGrayColor
    },
    dropdown: {
        // paddingVertical: 10,
        height: 50,
        borderColor: 'gray',
        borderRadius: 4,
        paddingHorizontal: 8,
        marginTop: 6,
        backgroundColor: Colors.fieldGrayColor
    },
    icon: {
        marginRight: 5,
    },
    label: {
        position: 'absolute',
        backgroundColor: Colors.bgGrayColor,
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
        color: Colors.textColor
    },
    placeholderStyle: {
        fontSize: 16,
        color: Colors.greyBorder
    },
    selectedTextStyle: {
        fontSize: 16,
        color: Colors.textColor
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: Colors.textColor,

    },
});

export default CompleteProfile