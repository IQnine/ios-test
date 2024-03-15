import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Dimensions, Keyboard } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useIsFocused } from '@react-navigation/native'
import * as ProfileServices from '../../services/prospect/profile/ProfileServices'
import { Icons, Images } from '../../assets/Images'
import FastImage from 'react-native-fast-image'
import AntDesign from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DEGREE_LEVEL, GENDER, USER_TYPE } from '../prospect/menu/Dropdowndata'
import { useSelector } from 'react-redux'
import moment from 'moment'
import * as AuthServices from '../../services/auth/AuthServices'
import { Utils } from '../../common/Utils'
import * as AmbassadorServices from '../../services/prospect/ambassadors/AmbassadorsServices';
import { Colors } from '../../common/Colors'
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
// import GradientButton from '../../components/Gradientbtn'
// import Modal from "react-native-modal";
// import BottomSheet from '@gorhom/bottom-sheet';
// import EvilIcon from 'react-native-vector-icons/EvilIcons'
// import IonIcon from 'react-native-vector-icons/Ionicons';
// import Feather from 'react-native-vector-icons/Feather'
// import { initiateOnDeviceConversionMeasurementWithPhoneNumber } from '@react-native-firebase/analytics'
// import { any } from 'prop-types'

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

const OptionalField = (props: any) => {
    const isFocused = useIsFocused();
    const [mandatoryFields, setMandatoryFields] = useState<MandatoryDataType>();
    const [customAdditionalFields, setCustomAdditionalFields] = useState([]);
    const [dob, setDob] = useState('');
    const [isFocus, setIsFocus] = useState(false);
    const [datePicker, setDatePicker] = useState(false)
    const [date, setDate] = useState(new Date())
    const [nationalityValue, setNationalityValue] = useState<any>();
    const [gender, setGender] = useState();
    const [previousQualification, setPreviousQualification] = useState('');
    const [industryValue, setIndustryValue] = useState()
    const [yearOfGraduation, setYearOfGraduation] = useState('');
    const [hobbies, setHobbiesData] = useState('');
    const [studentId, setStudentId] = useState('');
    const [clubs, setClubs] = useState('');
    const [stateValue, setStateValue] = useState()
    const [favouriteSpot, setFavouriteSpot] = useState('')
    const [phoneNumber, setPhoneNumber] = useState("");
    const [languageValue, setLanguageValue] = useState<any>([]);
    const [languageData, setLanguageData] = useState<any>([]);
    const [degreeLevelValue, setDegreeValue] = useState();
    const [areaOfStudy, setAreaOfStudy] = useState('');
    const [c_major, setCmajor] = useState('');
    const [pronoun, setPronoun] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notEmpty, setNotEmpty] = useState(Number);
    const [customData, setCustomdata] = useState<any>();
    const [additional, setAdditional] = useState([])
    const [nationalityData, setNationalityData] = useState<OptionData[]>([]);
    const [userType, setUserType] = useState(Number);
    const [industryData, setIndustryData] = useState<OptionData[]>([]);
    const [stateData, setStateData] = useState<OptionData[]>([]);
    const [areaOfQueryData, setAreaOfQueryData] = useState<OptionData[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })

    const collegeId = instituteInfo?.item.college_id[0] ? instituteInfo?.item.college_id[0] : Utils.getData('collegeData')

    const primaryColor = instituteInfo?.college_data[0].font_color ? instituteInfo.college_data[0].font_color : Utils.getData('primaryColor')

    useEffect(() => {
        filterMandatoryFields();
        getFieldDetails();
        getfield()
        getLanguageData()
    }, [isFocused])

    useEffect(() => {
        addCustomFields()
    }, [customAdditionalFields])

    useEffect(() => {
        filterMandatoryFields();
    }, [customData])
    useEffect(() => { return setCustomdata(hobbies) }, [hobbies])

    useEffect(() => {
        filterMandatoryFields();
    }, [mandatoryFields, dob, gender, studentId, pronoun, isFocused, yearOfGraduation, pronoun, DEGREE_LEVEL,
        c_major, nationalityValue, clubs, industryValue, studentId, areaOfStudy, stateValue
        , previousQualification, phoneNumber, languageValue, degreeLevelValue, favouriteSpot])


    const getFieldDetails = async () => {
        setIsLoading(true)
        try {
            await ProfileServices.get_field_detail().then((res: any) => {
                if (res.statusCode == 200) {
                    setIsLoading(false);
                    setMandatoryFields(res.data?.mandatory_fields);
                    setCustomAdditionalFields(res.data.additional_fields);
                } else {
                    setIsLoading(false);
                }
            })
        } catch (error) {
            console.log(error);
            setIsLoading(false);
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

    function filterMandatoryFields() {
        trimStrings(nationalityValue)
        try {
            const filterList: any = mandatoryFields ?? {}
            let additional = {
                gender: mandatoryFields?.gender ? nationalityValue?.['gender'] : null,
                student_id: mandatoryFields?.student_id ? nationalityValue?.['student_id'].trim() : null,
                date_of_birth: mandatoryFields?.date_of_birth ? dob : null,
                previous_qualification: mandatoryFields?.previous_qualification ? nationalityValue?.['previous_qualification'].trim() : null,
                industry: mandatoryFields?.industry ? nationalityValue?.['industry'] : null,
                year_of_graduation: mandatoryFields?.year_of_graduation ? nationalityValue?.['year_of_graduation'].trim() : null,
                clubs_and_organizations: mandatoryFields?.clubs_and_organizations ? nationalityValue?.['clubs_and_organizations'].trim() : null,
                state: mandatoryFields?.state ? nationalityValue?.['state'] : null,
                favorite_spot_on_campus: mandatoryFields?.favorite_spot_on_campus ? nationalityValue?.['favorite_spot_on_campus'].trim() : null,
                pronouns: mandatoryFields?.pronouns ? nationalityValue?.['pronouns'].trim() : null,
                concentration_major: mandatoryFields?.concentration_major ? nationalityValue?.['concentration_major'].trim() : null,
                area_of_study: mandatoryFields?.area_of_study ? nationalityValue?.['area_of_study'].trim() : null,
                phone_number: mandatoryFields?.phone_number ? phoneNumber.trim() : null,
                languages: mandatoryFields?.languages ? languageValue : null,
                degree_level: mandatoryFields?.degree_level ? nationalityValue?.['degree_level'] : null,
                hobbies_and_interests: mandatoryFields?.hobbies_and_interests ? nationalityValue?.['hobbies_and_interests'].trim() : null,
                nationality: mandatoryFields?.nationality ? nationalityValue?.['nationality'] : null,
                topic_of_inquiry: mandatoryFields?.topic_of_inquiry ? nationalityValue?.['topic_of_inquiry'] : null,
            }
            const filteredAdditional = Object.fromEntries(
                Object.entries(additional)?.filter(([key]) => filterList[key])
            );
            Object.assign(filteredAdditional, customData);
            let s = { ...filteredAdditional, ...customData };
            let n = Object.keys(s).map((key) => notNull(s[key])).filter(t => t == false)
            setNotEmpty(n.length)
            console.log(n, n.length)
            return filteredAdditional
        } catch (e) {
            console.log("Error -------------", e)
            return {}
        }
    }

    function addCustomFields() {
        const custom = customAdditionalFields.filter((item: any) => item.field_type === "custom")
        const customDa: any = {};
        custom.forEach((item: any) => {
            customDa[item.field_key] = item.attribute_value;
        });
        setCustomdata(customDa)
    }
    const Additional = async () => {
        setIsLoading(true)
        let collegId = await Utils.getData('ambassador_college_id')
        let userId = await Utils.getData('ambassador_id')
        let send_data = {
            "college_id": collegId,
            "user_id": userId,
            ...filterMandatoryFields()
        }
        console.log("send_data", send_data)
        try {
            await AuthServices.ambassador_complete_profile_additional(send_data).then((res: any) => {
                if (res.statusCode == 200) {
                    props.navigation.replace('AmbassadorStack', { screen: 'BottomTabsNavigator' })
                    setIsLoading(false)
                } else {
                    console.log("error sending mandatory data additonal profile ambassador", res);
                }
            })
        } catch (error) {
            console.log(error);
        }
        setIsLoading(false)
    }

    const getfield = async () => {
        try {
            await AuthServices.ambassador_complete_profile_fields().then((res: any) => {
                if (res.statusCode == 200) {
                    setAdditional(res.data.optional_fields)
                }
            })
        } catch (error) {
            console.log(error);
        }
    }
    const textField = (item: any) => {
        return (<View key={item.field_key}>
            <View className='mt-7 ml-1' key={item.field_key}>
                <Text className='text-textColor text-[16px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}</Text>
            </View>
            <TextInput
                className={`w-full h-[50px] text-textColor leading-4 bg-fieldGrayColor px-3 rounded-[4px] mt-1`}
                // value={firstName}
                // placeholder={`Enter ${item.field_label.toLowerCase()}`}
                placeholder={item.field_placeholder}
                onChangeText={(e) => {
                    const cleanedValue: any = e.replace(/^\s+|\s+$|\s+(?=\s)/g, " ");
                    if (cleanedValue) {
                        setNationalityValue((prevValues: any) => ({
                            ...prevValues,
                            [item.field_key ?? item.field_label]: cleanedValue
                        }));
                    } else {
                        setNationalityValue((prevValues: any) => ({
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
                // placeholder='Enter your mobile number'
                placeholder={item.field_placeholder}
                onChangeText={(e) => { setPhoneNumber(e) }}
                placeholderTextColor={Colors.greyBorder}
                autoComplete='off'
                maxLength={15}
            />
        </View>
        )
    }
    function showDatePicker() {
        setDatePicker(true);
    };

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
                // value={customData}
                // placeholder={`Enter ${item.field_label.toLowerCase()}`}
                placeholder={item.field_placeholder}
                onChangeText={(e) => {
                    const cleanedValue: any = e.replace(/^\s+|\s+$|\s+(?=\s)/g, " ");
                    if (cleanedValue) {
                        setHobbiesData((prevValues: any) => ({
                            ...prevValues,
                            [item.field_key ?? item.field_label]: cleanedValue
                        }));
                    } else {
                        setHobbiesData((prevValues: any) => ({
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
                // placeholder={!isFocus ? `Select ${item.field_label.toLowerCase()}` : ''}
                placeholder={item.field_placeholder}
                searchPlaceholder="Search..."
                value={nationalityValue?.[`${item.field_key}`]}
                onFocus={() => Keyboard.dismiss()}
                onChange={(o: any) => {
                    setNationalityValue((prevValues: any) => ({
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
            let item = {
                label: o.name,
                value: o.id
            }
            option.push({ label: o.name, value: o.id })
        })
        let placeholderColor = item.field_key === "languages" && languageValue.length > 0 ? Colors.textColor : Colors.greyBorder
        return (<View key={item.field_key} >
            <View className='mt-7 ml-1'>
                <Text className='text-textColor text-[14px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{item.field_label}</Text>
            </View>
            <MultiSelect
                placeholderStyle={[styles.placeholderStyle, { color: placeholderColor }]}
                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                // placeholderStyle={styles.placeholderStyle}
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
                // placeholder={!isFocus ? `Select ${item.field_label.toLowerCase()}` : ''}
                placeholder={getSelectedItems(item.field_placeholder)}
                searchPlaceholder="Search..."
                value={languageValue}
                onFocus={() => Keyboard.dismiss()}
                onChange={(item: any) => {
                    setLanguageValue(item);
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
                renderItem={(item) => {
                    let i = languageValue.findIndex((t: any) => t == item.value)
                    return <View style={{ padding: 10, paddingRight: 20, flexDirection: 'row', alignItems: 'center', minHeight: 60 }} key={item.value}>
                        {i !== -1 ?
                            // <Ionicons name='checkbox' size={20} color={Colors.greyColor25} />
                            <View className='flex justify-center items-center w-5 h-5 border-[1.5px] border-greyColor rounded-[3px]'>
                                <View className='w-[14px] h-[14px] rounded-[2px]' style={{ backgroundColor: primaryColor }}></View>
                            </View>
                            :
                            // <Ionicons name='square-outline' size={20} color={Colors.greyColor50} />
                            <View className='flex justify-center items-center w-5 h-5 border-[1.5px] border-greyColor rounded-[3px]'>
                                {/* <View className='w-[14px] h-[14px] rounded-[2px]' style={{ backgroundColor: this.primaryColor }}></View> */}
                            </View>
                        }
                        <Text style={{ color: Colors.grey1, marginLeft: 10 }} >{item.label}</Text>
                    </View>
                }}
            />
        </View>)

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
    const getSelectedItems = (placeholder: any) => {
        try {
            let d = languageData.filter((t: any) => languageValue.includes(t.value))
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

    const loginButton = async () => {
        await Utils.clearAllData()
        props.navigation.replace('AuthStack', { screen: 'Login' })
    }

    function onDateSelected(event: any, value: any) {
        setDatePicker(false);
        const currentDate = value || tommorow;
        if (new Date(currentDate) == new Date(tommorow)) {
            // setDob('dd/mm/yyyy')
            setDob(moment(currentDate).format('ll'))
            return
        }
        setDate(currentDate);
        let tempDate = new Date(currentDate);
        // let fDate = tempDate.getDate() + '/' + (tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
        // setDob(fDate)
        setDob(moment(tempDate).format('ll'))

    };

    const onRefresh = () => {
        setRefreshing(true);
        setRefreshing(false);
    };

    const handleChange = (item: any, key: any) => {

        let f = Object.keys(customData).find(t => t === key)

        let y = f == undefined ? { [key]: '' } : { [key]: item }

        setCustomdata({
            ...customData,
            [key]: item
        })
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
    const onFinish = async () => {
        Additional()
    }

    const screenWidth = Dimensions.get('window').width;

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className='flex flex-1 bg-bgGrayColor w-full items-center relative' style={{ zIndex: 10 }}>
            <View className='flex w-full justify-center items-center'>
                <View className='w-[120px] h-[92px] mt-10'>
                    <FastImage source={Images.truleaguelogo} resizeMode='contain' className='w-full h-full' />
                </View>
            </View>
            {/* <View className='flex w-full justify-center items-center'>
                <View className='w-[120px] h-[92px] mt-10'>
                    <FastImage source={Images.truleaguelogo} resizeMode='contain' className='w-full h-full' />
                </View>
            </View> */}
            {isLoading ?
                <View style={{ zIndex: 50, width: screenWidth * 8.5 / 10 }} className='flex bg-whiteColor h-[65%] px-[20px] rounded-[4px] pt-[20px] pb-[10px] absolute top-[20%]' >
                    <View className='flex flex-1 justify-center items-center'>
                        <ActivityIndicator size={'large'} color={Colors.textColor} />
                    </View>
                </View>
                : <>
                    <View style={{ zIndex: 50, width: screenWidth * 8.5 / 10 }} className='flex bg-whiteColor h-[65%] px-[20px] rounded-[4px] pt-[20px] pb-[10px] absolute top-[20%]' >
                        <View>
                            <Text className='text-textColor text-[30px] font-Helvetica leading-[44px] tracking-[-0.44px] text-center'>Ambassador sign up</Text>
                        </View>
                        <ScrollView keyboardShouldPersistTaps='always'   >
                            <View className='h-full flex flex-1 mt-3 mx-[10px]'>
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
                                }
                                {datePicker && <DateTimePicker
                                    value={date}
                                    mode={'date'}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    is24Hour={true}
                                    onChange={onDateSelected}
                                />}
                            </View>
                            {
                                isLoading ?
                                    <View className='mt-10'>
                                        <ActivityIndicator size={'large'} color={Colors.textColor} />
                                    </View>
                                    :
                                    notEmpty == 0 ?
                                        <TouchableOpacity onPress={onFinish} style={{ backgroundColor: primaryColor }} className='flex-auto flex-row min-w-[70%] mb-[10px] mt-[30px] h-[55px] mx-[10px] items-center justify-center rounded-[4px]' >
                                            <Text className='px-1 text-[16px]  font-InterRegular text-white' numberOfLines={1}>Sign up</Text>
                                        </TouchableOpacity>
                                        : <View style={{ backgroundColor: primaryColor }} className='flex-auto flex-row min-w-[70%] mb-[10px] mt-[30px] h-[55px] items-center mx-[10px] justify-center  opacity-50 rounded-[4px]'>
                                            <Text className='px-11 text-[16px] font-InterRegular text-white' numberOfLines={1}>Sign up</Text>
                                        </View>
                            }
                        </ScrollView>
                    </View >
                </>
            }
            <View style={{ backgroundColor: primaryColor }} className='flex px-[30px] absolute bottom-0 w-full h-[32%] ' >
                <View className='items-center justify-center top-[60%]'>
                    <Text className='text-[16px]  font-InterRegular text-white '>Already have an account?</Text>
                    <TouchableOpacity onPress={() => props.navigation.replace('AuthStack', { screen: 'Login' })} className='border-b-2 border-whiteColor' >
                        <Text className='text-[16px]  font-InterRegular text-white '>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView >
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
        height:50,
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

export default OptionalField