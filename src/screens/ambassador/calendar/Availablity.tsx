import { View, Text, TouchableOpacity, Button, ScrollView, ToastAndroid, Dimensions, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Calendar, } from 'react-native-big-calendar'
import FastImage from 'react-native-fast-image'
import { Icons } from '../../../assets/Images';
import Modal from "react-native-modal";
import AddAvailability from './modals/AddAvailability';
import { NavigationProp } from '../../../../type';
import { Colors } from '../../../common/Colors';
import { Fonts } from '../../../common/Fonts';
import moment from 'moment-timezone';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import * as AmbassadorServices from '../../../services/prospect/ambassadors/AmbassadorsServices';
import * as AvailabilityServices from '../../../services/ambassador/calendar/AvailabilityServices';
import { Utils } from '../../../common/Utils';
import { any } from 'prop-types';
import { setSetSlotData } from '../../../redux/action/SchedularData';


type EventData = {
  start: Date;
  end: Date;
  title: string;
  class: string,
  id: number,
  isSelected: boolean
};

const Availablity = (props: any) => {
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  let SLOT_DATA = useSelector((state: any) => {
    return state.upcomingDataReducer.slotData
  });

  const instituteInfo = useSelector((state: any) => {
    return state.instituteInfoReducer?.instituteInfo
  })
  const primaryColor = instituteInfo.college_data[0].font_color;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [prevDisable, setPrevDisable] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [slotData, setSlotData] = useState<EventData[]>([]);
  const [currentMonths, setCurrentMonths] = useState(new Date());
  const [cellId, setCellId] = useState(Number);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [timeDifference, setTimeDifference] = useState();
  const [selectedDate, setSelectedDate] = useState(Date);
  const [refreshing, setRefreshing] = useState(false);
  const [modalKey, setModalKey] = useState('');
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  let currentMonth = new Date();
  const currentYear = new Date(currentMonths).getFullYear();
  const timeZone = moment.tz.guess();

  useEffect(() => {
    if (isFocus) {
      if (SLOT_DATA.length <= 0) {
        // setLoadMore(true)
        getSlotData();
      }
      checkIfWelcomeSeen();
    }
  }, [])

  function weekCount(year: any, month_number: any) {
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
    getSlotData(previousMonth)
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonths);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonths(nextMonth);
    setPrevDisable(false);
    getSlotData(nextMonth)
  };
  const closeModal = () => {
    setModalVisible(false);
    setModalKey('');
    getSlotData();
    getTimeDifference();
  }
  const closeModal1 = () => {
    setModalVisible(false);
    setModalKey('');
  }

  const getSlotData = async (month?: any) => {
    setCellId(0)
    setCalendarLoading(true);
    let ambassador_id = await Utils.getData('ambassador_id');
    let mentorId = ambassador_id;
    let dateTime = month ? month : currentMonths
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
        dispatch(setSetSlotData(EVENET_DATA))
        setSlotData(EVENET_DATA)
        setCalendarLoading(false);
      } else {
        setCalendarLoading(false);
        // ToastAndroid.showWithGravity(
        //   res.message,
        //   ToastAndroid.SHORT,
        //   ToastAndroid.CENTER
        // );
      }
    })
  }

  const getTimeDifference = async () => {
    try {
      let response: any = await AvailabilityServices.time_difference();
      if (response.statusCode == 200) {
        setTimeDifference(response.data)
      }
    } catch (error) {
      console.log(error);
    }
  }


  const onPressCell = async (e: any) => {
    setSelectedDate(e);
    setModalVisible(true);
    setModalKey('AVAILABILITY')
    // props.navigation.navigate('AddAvailability', { selectedDate: selectedDate })
  }

  const onRefresh = () => {
    setRefreshing(true);
    getSlotData();
    setRefreshing(false)
  }

  const checkIfWelcomeSeen = async () => {
    try {
      const value = await Utils.getData('hasSeenWelcome')
      if (value !== null) {
        setHasSeenWelcome(true);
      } else {
        setHasSeenWelcome(false);
        setModalVisible(true)
        setModalKey('WELCOME_MESSAGE')
        await Utils.storeData('hasSeenWelcome', 'true')
      }
    } catch (error) {
      console.error('Error checking AsyncStorage:', error);
    }
  };

  const screen_height = Dimensions.get('window').height;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgGrayColor, padding: 10 }}>
      <Modal
        isVisible={modalVisible}
        onBackButtonPress={closeModal}
        coverScreen={true}
        animationIn={'slideInRight'}
        animationOut={'slideOutRight'}
        animationInTiming={1}
        animationOutTiming={1}
        style={{
          margin: 0,
          flex: 1,
          justifyContent: 'flex-start'
        }}
      >
        {
          modalKey === 'AVAILABILITY' ?
            <AddAvailability closeModal={closeModal} timeDifference={timeDifference} selectedDate={selectedDate} />
            :
            modalKey === 'WELCOME_MESSAGE' ?
              <View  style={{ height: '100%', width: '100%', backgroundColor: 'transparent', position: 'relative' }}>
                <View className='w-[240px] h-[290px] bg-whiteColor  rounded-[4px] px-5 py-5 absolute bottom-4 right-4'>
                  <View className='w-[40px] h-[40px]'>
                    <FastImage source={Icons.IcMessage} tintColor={Colors.textColor} className='w-full h-full' />
                  </View>
                  <View className='py-5'>
                    <Text className='text-textColor text-[16px] font-InterRegular font-normal tracking-[0.44px] leading-4'>You are requested to be available for a live text based conversation at the designated time slots.</Text>
                  </View>
                  <TouchableOpacity
                    className={`flex px-4 py-4 justify-center items-center rounded-[4px]`}
                    style={{ backgroundColor: primaryColor }}
                    onPress={closeModal1}>
                    <Text className='text-whiteColor text-[14px] font-normal font-InterRegular'>Ok, Got it!</Text>
                  </TouchableOpacity>
                </View>
              </View>
              : <></>
        }
      </Modal>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 2, marginBottom: 10 }}>
        {
          prevDisable ?
            <TouchableOpacity disabled onPress={goToPreviousMonth} className='flex justify-center items-center px-4 rounded-[4px] border-[1px] border-greyBorder mr-3 opacity-30'>
              <AntDesign name='caretleft' size={6} color={primaryColor} />
            </TouchableOpacity>
            :
            <TouchableOpacity onPress={goToPreviousMonth} className='flex justify-center items-center px-4 rounded-[4px] border-[1px] border-greyBorder mr-3'>
              <AntDesign name='caretleft' size={6} color={primaryColor} />
            </TouchableOpacity>
        }
        <View className='px-3 py-2 rounded-[4px] border-[1px] ' style={{ borderColor: primaryColor }}>
          <Text className='' style={{ color: primaryColor }}>{currentMonths.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
        </View>
        <TouchableOpacity onPress={goToNextMonth} className='flex justify-center items-center px-4 rounded-[4px] border-[1px] border-greyBorder ml-3'>
          <AntDesign name='caretright' size={6} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className='flex flex-auto'>
          <View className='px-1 w-full flex flex-1'>
            {
              calendarLoading ?
                <View className='flex flex-auto justify-center items-center' style={{ height: screen_height * 2 / 3 }}>
                  <ActivityIndicator size={'large'} color={primaryColor} />
                </View>
                :
                <Calendar
                  calendarCellStyle={{ backgroundColor: Colors.white, marginHorizontal: 1.5, borderRadius: 4, height: 95, padding: 3, width: 60 }}
                  calendarCellTextStyle={(date, hour) => {
                    let start = moment(moment(date).format('YYYY-MM-DD'))
                    let current = moment(moment(currentDate).format('YYYY-MM-DD'))
                    const isBeforeCurrentDate = start < current;
                    return { fontSize: 12, fontWeight: '400', fontFamily: Fonts.InterRegular, lineHeight: 20, letterSpacing: 0.44, color: Colors.greyBorder, textAlign: 'left', opacity: isBeforeCurrentDate ? 0.3 : 1 }
                  }}
                  events={SLOT_DATA}
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
                      <TouchableOpacity key={e.id}  disabled className={`w-full px-1 relative flex flex-col justify-center items-center mt-2 ${isBeforeCurrentDate ? 'opacity-40' : 'opacity-100'} absolute -top-8 h-[95px] ${e.id === 0 ? 'border-none' : (cellId === e.id) ? 'border-[1.5px] rounded-[6px] border-primaryColor' : 'border-none'}`}>
                        <Text className='text-greyBorder text-[9px] font-InterSemiBold absolute bottom-2 mb-3 leading-5 tracking-[0.44px]'>{e.title.split(' ')[1]}</Text>
                        <Text className={`${e.title.split(' ')[0] === 'Booked' ? `${primaryColor}` : 'text-greyBorder'} text-[6px] font-InterRegular absolute bottom-2 leading-5`}>{e.title.split(' ')[0]}</Text>
                      </TouchableOpacity>
                    )
                  }}
                  // height={weekCount(currentYear, currentMonths.getMonth() + 1) == 6 ? Dimensions.get('window').height * (.7) : Dimensions.get('window').height * (.6)}
                  height={Dimensions.get('window').height > 750 ? Dimensions.get('window').height * (.6) : Dimensions.get('window').height * (.68)}
                />
            }
          </View>
        </View>
      </ScrollView>


    </View>
  )
}

export default Availablity