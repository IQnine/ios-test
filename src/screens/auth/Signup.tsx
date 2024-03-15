import { View, Text, ToastAndroid, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Alert, Linking, Keyboard, PermissionsAndroid, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfo } from '../../redux/action/UserAction';
import { Colors } from '../../common/Colors';
import GradientButton from '../../components/Gradientbtn';
import { Icons } from '../../assets/Images';
import FastImage from 'react-native-fast-image';
import * as AuthService from '../../services/auth/AuthServices'
import { Utils } from '../../common/Utils';
// import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin'
import { COMETCHAT_CONSTANTS, GOOGLE_SIGNIN_CONSTANTS, TERMS_AND_CONDITIONS } from '../../CONSTS';
import { setGoogleInfo } from '../../redux/action/GooglesignupAction';
import { CometChat } from '@cometchat-pro/react-native-chat';
import * as InstituteServices from '../../services/prospect/institutes/InstituteServices';
import { setInstituteInfo } from '../../redux/action/InstituteAction';
import { any } from 'prop-types';
import { get_api } from '../../services/auth/AuthServices';
import { setPastProspectData, setUpcomingData, setUpcomingProspectData } from '../../redux/action/SchedularData';
import { setResetInstitute } from '../../redux/action/ResetInstituteAction';
import { setFilterMajor, setFilterNational, setFilterStates, setFilterValue, setIsFilterSet } from '../../redux/action/FilterStateList';
import moment, { isDate } from 'moment';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import BottomSheet from '@gorhom/bottom-sheet';
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import IonIcon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather'
import { Dropdown } from 'react-native-element-dropdown';
import { MultiSelect } from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Modal from "react-native-modal";
import ImageCroper from '../prospect/menu/ImageCroper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ProfileServices from '../../services/prospect/profile/ProfileServices'
import { RefreshControl } from 'react-native';
import messaging from '@react-native-firebase/messaging';


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
    student_id: any,
    previous_qualification: any,
    year_of_graduation: any,
    clubs_and_organizations: any,
    favorite_spot_on_campus: any,
    pronouns: any,
    concentration_major: any
}
type userData = {
    email: string,
    role_id: number
}
type OptionData = {
    label: string,
    value: number
}
const tommorow = new Date().setDate(new Date().getDate() + 1)

