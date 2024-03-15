import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ToastAndroid, BackHandler, RefreshControl, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Icons, Images } from '../../../../assets/Images'
import FastImage from 'react-native-fast-image'
import { Utils } from '../../../../common/Utils'
import * as ScheduleServices from '../../../../services/prospect/scheduler/SchedulerServices';
import { Colors } from '../../../../common/Colors'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux';
import { CometChat } from '@cometchat-pro/react-native-chat'
import * as AmbassadorsServices from '../../../../services/prospect/ambassadors/AmbassadorsServices'
import { COMETCHAT_CONSTANTS } from '../../../../CONSTS'
import { useIsFocused } from '@react-navigation/native'
import moment from 'moment'
import { setUpcomingData, setUpcomingProspectData } from '../../../../redux/action/SchedularData'
import { SvgXml } from 'react-native-svg'
import { setResetInstitute } from '../../../../redux/action/ResetInstituteAction'

type AmbassadorData = {
  id: number,
  status: string,
  current_status: string,
  additional: [],
  user_type: number,
  about_me: string
  user_detail: {
    first_name: string,
    nationality: {
      id: number,
      nationality: string,
      alpha_2_code: string
    },
    country: {
      id: number,
      name: string,
      sortname: string
    },
    profile_image: any,
    Program: {
      id: number,
      name: string,
    },
  }
}

type AmbassadorDataList = {
  id: number,
  status: string,
  last_active: string,
  schedule: {
    time: string,
    schedule_date: string,
    start_time: any,
    end_time: any
  },
  schedule_user_for_mentor: {
    id: number,
    user_detail: {
      profile_image: any,
      first_name: any,
      nationality: {
        id: number,
        nationality: string,
        alpha_2_code: string
      },
      country: {
        id: number,
        name: string,
        sortname: string
      },
      program: {
        id: number,
        name: string,
      },
    }
  },
}

