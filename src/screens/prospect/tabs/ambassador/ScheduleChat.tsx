import { View, Text, TouchableOpacity, ScrollView, FlatList, ToastAndroid, ActivityIndicator, BackHandler, RefreshControl, Dimensions, Alert } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Icons } from '../../../../assets/Images'
import FastImage from 'react-native-fast-image'
import { Colors } from '../../../../common/Colors'
import { Calendar, CalendarCellStyle, } from 'react-native-big-calendar'
import { Fonts } from '../../../../common/Fonts'
import Modal from "react-native-modal";
import * as ScheduleServices from '../../../../services/prospect/scheduler/SchedulerServices';
import * as AmbassadorServices from '../../../../services/prospect/ambassadors/AmbassadorsServices';
import moment from 'moment-timezone';
import { useIsFocused } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { setUpcomingData, setUpcomingProspectData } from '../../../../redux/action/SchedularData'
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Utils } from '../../../../common/Utils'

type EventData = {
    start: Date;
    end: Date;
    title: string;
    class: string,
    id: number,
    isSelected: boolean
};

type SlotData = {
    id: number,
    time: string,
    start_time: Date,
    end_time: Date
}

const ScheduleChat = (props: any) => {
    let mentor_id = props.route.params.mentorId;
    let profile_image = props.route.params.profile_image;
    let mentor_name = props.route.params.mentor_name;
    // let primaryColor = props.route.params.primaryColor
    const isFocus = useIsFocused();
    let dispatch = useDispatch()

    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentMonths, setCurrentMonths] = useState(new Date());
    const [prevDisable, setPrevDisable] = useState(true);
    const [scheduleId, setscheduleId] = useState(Number)
    const [selectedCell, setSelectedCell] = useState(null);
    const [slotData, setSlotData] = useState<EventData[]>([]);
    const [availableSlotData, setAvailableSlotData] = useState<SlotData[]>([]);
    const [loading, setLoading] = useState(false);
    const [startTime, setStartTime] = useState(Date);
    const [endTime, setEndTime] = useState(Date);
    const [btnLoading, setBtnLoading] = useState(false);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [cellId, setCellId] = useState(Number);
    const [btnDisable, setBtnDisable] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    let currentMonth = new Date();
    const timeZone = moment.tz.guess();

    const scrollViewRef = useRef<ScrollView>(null);
    const slotsAvailableRef = useRef<View>(null);

    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
      })
      const primaryColor = instituteInfo?.college_data[0]?.font_color;

    useEffect(() => {
        getSlotData();
        checkIfWelcomeSeen();
    }, [isFocus])

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

    const checkIfWelcomeSeen = async () => {
        try {
            const value = await Utils.getData('hasSeenWelcome')
            if (value !== null) {
                setHasSeenWelcome(true);
            } else {
                setHasSeenWelcome(false);
                setModalVisible(true)
                await Utils.storeData('hasSeenWelcome', 'true')
            }
        } catch (error) {
            console.error('Error checking AsyncStorage:', error);
        }
    };

    const getSlotData = async (month?: any) => {
        setCellId(0)
        setCalendarLoading(true);
        let mentorId = mentor_id;
        let dateTime = month ? month : currentMonth
        let userTz = timeZone
        let EVENET_DATA: EventData[] = [];
        await AmbassadorServices.get_slot_data(mentorId, dateTime, userTz).then((res: any) => {
            if (res.statusCode == 200) {
                res.data.map((o: any, index: any) => {
                    EVENET_DATA.push({
                        id: index + 1,
                        start: new Date(o.date),
                        end: new Date(o.date),
                        title: (o.totalSlots <= 0 && o.availableSlots <= 0 && o.bookedSlots <= 0) ? '' : (o.totalSlots === o.bookedSlots) && o.availableSlots == 0 ? 'Booked' : o.totalSlots == 0 ? '' : `Available ${o.availableSlots}/${o.totalSlots}`,
                        // title: o.totalSlots == 0 ? '' : `${o.availableSlots}/${o.totalSlots}`
                        class: `text-errorColor`,
                        isSelected: false
                    })
                })
                setSlotData(EVENET_DATA)
                setCalendarLoading(false);
            } else {
                setCalendarLoading(false);
            }
        })
    }

    const onPressCell = async (e: any) => {
        setLoading(true);
        setSelectedCell(e)
        let mentorId = mentor_id;
        let dateTime = e
        let userTz = timeZone
        try {
            await AmbassadorServices.get_available_slot(mentorId, dateTime, userTz).then((res: any) => {
                if (res.statusCode == 200) {
                    setAvailableSlotData(res.data)
                    setLoading(false);
                } else {
                    setLoading(false)
                    ToastAndroid.showWithGravity(
                        res.message,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                }
            })
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    const currentYear = new Date(currentMonths).getFullYear();

    function weekCount(year: any, month_number: any) {
        // month_number is in the range 1..12
        var firstOfMonth = new Date(year, month_number - 1, 1);
        var lastOfMonth = new Date(year, month_number, 0);
        var used = firstOfMonth.getDay() + lastOfMonth.getDate();
        return Math.ceil(used / 7);
    }

    const goToPreviousMonth = () => {
        const previousMonth = new Date(currentMonths);
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        setCurrentMonths(previousMonth);
        if (currentDate.getMonth() == previousMonth.getMonth()) {
            setPrevDisable(true)
        }
        getSlotData(previousMonth);
        setAvailableSlotData([])
    };

    const getUpcomingScheduleList = async () => {
        try {
            await ScheduleServices.get_schedules(2,timeZone).then((res: any) => {
                if (res.statusCode == 200) {
                    dispatch(setUpcomingData(res.data))
                }
            }

            )
        }
        catch (error) {
        }
    }

    const goToNextMonth = () => {
        const nextMonth = new Date(currentMonths);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setCurrentMonths(nextMonth);
        setPrevDisable(false);
        getSlotData(nextMonth);
        setAvailableSlotData([])
    };

    const click_slot = (id: number) => {
        setscheduleId(id)
    }

    const on_update_time_slot = async () => {

        setBtnLoading(true);
        let send_data = {
            mentor_id: mentor_id,
            schedule_id: scheduleId
        }
        try {
            await AmbassadorServices.book_time_slot(send_data).then((res: any) => {
                if (res.statusCode === 201) {
                    setBtnLoading(false);
                    getSlotData();
                    setAvailableSlotData([])
                    getUpcomingScheduleList();
                    dispatch(setUpcomingProspectData([]))
                    props.navigation.navigate('ProSchedulerBar')
                } else {
                    setBtnLoading(false);
                    ToastAndroid.showWithGravity(
                        res.message,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                }
            })
        } catch (error) {
            console.log(error);
            setBtnLoading(false);
        }
    }
    const renderTimeSlots = ({ item }: { item: SlotData }) => {
        return (
            <TouchableOpacity className={`w-full px-4 py-5 bg-whiteColor rounded-[4px] justify-center my-1 `} style={{ borderWidth: item.id == scheduleId ? 2 : 0, borderColor: item.id == scheduleId ? primaryColor : "" }} onPress={() => { click_slot(item.id) }}>
                <Text style={{ color: item.id == scheduleId ? primaryColor : Colors.textColor }} className={` text-[14px] font-InterRegular leading-5 tracking-[0.44px]`}>{moment(item.start_time).format('hh:mm a')} - {moment(item.end_time).format('hh:mm a')}</Text>
            </TouchableOpacity>

        )
    }
    const onRefresh = () => {
        setRefreshing(true);
        getSlotData();
        setRefreshing(false);
    };

    const closeModal = () => {
        setModalVisible(false);
    }
    return (
        <View className='flex flex-1 bg-bgGrayColor'>
            <Modal
                isVisible={modalVisible}
                coverScreen={true}
                style={{
                    margin: 0,
                    flex: 1,
                    justifyContent: 'flex-start'
                }}>
                <View className='h-full w-full bg-transparent relative'>
                    <View className='w-[240px] h-[324px] bg-whiteColor  rounded-[4px] px-5 py-5 absolute bottom-4 right-4'>
                        <View className='w-[40px] h-[40px]'>
                            <FastImage source={Icons.IcMessage} tintColor={Colors.textColor} className='w-full h-full' />
                        </View>
                        <View className='py-5'>
                            <Text className='text-textColor text-[16px] font-InterRegular font-normal tracking-[0.44px] leading-4'>These are the available time slots, this will ensure a quicker response time during live text based conversations.</Text>
                        </View>
                        <TouchableOpacity
                            className={`flex px-4 py-4 justify-center items-center rounded-[4px]`}
                            style={{ backgroundColor: primaryColor }}
                            onPress={closeModal}>
                            <Text className='text-whiteColor text-[14px] font-normal font-InterRegular'>Ok, Got it!</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </Modal>
            <View className={`flex flex-row items-center py-5 px-4`} style={{ backgroundColor: primaryColor }}>
                <TouchableOpacity onPress={() => { props.navigation.goBack() }}>
                    <FastImage source={Icons.IcBackBtn} className='w-[30px] h-[42px]' tintColor={Colors.white} />
                </TouchableOpacity>
                <View className='flex justify-center items-center w-10 h-10 rounded-full ml-3'>
                    <FastImage source={{ uri: profile_image }} className='w-full h-full rounded-full' resizeMode='cover' />
                </View>
                <View className='flex flex-col ml-3 w-[70%]'>
                    <Text className='text-whiteColor font-InterRegular  text-[12px] leading-5 tracking-[0.44px] font-normal '>Schedule chat with</Text>
                    <Text numberOfLines={1} className='text-whiteColor text-[14px] font-InterMedium leading-5 tracking-[0.44px] font-medium '>{mentor_name}</Text>
                </View>
            </View>
            <View className='flex flex-auto'>
                <ScrollView ref={scrollViewRef} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                    <View className='flex flex-row w-full justify-between items-center mb-6 bg-whiteColor py-4 px-4'>

                        <View>
                            <Text className='text-textColor text-xl text-center mt-2  font-InterRegular'>Book time slot</Text>
                        </View>

                        <View className='flex flex-row justify-center'>
                            {
                                prevDisable ?
                                    <TouchableOpacity disabled onPress={goToPreviousMonth} className='flex justify-center items-center px-4 rounded-[4px] border-[1px] border-greyBorder mr-2 opacity-30'>
                                        <AntDesign name='caretleft' size={6} color={primaryColor} />
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity onPress={goToPreviousMonth} className='flex justify-center items-center px-4 rounded-[4px] border-[1px] border-greyBorder mr-3'>
                                        <AntDesign name='caretleft' size={6} color={primaryColor} />
                                    </TouchableOpacity>
                            }
                            <View className='px-3 py-2 rounded-[4px] border-[1px] ' style={{ borderColor: primaryColor }}>
                                <Text className='font-Helvetica' style={{ color: primaryColor }}>{currentMonths.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
                            </View>
                            <TouchableOpacity onPress={goToNextMonth} className='flex justify-center items-center px-4 rounded-[4px] border-[1px] border-greyBorder ml-2'>
                                <AntDesign name='caretright' size={6} color={primaryColor} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className='px-3 w-full flex flex-1'>
                        {
                            calendarLoading ?
                                <ActivityIndicator size={'large'} color={primaryColor} />
                                :
                                <Calendar
                                    calendarCellStyle={{ backgroundColor: Colors.white, marginHorizontal: 1, paddingHorizontal: 0, paddingVertical: 0, borderRadius: 6, width: 60, height: 95, padding: 3 }}
                                    calendarCellTextStyle={(date, hour) => {
                                        let start = moment(moment(date).format('YYYY-MM-DD'))
                                        let current = moment(moment(currentDate).format('YYYY-MM-DD'))
                                        const isBeforeCurrentDate = start < current;                                        
                                        return { fontSize:12, fontWeight: '400', fontFamily: Fonts.InterRegular, lineHeight: 20, letterSpacing: 0.44, color: Colors.greyBorder, textAlign: 'left', paddingLeft: 5,opacity:isBeforeCurrentDate?0.3:1 }
                                    }}
                                    events={slotData}
                                    date={currentMonths}
                                    activeDate={currentDate}
                                    showAdjacentMonths={false}
                                    hideNowIndicator={false}
                                    weekStartsOn={1}
                                    swipeEnabled={false}
                                    onPressEvent={(e) => {
                                        let start = moment(moment(e.start).format('YYYY-MM-DD'))
                                        let current = moment(moment(currentDate).format('YYYY-MM-DD'))
                                        const isBeforeCurrentDate = start < current;
                                        if (!isBeforeCurrentDate) {
                                            setCellId(e.id);
                                            onPressCell(e.start);
                                            if (scrollViewRef.current) {
                                                scrollViewRef.current.scrollTo({ y: 400, animated: true });
                                            }
                                        } else {
                                            ToastAndroid.showWithGravity('You can only schedule future time slots.', ToastAndroid.SHORT, ToastAndroid.CENTER);
                                        }
                                    }}
                                    mode="month"
                                    renderEvent={(e: any) => {
                                        let start = moment(moment(e.start).format('YYYY-MM-DD'))
                                        let current = moment(moment(currentDate).format('YYYY-MM-DD'))
                                        const isBeforeCurrentDate = start < current;
                                        return (
                                            <TouchableOpacity disabled className={`w-full px-1 flex flex-col justify-center items-center mt-2 ${isBeforeCurrentDate ? 'opacity-40' : 'opacity-100'} absolute -top-7 h-[95px]`} style={{ borderWidth: (cellId === e.id) ? 2 : 0, borderColor: (cellId === e.id) ? primaryColor : '', borderRadius: 6 }}>
                                                <Text className='text-greyBorder text-[9px] font-InterSemiBold absolute bottom-2 mb-3 leading-5 tracking-[0.44px]'>{e.title.split(' ')[1]}</Text>
                                                <Text className={`${e.title.split(' ')[0] === 'Booked' ? 'text-errorColor' : 'text-greyBorder'} text-[6px] font-InterRegular absolute bottom-2 leading-5`}>{e.title.split(' ')[0]}</Text>
                                            </TouchableOpacity>
                                        )
                                    }}
                                    height={Dimensions.get('window').height > 750 ? Dimensions.get('window').height * (.62) : Dimensions.get('window').height * (.68)}
                                />
                        }
                    </View>

                    <View className='px-4 mt-5 pb-10'>
                        <View className='flex flex-row'>
                            <Text className='text-textColor text-xl leading-8 tracking-[0.44px] font-Helvetica'>Slots available</Text>
                            <View className='flex justify-center items-center px-2 py-1 rounded-[4px] bg-greyBorder ml-4'>
                                <Text className='text-whiteColor text-[12px] font-InterSemiBold leading-5 tracking-[0.44px]'>{availableSlotData.length < 10 ? '0' + availableSlotData.length : availableSlotData.length}</Text>
                            </View>
                        </View>

                        <View ref={slotsAvailableRef} id="slotsAvailable" className='mt-5'>
                            {
                                loading ?
                                    <ActivityIndicator size={'large'} color={Colors.textColor} />
                                    :
                                    availableSlotData.length > 0 ?
                                        <FlatList
                                            data={availableSlotData}
                                            renderItem={renderTimeSlots}
                                        />
                                        :
                                        <View className='mt-5'>
                                            <Text className='text-textColor text-[18px] font-normal font-InterRegular text-center opacity-40'>No Slot Available</Text>
                                        </View>
                            }
                        </View>
                    </View>
                </ScrollView>
            </View>

            <View className='px-4 py-4 pb-7'>
                {
                    btnLoading ?
                        <ActivityIndicator size={'large'} color={primaryColor} />
                        :
                        scheduleId && cellId ?
                            <TouchableOpacity className={`flex px-4 py-4 justify-center items-center rounded-[4px] `} style={{ backgroundColor: primaryColor }} onPress={() => { on_update_time_slot(); }}>
                                <Text className='text-whiteColor text-[16px] font-HelveticaBold'>Book slot</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity className={`flex px-4 py-4 justify-center items-center rounded-[4px] opacity-40`} style={{ backgroundColor: primaryColor }}>
                                <Text className='text-whiteColor text-[16px] font-HelveticaBold'>Book slot</Text>
                            </TouchableOpacity>
                }
            </View>
        </View>
    )
}

export default ScheduleChat