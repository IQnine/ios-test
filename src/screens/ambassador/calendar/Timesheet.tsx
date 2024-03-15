import { View, Text, Touchable, TouchableOpacity, Platform, TextInput, ScrollView, ToastAndroid, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import FastImage from 'react-native-fast-image'
import { Icons } from '../../../assets/Images'
import { Colors } from '../../../common/Colors'
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector } from 'react-redux'
import * as ScheduleServices from '../../../services/ambassador/calendar/Schedules';
import moment from 'moment'
import { Utils } from '../../../common/Utils'

const tommorow = new Date().setDate(new Date().getDate() + 1)


const Timesheet = ({ navigation }: any) => {
  const [date, setDate] = useState(new Date())
  const [datePicker, setDatePicker] = useState(false);
  const [endDatePicker, setEndDatePicker] = useState(false);
  const [startDate1, setStartDate1] = useState('mm/dd/yyyy');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate1, setEndDate1] = useState('mm/dd/yyyy');
  const [endDate, setEndDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [minute, setMinutes] = useState('');
  const [timePicker, setTimePicker] = useState(false);
  const [fromDate, setFromDate] = useState(Date);
  const [toDate, setToDate] = useState(Date);
  const [loader, setLoader] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const [endDate3, setEndDate3] = useState('');
  const [endTime, setEndTime] = useState(false);

  let tempDate: any = null

  const timeZone = moment.tz.guess();
  const instituteInfo = useSelector((state: any) => {
    return state.instituteInfoReducer?.instituteInfo
  })
  const primaryColor = instituteInfo.college_data[0].font_color;

  function showDatePicker() {
    setDatePicker(true);
  };
  function showEndDatePicker() {
    setEndDatePicker(true);
  };
  function showTimePicker() {
    setTimePicker(true);
  };

  function onDateSelected(event: any, value: any) {
    setDatePicker(false);
    const currentDate = value || tommorow;
    if (new Date(currentDate).getTime() === new Date(tommorow).getTime()) {
      setStartDate(new Date())
      setStartDate1(moment(currentDate).format('ll'))
      return
    }
    setDate(currentDate);
    let tempDate1 = new Date(currentDate);
    let fDate = (tempDate1.getMonth() + 1) + '/' + tempDate1.getDate() + '/' + tempDate1.getFullYear();
    setStartDate(tempDate1)
    setStartDate1(moment(tempDate1).format('ll'))
    setFromDate(currentDate)
  };

  function onEndDateSelected(event: any, value: any) {
    setEndDatePicker(false);
    const currentDate = value || tommorow;
    if (new Date(currentDate).getTime() === new Date(tommorow).getTime()) {
      setEndDate(new Date())
      setEndDate1(moment(currentDate).format('ll'))
      return
    }
    setDate(currentDate);
    tempDate = new Date(currentDate);
    setEndDate3(tempDate);
    let fDate = (tempDate.getMonth() + 1) + '/' + tempDate.getDate() + '/' + tempDate.getFullYear();
    // if (moment(tempDate).format('ll') >= startDate1) {
    setEndDate(tempDate)
    setEndDate1(moment(tempDate).format('ll'))
    // } else {
    //   ToastAndroid.showWithGravity(
    //     "End date should be bigger than start date",
    //     ToastAndroid.SHORT,
    //     ToastAndroid.CENTER
    //   );
    //   setEndDate1('mm/dd/yyyy')
    // }
    setToDate(currentDate)
  };


  // function onTimeSelected(event: any, value: any) {
  //   if (event.type === 'dismissed') {
  //     // Time picker dismissed
  //     setTimePicker(false); // Hide the time picker
  //     return;
  //   }
  //   if (value) {
  //     const selectedTime = new Date(value);
  //     const hours = selectedTime.getHours();
  //     const minutes = selectedTime.getMinutes();
  //     const ampm = hours >= 12 ? 'PM' : 'AM';

  //     // Convert hours to 12-hour format
  //     const formattedHours = hours % 12 || 12;

  //     const formattedTime = `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;

  //     setTime(formattedTime);
  //     setTimePicker(false);
  //   }
  // };


  const startDateString = "2024-01-11";
  const endDateString = "2024-01-12";



  // console.log(startDate, endDate);

  // if (!isNaN(date1) && !isNaN(date2)) {
  //   if (startDate <= endDate) {
  //     console.log("Start date is less than or equal to end date");
  //   } else {
  //     console.log("End date is greater than start date");
  //   }
  // } else {
  //   console.log("Invalid date format");
  // }

  const addTimeSheet = async () => {
    setLoader(true);
    let date1 = moment(startDate);
    let date2 = moment(endDate);
    let collegeId = await Utils.getData('ambassador_college_id');
    let send_Data = {
      college_id: collegeId,
      description: description,
      from_date: startDate1,
      hours: parseInt(hours),
      minute: parseInt(minute),
      to_date: endDate1
    }
    if (parseInt(minute) > 60) {
      setErrorMessage('Minutes should be less than 60.');
      setLoader(false);
    } else if (date1.isBefore(date2) || date1.isSame(date2)) {
      try {
        let response: any = await ScheduleServices.add_time_sheet(send_Data);
        if (response.statusCode == 201) {
          ToastAndroid.showWithGravity('Timesheet submitted.', ToastAndroid.SHORT, ToastAndroid.CENTER);
          setLoader(false)
          setStartDate1('mm/dd/yyyy');
          setStartDate(new Date());
          setEndDate1('mm/dd/yyyy');
          setEndDate(new Date());
          setMinutes('');
          setHours('');
          setErrorMessage('');
          setEndDateError('');
          setDescription('');
        } else {
          setLoader(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
    else {
      setEndDateError('End date should be >= start date.');
      setLoader(false);
    }

  }

  return (
    <View className='flex px-6'>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
        <View className='mt-4'>
          <Text className='text-textColor text-[16px] leading-4 font-regular'>Start date*</Text>
        </View>
        <TouchableOpacity onPress={showDatePicker} className='flex flex-row mt-3 w-full py-3 px-4 justify-between items-center rounded-lg' style={{ backgroundColor: Colors.fieldGrayColor }}>
          <Text className='text-fieldTextColor'>{startDate1}</Text>
          <TouchableOpacity onPress={showDatePicker}>
            <FastImage source={Icons.IcCalendar} tintColor={Colors.bottomInactive} className='w-6 h-6' resizeMode='contain' />
          </TouchableOpacity>
        </TouchableOpacity>

        <View className='mt-5'>
          <Text className='text-textColor text-[16px] leading-4 font-regular'>End date*</Text>
        </View>

        <TouchableOpacity onPress={showEndDatePicker} className='flex flex-row mt-3 w-full py-3 px-4 justify-between items-center rounded-lg' style={{ backgroundColor: Colors.fieldGrayColor }}>
          <Text className={`${errorMessage == '' ? 'text-fieldTextColor' : 'text-errorColor'} text-fieldTextColor`}>{endDate1}</Text>
          <TouchableOpacity onPress={showEndDatePicker}>
            <FastImage source={Icons.IcCalendar} tintColor={Colors.bottomInactive} className='w-6 h-6' resizeMode='contain' />
          </TouchableOpacity>
        </TouchableOpacity>
        {
          endDateError == '' ?
            null
            :
            <View className='ml-1'>
              <Text className='text-errorColor text-[10px] font-InterRegular font-normal tracking-[0.44px]'>{endDateError}</Text>
            </View>
        }

        {
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
          endDatePicker &&
          <DateTimePicker
            value={date}
            mode={'date'}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            is24Hour={true}
            onChange={onEndDateSelected}
          />
        }
        {/* {
          timePicker &&
          <DateTimePicker
            value={date}
            mode={'time'}
            display={'clock'}
            is24Hour={false}
            onChange={onTimeSelected}
          />
        } */}

        {/* <View className='w-full mt-7 h-[1px]' style={{ backgroundColor: Colors.fieldGrayColor }}></View> */}
        <View className='mt-4 flex flex-row'>
          <Text className='text-textColor text-[16px] leading-4 font-regular'>Hours*</Text>
        </View>
        <TextInput
          className='flex flex-row mt-3 w-full px-4 rounded-lg justify-start items-start bg-fieldGrayColor text-textColor'
          value={hours}
          placeholder='Enter minutes'
          placeholderTextColor={Colors.greyBorder}
          onChangeText={(e) => { setHours(e) }}
          keyboardType='number-pad'
        />

        <View className='mt-4 flex flex-row'>
          <Text className='text-textColor text-[16px] leading-4 font-regular'>Minutes*</Text>
        </View>
        <TextInput
          className='flex flex-row mt-3 w-full px-4 rounded-lg justify-start items-start bg-fieldGrayColor text-textColor'
          value={minute}
          placeholder='Enter minutes'
          placeholderTextColor={Colors.greyBorder}
          onChangeText={(e) => { setMinutes(e) }}
          keyboardType='number-pad'
        />
        {
          errorMessage == '' ?
            null
            :
            <View className='ml-1'>
              <Text className='text-errorColor text-[10px] font-InterRegular font-normal tracking-[0.44px]'>{errorMessage}</Text>
            </View>
        }

        {/* <TouchableOpacity onPress={showTimePicker} className='flex flex-row mt-3 w-full py-3 px-4 justify-between items-center rounded-lg' style={{ backgroundColor: Colors.fieldGrayColor }}>
          <Text className='text-fieldTextColor'>{time}</Text>
          <TouchableOpacity onPress={showTimePicker}>
            <FastImage source={Icons.IcTime} tintColor={Colors.bottomInactive} className='w-6 h-6' resizeMode='contain' />
          </TouchableOpacity>
        </TouchableOpacity> */}
        {/* <View className='w-full mt-7 h-[1px]' style={{ backgroundColor: Colors.fieldGrayColor }}></View> */}

        <View className='mt-4'>
          <Text className='text-textColor text-[16px] leading-4 font-regular'>Description*</Text>
        </View>

        {/* <View className='flex flex-row mt-3 w-full py-5 rounded-lg justify-start items-start' style={{ backgroundColor: Colors.fieldGrayColor }}> */}
        <TextInput
          className='flex flex-row mt-3 w-full px-4 rounded-lg justify-start items-start bg-fieldGrayColor text-textColor'
          value={description}
          placeholder='How did you spend your time on the TruLeague platform?'
          placeholderTextColor={Colors.greyBorder}
          onChangeText={(e) => { setDescription(e) }}
          multiline={true}
        />
        {/* </View> */}

        <View className='mt-4 pb-5'>
          {
            loader ?
              <ActivityIndicator size={'large'} color={primaryColor} />
              :
              startDate1 === 'mm/dd/yyyy' || endDate1 === 'mm/dd/yyyy' || hours === 'Enter hours' || minute === 'Enter minute' || description === '' ?
                <TouchableOpacity
                  className='flex px-4 py-4 justify-center items-center rounded-lg opacity-40' style={{ backgroundColor: primaryColor }}>
                  <Text className='text-whiteColor text-[16px] font-regular'>Book Time</Text>
                </TouchableOpacity>
                :
                <TouchableOpacity
                  onPress={addTimeSheet}
                  className='flex px-4 py-4 justify-center items-center rounded-lg' style={{ backgroundColor: primaryColor }}>
                  <Text className='text-whiteColor text-[16px] font-regular'>Book Time</Text>
                </TouchableOpacity>
          }
        </View>
      </ScrollView>
    </View>
  )
}

export default Timesheet