const Signup = (props: any) => {
    let DATA = props.route.params.data
    let primaryColor = DATA[0].college_color
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [seepassword, setSeePassword] = useState(false);
    const [user, setUser] = useState({});
    const [ipData, setIpData] = useState();
    const [isoCodeData, setIsoCodeData] = useState();
    const [country, setCountry] = useState();
    const [state, setstate] = useState();
    const [userDetail, setUserDetail] = useState<userData>(Object)
    const [ipObject, setIpObject] = useState();
    const [mandatory, setMandatory] = useState([]);
    const [additional, setAdditional] = useState([])
    const [mandatoryField, setMandatoryFieldData] = useState<any>()//done
    const [customeData, setCustomeData] = useState<any>();
    const [about, setAbout] = useState();
    const [languageValue, setLanguageValue] = useState<any>([]);
    const [areaOfQueryValue, setAreaOfQueryValue] = useState<any>([]);
    const [dob, setDob] = useState('')//done
    const [dobPlaceHolder, setDobPlaceHolder] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [datePicker, setDatePicker] = useState(false)
    const [date, setDate] = useState(new Date())
    const [areaOfQueryData, setAreaOfQueryData] = useState<OptionData[]>([]);
    const [languageData, setLanguageData] = useState<OptionData[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [bottomSheetVisiblity, setBottomsheetVisibility] = useState(false);
    const bottomSheetRef = React.useRef<BottomSheet>(null);
    const [profilePic, setProfilePic] = useState()
    const [profilePic2, setProfilePic2] = useState()
    const [profilePicUrl, setProfilePicUrl] = useState();
    const [isFocus, setIsFocus] = useState(false);
    const [isDateSelected, setIsDateSelected] = useState(false)
    const [picPlaceholder, setPicPlaceholder] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showFields, setShowFields] = useState<MandatoryDataType>()
    let user_detail: any = '';
    const userInfo = useSelector((state: any) => {
        return state.userInfoReducer.userInfo
    })
    useEffect(() => {
        getUserDetail();
        getApiData();
        getFields();
    }, [])


    const getUserDetail = async () => {
        user_detail = await Utils.getData('user_details')
        setUserDetail(user_detail);
    }

    const getApiData = async () => {
        await AuthService.get_api().then((data: any) => {
            setIpObject(data)
            setIpData(data.ip)
            setIsoCodeData(data.country.iso_code)
            setCountry(data.country.name)
            setstate(data.state.name)

        }).catch((error) => {
            console.log(error);

        })

    }
    // const click_password = () => {
    //     setSeePassword(!seepassword);
    // }
    const get_colleges = async () => {
        try {
            let t: any = await InstituteServices.get_colleges_by_id(DATA[0].id)
            if (t.statusCode == 200) {
                return t
            }

        } catch (error) {
            console.log(error);
        }
    }

    const getFields = async () => {
        let option: OptionData[] = [];
        let option1: OptionData[] = [];
        setIsLoading(true)
        try {
            let response: any = await AuthService.propspect_signup_attributes(parseInt(DATA[0].id));
            if (response.statusCode == 200) {
                setMandatory(response.data.mandatory_fields);
                setAdditional(response.data.optional_fields);
                let { mandatory_fields, optional_fields } = response.data
                if (mandatory_fields.length || optional_fields.length) {
                    let fields = [...mandatory_fields, ...optional_fields].filter((t: any) => (t.field_type === 'select_one' || t.field_type === 'text'))
                    let about1 = [...mandatory_fields].filter((t: any) => (t.field_type === 'textarea'))
                    let lang = optional_fields?.filter((t: any) => (t.field_key === 'languages'))
                    let toi = optional_fields?.filter((t: any) => (t.field_key === 'topic_of_inquiry'))
                    let date1 = optional_fields?.filter((t: any) => (t.field_type === 'date'))
                    let customs = optional_fields?.filter((t: any) => (t.field_type === 'custom_text'))
                    let profile_pic = optional_fields?.filter((t: any) => (t.field_type === 'file'));
                    let d: any = {}
                    let c = fields.map((f: any) => {
                        d[f.field_key] = f.field_value
                    })
                    setMandatoryFieldData((prevValues: any) => ({
                        ...prevValues,
                        ...d
                    }));
                    let e: any = {}
                    let f = customs.map((f: any) => {
                        e[f.field_key] = f.field_value
                    })
                    setCustomeData((prevValues: any) => ({
                        ...prevValues,
                        ...e
                    }));
                    lang[0]?.field_options?.data?.map((o: any) => {
                        option?.push({ label: o.name, value: o.id })
                    })

                    toi[0]?.field_options?.data?.map((o: any) => {
                        option1?.push({ label: o.name, value: o.id })
                    })
                    setLanguageData(option)
                    setAreaOfQueryData(option1)
                    setDobPlaceHolder(date1[0]?.field_placeholder)
                    setProfilePicUrl(profile_pic[0]?.field_placeholder)
                    setIsLoading(false)
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const openWebsite = (url: any) => {
        Linking.openURL(url)
            .catch((err) => console.error('An error occurred:', err));
    };

    function showDatePicker() {
        setDatePicker(true);
    };

    function onDateSelected(event: any, value: any) {
        setDatePicker(false);
        const currentDate = value || tommorow;
        if (new Date(currentDate) == new Date(tommorow)) {
            let data: any = moment(currentDate).format('ll');
            setDob(data)
            return
        }
        setDate(currentDate);
        setIsDateSelected(true);
        let tempDate = new Date(currentDate);
        setDob(moment(tempDate).format('ll'))
    };

    const getSelectedItems = (placeholder: any) => {
        try {
            let d = languageData.filter((t: any) => languageValue?.includes(t.value));
            if (d.length) {
                return d.map((o: any) => o.label).join(', ')
            } else {
                return placeholder
            }
        } catch (e) {
            console.log(e)
            return placeholder
        }
    }
    const getSelectedItemsTOC = (placeholder: any) => {
        try {
            let d = areaOfQueryData.filter((t: any) => areaOfQueryValue?.includes(t.value))
            if (d.length) {
                return d.map((o: any) => o.label).join(', ')
            } else {
                return placeholder
            }
        } catch (e) {
            console.log(e)
            return placeholder
        }
    }

    const closeModal = (uri: any, image_url: any) => {
        setModalVisible(false);
        if (uri !== null) {
            setProfilePic(image_url)
            setProfilePicUrl(image_url)
            setPicPlaceholder(false)
        } else if (uri == undefined) {
            setProfilePic(profilePic);
            setProfilePicUrl(profilePicUrl);
            setPicPlaceholder(true);
        }
    }

    const pickImage = async () => {
        setModalVisible(true)
        setBottomsheetVisibility(true)
    };

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
            notNull(mandatoryField?.['last_name'])
            && notNull(mandatoryField?.['first_name'])
            && notNull(password)
            // && notNull(majorValue?.['program'])
            // && notNull(USER_TYPE)
            // && notNull(profilePicUrl)
        )
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
                    presentationStyle: 'fullScreen'
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

    const textField = (item: any) => {
        return (<View key={item.field_key}>
            <View className='mt-7 ml-1' key={item.field_key}>
                <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}</Text>
            </View>
            <TextInput
                className={`w-full h-[50px] text-textColor leading-4 bg-fieldGrayColor px-3 rounded-[4px] mt-1`}
                value={mandatoryField?.[`${item.field_key}`]}
                placeholder={item.field_placeholder}
                onChangeText={(e) => {
                    const cleanedValue: any = e.replace(/^\s+|\s+$|\s+(?=\s)/g, " ");
                    if (cleanedValue) {
                        setMandatoryFieldData((prevValues: any) => ({
                            ...prevValues,
                            [item.field_key ?? item.field_label]: cleanedValue
                        }));
                    } else {
                        setMandatoryFieldData((prevValues: any) => ({
                            ...prevValues,
                            [item.field_key ?? item.field_label]: e
                        }));
                    }
                }}
                placeholderTextColor={Colors.greyBorder}
                autoComplete='off'
            />
        </View>
        )
    }
    const TextField = (item: any) => {
        return (<View key={item.field_key}>
            <View className='mt-7 ml-1' key={item.field_key}>
                <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}*</Text>
            </View>
            <TextInput
                className={`w-full h-[50px] text-textColor leading-4 bg-fieldGrayColor px-3 rounded-[4px] mt-1`}
                value={mandatoryField?.[`${item.field_key}`]}
                placeholder={item.field_placeholder}
                onChangeText={(e) => {
                    const cleanedValue: any = e.replace(/^\s+|\s+$|\s+(?=\s)/g, " ");
                    if (cleanedValue) {
                        setMandatoryFieldData((prevValues: any) => ({
                            ...prevValues,
                            [item.field_key ?? item.field_label]: cleanedValue
                        }));
                    } else {
                        setMandatoryFieldData((prevValues: any) => ({
                            ...prevValues,
                            [item.field_key ?? item.field_label]: e
                        }));
                    }
                    // setMandatoryFieldData((prevValues: any) => ({
                    //     ...prevValues,
                    //     [item.field_key ?? item.field_label]: e
                    // }));
                }}
                placeholderTextColor={Colors.greyBorder}
                autoComplete='off'
            />
        </View>
        )
    }
    const click_password = () => {
        setSeePassword(!seepassword);
    }
    const PasswordField = (item: any) => {
        return (<View key={item.field_key}>
            <View className='mt-7 ml-1' key={item.field_key}>
                <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}*</Text>
            </View>

            <View className='flex flex-row mt-1 w-full rounded-[4px] justify-between items-center bg-fieldGrayColor px-3'>
                <TextInput
                    className={` text-textColor leading-4 flex flex-1 `}
                    value={password}
                    placeholder={item.field_placeholder}
                    // onChangeText={(e) => {
                    //     setPassword(e)
                    // }}
                    onChangeText={(e: any) => {
                        const cleanedValue: any = e.replace(/^\s+|\s+$|\s+(?=\s)/g, " ");
                        if (cleanedValue) {
                            setPassword(cleanedValue)
                        } else {
                            setPassword(e)
                        }
                    }}
                    placeholderTextColor={Colors.greyBorder}
                    autoComplete='off'
                    secureTextEntry={!seepassword}
                />
                <TouchableOpacity onPress={() => { click_password() }} className=''>
                    {
                        seepassword ?
                            <FastImage source={Icons.IcEyeOpen} resizeMode='contain' className='w-[24px] h-[24px]' />
                            :
                            <FastImage source={Icons.IcEyeClose} resizeMode='contain' className='w-[20px] h-[18px] mr-[1.8px]' />
                    }
                </TouchableOpacity>
            </View>
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
                    className={`w-full text-textColor leading-4 bg-fieldGrayColor px-3 rounded-[4px] mt-1 opacity-60`}
                    value={userDetail.email}
                    placeholder={item.field_placeholder}
                    placeholderTextColor={Colors.greyBorder}
                    autoComplete='off'
                    editable={false}
                />
            </View>
        )
    }
    const phoneField = (item: any) => {
        return (<View key={item.field_key}>
            <View className='mt-7 ml-1'>
                <Text className='text-textColor text-[14px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}</Text>
            </View>
            <TextInput
                style={{ color: Colors.textColor, backgroundColor: Colors.fieldGrayColor }}
                className={`w-full h-[50px] text-textColor leading-4  bg-fieldGrayColor px-3 rounded-[4px] mt-1`}
                keyboardType="numeric"
                value={phoneNumber}
                placeholder={item.field_placeholder}
                onChangeText={(e: any) => {
                    setPhoneNumber(e);
                }}
                placeholderTextColor={Colors.greyBorder}
                autoComplete='off'
                maxLength={15}
            />
        </View>
        )
    }
    const dateField = (item: any) => {
        return (
            <View key={item.field_key}>
                <View className='mt-7 ml-1'>
                    <Text className='text-textColor text-[14px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}</Text>
                </View>
                <View className='flex flex-row mt-2 w-full py-4 px-4 justify-between items-center rounded-lg' style={{ backgroundColor: Colors.fieldGrayColor }}>
                    <Text className={`${isDateSelected ? 'text-textColor' : 'text-greyBorder font-Helvetica'}`}>{isDateSelected ? dob : dobPlaceHolder}</Text>
                    <TouchableOpacity onPress={showDatePicker}>
                        <FastImage source={Icons.IcCalendar} tintColor={Colors.bottomInactive} className='w-6 h-6' resizeMode='contain' />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    const customField = (item: any) => {
        return (<View key={item.field_key}>
            <View className='mt-7 ml-1'>
                <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}</Text>
            </View>
            <TextInput
                className={`w-full h-[50px] text-textColor leading-4 bg-fieldGrayColor px-3 rounded-[4px] mt-1`}
                value={customeData?.[`${item.field_key}`]}
                placeholder={item.field_placeholder}
                onChangeText={(e) => {
                    const cleanedValue: any = e.replace(/^\s+|\s+$|\s+(?=\s)/g, " ");
                    if (cleanedValue) {
                        setCustomeData((prevValues: any) => ({
                            ...prevValues,
                            [item.field_key ?? item.field_label]: cleanedValue
                        }));
                    } else {
                        setCustomeData((prevValues: any) => ({
                            ...prevValues,
                            [item.field_key ?? item.field_label]: e
                        }));
                    }
                    // setCustomeData((prevValues: any) => ({
                    //     ...prevValues,
                    //     [item.field_key ?? item.field_label]: e
                    // }));
                }}

                placeholderTextColor={Colors.greyBorder}
                autoComplete='off'
            />
        </View>
        )
    }
    const dropdown = (item: any) => {
        let option: OptionData[] = [];
        item.field_options.data.map((o: any) => {
            let item = {
                label: o.name,
                value: o.id
            }
            option.push({ label: o.name, value: o.id })
        })
        return (<View key={item.field_key} >
            <View className='mt-7 ml-1'>
                <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}</Text>
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
                placeholder={item.field_placeholder}
                searchPlaceholder="Search..."
                value={mandatoryField?.[`${item.field_key}`]}
                onFocus={() => Keyboard.dismiss()}
                // onBlur={() => Keyboard.dismiss()}
                onChange={(o: any) => {
                    setMandatoryFieldData((prevValues: any) => ({
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
    const multiselect = (item: any) => {
        let option: OptionData[] = [];
        item.field_options.data.map((o: any) => {
            option.push({ label: o.name, value: o.id })
        })
        let placeholderColor = item.field_key === "languages" && languageValue.length > 0 ? Colors.textColor : Colors.greyBorder
        let placeholderColor1 = item.field_key === "topic_of_inquiry" && areaOfQueryValue.length > 0 ? Colors.textColor : Colors.greyBorder
        return (
            <View key={item.field_key} >
                <View className='mt-7 ml-1'>
                    <Text className='text-textColor text-[14px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}</Text>
                </View>
                <MultiSelect
                    style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                    // placeholderStyle={styles.placeholderStyle}
                    placeholderStyle={[styles.placeholderStyle, { color: item.field_key === "languages" ? placeholderColor : placeholderColor1 }]}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    itemContainerStyle={styles.itemContainer}
                    itemTextStyle={{ color: Colors.textColor }}
                    dropdownPosition='auto'
                    data={option}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={item.field_key === "languages" ? getSelectedItems(item.field_placeholder) : getSelectedItemsTOC(item.field_placeholder)}
                    searchPlaceholder="Search..."
                    value={item.field_key === "languages" ? languageValue : areaOfQueryValue}
                    onFocus={() => Keyboard.dismiss()}
                    // onBlur={() => setIsFocus()}
                    onChange={(i: any) => {
                        (item.field_key === "languages" ? setLanguageValue(i) : setAreaOfQueryValue(i))
                        setIsFocus(false);
                    }}
                    renderRightIcon={() => {
                        return (
                            <AntDesign name='caretdown' size={8} color={Colors.greyBorder} style={{ paddingRight: 10 }} />
                        )
                    }}
                    renderSelectedItem={(item) => {
                        return (<></>)
                    }}
                    renderItem={(data) => {
                        let i = (item.field_key === "languages") ? languageValue?.findIndex((t: any) => t == data.value) : areaOfQueryValue?.findIndex((t: any) => t == data.value)
                        return <View style={{ padding: 10, paddingRight: 20, flexDirection: 'row', alignItems: 'center', minHeight: 60 }} key={data.value}>
                            {i !== -1 ?
                                <View className='flex justify-center items-center w-5 h-5 border-[1.5px] border-greyColor rounded-[3px]'>
                                    <View className='w-[14px] h-[14px] rounded-[2px]' style={{ backgroundColor: primaryColor }}></View>
                                </View>
                                :
                                <View className='flex justify-center items-center w-5 h-5 border-[1.5px] border-greyColor rounded-[3px]'>
                                </View>
                            }
                            <Text style={{ color: Colors.grey1, marginLeft: 10 }} >{data.label}</Text>
                        </View>
                    }}
                />
            </View>)
    }
    const AboutField = (item: any) => {
        return (
            <View key={item.field_key}>
                <View className='mt-7 ml-1'>
                    <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>About*</Text>
                </View>
                <TextInput
                    style={{ height: 'auto', alignItems: 'flex-start', textAlign: 'left', textAlignVertical: 'top' }}
                    className='flex flex-row mt-3 min-w-full py-2 px-3 text-left rounded-lg justify-start items-start text-textColor leading-4 bg-fieldGrayColor tracking-[0.44px] font-InterRegular font-normal'
                    value={about}
                    onChangeText={(e: any) => { setAbout(e) }}
                    multiline={true}
                />
            </View>
        )
    }
    const Profile = (item: any) => {
        return (
            <View key={item.field_key}>
                <View className='mt-7 ml-1'>
                    <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}</Text>
                </View>
                <TouchableOpacity className='flex flex-row mt-2 max-w-full py-4 px-2 justify-start items-center rounded-lg' style={{ backgroundColor: Colors.fieldGrayColor }} onPress={pickImage}>
                    <TouchableOpacity onPress={() => { }}>
                        <Feather name='upload' size={16} color={Colors.greyBorder} />
                    </TouchableOpacity>
                    <View className=' ml-2 pr-2'>
                        <Text className={`${picPlaceholder ? 'text-greyBorder' : 'text-textColor'}`} numberOfLines={1}>{profilePicUrl}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    const submit = async () => {
        setLoading(true);
        Keyboard.dismiss()
        let authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
        let college_data1: any = await get_colleges()
        let d = {
            ...mandatoryField
        }
        delete d.first_name
        delete d.last_name

        for (let key in d) {
            if (d.hasOwnProperty(key) && typeof d[key] === 'string') {
                d[key] = d[key].trim();
            }
        }

        for (let key in customeData) {
            if (customeData.hasOwnProperty(key) && typeof customeData[key] === 'string') {
                customeData[key] = customeData[key].trim();
            }
        }

        if (college_data1.statusCode == 200) {
            let send_data = {
                first_name: mandatoryField?.['first_name'].trim(),
                last_name: mandatoryField?.['last_name'].trim(),
                email: userDetail.email,
                password: password.trim(),
                college_id: parseInt(DATA[0].id),
                country: country,
                short_code: isoCodeData,
                ip: ipData,
                state: state,
                additionals: {
                    ...d,
                    languages: languageValue.length > 0 ? languageValue : [],
                    date_of_birth: dob ? dob : null,
                    phone_number: phoneNumber ? phoneNumber.trim() : null,
                    topic_of_inquiry: areaOfQueryValue.length > 0 ? areaOfQueryValue : [],
                    profile_picture: profilePic ? profilePic : null,
                    ...customeData
                },
                ipjson: ipObject
            }

            let fcm_token = await messaging().getToken();
            let push_notification_data = {
                email: userDetail.email,
                college_id:  parseInt(DATA[0].id),
                fcm_token: fcm_token
            }
            try {
                await AuthService.signup(send_data).then(async (res: any) => {

                    if (res.statusCode == 201) {
                        await AuthService.updateapptoken().then(async (o: any) => {
                            if (o.statusCode == 200) {
                                Utils.storeData('app_token', o.data.app_token);
                                let creat_data = {
                                    college_id: res.data.college_id,
                                    cometchat_uid: null,
                                    email: res.data.email,
                                    first_name: res.data.user_detail.first_name,
                                    isMentorProfileComplete: res.data.is_profile_complete,
                                    last_name: res.data.user_detail.last_name,
                                    middle_name: res.data.user_detail.middle_name,
                                    nationality: res.data.user_detail.nationality,
                                    profile_image: res.data.user_detail.profile_image,
                                    role_id: res.data.role_id,
                                    token: res.data.accessToken,
                                    user_id: res.data.id,
                                }
                                await AuthService.create_cometchat_uid(creat_data).then(async (o: any) => {
                                    if (o.statusCode == 200) {
                                        let user = new CometChat.User(o.data.cometchat_uid);
                                        let tags: Array<any> = ["prospect", `prospect-${DATA[0]?.slug}`, DATA[0]?.slug];
                                        let n = AuthService.encrypt(res.data.user_detail?.first_name)
                                        user.setName(n)
                                        user.setTags(tags);
                                        CometChat.createUser(user, authKey).then(
                                            async (user) => {
                                                let login_data = {
                                                    email_mobile: userDetail.email,
                                                    college_id: parseInt(DATA[0].id),
                                                    user_role_id: userDetail.role_id
                                                }
                                                await InstituteServices.college_login(login_data).then((response: any) => {
                                                    if (response.statusCode == 200) {
                                                        CometChat.login(response.data.cometchat_uid, authKey).then(
                                                            async (user) => {
                                                                setLoading(false)
                                                                if (profilePic != null && profilePic != undefined) {
                                                                    var user = new CometChat.User(response.data.cometchat_uid);
                                                                    let n = AuthService.encrypt(mandatoryField.first_name);
                                                                    user.setName(n);
                                                                    user.setAvatar(profilePic);
                                                                    CometChat.updateCurrentUserDetails(user).then(
                                                                        user => {
                                                                            console.log("Complete profile mandatory successfull", res);
                                                                        }, error => {
                                                                            console.log("error", error);
                                                                        }
                                                                    )
                                                                }
                                                                let fcm_res: any = await AuthService.store_fcm_toke(push_notification_data);
                                                                if (fcm_res.statusCode == 202) {
                                                                    console.log(fcm_res.message);
                                                                }
                                                                Utils.storeData('accessToken', response.data.accessToken)
                                                                Utils.storeData('prospect_cometchat_uid', o.data.cometchat_uid)
                                                                Utils.storeData('prospect_userId', res.data.id)
                                                                Utils.storeData('collegeId', parseInt(DATA[0].id))
                                                                let dispatch_data = {
                                                                    item: DATA[0],
                                                                    college_data: college_data1.data
                                                                }
                                                                Utils.storeData('collegeData', dispatch_data)
                                                                let t = {
                                                                    state: 0,
                                                                    major: 0,
                                                                    nationality: 0,
                                                                    userType: 0
                                                                }
                                                                dispatch(setUpcomingProspectData([]))
                                                                dispatch(setUpcomingData([]))
                                                                dispatch(setInstituteInfo(dispatch_data))
                                                                dispatch(setResetInstitute(true))
                                                                dispatch(setPastProspectData([]))
                                                                dispatch(setFilterValue(t))
                                                                dispatch(setFilterMajor([]))
                                                                dispatch(setFilterNational([]))
                                                                dispatch(setFilterStates([]))
                                                                dispatch(setIsFilterSet(false));
                                                                await Utils.storeData('primaryColor', college_data1.data[0].font_color)
                                                                props.navigation.replace('ProspectStack', { screen: 'ProsBottomTabsNavigator' })
                                                            },
                                                            (error) => {
                                                                console.log('Login failed with exception:', { error });
                                                                setLoading(false)
                                                            },
                                                        ).catch(err => {
                                                            setLoading(false);
                                                            console.log(err);

                                                        });
                                                    } else {
                                                        setLoading(false);
                                                    }
                                                })

                                            }, error => {
                                                console.log("error", error);
                                                setLoading(false);
                                            }
                                        )

                                    } else {
                                        setLoading(false)
                                    }
                                })
                            } else {
                                setLoading(false);
                                ToastAndroid.showWithGravity(
                                    res.message,
                                    ToastAndroid.SHORT,
                                    ToastAndroid.CENTER
                                );
                            }
                        })


                    } else if (res.statusCode == 400) {
                        setLoading(false)
                        ToastAndroid.showWithGravity(
                            res.message,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER
                        );
                    }
                })
            } catch (error) {
                console.log("Signup Error:", error);
                setLoading(false)
            }
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        getUserDetail();
        getApiData();
        getFields();
        setRefreshing(false);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className='flex flex-1 px-5'>
            <Modal
                isVisible={modalVisible}
                onBackButtonPress={() => closeModal(null, null)}
                animationIn={'slideInUp'}
                animationOut={'slideOutDown'}
                animationInTiming={1}
                animationOutTiming={1}
                onBackdropPress={() => closeModal(null, null)}
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
                            index={1}
                            enablePanDownToClose={true}
                        >
                            <View>
                                {TakePhotoOption()}
                                {PhotoLibraryOption()}
                            </View>
                        </BottomSheet>
                        :
                        <ImageCroper closeModal={closeModal} profilePic={profilePic} primaryColor={primaryColor} profilePic2={profilePic2} type={'_P_SIGNUP'} />
                }

            </Modal>
            {
                isLoading ?
                    <View className='flex flex-1 justify-center items-center'>
                        <ActivityIndicator size={'large'} color={'#1B1869'} />
                    </View>
                    :
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps='handled'
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        <View className='flex w-full justify-center items-center'>
                            <View className='w-[70px] h-[70px] mt-5'>
                                <FastImage source={{ uri: DATA[0].logo }} resizeMode='contain' className='w-full h-full' />
                            </View>
                            <Text className='text-textColor text-sm font-medium leading-4 tracking-[0.44px] mt-3 text-center'>Welcome to {DATA[0].name}</Text>
                        </View>
                        <View className='mt-5'>
                            <Text className='text-textColor text-[34px] font-medium tracking-[0.44px] leading-[44px]'>Signup</Text>
                        </View>
                        <View className='h-full flex flex-1 pb-8'>
                            {
                                mandatory.map((e: any, i: any) => {
                                    if (e.field_type === 'text') {
                                        return (
                                            TextField(e)
                                        )
                                    }
                                    if (e.field_type === 'password') {
                                        return (
                                            PasswordField(e)
                                        )
                                    }

                                    if (e.field_type === 'email') {
                                        return (
                                            EmailField(e)
                                        )
                                    }
                                    if (e.field_type === 'textarea') {
                                        return (
                                            AboutField(e)
                                        )
                                    }
                                    if (e.field_type === 'select_one') {
                                        return (
                                            dropdown(e)
                                        )
                                    }
                                    if (e.field_type === 'file') {
                                        return (
                                            Profile(e)
                                        )
                                    }
                                }
                                )
                            }
                            {
                                additional?.map((e: any) => {
                                    if (e.field_type === 'text') {
                                        return (
                                            textField(e)
                                        )
                                    }
                                    if (e.field_type === 'custom_text') {
                                        return (
                                            customField(e)
                                        )
                                    }
                                    if (e.field_type === 'select_one') {
                                        return (
                                            dropdown(e)
                                        )
                                    }
                                    {
                                        if (e.field_type === 'select_multi') {
                                            return (
                                                multiselect(e)
                                            )
                                        }
                                    }
                                    {
                                        if (e.field_type === 'date') {
                                            return (
                                                dateField(e)
                                            )
                                        }
                                    }
                                    {
                                        if (e.field_type === 'numberOnly') {
                                            return (
                                                phoneField(e)
                                            )
                                        }
                                    }
                                    {
                                        if (e.field_type === 'file') {
                                            return (
                                                Profile(e)
                                            )
                                        }
                                    }
                                }
                                )
                            }{
                                datePicker ?
                                    <DateTimePicker
                                        value={date}
                                        mode={'date'}
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        is24Hour={true}
                                        onChange={onDateSelected}
                                    />
                                    :
                                    null
                            }
                        </View>

                        <View className=''>
                            {
                                loading ?
                                    <ActivityIndicator size={'large'} color={Colors.textColor} />
                                    :
                                    <GradientButton
                                        onPress={submit}
                                        text="Signup"
                                        colors={['#1B1869', '#8C126E']}
                                        disable={isFormValid() ? false : true}
                                    />
                            }
                        </View>

                        <View className='mt-8 w-full flex flex-wrap flex-row justify-center items-center px-2'>
                            <Text className='text-textColor text-[12px] tracking-[0.15px] leading-5'>By signing up, you agree to our</Text>
                            <TouchableOpacity onPress={() => { openWebsite(TERMS_AND_CONDITIONS.PRIVACY_POLICY) }}>
                                <Text className='text-primaryColor text-[12px] tracking-[0.15px] leading-5'> privacy policy </Text>
                            </TouchableOpacity>
                            <Text className='text-textColor text-[12px] tracking-[0.15px] leading-5'>&</Text>
                            <TouchableOpacity onPress={() => { openWebsite(TERMS_AND_CONDITIONS.TERMS) }}>
                                <Text className='text-primaryColor ml-1 text-[12px] tracking-[0.15px] leading-5'>
                                    terms of use.
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View className='mt-3 flex flex-row justify-center items-center pb-4'>
                            <Text className='text-textColor text-[12px] tracking-[0.15px] leading-5'>Already have an account?</Text>
                            <TouchableOpacity onPress={() => { props.navigation.replace('AuthStack', { screen: 'Login' }) }}>
                                <Text className='text-primaryColor ml-1 text-[12px] tracking-[0.15px] leading-5'>Login here</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
            }
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
        backgroundColor: Colors.white,
        borderTopWidth: 0.5
    },
    dropdown: {
        height: 50,
        // paddingVertical: 10,
        borderColor: 'gray',
        borderRadius: 4,
        paddingHorizontal: 8,
        marginTop: 6,
        backgroundColor: Colors.fieldGrayColor,
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
        fontSize: 14,
        color: Colors.greyBorder
    },
    selectedTextStyle: {
        fontSize: 14,
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
    error: {
        color: 'red',
        fontSize: 20,
        marginBottom: 12,
    },

});

export default Signup