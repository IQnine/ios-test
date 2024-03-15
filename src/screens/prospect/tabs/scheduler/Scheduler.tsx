import { View, Text, useWindowDimensions, BackHandler, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../../header/Header'
import UpcomingSchedule from './UpcomingSchedule';
import PastSchedule from './PastSchedule';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Colors } from '../../../../common/Colors';
import { useSelector } from 'react-redux';
import CustomModal from '../../../../components/CustomModal';

const Scheduler = (props: any) => {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [AwesomeModal, setAwesomeModal] = useState(false);

  const instituteInfo = useSelector((state: any) => {
    return state.instituteInfoReducer?.instituteInfo
  })
  
  let primaryColor = instituteInfo.college_data[0].font_color;
 

  const [routes] = React.useState([
    { key: 'upcoming_schedules', title: 'Upcoming_Schedules' },
    { key: 'past_schedule', title: 'Past_Schedules' }
  ]);

  const UpcomingRoute = () => (
    <UpcomingSchedule navigation={props.navigation} primaryColor={primaryColor} />
  );

  const PastRoute = () => (
    <PastSchedule navigation={props.navigation} />
  );
  const renderScene = SceneMap({
    upcoming_schedules: UpcomingRoute,
    past_schedule: PastRoute,
  });

  const closeModal= () => {
    setAwesomeModal(false)
  }

  const onYesClick = () => {
    BackHandler.exitApp();
    closeModal()
  }

  return (
    <View className='flex flex-1 bg-bgGrayColor'>
      <Header navigation={props.navigation} collegeInfo={instituteInfo} />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
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
              <View className='flex flex-row'>
                <Text className='text-textColor font-Helvetica text-[17px] leading-5 font-normal '>
                  {route.title.split('_')[0]}
                </Text>

                <Text className='text-textColor text-[17px] font-Helvetica leading-5 font-normal ml-1 '>
                  {route.title.split('_')[1]}
                </Text>
              </View>
              :
              <View className='flex flex-row'>
                <Text className='text-greyBorder text-[16px] font-Helvetica leading-5 font-normal'>
                  {route.title.split('_')[0]}
                </Text>

                <Text className='text-greyBorder leading-5 text-[16px] font-Helvetica font-normal ml-1 '>
                  {route.title.split('_')[1]}
                </Text>
              </View>
          )}
          style={{ width: layout.width, }}
        />

        }
        initialLayout={{ width: layout.width }}
      />
      {
        AwesomeModal ?
          <CustomModal title={'Are you leaving?'} closeModal={closeModal} no={'Cancel'}  yes={"Exit"} message={'Are you sure, you want to exit?'} AwesomeModal={AwesomeModal} onYesClick={onYesClick} setAwesomeModal={setAwesomeModal} />
          : null
      }
    </View>
  )
}

export default Scheduler