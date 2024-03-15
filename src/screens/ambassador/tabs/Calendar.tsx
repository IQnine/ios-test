import { View, Text, StatusBar, Dimensions, TouchableOpacity, useWindowDimensions, BackHandler } from 'react-native'
import React, { useState, useEffect } from 'react'
import FastImage from 'react-native-fast-image';
import { Icons } from '../../../assets/Images';
import { Colors } from '../../../common/Colors'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Availablity from '../calendar/Availablity';
import Schedules from '../calendar/Schedules';
import Timesheet from '../calendar/Timesheet';
import AmbassadorHeader from '../header/AmbassadorHeader';
import { useSelector } from 'react-redux';
import * as InstituteServices from '../../../services/prospect/institutes/InstituteServices';
import { Utils } from '../../../common/Utils';
import { useIsFocused } from '@react-navigation/native';
import CustomModal from '../../../components/CustomModal';
const screenHeight = Dimensions.get('screen').height
const screenWidth = Dimensions.get('screen').width



const Calendar = (props: any) => {
  const layout = useWindowDimensions();
  const isFocused = useIsFocused();
  const [index, setIndex] = React.useState(0);
  const [isTimeSheet, setIsTimeSheet] = useState(false);
  const [AwesomeModal, setAwesomeModal] = useState(false)

  // useEffect(() => {
  //   if (!props.navigation.canGoBack() || props.navigation.canGoBack()) {
  //     const backAction = () => {
  //       setAwesomeModal(true)
  //       return true;
  //     };
  //     const backHandler = BackHandler.addEventListener(
  //       'hardwareBackPress',
  //       backAction,
  //     );
  //     return () => backHandler.remove();
  //   }
  // }, [props.navigation.canGoBack()]);

  const onYesClick = () => {
    BackHandler.exitApp();
    setAwesomeModal(false);
  }

  const closeModal = () => {
    setAwesomeModal(false);
  }

  const [routes] = React.useState([
    { key: 'availability', title: 'Availability' },
    { key: 'schedules', title: 'Schedules' },
    { key: 'timesheet', title: 'Time Sheet' },
  ]);
  const [routes1] = React.useState([
    { key: 'availability', title: 'Availability' },
    { key: 'schedules', title: 'Schedules' },
  ]);
  const instituteInfo = useSelector((state: any) => {
    return state.instituteInfoReducer?.instituteInfo
  })
  const primaryColor = instituteInfo.college_data[0].font_color;

  useEffect(() => {
    getCollegeById();
  }, [isFocused])

  const getCollegeById = async () => {
    let collegeId = await Utils.getData('ambassador_college_id');
    try {
      let response: any = await InstituteServices.get_colleges_by_id(collegeId);
      if (response.statusCode == 200) {
        if (response.data[0]?.timesheet_enabled == 1) {
          setIsTimeSheet(true)
        } else {
          setIsTimeSheet(false)
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  const AvailabilityRoute = () => (
    <Availablity navigation={props.navigation} />
  );

  const SchedulesRoute = () => (
    <Schedules navigation={props.navigation} />
  );
  const TimesheetRoute = () => (
    <Timesheet navigation={props.navigation} />
  );
  const renderScene = SceneMap({
    availability: AvailabilityRoute,
    schedules: SchedulesRoute,
    timesheet: TimesheetRoute
  });
  const renderScene1 = SceneMap({
    availability: AvailabilityRoute,
    schedules: SchedulesRoute
  });

  function getScene(): any {
    if (isTimeSheet)
      return renderScene
    else
      return renderScene1
  }

  return (
    <View className='flex flex-1 bg-bgGrayColor'>
      <AmbassadorHeader navigation={props.navigation} />
      <TabView
        navigationState={{ index, routes: isTimeSheet ? routes : routes1 }}
        renderScene={getScene()}
        onIndexChange={setIndex}
        renderTabBar={props => <TabBar {...props}
          activeColor={primaryColor}
          inactiveColor={Colors.bottomInactive}
          indicatorContainerStyle={{
            backgroundColor: Colors.white
          }}
          indicatorStyle={{ backgroundColor: primaryColor }}
          renderLabel={({ route, focused, color }) => (
            focused ?
              <Text className='text-inActiveColor text-[16px]  font-Helvetica leading-4 tracking-[0.20px]'>
                {route.title}
              </Text>
              :
              <Text className='text-greyBorder text-[16px]  font-Helvetica leading-4 tracking-[0.20px]' >
                {route.title}
              </Text>
          )}
          style={{}}
        />

        }
        initialLayout={{ width: layout.width, }}
        style={{}}
      />
      {
        AwesomeModal ?
          <CustomModal closeModal={closeModal} yes={"Exit"} no={'Cancel'} title={'Are you Leaving?'} message={'Are you sure,you really want to exit?'} AwesomeModal={AwesomeModal} onYesClick={onYesClick} setAwesomeModal={setAwesomeModal} />
          : null
      }
    </View>
  )
}

export default Calendar