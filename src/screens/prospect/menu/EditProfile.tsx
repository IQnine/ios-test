import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, PermissionsAndroid, Platform, ActivityIndicator, ToastAndroid, BackHandler, Keyboard } from 'react-native'
import React, { useState, useEffect } from 'react'
import FastImage from 'react-native-fast-image'
import { Icons, Images } from '../../../assets/Images'
import { Colors } from '../../../common/Colors'
import * as AmbassadorServices from '../../../services/prospect/ambassadors/AmbassadorsServices';
import { Dropdown } from 'react-native-element-dropdown';
import { MultiSelect } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
const tommorow = new Date().setDate(new Date().getDate() + 1)
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import * as ProfileServices from '../../../services/prospect/profile/ProfileServices';
import * as AuthServices from '../../../services/auth/AuthServices';
import { Utils } from '../../../common/Utils'
import { useSelector } from 'react-redux'
import ImageCroper from './ImageCroper'
import Modal from "react-native-modal";
import BottomSheet from '@gorhom/bottom-sheet';
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import IonIcon from 'react-native-vector-icons/Ionicons';
import { CometChat } from '@cometchat-pro/react-native-chat'
import moment from 'moment'
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomSemiCircleInsideCircle from '../../../components/CustomSemiCircleInsideCircle'

type OptionData = {
    label: string,
    value: number
}


