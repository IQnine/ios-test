import { View, Text, TouchableOpacity, FlatList, ScrollView, ToastAndroid, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import FastImage from 'react-native-fast-image'
import { Icons } from '../../../../assets/Images'
import { Colors } from '../../../../common/Colors'
import { useSelector } from 'react-redux'
import * as AvailabilityServices from '../../../../services/ambassador/calendar/AvailabilityServices';
import moment from 'moment-timezone';
import { Utils } from '../../../../common/Utils'
import { any } from 'prop-types'
import { Dimensions } from 'react-native'

type SelectedTimeData = {
    id: number,
    time: string
}
type SelectedTimeData1 = {
    id: number,
    slot: any,
    shift: any
}
type AvailAbleTimeSlot = {
    id: number,
    start_time: Date,
    end_time: Date
}
type TimeData = {
    id: number,
    time: string,
    ampm: string,
}
type TimeData1 = {
    id: number,
    time: string,
    ampm: string,
    hour: any
}

const AddAvailability = (props: any) => {
    const [time, setTime] = useState('');
    const [selectedTimeRange, setSelectedTimeRange] = useState('')
    const [disabledItem, setDisableItem] = useState(true);
    const [selectedTime, setSelectedTime] = useState(Number);
    const [selectedSlot, setSelectedSlot] = useState<SelectedTimeData[]>([]);
    const [AvailableTimeSlot, setAvailableTimeSlot] = useState<AvailAbleTimeSlot[]>([]);
    // const [tempSelectedSlotsList, setTempSelectedSlotsList] = useState([]);
    const [shiftHoursData1, setShiftHoursData1] = useState([]);
    const [selectedSlots1, setSelectedSlots1] = useState<SelectedTimeData1[]>([])
    const [selectedSlotsList1, setSelectedSlotsList1] = useState<Array<any>>([])
    const [addedLoader, setAddedLoader] = useState(false);
    const [btnLoader, setBtnLoader] = useState(false);

    let shiftData: any = [];
    let tempSelectedSlotsList: any = [];
    let shiftHoursData: any = [];
    let timeDifference: number = 0;
    let selectedSlotsList: any = [];
    const screenWidth = Dimensions.get('window').width

    const timeZone = moment.tz.guess();
    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    const primaryColor = instituteInfo.college_data[0].font_color;
    useEffect(() => {
        let date = moment(props.selectedDate).format('YYYY-MM-DD');
        getAvailableTimeSlot();
        getTimeDifference(date);
    }, [])


    const getTimeSlots = (diff: any) => {
        const slotDurationInMinutes = diff;
        const now = new Date();
        const endTime = new Date(now);
        endTime.setHours(23, 59, 59, 999); // Set the end time to 23:59:59.999 (end of the day)

        // Calculate the next multiple of 15 minutes from the current time    
        const nextSlotStart = new Date(moment().add(1, 'h').startOf('h').toString());

        const slots = [];
        let currentTime = nextSlotStart;


        while (currentTime <= endTime) {
            const slotEndTime = new Date(
                currentTime.getTime() + slotDurationInMinutes * 60000
            );
            slots.push({
                shift: '',
                slot:
                    currentTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    }) +
                    ' to ' +
                    (slotEndTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    }) === '24:00'
                        ? '00:00'
                        : slotEndTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                        })),
            });

            currentTime = slotEndTime;
        }

        return slots;
    }

    const getTimeDifference = async (d: any) => {
        let date = moment(new Date()).format('YYYY-MM-DD');
        // console.log(d === date, "gg", d, date)
        if (d === date) {
            let response: any = await AvailabilityServices.time_difference();
            if (response.statusCode === 200) {
                shiftData.splice(0, shiftData.length);
                shiftData = [...getTimeSlots(response.data.difference)];
                shiftHoursData = [...getHoursSlots(response.data.difference, new Date(), true)];
                setShiftHoursData1(shiftHoursData)
            }

        } else {
            let response: any = await AvailabilityServices.time_difference();
            if (response.statusCode === 200) {
                shiftData.splice(0, shiftData.length);
                timeDifference = response.data.difference;
                var startMorningTime = moment('00:00', 'HH:mm');
                var startMorningTime = (moment('00:00', 'HH:mm'));
                var endMorningTime = moment('11:59', 'HH:mm');
                shiftHoursData = [...getHoursSlots(response.data.difference, startMorningTime)];
                setShiftHoursData1(shiftHoursData)
                var timeMorningSlots = [];
                while (startMorningTime <= endMorningTime) {
                    let tempStartMorningTime = startMorningTime.clone();
                    timeMorningSlots.push({
                        shift: 'Morning',
                        slot: `${moment(startMorningTime).format('HH:mm')} to ${moment(
                            tempStartMorningTime.add(timeDifference, 'minutes')
                        ).format('HH:mm')}`,
                    });
                    startMorningTime.add(timeDifference, 'minutes');
                }
                // console.log(startMorningTime);
                shiftData.push(...timeMorningSlots);
                var startAfternoonTime = moment('12:00', 'HH:mm');
                var endAfternoonTime = moment('14:49', 'HH:mm');
                var timeAfternoonSlots = [];
                while (startAfternoonTime <= endAfternoonTime) {
                    let tempStartAfternoonTime = startAfternoonTime.clone();
                    timeAfternoonSlots.push({
                        shift: 'Afternoon',
                        slot: `${moment(startAfternoonTime).format('HH:mm')} to ${moment(
                            tempStartAfternoonTime.add(timeDifference, 'minutes')
                        ).format('HH:mm')}`,
                    });
                    startAfternoonTime.add(timeDifference, 'minutes');
                }
                shiftData.push(...timeAfternoonSlots);
                var startEveningTime = moment('15:00', 'HH:mm');
                var endEveningTime = moment('23:59', 'HH:mm');
                var timeEveningSlots = [];
                while (startEveningTime <= endEveningTime) {
                    let tempStartEveningTime = startEveningTime.clone();
                    timeEveningSlots.push({
                        shift: 'Evening',
                        slot: `${moment(startEveningTime).format('HH:mm')} to ${moment(
                            tempStartEveningTime.add(timeDifference, 'minutes')
                        ).format('HH:mm')}`,
                    });
                    startEveningTime.add(timeDifference, 'minutes');
                }
                shiftData.push(...timeEveningSlots);
            }
            // console.log('this.shiftDatathis.shiftData', JSON.stringify(shiftHoursData))
        }
    }

    const getHoursSlots = (diff: any, time: any, addHour = false) => {
        const slotDurationInMinutes = diff;
        const now = new Date();
        const endTime = new Date(now);
        endTime.setHours(23, 59, 59, 999); // Set the end time to 23:59:59.999 (end of the day)
        let nextSlotStart = new Date(moment(time).startOf('h').toString());
        if (addHour) {
            // Calculate the next multiple of 15 minutes from the current time    
            nextSlotStart = new Date(moment(time).add(1, 'h').startOf('h').toString());
        }

        const slotsHours = [];
        let currentHour = nextSlotStart;

        while (currentHour <= endTime) {
            const slotEndHour = new Date(
                currentHour.getTime() + 60 * 60000
            );
            let currentHourTime = currentHour;
            let slots = [];
            while (currentHourTime < slotEndHour) {
                const slotEndTime = new Date(
                    currentHourTime.getTime() + slotDurationInMinutes * 60000
                );
                let slotTime = currentHourTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }) +
                    ' to ' +
                    (slotEndTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }) === '24:00'
                        ? '00:00'
                        : slotEndTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        }));

                let slot24Time = moment(currentHourTime).format('HH:mm') + ' to ' + moment(slotEndTime).format('HH:mm');
                let alreadyAdded = tempSelectedSlotsList.some((slot: any) => {
                    const trimmedSlot = slot.toString().trim();
                    const trimmedSlot24Time = slot24Time.toString().trim();

                    return (
                        (trimmedSlot === "23:45 to 23:59" && trimmedSlot24Time === "23:45 to 00:00") ||
                        trimmedSlot === trimmedSlot24Time
                    );
                });

                if (!alreadyAdded) {
                    slots.push({
                        shift: '',
                        slot: slotTime
                    });
                }

                currentHourTime = slotEndTime;
            }
            slotsHours.push({
                slots: slots,
                hour: currentHour.toLocaleTimeString([], {
                    hour: '2-digit',
                    hour12: true,
                })
            })

            currentHour = slotEndHour;
        }

        return slotsHours;
    }

    const getAvailableTimeSlot = async () => {
        setAddedLoader(true);
        let mentorId = await Utils.getData('ambassador_id');
        try {
            let response: any = await AvailabilityServices.get_available_slot_data(mentorId, timeZone, props.selectedDate);
            if (response.statusCode == 200) {
                setAvailableTimeSlot(response.data)
                setAddedLoader(false);
            }

        } catch (error) {
            console.log(error);
        }
    }

    const setSelectedTime1 = (selectTime: any) => {
        setTime(selectTime.hour)
        setSelectedSlots1(selectTime?.slots);
    }
    const removeSlot = (slot: any) => {
        selectedSlotsList1.splice(selectedSlotsList1.indexOf(slot), 1);
        setSelectedSlotsList1([...selectedSlotsList1])
        setSelectedTimeRange('')
    }
    const checkSlot = (slot: any) => {
        let check = selectedSlotsList1.some((el: any) => el == slot);
        return check;
    }

    const SelectSlot = (slot: any = {}) => {
        setSelectedTimeRange(slot.slot)
        let isIncluded = checkSlot(slot.slot);
        if (isIncluded) {
            removeSlot(slot.slot);
        } else {
            selectedSlotsList.push(slot.slot);
            setSelectedSlotsList1([...selectedSlotsList1, slot.slot])
        }
    }

    const renderSelectedTimes = ({ item }: { item: SelectedTimeData1 }) => {
        const isSelected = selectedTimeRange === item.slot;
        const cardWidth = ((screenWidth - 40) / 2) - 6
        return (
            <TouchableOpacity
                onPress={() => { SelectSlot(item) }}
                style={{ width: cardWidth, borderWidth: isSelected ? 1 : 0, borderColor: isSelected ? primaryColor : null }}
                className={`flex mt-2 items-center justify-center bg-whiteColor mr-2 py-4 rounded-md`}>
                <Text className='text-textColor text-[10px] font-medium tracking-[1.5px]'>{item.slot}</Text>
            </TouchableOpacity>
        )
    }
    const renderSelectedTimes2 = ({ item }: any) => {
        const cardWidth = ((screenWidth - 40) / 2) + 12
        return (
            <View className='flex flex-row mt-2 bg-fieldGrayColor mr-2 px-4 py-4 rounded-md justify-between items-center' style={{ width: cardWidth }}>
                <View>
                    <Text className='text-textColor text-[10px] font-medium tracking-[1.5px]'>{item}</Text>
                </View>
                <TouchableOpacity className='ml-1'
                    onPress={() => { removeSlot(item) }}>
                    <FastImage source={Icons.IcCross} resizeMode='contain' className='w-[10px] h-[10px]' />
                </TouchableOpacity>
            </View>
        )
    }
    const renderSelectedTimes3 = ({ item }: { item: AvailAbleTimeSlot }) => {
        return (
            <View className='flex flex-row mt-[2px] bg-whiteColor w-full px-4 py-4 rounded-md justify-between items-center'>
                <View>
                    <Text className='text-textColor text-[10px] font-medium tracking-[1.5px] uppercase'>{moment(item.start_time).format('hh:mm a')}-{moment(item.end_time).format('hh:mm a') === '11:59 pm' ? '12:00 am' : moment(item.end_time).format('hh:mm a')}</Text>
                </View>
                <TouchableOpacity className=''
                    onPress={() => { DeleteSchedule(item.id) }}>
                    <FastImage source={Icons.IcCross} resizeMode='contain' className='w-[12px] h-[12px]' />
                </TouchableOpacity>
            </View>
        )
    }
    const renderTime = ({ item }: { item: TimeData1 }) => {
        const cardWidth = ((screenWidth - 40) / 6) - 6
        return (
            <TouchableOpacity
                onPress={() => { setSelectedTime1(item) }}
                className='flex flex-col justify-center items-center h-[48px] bg-whiteColor rounded-sm mt-2 mx-[3px]' style={{ borderWidth: item.hour == time ? 1 : 0, borderColor: item.hour == time ? primaryColor : '#fff', width: cardWidth }}>
                <Text className='text-textColor text-[10px] tracking-[1.5px] font-medium'>{item.hour.split(" ")[0] < 10 ? "0" + item.hour.split(" ")[0] : item.hour.split(" ")[0]}</Text>
                <Text className='text-textColor text-[10px] tracking-[1.5px] font-medium uppercase'>{item.hour.split(" ")[1]}</Text>
            </TouchableOpacity>
        )
    }

    const AddTimeSlot = async () => {
        setBtnLoader(true);
        let tempSlotData: any = [];
        selectedSlotsList1.map((slot) => {
            let timeArray = slot.split('to');
            tempSlotData.push(moment(timeArray[0], ["h:mm A"]).format("HH:mm") + ' to ' + moment(timeArray[1], ["h:mm A"]).format("HH:mm"));
        });
        let send_data = {
            schedule_date: moment(props.selectedDate).format('YYYY-MM-DD'),
            schedule_time: [...tempSlotData],
            userTz: timeZone
        }
        try {
            let response: any = await AvailabilityServices.add_availability(send_data);
            if (response.statusCode == 200) {
                // ToastAndroid.showWithGravity(response.message, ToastAndroid.SHORT, ToastAndroid.CENTER);
                setBtnLoader(false);
                setTime('')
                setSelectedTimeRange('');
                setSelectedSlotsList1([])
                getAvailableTimeSlot();
                props.closeModal()
            } else {
                ToastAndroid.showWithGravity(response.message, ToastAndroid.SHORT, ToastAndroid.CENTER);
                setBtnLoader(false);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const DeleteSchedule = async (id: number) => {
        try {
            let response: any = await AvailabilityServices.delete_schedule(id);
            if (response.statusCode == 202) {
                getAvailableTimeSlot()
            }
        } catch (error) {
            console.log(error);

        }
    }

    return (
        <View style={{flex:1,backgroundColor:Colors.bgGrayColor}}>
            <View className='flex py-4 flex-row justify-start items-center px-2' style={{ backgroundColor: primaryColor }}>
                <TouchableOpacity className='w-[36px] h-[36px]' onPress={() => { props.closeModal() }}>
                    <FastImage source={Icons.IcBackBtn} resizeMode='contain' className='w-full h-full' />
                </TouchableOpacity>
                <View className='ml-4'>
                    <Text className='text-whiteColor text-xl tracking-[0.44px] font-medium'>Add availability</Text>
                </View>
            </View>

            <ScrollView>
                <View className='px-5 pb-10'>
                    <View className='flex w-full justify-start items-start mt-6'>
                        <Text className='text-textColor text-xl tracking-[0.44px] font-InterBold'>Select time range</Text>
                    </View>
                    <View className='mt-4'>
                        <FlatList
                            data={shiftHoursData1}
                            renderItem={renderTime}
                            numColumns={6}
                        />
                    </View>
                    {
                        selectedSlots1.length <= 0 ?
                            <View className='flex mt-10 w-full items-start justify-start opacity-25'>
                                <Text disabled className='text-textColor text-xl font-medium tracking-[0.44px] opacity-60'>Select time slot</Text>
                            </View>
                            :
                            <View className='flex mt-10 w-full items-start justify-start'>
                                <Text className='text-textColor text-xl font-medium tracking-[0.44px]'>Select time slot</Text>
                            </View>
                    }
                    {
                        selectedSlots1.length > 0 ?
                            <View className='mt-2'>
                                <FlatList
                                    data={selectedSlots1}
                                    renderItem={renderSelectedTimes}
                                    numColumns={2}
                                />
                            </View>
                            :
                            <TouchableOpacity disabled className='flex w-full py-4 justify-center items-center bg-whiteColor mt-4 rounded-[4px] opacity-50'>
                                <Text className='text-textColor text-[10px] font-medium tracking-[1.5px] uppercase'>Select time range first</Text>
                            </TouchableOpacity>

                    }

                    <View className='w-full mt-7 h-[1.5px]' style={{ backgroundColor: Colors.fieldGrayColor }}></View>

                    <View className='mt-4'>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={true}
                            indicatorStyle={'black'}
                            data={selectedSlotsList1}
                            renderItem={renderSelectedTimes2}
                        />
                    </View>

                    <View className='mt-7 pb-5'>
                        {
                            selectedSlotsList1.length <= 0 ?
                                <TouchableOpacity disabled className='flex px-4 py-4 justify-center items-center rounded-[4px]  opacity-50' style={{ backgroundColor: primaryColor }}>
                                    <Text className='text-whiteColor text-[16px] font-medium'>Update time slot</Text>
                                </TouchableOpacity>
                                :
                                btnLoader ?
                                    <ActivityIndicator size={'large'} color={primaryColor} />
                                    :
                                    <TouchableOpacity
                                        onPress={AddTimeSlot}
                                        className='flex px-4 py-4 justify-center items-center rounded-[4px]' style={{ backgroundColor: primaryColor }}>
                                        <Text className='text-whiteColor text-[16px] font-medium'>Update time slot</Text>
                                    </TouchableOpacity>
                        }
                    </View>

                    <View className='flex mt-5 w-full items-start justify-start'>
                        <Text className='text-textColor text-xl font-medium tracking-[0.44px]'>Added time slots</Text>
                    </View>
                    {
                        AvailableTimeSlot.length > 0 ?
                            addedLoader ?
                                <ActivityIndicator size={'large'} color={primaryColor} />
                                :
                                <View className='mt-4'>
                                    <FlatList
                                        data={AvailableTimeSlot}
                                        renderItem={renderSelectedTimes3}
                                    />
                                </View>
                            :
                            <View className='flex w-full py-4 justify-center items-center bg-whiteColor mt-4 rounded-[4px]'>
                                <Text className='text-textColor text-[10px] font-medium tracking-[1.5px] uppercase'>No slots added</Text>
                            </View>
                    }

                </View>
            </ScrollView>

        </View>
    )
}

export default AddAvailability