const UpcomingSchedule = (props: any) => {
  const isFocus = useIsFocused();
  const timeZone = moment.tz.guess();
  const [isloading, setIsLoading] = useState(false);
  const [upcomingList, setUpcomingList] = useState<any[]>([]);
  let dispatch = useDispatch()
  const [refreshing, setRefreshing] = useState(false);
  const [btnDisable, setBtnDisable] = useState(false);
  const [AmbassadorsList, setAmbassadorsList] = useState<AmbassadorData[]>([]);

  const instituteInfo = useSelector((state: any) => {
    return state.instituteInfoReducer?.instituteInfo
  })
  const primaryColor = instituteInfo.college_data[0].font_color;

  const UPCOMING_DATA: any[] = useSelector((state: any) => {
    return state.upcomingDataReducer?.upcomingProspectData
  })
  const resetInstitute = useSelector((state: any) => {
    return state.resetInstitute?.resetInstitute
  })
  const screenHeight = Dimensions.get('window').height
  const screenWidth = Dimensions.get('window').width

  useEffect(() => {
    if (isFocus || resetInstitute) {
      if (UPCOMING_DATA?.length <= 0) {
        getUpcomingScheduleList();
      }
    }
  }, [isFocus, resetInstitute])

  const onRefresh = () => {
    setRefreshing(true);
    getUpcomingScheduleList();
    setRefreshing(false);
  }

  const itemClicked = async (item: any) => {
    setBtnDisable(true)
    let p = await Utils.getData('prospect_cometchat_uid')
    let p_id = await Utils.getData('prospect_userId');
    let send_data = {
      prospect_uid: p as string,
      ambassador_uid: item.schedule_user_for_mentor.cometchat_uid,
      userId: p_id
    }
    let i = {
      cometchat_uid: item.schedule_user_for_mentor.cometchat_uid,
      user_detail: {
        first_name: item.schedule_user_for_mentor.user_detail.first_name,
        profile_image: item.schedule_user_for_mentor.user_detail.profile_image
      },
      current_status: item?.current_status ? item?.current_status : 'offline',
      last_active: item?.last_active ? item?.last_active : 'offline',
    }
    const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
    try {
      AmbassadorsServices.add_conversation_info(send_data).then((res: any) => {
        if (res.statusCode == 200) {
          CometChat.getLoggedinUser().then(
            user => {
              if (!user) {
                CometChat.login(p, authKey).then(
                  user => {
                    props.navigation.navigate('CometChatConversationListWithMessages', { item: i, type: 'user', loggedInUser: user })
                    setBtnDisable(false)
                  }, error => {
                    console.log("Login failed with exception:", { error });
                    setBtnDisable(false)
                  }
                );
              } else if (user) {
                props.navigation.navigate('CometChatConversationListWithMessages', { item: i, type: 'user', loggedInUser: user })
                setTimeout(() => {
                  setBtnDisable(false)
                }, 1000)
              }
            }, error => {
              console.log("Something went wrong", error);
              setBtnDisable(false)
            }
          );
        }

      })
    } catch (error) {
      console.log(error);
    }
  };

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

  const getUpcomingScheduleList = async () => {
    setIsLoading(true);
    let type = 2
    try {
      await ScheduleServices.get_schedules(type, timeZone).then((res: any) => {
        if (res.statusCode == 200) {
          if (res.data?.length <= 0) {
            getAmbassadorsList();
          } else {
            setUpcomingList(res.data)
            dispatch(setUpcomingProspectData(res.data))
            dispatch(setUpcomingData(res.data))
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }

      })
    }
    catch (error) {
      console.log("upcoming error: ", error);
      setIsLoading(false);
    }
    dispatch(setResetInstitute(false))
  }

  const getAmbassadorsList = async () => {
    setIsLoading(true);
    let college_id = await Utils.getData('collegeId')
    let send_data = {
      user_type: 0,
      page_no: 1,
      nationality_id: 0,
      state_id: 0,
      program_id: 0,
      college_id: college_id
    }
    try {
      await AmbassadorsServices.get_ambassadors(send_data).then((res: any) => {
        if (res.statusCode == 200) {
          setIsLoading(false)
          setAmbassadorsList(res.data?.rows);
        } else {
          setIsLoading(false);
          console.log("error----------->", res);
        }
      })
    } catch (error) {
      console.log("-------------->", error);
      setIsLoading(false)
    }
  }

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
        <View className='flex w-[80%] flex-row items-center ml-3 '>
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
      <View className='flex bg-whiteColor rounded-[4px] mb-5 ' style={{ elevation: 3 }}>
        <TouchableOpacity className='flex flex-row px-4 py-3 rounded-[6px] items-center ' onPress={() => { props.navigation.navigate('CometChatUserProfile', { cometchat_uid: item.schedule_user_for_mentor.cometchat_uid }) }}>
          <View className='w-[130px] h-[135px] rounded-[6px] mt-2 '>
            <FastImage source={{ uri: item?.schedule_user_for_mentor?.user_detail?.profile_image }} resizeMode='cover' className='w-full h-full rounded-[6px] relative' />
            <View className='bg-blackColor50 w-full h-6 absolute bottom-0 rounded-[4px] flex justify-center items-center flex-row'>
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
          <View className='flex flex-col justify-start w-[70%]'>
            <View className='flex flex-row items-center w-[80%] ml-3 mb-2'>
              <View className='flex-shrink'>
                <Text numberOfLines={1} className='text-textColor text-[19px] font-HelveticaBold tracking-[0.15px]'>{item?.schedule_user_for_mentor?.user_detail?.first_name.split(' ')[0]}</Text>
              </View>
            </View>
            {
              item.additionalFields.map((data: any, i: any) => {
                if (data.field_key === 'languages') {
                  return (<AdditionalValues key={i} svg={data.field_svg} title={data.field_label} subtitle={data.attribute_value == null ? '' : stringValue(data.attribute_value)} />)
                } if (data.field_key === 'profile_picture' || data.field_key === 'pronouns') {
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
        </TouchableOpacity>
        <View className='w-full h-[1px] bg-fieldGrayColor mt-2'></View>
        <View className='flex px-5 py-3'>
          <View className='flex flex-row items-center'>
            <View className='w-4 h-4'>
              <FastImage source={Icons.IcSchedule} resizeMode='contain' className='w-4 h-4' />
            </View>
            <View className='ml-1'>
              <Text className='text-greyBorder text-[12px] leading-5 tracking-[0.44px] font-InterSemiBold font-semibold'>Scheduled time slot</Text>
            </View>
          </View>
          <View className='flex flex-row ml-3 justify-items-start pt-1'>
            <View className='px-2'>
              <Text className='text-textColor text-[12px] font-InterRegular font-normal leading-5 tracking-[0.44px]'>Date: {moment(item?.schedule?.schedule_date).format('ll')}</Text>
            </View  >
            <View className='w-[1px] border-l-[1px] border-l-fieldGrayColor'></View>
            <View className='px-2 '>
              <Text className='text-textColor text-[12px] font-InterRegular font-normal leading-5 tracking-[0.44px]'>Time: {moment(item?.schedule?.start_time).format('hh:mm')} - {moment(item?.schedule?.end_time).format('hh:mm')}</Text>
            </View>
          </View>
        </View>
        <View className='w-full h-[1px] bg-fieldGrayColor mt-2'></View>
        <View className='flex flex-row justify-between items-center px-4 py-4 '>
          <TouchableOpacity className='flex justify-center items-center px-1 py-4 rounded-[4px] border-[1px] border-greyBorder w-[43%]' onPress={() => { props.navigation.navigate('ScheduleChat', { mentorId: item.schedule_user_for_mentor.id, profile_image: item.schedule_user_for_mentor.user_detail.profile_image, mentor_name: item.schedule_user_for_mentor.user_detail.first_name, primaryColor: primaryColor }) }}>
            <Text className='text-greyBorder font-InterMedium text-[14px] leading-5  tracking-[0.44px]'>Reschedule</Text>
          </TouchableOpacity>
          {
            btnDisable ?
              <TouchableOpacity className={`flex justify-center items-center px-1 py-4 rounded-[4px]  w-[53%] opacity-60 `} style={{ backgroundColor: primaryColor, borderWidth: 1, borderColor: primaryColor }}>
                <View className='w-full'>
                  <Text numberOfLines={1} className='text-white text-[14px] font-HelveticaBold tracking-[0.44px] leading-5 text-center'>Chat with {item?.schedule_user_for_mentor?.user_detail?.first_name.split(' ')[0]}</Text>
                </View>
              </TouchableOpacity>
              :
              <TouchableOpacity className={`flex justify-center items-center px-1 py-4 rounded-[4px]  w-[53%] `} style={{ backgroundColor: primaryColor, borderWidth: 1, borderColor: primaryColor }} onPress={() => { itemClicked(item) }}>
                <View className='w-full'>
                  <Text numberOfLines={1} className='text-white text-[14px] font-HelveticaBold tracking-[0.44px] leading-5 text-center'>Chat with {item?.schedule_user_for_mentor?.user_detail?.first_name.split(' ')[0]}</Text>
                </View>
              </TouchableOpacity>
          }
        </View>
      </View>
    )
  }

  const renderAmbassadors = ({ item }: { item: AmbassadorData }) => {
    return (
      <View className='flex w-[157px] h-[175px] bg-whiteColor rounded-[4px] my-5 mx-3' style={{ elevation: 3 }}>
        <View className='bg-greyColor50 w-full py-7 relative rounded-t-[4px]'>
          <TouchableOpacity onPress={(() => { props.navigation.navigate('ScheduleChat', { mentorId: item.id, profile_image: item.user_detail.profile_image, mentor_name: item.user_detail.first_name, primaryColor: primaryColor }) })} className='flex absolute w-20 h-20 rounded-full  border-whiteColor left-9 top-2 justify-center items-center bg-whiteColor'>
            <FastImage source={{ uri: item.user_detail?.profile_image }} resizeMode='cover' className='w-[70px] h-[70px] rounded-full' />
          </TouchableOpacity>
          <View className={`w-2 h-2 rounded-full ${item.current_status === 'available' ? 'bg-onlineColor' : 'bg-offlineColor'} absolute right-12 -bottom-5 mt-[1px]`}></View>
        </View>

        <View className='mt-10 flex justify-center items-center px-1'>
          <Text className='text-textColor font-bold text-[16px] leading-4' numberOfLines={1}>{item?.user_detail?.first_name}</Text>
        </View>

        <View className='mt-2 pb-2 flex justify-center items-center px-3'>
          <Text className='text-greyBorder font-InterRegular text-[12px] leading-5 text-center tracking-[0.44px]  ' numberOfLines={1} >
            {item.user_detail?.Program.name}
          </Text>
        </View>
      </View>
    )
  }


  return (
    <View className='flex flex-1 bg-bgGrayColor  '>
      {
        // isloading ?
        //   <View className='flex flex-1 justify-center items-center'>
        //     <ActivityIndicator size={'large'} color={props.primaryColor} />
        //   </View>
        //   :
        UPCOMING_DATA?.length > 0 ?
          <View className=' px-4'>
            <FlatList
              className='pt-5'
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
              showsVerticalScrollIndicator={false}
              data={UPCOMING_DATA}
              renderItem={renderAmbassadorsList}
              keyExtractor={(item: any) => item.id}
            />
          </View>
          :
          <>
            <View className='mt-20 flex justify-center items-center flex-auto'>
              <FastImage source={Images.emptyscheduler} resizeMode='cover' className='w-[100px] h-[100px]' />
              <Text className='text-greyBorder text-xl font-bold leading-5 tracking-[0.15px] text-center mt-5'>You don’t have any schedules yet</Text>
            </View>

            <View className='flex pb-5'>
              <Text className='text-greyBorder text-[16px] font-InterRegular text-center leading-4 tracking-[0.44px]'>
                Select an ambassador to book a chat
              </Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={AmbassadorsList}
                renderItem={renderAmbassadors}
                keyExtractor={(item: any) => item.id}
              />
            </View>
          </>
      }
    </View>
  )
}

export default UpcomingSchedule