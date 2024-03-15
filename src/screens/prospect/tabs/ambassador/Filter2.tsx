import { View, Text, TouchableOpacity, FlatList, Pressable, StyleSheet, ActivityIndicator, BackHandler } from 'react-native'
import React, { useState, useEffect } from 'react'
import FastImage from 'react-native-fast-image'
import { Colors } from '../../../../common/Colors'
import { Icons } from '../../../../assets/Images'
import * as AmbassadorsServices from '../../../../services/prospect/ambassadors/AmbassadorsServices';
import { useDispatch, useSelector } from 'react-redux'
import { setFilterMajor, setFilterNational, setFilterStates, setFilterValue, setIsFilterSet } from '../../../../redux/action/FilterStateList'
import { Dropdown } from 'react-native-element-dropdown'
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Fonts } from '../../../../common/Fonts'
import { useIsFocused } from '@react-navigation/native'
import GradientButton from '../../../../components/Gradientbtn'

const Filter = (props: any) => {
    type FilterDataType = {
        id: number,
        filter_type: string,
        filter_value: string
    }
    type SubFilterDataType = {
        id: number,
        filter_type: string,
        filter_value: string
    }
    type OptionData = {
        label: string,
        value: number
    }

    const [stateId, setStateId] = useState(Number);
    const [userType, setUserType] = useState(Number);
    const [nationalityId, setNationalityId] = useState<any>();
    const [courseId, setCourseId] = useState<any>();
    const [isFocus, setIsFocus] = useState(false);
    const [isFocus1, setIsFocus1] = useState(false);
    const [isFocus2, setIsFocus2] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const isFocused = useIsFocused();

    const filterValue = useSelector((state: any) => {
        return state.FilterStateReducer?.filterValue
    })

    const stateFilterList = useSelector((state: any) => {
        return state.FilterStateReducer?.filterState
    })

    const isFilterSet = useSelector((state: any) => {
        return state.FilterStateReducer?.isFilterSet
    })
    const nationalFilterList = useSelector((state: any) => {
        return state.FilterStateReducer?.filterNational
    })

    const majorFilterList = useSelector((state: any) => {
        return state.FilterStateReducer?.filterMajor
    })

    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    const primaryColor = instituteInfo.college_data[0].font_color;

    let AFFILIATION_DATA = [
        {
            id: 0,
            name: 'Select affiliation'
        },
        {
            id: 1,
            name: 'Current Student'
        },
        {
            id: 2,
            name: 'Staff'
        },
        {
            id: 3,
            name: 'Alumni'
        }
    ]


    useEffect(() => {
        getStateData();
        getCourseData();
        getCountryList();
    }, [])

    useEffect(() => {
        if (props.navigation.canGoBack()) {
            const backAction = () => {
                props.navigation.goBack()
                return true;
            };
            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                backAction,
            );
            return () => backHandler.remove();
        }
    }, [props.navigation.canGoBack()]);

    useEffect(() => {
        setNationalityId(filterValue.nationality);
        setStateId(filterValue.state);
        setCourseId(filterValue.major);
        setUserType(filterValue.userType);
    }, [isFocused])

    const clear_filter = () => {
        let t = {
            state: 0,
            major: 0,
            nationality: 0,
            userType: 0
        }
        setStateId(0);
        setCourseId(0);
        setUserType(0);
        setNationalityId(0);
        dispatch(setIsFilterSet(false));
        dispatch(setFilterValue(t))
        props.navigation.replace('ProspectStack', { screen: 'ProsBottomTabsNavigator' });
    }


    const getStateData = async () => {
        await AmbassadorsServices.get_state_list().then((res: any) => {
            if (res.statusCode == 200) {
                let states = res.data
                let { stateData } = props.route.params.stateList
                const data = states.filter((arrayEl: any) =>
                    stateData?.some((filterEl: any) => filterEl === arrayEl.name)
                );
                let t = data.unshift({ country_id: 0, id: 0, name: 'Select state' })
                if (!isFilterSet) {
                    dispatch(setFilterStates(data))
                }
            }
        })
    }
    const getCourseData = async () => {
        await AmbassadorsServices.get_course_list().then((res: any) => {
            if (res.statusCode == 200) {
                let major = res.data
                let { StateMajor } = props.route.params.majorlist
                const data = major.filter((arrayEl: any) =>
                    StateMajor?.some((filterEl: any) => filterEl === arrayEl.course.name)
                );
                let course = data.map((i: any) => i.course)
                let t = course.unshift({ id: 0, name: 'Select major' })
                if (!isFilterSet) {
                    dispatch(setFilterMajor(course))
                }
            }
        })
    }
    const getCountryList = async () => {
        try {
            await AmbassadorsServices.get_country_list().then((res: any) => {
                if (res.statusCode == 200) {
                    let nationals = res.data
                    let { nationalityData } = props.route.params.nationalityList
                    const data = nationals.filter((arrayEl: any) =>
                        nationalityData?.some((filterEl: any) => filterEl === arrayEl.name)
                    );
                    let t = data.unshift({ country_id: 0, id: 0, name: 'Select nationality' })
                    if (!isFilterSet) {
                        dispatch(setFilterNational(data))
                    }
                }
            })
        } catch (error) {

        }
    }

    const onApplyFilter = () => {
        setIsLoading(true);
        let t = {
            state: stateId,
            major: courseId,
            nationality: nationalityId,
            userType: userType
        }
        dispatch(setFilterValue(t))
        props.navigation.replace('ProspectStack', { screen: 'ProsBottomTabsNavigator' });
        setIsLoading(false)
    }

    return (
        <View className='flex flex-1 bg-bgGrayColor'>
            <View className='flex flex-row justify-between items-center py-4 px-4' style={{ backgroundColor: primaryColor }}>
                <TouchableOpacity onPress={() => { props.navigation.goBack() }} className='flex flex-row items-center'>
                    <FastImage source={Icons.IcBackBtn} className='w-[42px] h-[42px]' tintColor={Colors.white} />
                    <Text className='text-whiteColor text-[20px] tracking-[0.44px] font-normal font-Helvetica mt-[3] ml-2'>Filters</Text>
                </TouchableOpacity>
                {
                    userType || nationalityId || stateId || courseId ?
                        <TouchableOpacity activeOpacity={0.25} onPress={() => { clear_filter() }} className='border-[1px] rounded-[4px]  border-white justify-center items-center h-[35px] w-[90px]'>
                            <View className='flex flex-row justify-evenly items-center'>
                                <FastImage source={Icons.IcCross} className='w-[8px] h-[8px]' tintColor={Colors.white} />
                                <Text className='text-white ml-3 text-[14px] tracking-[0.44px] font-InterRegular'>Clear</Text>
                            </View>
                        </TouchableOpacity>
                        : null
                }
            </View>
            <View className='flex flex-row flex-1'>
                <View className='w-[50%] flex-1 bg-greyColor25 px-4'>
                    <View className='flex flex-auto mt-3'>
                        <View className='mt-3' >
                            <View className=' ml-2'>
                                <Text className='text-textColor text-[14px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>Affiliation with institution</Text>
                            </View>
                            <Dropdown
                                selectedTextProps={{ numberOfLines: 1 }}
                                style={[styles.dropdown, isFocus && {}]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={[styles.selectedTextStyle, { color: userType == 0 ? Colors.greyBorder : Colors.textColor }]}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                itemContainerStyle={styles.itemContainer}
                                itemTextStyle={{ color: Colors.textColor }}
                                dropdownPosition='auto'
                                data={AFFILIATION_DATA}
                                maxHeight={300}
                                autoScroll={false}
                                inverted={false}
                                labelField="name"
                                valueField="id"
                                placeholder={!isFocus ? 'Select affiliation' : '...'}
                                searchPlaceholder="Search..."
                                value={userType}
                                onFocus={() => setIsFocus(true)}
                                onBlur={() => setIsFocus(false)}
                                onChange={(item: any) => {
                                    setUserType(item.id);
                                    setIsFocus(false);
                                }}
                                renderRightIcon={() => {
                                    return (
                                        <AntDesign name='caretdown' size={8} color={Colors.greyBorder} style={{ paddingRight: 10 }} />
                                    )
                                }}
                            />
                        </View>
                        <View className='mt-4'>

                            <View className='ml-2'>
                                <Text className='text-textColor text-[14px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>{instituteInfo.college_data[0]?.no_flag == 0 ? 'Nationality' : 'State'}</Text>
                            </View>
                            <Dropdown
                                selectedTextProps={{ numberOfLines: 1 }}
                                style={[styles.dropdown, isFocus1 && {}]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={[styles.selectedTextStyle,
                                {
                                    color: instituteInfo.college_data[0]?.no_flag == 0 && nationalityId == 0 ?
                                        Colors.greyBorder : instituteInfo.college_data[0]?.no_flag == 1 && stateId == 0 ?
                                            Colors.greyBorder : Colors.textColor
                                }]}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                itemContainerStyle={styles.itemContainer}
                                itemTextStyle={{ color: Colors.textColor }}
                                autoScroll={false}
                                inverted={false}
                                dropdownPosition='auto'
                                data={instituteInfo.college_data[0]?.no_flag == 0 ? nationalFilterList : stateFilterList}
                                maxHeight={300}
                                labelField="name"
                                valueField="id"
                                placeholder={!isFocus1 ? `Select ${instituteInfo.college_data[0]?.no_flag == 0 ? 'nationality' : 'state'}` : '...'}
                                searchPlaceholder="Search..."
                                value={instituteInfo.college_data[0]?.no_flag == 0 ? nationalityId : stateId}
                                onFocus={() => setIsFocus1(true)}
                                onBlur={() => setIsFocus1(false)}
                                onChange={(item: any) => {
                                    instituteInfo.college_data[0]?.no_flag == 0 ? setNationalityId(item.id) : setStateId(item.id);
                                    setIsFocus1(false);
                                    dispatch(setIsFilterSet(true))
                                }}
                                renderRightIcon={() => {
                                    return (
                                        <AntDesign name='caretdown' size={8} color={Colors.greyBorder} style={{ paddingRight: 10 }} />
                                    )
                                }}
                            />
                        </View>
                        <View className='mt-4'>
                            <View className='ml-2'>
                                <Text className='text-textColor text-[14px] font-normal leading-5 tracking-[0.44px] font-InterRegular'>Major</Text>
                            </View>
                            <Dropdown
                                selectedTextProps={{ numberOfLines: 1 }}
                                style={[styles.dropdown, isFocus2 && {}]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={[styles.selectedTextStyle, { color: courseId == 0 ? Colors.greyBorder : Colors.textColor }]}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                itemContainerStyle={styles.itemContainer}
                                itemTextStyle={{ color: Colors.textColor }}
                                data={majorFilterList}
                                autoScroll={false}
                                inverted={false}
                                dropdownPosition='auto'
                                maxHeight={300}
                                labelField="name"
                                valueField="id"
                                placeholder={!isFocus2 ? 'Select major' : '...'}
                                searchPlaceholder="Search..."
                                value={courseId}
                                onFocus={() => setIsFocus2(true)}
                                onBlur={() => setIsFocus2(false)}
                                onChange={(item: any) => {
                                    setCourseId(item.id);
                                    setIsFocus2(false);
                                    dispatch(setIsFilterSet(true))
                                }}
                                renderRightIcon={() => {
                                    return (
                                        <AntDesign name='caretdown' size={8} color={Colors.greyBorder} style={{ paddingRight: 10 }} />
                                    )
                                }}
                            />
                        </View>
                    </View>
                    {
                        isLoading ?
                            <ActivityIndicator size={'large'} color={primaryColor} />
                            :
                            <View className='my-6 px-2'>
                                <GradientButton
                                    onPress={onApplyFilter}
                                    text="Apply filters"
                                    colors={[primaryColor, primaryColor]}
                                    disable={courseId || stateId || nationalityId || userType ? false : true}
                                />
                            </View>
                    }
                </View>
            </View>
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
        backgroundColor: Colors.fieldGrayColor
    },
    dropdown: {
        marginHorizontal: 5,
        paddingVertical: 10,
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
        marginLeft: 6,
        fontSize: 16,
        color: Colors.greyBorder,
        paddingHorizontal: 5
    },
    selectedTextStyle: {
        fontSize: 14,
        color: Colors.textColor,
        fontFamily: Fonts.Helvetica
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
export default Filter