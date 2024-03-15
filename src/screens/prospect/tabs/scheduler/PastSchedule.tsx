import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, BackHandler, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as ScheduleServices from '../../../../services/prospect/scheduler/SchedulerServices';
import FastImage from 'react-native-fast-image';
import { Images } from '../../../../assets/Images';
// import { Colors } from '../../../../common/Colors';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { setPastProspectData } from '../../../../redux/action/SchedularData';
import { useIsFocused } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import { setResetInstitute } from '../../../../redux/action/ResetInstituteAction';

// type AmbassadorDataList = {
//   id: number,
//   status: string,
//   schedule: {
//     time: string,
//     schedule_date: string
//   },
//   schedule_user_for_mentor: {
//     user_detail: {
//       profile_image: any,
//       first_name: any,
//       nationality: {
//         id: number,
//         nationality: string,
//         alpha_2_code: string
//       },
//       country: {
//         id: number,
//         name: string,
//         sortname: string
//       },
//       program: {
//         id: number,
//         name: string,
//       },
//     }
//   },
//   additionalFields: {
//     nationality: string,
//     languages: [{
//       id: number,
//       name: string,
//       short_code: string
//     }],
//     date_of_birth: string,
//     hobbies_and_interests: string,
//     pronouns: string
//   }
// }