const EditProfile = (props: any) => {
    const [value, setvalue] = useState<any>()
    const [mvalue, setMvalue] = useState<any>()
    const [isFocus, setIsFocus] = useState(false);
    const [datePicker, setDatePicker] = useState(false)
    const [date, setDate] = useState(new Date())
    const [languageData, setLanguageData] = useState<OptionData[]>([]);
    const [areaOfQueryData, setAreaOfQueryData] = useState<OptionData[]>([]);
    const [profilePic, setProfilePic] = useState<any>()
    const [modalVisible, setModalVisible] = useState(false);
    const [bottomSheetVisiblity, setBottomsheetVisibility] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const bottomSheetRef = React.useRef<BottomSheet>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const [mandatory, setMandatory] = useState([]);
    const [additional, setAdditional] = useState([])
    const [about, setAbout] = useState();
    const [custom, setCostum] = useState<any>();
    const [phoneNumber, setPhoneNumber] = useState();
    const [languageValue, setLanguageValue] = useState<any>();
    const [dob, setDob] = useState('')//done
    const [areaOfQueryValue, setAreaOfQueryValue] = useState<any>();
    const [email, setEmail] = useState();
    const [name, setName] = useState();
    const [profilePic2, setProfilePic2] = useState()

    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    let primaryColor = instituteInfo.college_data[0].font_color;


    useEffect(() => {
        // getCustomData();
        getLanguageData();
        getAreaOfQuery();
        getfield();
    }, [])

    useEffect(() => {

        const backAction = () => {
            props.navigation.goBack()
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, [props.navigation]);


    const getfield = async () => {
        setIsLoading(true)
        try {
            await AuthServices.prospect_complete_profile_fields().then((res: any) => {
                if (res.statusCode == 200) {
                    setMandatory(res.data.mandatory_fields)
                    setAdditional(res.data.optional_fields)
                    let { mandatory_fields, optional_fields } = res.data
                    if (mandatory_fields.length || optional_fields.length) {
                        let text = [...mandatory_fields, ...optional_fields].filter((t: any) => (t.field_type === 'text'))
                        let select_one = [...mandatory_fields, ...optional_fields].filter((t: any) => (t.field_type === 'select_one'))
                        let lang = optional_fields.filter((t: any) => (t.field_key === 'languages'))
                        let customs = optional_fields.filter((t: any) => (t.field_type === 'custom_text'))
                        let date = optional_fields.filter((t: any) => (t.field_type === 'date'))
                        let data = optional_fields.filter((t: any) => (t.field_type === 'numberOnly' || t.field_type === 'text' || t.field_type === 'textarea'))
                        let email = mandatory_fields.filter((t: any) => (t.field_type === 'email'))
                        let profilePicture = optional_fields?.filter((t: any) => (t.field_key === 'profile_picture')) ?? null
                        let toi = optional_fields.filter((t: any) => (t.field_key === 'topic_of_inquiry'))
                        setProfilePic(profilePicture[0]?.field_value)
                        setProfilePicUrl(profilePicture[0]?.field_value)
                        setDob(date[0]?.field_value)
                        setEmail(email[0]?.field_value)
                        let d: any = {}
                        let c = text?.map((f: any) => {
                            d[f.field_key] = f?.field_value
                        })
                        setMvalue((prevValues: any) => ({
                            ...prevValues,
                            ...d
                        }));
                        let k: any = {}
                        let g = select_one?.map((f: any) => {
                            k[f.field_key] = f?.field_value.id
                        })
                        setvalue((prevValues: any) => ({
                            ...prevValues,
                            ...k
                        }));
                        let u: any = {}
                        let y = data?.map((f: any) => {
                            u[f.field_key] = f?.field_value
                        })
                        setvalue((prevValues: any) => ({
                            ...prevValues,
                            ...u
                        }));
                        let e: any = {}
                        let f = customs?.map((f: any) => {
                            e[f.field_key] = f?.field_value
                        })
                        setCostum((prevValues: any) => ({
                            ...prevValues,
                            ...e
                        }));
                        setAreaOfQueryValue(extractIds(toi[0]?.field_value))
                        setLanguageValue(extractIds(lang[0]?.field_value))
                        setIsLoading(false)
                    }
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    // const getCustomData = () => {
    //     let additional_object = {};

    //     const result = customAdditionalFields?.filter((t: any) => t.field_type === 'custom').map((o: any) => {
    //         let r = createObjFromFieldKeyAndAttributeValue(o.field_key, o.attribute_value);
    //         Object.assign(additional_object, r)
    //         setCustomdata(additional_object)
    //     })
    // }

    const getAreaOfQuery = async () => {
        let option: OptionData[] = [];
        try {
            await AmbassadorServices.get_area_of_query_list().then((res: any) => {
                if (res.statusCode == 200) {
                    res.data?.map((o: any) => {
                        let item = {
                            label: o.area_of_query.name,
                            value: o.area_of_query.id
                        }
                        option.push(item)
                    })
                    setAreaOfQueryData(option)
                }
            })
        } catch (error) {
            console.log(error);
        }
    }


    const getLanguageData = async () => {
        let option: OptionData[] = [];
        try {
            await AmbassadorServices.get_language_list().then((res: any) => {
                if (res.statusCode == 200) {
                    res.data?.languageList?.map((o: any) => {
                        let item = {
                            label: o.name,
                            value: o.id
                        }
                        option.push(item)
                    })
                    setLanguageData(option)
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

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
        let tempDate = new Date(currentDate);
        setDob(moment(tempDate).format('ll'))
    };

    function createObjFromFieldKeyAndAttributeValue<T>(fieldKey: string, attributeValue: T): { [key: string]: T } {
        const obj: { [key: string]: T } = {};
        obj[fieldKey] = attributeValue;
        return obj;
    }

    const extractIds = (data: any) => {
        let t = data?.map((o: any) => { return o.id })
        return t
    }

    const on_update = async () => {
        trimStrings(mvalue)
        trimStrings(value)
        trimStrings(custom)
        Keyboard.dismiss()
        setBtnLoading(true)
        let college_id = await Utils.getData('collegeId')
        let user_detail = await Utils.getData('user_details');
        let send_data = {
            college_id: college_id,
            // userId: userData.id,
            role_id: user_detail.role_id,
            mandatory: {
                email: email,
                first_name: mvalue?.['first_name'],
                last_name: mvalue?.['last_name'],
            },
            additional: {
                ...value,
                ...custom,
                languages: languageValue ? languageValue : null,
                topic_of_inquiry: areaOfQueryValue ? areaOfQueryValue : null,
                date_of_birth: dob ? dob : null
            }

        }
        console.log("send data", send_data)
        try {
            await ProfileServices.update_profile(send_data).then(async (res: any) => {
                if (res.statusCode === 200) {
                    let uid = await Utils.getData('prospect_cometchat_uid')
                    var user = new CometChat.User(uid);
                    let n = AuthServices.encrypt(mvalue?.['first_name']);
                    user.setName(n);
                    user.setAvatar(profilePicUrl);
                    if (profilePicUrl !== null && profilePicUrl) {
                        CometChat.updateCurrentUserDetails(user).then(
                            user => {
                                props.navigation.navigate('Profile')
                                setBtnLoading(false)
                            }, error => {
                                console.log("error", error);
                            }
                        )
                    } else {
                        let uid = await Utils.getData('prospect_cometchat_uid')
                        var user = new CometChat.User(uid);
                        let n = AuthServices.encrypt(mvalue?.['first_name']);
                        user.setName(n);
                        CometChat.updateCurrentUserDetails(user).then(
                            user => {
                                props.navigation.navigate('Profile')
                                setBtnLoading(false)
                            }, error => {
                                console.log("error", error);
                            }
                        )
                    }
                } else {
                    console.log(res)
                    setBtnLoading(false)
                    ToastAndroid.showWithGravity(
                        res.message,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                }
            })
        } catch (error) {
            setBtnLoading(false)
        }
    }

    function trimStrings(obj: any) {
        if (typeof obj !== 'object' || obj === null) {
            return obj; // Return the input if it's not an object or if it's null
        }

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (typeof obj[key] === 'string') {
                    obj[key] = obj[key].trim(); // Trim string values
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    obj[key] = trimStrings(obj[key]); // Recursively trim nested objects
                }
            }
        }

        return obj;
    }

    const closeModal = (uri: any, image_url: any) => {
        setModalVisible(false);
        if (uri !== null) {
            setProfilePic(uri)
            console.log('if el', image_url)
            setProfilePicUrl(image_url)
        } else if (uri == undefined) {
            setProfilePic(profilePic);
            console.log('if', profilePicUrl)
            setProfilePicUrl(profilePicUrl)
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
            notNull(mvalue?.['first_name'])
            && notNull(mvalue?.['last_name'])
            // && notNull(about)
            // && notNull(majorValue?.['program'])
            // && notNull(USER_TYPE)
            // && notNull(profilePicUrl)
        )
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
                console.log("result:", result)
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

    const getSelectedItems = (data: any, placeholder: any) => {
        try {
            let d = languageData.filter((t: any) => data?.includes(t.value))
            if (d.length) {
                return d?.map((o: any) => o.label).join(', ')
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
                return d?.map((o: any) => o.label).join(', ')
            } else {
                return placeholder
            }
        } catch (e) {
            console.log(e)
            return placeholder
        }
    }


    const textField = (item: any) => {
        return (<View key={item.field_key}>
            <View className='mt-7 ml-1' key={item.field_key}>
                <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}</Text>
            </View>
            <TextInput
                className={`w-full h-[50px] text-textColor leading-4 bg-fieldGrayColor px-3 rounded-[4px] mt-1`}
                value={value?.[`${item.field_key}`]}
                placeholder={item.field_placeholder}
                onChangeText={(e) => {
                    const cleanedValue: any = e.replace(/^\s+|\s+$|\s+(?=\s)/g, " ");
                    if (cleanedValue) {
                        setvalue((prevValues: any) => ({
                            ...prevValues,
                            [item.field_key ?? item.field_label]: cleanedValue
                        }));
                    } else {
                        setvalue((prevValues: any) => ({
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
                value={mvalue?.[`${item.field_key}`]}
                placeholder={item.field_placeholder}
                onChangeText={(e) => {
                    const cleanedValue: any = e.replace(/^\s+|\s+$|\s+(?=\s)/g, " ");
                    if (cleanedValue) {
                        setMvalue((prevValues: any) => ({
                            ...prevValues,
                            [item.field_key ?? item.field_label]: cleanedValue
                        }));
                    } else {
                        setMvalue((prevValues: any) => ({
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
    const EmailField = (item: any) => {
        return (
            <View key={item.field_key}>
                <View className='mt-7 ml-1'>
                    <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}*</Text>
                </View>
                <TextInput
                    className={`w-full text-textColor leading-4 bg-fieldGrayColor px-3 rounded-[4px] mt-1 opacity-60`}
                    value={email}
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
                value={value?.[`${item.field_key}`]}
                placeholder={item.field_placeholder}
                onChangeText={(e: any) => {
                    setvalue((prevValues: any) => ({
                        ...prevValues,
                        [item.field_key ?? item.field_label]: e
                    }));
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
                <TouchableOpacity className='flex flex-row mt-2 w-full py-4 px-4 justify-between items-center rounded-lg' style={{ backgroundColor: Colors.fieldGrayColor }} onPress={showDatePicker}>
                    <Text className='text-textColor'>{dob}</Text>
                    <TouchableOpacity onPress={showDatePicker}>
                        <FastImage source={Icons.IcCalendar} tintColor={Colors.bottomInactive} className='w-6 h-6' resizeMode='contain' />
                    </TouchableOpacity>
                </TouchableOpacity>
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
                value={custom?.[`${item.field_key}`]}
                placeholder={item.field_placeholder}
                onChangeText={(e) => {
                    const cleanedValue: any = e.replace(/^\s+|\s+$|\s+(?=\s)/g, " ");
                    if (cleanedValue) {
                        setCostum((prevValues: any) => ({
                            ...prevValues,
                            [item.field_key ?? item.field_label]: cleanedValue
                        }));
                    } else {
                        setCostum((prevValues: any) => ({
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
    const Dropdown123 = (item: any) => {
        let option: OptionData[] = [];
        item.field_options.data?.map((o: any) => {
            let item = {
                label: o.name,
                value: o.id
            }
            option.push({ label: o.name, value: o.id })
        })
        return (<View key={item.field_key} >
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
                placeholder={item.field_placeholder}
                searchPlaceholder="Search..."
                value={value?.[`${item.field_key}`]}
                onFocus={() => Keyboard.dismiss()}
                onChange={(o: any) => {
                    setvalue((prevValues: any) => ({
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
    const dropdown = (item: any) => {
        let option: OptionData[] = [];
        item.field_options.data?.map((o: any) => {
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
                value={value?.[`${item.field_key}`]}
                onFocus={() => Keyboard.dismiss()}
                onChange={(o: any) => {
                    setvalue((prevValues: any) => ({
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
                    placeholder={item.field_key === "languages" ? getSelectedItems(languageValue, item.field_placeholder) : getSelectedItemsTOC(item.field_placeholder)}
                    searchPlaceholder="Search..."
                    value={item.field_key === "languages" ? languageValue : areaOfQueryValue}
                    onFocus={() => Keyboard.dismiss()}
                    onChange={(i: any) => {
                        if (item.field_key === 'languages') {
                        }
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
                    <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}*</Text>
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

    return (
        <View className='flex flex-1 bg-bgGrayColor'>
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
                        <ImageCroper closeModal={closeModal}
                            profilePic={profilePic}
                            primaryColor={primaryColor}
                            profilePic2={profilePic2}
                            type={'_P_EDIT'} />
                }

            </Modal>

            <View className={`flex flex-row items-center px-2 py-5`} style={{ backgroundColor: primaryColor }}>
                <TouchableOpacity onPress={() => { props.navigation.navigate('Profile') }}>
                    <FastImage source={Icons.IcBackBtn} className='w-[42px] h-[42px]' tintColor={Colors.white} />
                </TouchableOpacity>
                <View>
                    <Text className='text-whiteColor text-[20px] leading-8 tracking-[0.44px] font-normal ml-1'>Edit profile</Text>
                </View>
            </View>
            {
                isLoading ?
                    <View className='flex flex-1 justify-center items-center'>
                        <ActivityIndicator size={'large'} color={primaryColor} />
                    </View>
                    :
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
                        {
                            profilePic == undefined ?
                                null
                                :
                                profilePic === null || profilePic === '' ?
                                    <View className='flex px-5 py-5 bg-greyColor25 justify-center items-center'>
                                        <CustomSemiCircleInsideCircle radius={60} strokeWidth={1} color="blue" semiCircleAngle={180} imageSource={''} imageSize={100} pickImage={pickImage} />
                                    </View>
                                    :
                                    <View className='flex px-5 py-5 bg-greyColor25 justify-center items-center'>
                                        <CustomSemiCircleInsideCircle radius={60} strokeWidth={1} color="blue" semiCircleAngle={180} imageSource={profilePic} imageSize={100} pickImage={pickImage} />
                                    </View>
                        }
                        <View className='px-5 h-full flex flex-1 pb-8'>
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
                                    if (e.field_type === 'textarea') {
                                        return (
                                            AboutField(e)
                                        )
                                    }
                                    if (e.field_type === 'select_one') {
                                        return (
                                            Dropdown123(e)
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
                                }
                                )
                            }{
                                datePicker &&
                                <DateTimePicker
                                    value={date}
                                    mode={'date'}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    is24Hour={true}
                                    onChange={onDateSelected}
                                />
                            }

                            {
                                btnLoading ?
                                    <View className='mt-10'>
                                        <ActivityIndicator size={'large'} color={primaryColor} />
                                    </View>
                                    :
                                    isFormValid() ?
                                        <TouchableOpacity className={`flex justify-center items-center px-5 py-4 rounded-[4px] mt-10 `} style={{ backgroundColor: primaryColor }} onPress={() => { on_update() }}>
                                            <Text className='text-whiteColor text-[16px] leading-4 font-HelveticaRegular font-normal'>Save Changes</Text>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity className={`flex justify-center items-center px-5 py-4 rounded-[4px] mt-10 opacity-40`} style={{ backgroundColor: primaryColor }}>
                                            <Text className='text-whiteColor text-[16px] leading-4 font-HelveticaRegular font-normal'>Save Changes</Text>
                                        </TouchableOpacity>
                            }
                        </View>
                    </ScrollView>
            }
        </View>
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
        // paddingVertical: 10,
        height: 50,
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

export default EditProfile