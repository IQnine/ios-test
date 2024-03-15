import React from 'react';
import { View, Modal, Image, TouchableOpacity, Dimensions, TouchableWithoutFeedback, Text } from 'react-native';
import style from './styles';
import { get as _get } from 'lodash';
// import BottomSheet from 'reanimated-bottom-sheet';
import BottomSheet from '@gorhom/bottom-sheet';
import { Icons } from '../../../../../../assets/Images';
import { Colors } from '../../../../../../common/Colors';
import FastImage from 'react-native-fast-image';
import { Utils } from '../../../../../../common/Utils';

const cross = require('./resources/clear.png');

class CometChatImageViewer extends React.Component {
  primaryColor = ''
  constructor(props) {
    super(props);
    this.sheetRef = React.createRef(null);
    this.bottomSheetRef = React.useRef < BottomSheet > (null);
  }

  componentDidMount() {
    this.getColor();
  }
  getColor = async () => {
    let c = await Utils.getData('primaryColor');
    this.primaryColor = c
  }

  render() {
    return (
      // <Modal
      //   transparent
      //   animated
      //   animationType="fade"
      //   visible={this.props.open}
      //   onRequestClose={() => {
      //     this.sheetRef.current.snapTo(1);
      //     this.props.close();
      //   }} >
      //   <TouchableOpacity
      //     onPress={() => this.props.close()}
      //     style={style.outerContainer}>
      //     <BottomSheet
      //       ref={this.sheetRef}
      //       enablePanDownToClose={true}
      //       snapPoints={['25%', '100%']}
      //       borderRadius={30}
      //       index={1}
      //       // snapPoints={[Dimensions.get('window').height - 80, 0]}
      //       // borderRadius={30}
      //       // initialSnap={0}
      //       // enabledInnerScrolling={false}
      //       // enabledContentTapInteraction={false}
      //       // overdragResistanceFactor={10}
      //       // renderContent={() => {
      //       //   return (
      //       //     <TouchableWithoutFeedback>
      //       //       <View style={style.bottomSheetContainer}>
      //       //         <TouchableOpacity
      //       //           style={style.crossImgContainer}
      //       //           onPress={this.props.close}>
      //       //           <Image
      //       //             source={cross}
      //       //             style={style.crossImg}
      //       //             resizeMode="contain"
      //       //           />
      //       //         </TouchableOpacity>
      //       //         <View style={style.outerImageContainer}>
      //       //           <View style={[style.mainContainer]}>
      //       //             <Image
      //       //               source={{
      //       //                 uri: _get(this.props, 'message.data.url', ''),
      //       //               }}
      //       //               resizeMode="contain"
      //       //               style={style.imageStyles}
      //       //             />
      //       //           </View>
      //       //         </View>
      //       //       </View>
      //       //     </TouchableWithoutFeedback>
      //       //   );
      //       // }}
      //       onCloseEnd={() => {
      //         this.props.close();
      //       }}
      //     >
      //       <TouchableWithoutFeedback>
      //         <View style={style.bottomSheetContainer}>
      //           <TouchableOpacity
      //             style={style.crossImgContainer}
      //             onPress={this.props.close}>
      //             <Image
      //               source={cross}
      //               style={style.crossImg}
      //               resizeMode="contain"
      //             />
      //           </TouchableOpacity>
      //           <View style={style.outerImageContainer}>
      //             <View style={[style.mainContainer]}>
      //               <Image
      //                 source={{
      //                   uri: _get(this.props, 'message.data.url', ''),
      //                 }}
      //                 resizeMode="contain"
      //                 style={style.imageStyles}
      //               />
      //             </View>
      //           </View>
      //         </View>
      //       </TouchableWithoutFeedback>
      //     </BottomSheet>
      //   </TouchableOpacity>
      // </Modal>
      <TouchableWithoutFeedback>
        <View style={style.bottomSheetContainer}>
          <View className='flex flex-row items-center py-5 px-4' style={{ backgroundColor: this.props.color }}>
            <TouchableOpacity
              style={style.crossImgContainer}
              onPress={this.props.close}>
              <FastImage source={Icons.IcBackBtn} className='w-[25px] h-[35px]' tintColor={Colors.white} />
            </TouchableOpacity>
            <Text className='text-whiteColor text-[20px] font-Helvetica ml-2'>Shared items</Text>
          </View>
          <View style={style.outerImageContainer} className='bg-white'>
            <View style={[style.mainContainer]}>
              <Image
              className='w-full h-full bg-black'
                source={{
                  uri: _get(this.props, 'message.data.url', ''),
                }}
                resizeMode="contain"
                style={style.imageStyles}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
export default CometChatImageViewer;
