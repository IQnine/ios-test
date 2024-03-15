import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, BackHandler, RefreshControl, Dimensions, PermissionsAndroid, SafeAreaView } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import FastImage from 'react-native-fast-image'
import { Icons } from '../../../../assets/Images'
import Header from '../../header/Header'
import { useDispatch, useSelector } from 'react-redux';
import { Utils } from '../../../../common/Utils'
import * as ScheduleServices from '../../../../services/prospect/scheduler/SchedulerServices';
import * as AmbassadorsServices from '../../../../services/prospect/ambassadors/AmbassadorsServices';
import * as InstituteServices from '../../../../services/prospect/institutes/InstituteServices';
import moment from 'moment'
import { useIsFocused } from '@react-navigation/native';
import CustomModal from '../../../../components/CustomModal'
import AmbassadorList from '../../../../components/AmbassadorList'
import { setResetInstitute } from '../../../../redux/action/ResetInstituteAction'
import { setUpcomingData } from '../../../../redux/action/SchedularData'

type AmbassadorData = {
  id: number,
  current_status: string,
  last_active: any,
  additional: any,
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
    Program: any,
  }
}

const Ambassadors = React.memo((props: any) => {
  const filterValue = useSelector((state: any) => {
    return state.FilterStateReducer?.filterValue
  })
  const isFocus = useIsFocused();
  const [collegeId, setCollegeId] = useState(Number);
  const [isLoading, setIsLoading] = useState(false);
  const [AmbassadorsList, setAmbassadorsList] = useState<AmbassadorData[]>([]);
  const [StateMajor, setStateMajor] = useState<any>([]);
  const [stateData, setStateData] = useState<Array<any>>([]);
  const [nationalityData, setnationalityData] = useState<Array<any>>([]);
  const [prospectChatUid, setProspectChatUid] = useState();
  const [prospectId, setProspectId] = useState(Number);
  const [filterLength, setFilterLength] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [AwesomeModal, setAwesomeModal] = useState(false);

  const dispatch = useDispatch();
  const flatListRef = useRef<FlatList>(null);

  const instituteInfo = useSelector((state: any) => {
    return state.instituteInfoReducer?.instituteInfo
  })
  const resetInstitute = useSelector((state: any) => {
    return state.resetInstitute?.resetInstitute
  })
  const primaryColor = instituteInfo?.college_data[0]?.font_color;

  const timeZone = moment.tz.guess();

  useEffect(() => {
    if (isFocus) {
      // method_call();
    }
    requestNotificationPermission();
  }, [isFocus])

  useEffect(() => {
    getCollegeId();
    method_call();
  }, [resetInstitute])

  useEffect(() => {
    on_filter_change(instituteInfo.college_data[0]?.no_flag == 0 ? filterValue.nationality : filterValue.state, filterValue.userType, filterValue.major)
  }, [filterValue])

  useEffect(() => {
    getUpcomingScheduleList()
  }, [])

  const closeModal = () => {
    setAwesomeModal(false)
  }

  const method_call = async () => {
    let c_id = await Utils.getData('collegeId');
    if (collegeId !== c_id) {
      getAmbassadorsList();
      getCollegeId();
      getUpcomingScheduleList();
    }
  }

  useEffect(() => {
    if (!props.navigation.canGoBack()) {
      const backAction = () => {
        setAwesomeModal(true)
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }
  }, [props.navigation.canGoBack()]);


  const requestNotificationPermission = async () => {
    try {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      ]
      );
    } catch (err) {
      console.warn(err);
    }
  };

  const on_filter_change = async (state_id: number, user_type: number, program_id: number) => {
    getAmbassadorsList();
    getUpcomingScheduleList()
    if (state_id > 0 && program_id > 0 && user_type > 0) {
      setFilterLength(3);
    } else if (state_id > 0 && program_id > 0) {
      setFilterLength(2)
    } else if (state_id > 0 && user_type > 0) {
      setFilterLength(2)
    } else if (program_id > 0 && user_type > 0) {
      setFilterLength(2)
    } else if (state_id > 0) {
      setFilterLength(1)
    } else if (program_id > 0) {
      setFilterLength(1)
    } else if (user_type > 0) {
      setFilterLength(1)
    } else {
      setFilterLength(0)
    }

  }

  const getCollegeId = async () => {
    let c = await Utils.getData('collegeId');
    let p = await Utils.getData('prospect_cometchat_uid')
    let p_id = await Utils.getData('prospect_userId');
    setCollegeId(c);
    setProspectChatUid(p);
    setProspectId(p_id);
  }

  const onRefresh = () => {
    setRefreshing(true);
    getAmbassadorsList();
    setRefreshing(false);
  };

  const getUpcomingScheduleList = async () => {
    setIsLoading(true);
    let type = 2
    try {
      await ScheduleServices.get_schedules(type, timeZone).then((res: any) => {
        if (res.statusCode == 200) {
          dispatch(setUpcomingData(res.data))
        }
      })
    }
    catch (error) {
      console.log("getUpcomingScheduleList erorr:", error);
    }
    dispatch(setResetInstitute(false))
  }

  const getAmbassadorsList = async () => {
    setIsLoading(true);
    let college_id = await Utils.getData('collegeId')
    let send_data = {
      user_type: filterValue.userType,
      page_no: 1,
      nationality_id: filterValue.nationality,
      state_id: filterValue.state,
      program_id: filterValue.major,
      college_id: college_id,
      userTz: timeZone
    }
    try {
      await AmbassadorsServices.get_ambassadors(send_data).then((res: any) => {
        if (res.statusCode == 200) {
          setAmbassadorsList(res.data?.rows);
          let list = res.data?.rows
          let major = [...new Set(list?.map((o: AmbassadorData) => o.user_detail.Program.name))]
          setStateMajor((major as any[]).filter(Boolean))
          if (instituteInfo.college_data[0]?.no_flag == 0) {
            let nationality = [...new Set(list?.map((o: AmbassadorData) => o.additional?.find((t: any) => t.attribute_name == 'nationality')?.attribute_value))]
            setnationalityData((nationality as any[]).filter(Boolean))
          }
          else {
            let states = [...new Set(list?.map((o: AmbassadorData) => o.additional?.find((t: any) => t.attribute_name == 'state')?.attribute_value))]
            setStateData((states as any[]).filter(Boolean))
          }
          setIsLoading(false)
        } else {
          setIsLoading(false);
          console.log("error-----------res>", res.message);
        }
      })
    } catch (error) {
      console.log(error);
      setIsLoading(false)
    }

    dispatch(setResetInstitute(false))
  }

  const onYesClick = () => {
    BackHandler.exitApp();
    closeModal()
  }
  const screenHeight = Dimensions.get('window').height

  return (
    <View className='flex flex-1 bg-fieldGrayColor'>
      <Header navigation={props.navigation} collegeInfo={instituteInfo} />
      <View className='flex flex-row justify-between items-center bg-whiteColor px-4 h-[65px] w-full'>
        <View className='flex flex-row items-center rounded-[4px] '>
          <TouchableOpacity onPress={() => flatListRef?.current?.scrollToIndex({ animated: true, index: 0 })} >
            <Text className='text-textColor text-[20px] font-Helvetica '>Ambassadors</Text>
          </TouchableOpacity>
          <View className='bg-greyColor25 px-1.5 py-[2px]  justify-center ml-2 items-center rounded-[4px] font-normal'>
            <Text className='text-textColor text-[14px] font-medium font-Helvetica tracking-[0.44px]'>{AmbassadorsList?.length == undefined ? '00' : AmbassadorsList?.length < 10 ? '0' + AmbassadorsList?.length : AmbassadorsList?.length}</Text>
          </View>
        </View>
        <TouchableOpacity className={`flex flex-row justify-between p-1 items-center border-[1px] rounded-[4px]`} style={{ borderColor: primaryColor }}
          onPress={() => {
            props.navigation.navigate('Filter',
              {
                nationalityList: { nationalityData },
                majorlist: { StateMajor },
                stateList: { stateData }
              })
          }}>
          <FastImage source={Icons.IcFilter} resizeMode='contain' className='w-[25px] h-[25px] mb-[1px] mx-1' tintColor={primaryColor} />
          <Text className={`font-medium text-[16px] font-Helvetica mr-1 `} style={{ color: primaryColor }}>{filterLength == 0 ? 'Filter' : 'Filter ' + `(${filterLength})`}</Text>
        </TouchableOpacity>
      </View>
      {
        isLoading ?
          <View className='flex flex-1 justify-center items-center'>
            <ActivityIndicator size={'large'} color={primaryColor} className='' />
          </View>
          :
          AmbassadorsList?.length > 0 ?
            <SafeAreaView className='flex flex-1 '>
              {
                AwesomeModal ?
                  <CustomModal title={'Are you leaving?'} closeModal={closeModal} no={'Cancel'} yes={"Exit"} message={'Are you sure, you want to exit?'} AwesomeModal={AwesomeModal} onYesClick={onYesClick} setAwesomeModal={setAwesomeModal} />
                  : null
              }
              <View className='justify-center px-3'>
                <FlatList
                  // className='' 
                  // style={{ marginBottom: screenHeight > 740 ? ScreenHeight * 20 / 115 : ScreenHeight * 2 / 10 }}
                  style={{ height: screenHeight - 215 }}
                  showsVerticalScrollIndicator={false}
                  data={AmbassadorsList}
                  decelerationRate={.942}
                  initialNumToRender={15}
                  maxToRenderPerBatch={8}
                  ref={flatListRef}
                  renderItem={({ item, index }) => {
                    return (
                      <AmbassadorList
                        key={index}
                        item={item}
                        index={index}
                        primaryColor={primaryColor}
                        navigation={props.navigation}
                        prospectChatUid={prospectChatUid}
                        prospectId={prospectId}
                      />
                    )
                  }}
                  keyExtractor={(item: any) => item.id.toString()}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />}
                />
              </View>

            </SafeAreaView>
            :
            <View className='flex flex-1 justify-center items-center px-2 w-[100%]'>
              <View className='w-[90%]'>
                <Text className='text-greyColor text-xl text-center font-medium'>{filterLength > 0 ? "No ambassadors match selected criteria." : "No ambassadors have been onboarded yet."}</Text>
              </View>
            </View>
      }
    </View>
  )
})

export default Ambassadors