const PastSchedule = (props: any) => {
  const isFocused = useIsFocused();
  const [isloading, setIsLoading] = useState(false);
  const [pastList, setPastList] = useState<any[]>([]);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const timeZone = moment.tz.guess();

  const instituteInfo = useSelector((state: any) => {
    return state.instituteInfoReducer?.instituteInfo
  })
  const primaryColor = instituteInfo.college_data[0].font_color;

  const PAST_DATA = useSelector((state: any) => {
    return state.upcomingDataReducer?.pastProspectData
  })
  const resetInstitute = useSelector((state: any) => {
    return state.resetInstitute?.resetInstitute
  })

  useEffect(() => {
    if (isFocused || resetInstitute) {
      if (PAST_DATA?.length <= 0) {
        getPastScheduleList();
      }
    }
  }, [isFocused, resetInstitute])

  const getPastScheduleList = async () => {
    setIsLoading(true);
    let type = 1

    try {
      await ScheduleServices.get_schedules(type, timeZone).then((res: any) => {
        if (res.statusCode == 200) {
          setPastList(res.data)
          dispatch(setPastProspectData(res.data))
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      })
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
    dispatch(setResetInstitute(false))
  }
  const onRefresh = () => {
    setRefreshing(true);
    getPastScheduleList();
    setRefreshing(false);
  }

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

  const stringValue = (myProps: any) => {
    if (myProps.length) {
      let data = myProps?.map((e: any) => {
        return e.name
      })
      return String(data);
    }
  }
  const AdditionalValues = (additinalProps: any) => {
    return (
      <View className='flex flex-col'>
        <View className='flex flex-row items-center ml-3'>
          {
            additinalProps.svg ?
              <SvgXml xml={(additinalProps.svg.replace(/fill="#A52238"/g, `fill="${primaryColor}"`))} width="12px" height="12px" />
              : <View className='w-[14px] h-[14px] rounded-full flex justify-center items-center' style={{ backgroundColor: primaryColor }}>
                <View className='w-[5px] h-[5px] rounded-full bg-whiteColor'></View>
              </View>
          }
          <Text numberOfLines={1} className='w-[80%] text-textColor text-[12px] leading-5 tracking-[0.44px]  ml-2 font-InterRegular'>{additinalProps.subtitle}</Text>
        </View>
        <View className='ml-4'>
          {/* <Text className='text-textColor text-[12px] ml-1 leading-5 tracking-[0.44px] font-InterRegular font-normal'>{additinalProps.subtitle + " "}</Text> */}
        </View>
      </View>
    )
  }

  const momentFormatDate = (date: any): String => {
    const datee = moment(date, "DD MMMM YYYY, HH:mm A").fromNow();
    return datee;
  }

  const renderAmbassadorsList = ({ item }: { item: any, index: number }) => {
    return (
      <TouchableOpacity
        onPress={() => { props.navigation.navigate('CometChatUserProfile', { cometchat_uid: item.schedule_user_for_mentor.cometchat_uid }) }}
        className='flex bg-whiteColor rounded-[4px] mb-6 mx-1' style={{ elevation: 3 }}>
        <View className='flex flex-row px-4 py-3 rounded-[6px] items-center'>
          <View className='w-[130px] h-[135px] rounded-[6px]'>
            <FastImage source={{ uri: item.schedule_user_for_mentor?.user_detail?.profile_image }} resizeMode='cover' className='w-full h-full rounded-[6px] relative' />
            <View className='bg-blackColor50 w-full h-6 absolute bottom-0 rounded-none flex justify-center items-center flex-row'>
              <View className={`w-2 h-2 rounded-full ${item.last_active === 'online' ? 'bg-onlineColor' : item.last_active === 'offline' ? null : 'bg-offlineColor'} mt-[1px]`}></View>
              {
                item.last_active === 'online' || item.last_active === 'offline' ?
                  <Text className='text-whiteColor text-[9px] leading-5 tracking-[0.44px] ml-1 font-InterRegular font-normal'>
                    {item.last_active === 'online' ? 'Online' : ''}
                  </Text>
                  :
                  <Text className='text-whiteColor text-[9px] leading-5 tracking-[0.44px] ml-1 font-InterRegular font-normal'>
                    {momentFormatDate(item.last_active)}
                  </Text>
              }
            </View>
          </View>

          <View className='flex flex-col justify-start w-[70%] '>
            <View className='flex flex-row items-center w-[80%] ml-3 mb-2'>
              <View className='flex-shrink'>
                <Text numberOfLines={1} className='text-textColor text-[19px] font-HelveticaBold tracking-[0.15px]'>{item?.schedule_user_for_mentor?.user_detail?.first_name.split(' ')[0]}</Text>
              </View>
            </View>
            {
              item.additionalFields.map((data: any, i: any) => {
                if (data.field_key === 'languages') {
                  return (<AdditionalValues key={i} svg={data.field_svg} title={data.field_label} subtitle={data.attribute_value == null ? '' : stringValue(data.attribute_value)} />)
                } if (data.field_key === 'profile_picture' || data.field_key === 'program_of_interest' || data.field_key == 'pronouns') {
                  return null
                } if (data.field_key === 'nationality' || data.field_key === 'state' || data.field_key === 'industry') {
                  return (<AdditionalValues key={i} svg={data.field_svg} title={data.field_label} subtitle={data.attribute_value == null ? '' : (data.attribute_value.name)} />)
                }
                else {
                  return (<AdditionalValues key={i} svg={data.field_svg} title={data.field_label} subtitle={data.attribute_value == null ? '' : data.field_key === 'application_stage' ? data.attribute_value.application_name : data.attribute_value} />)
                }
              })
            }
          </View>
        </View>

        {/* <View className='w-full h-[1px] bg-fieldGrayColor mt-2'></View> */}
      </TouchableOpacity>
    )
  }

  return (
    <View className='flex flex-1 bg-bgGrayColor px-3  '>
      {
        // isloading ?
        //   <View className='flex flex-1 justify-center items-center'>
        //     <ActivityIndicator size={'large'} color={primaryColor} />
        //   </View>
        //   :
        PAST_DATA.length > 0 ?
          <View className=''>
            <FlatList
              className='pt-5'
              showsVerticalScrollIndicator={false}
              data={PAST_DATA}
              renderItem={renderAmbassadorsList}
              keyExtractor={(item: any) => item.id}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
            />
          </View>
          :
          <View>
            <View className='mt-20 flex justify-center items-center flex-auto'>
              <FastImage source={Images.emptyscheduler} resizeMode='cover' className='w-[100px] h-[100px]' />
              <Text className='text-greyBorder text-xl font-bold leading-5 tracking-[0.15px] text-center mt-5'>You don’t have any past schedules</Text>
            </View>
          </View>
      }
    </View>
  )
}

export default PastSchedule