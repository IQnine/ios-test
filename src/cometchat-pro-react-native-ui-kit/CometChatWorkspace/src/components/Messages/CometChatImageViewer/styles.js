import { StyleSheet, Platform } from 'react-native';
import {
  heightRatio,
  widthRatio,
  deviceHeight,
  deviceWidth,
} from '../../../utils/consts';
import { Colors } from '../../../../../../common/Colors';


export default StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  mainContainer: {
    marginVertical: Platform.OS === 'ios' ? 50 : 65,
    backgroundColor: 'black',
    marginHorizontal: 16 * widthRatio,
    borderRadius: 15,
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  bottomSheetContainer: {
    backgroundColor: Colors.black,
    // height: deviceHeight * 0.9,
    height:'100%'
  },
  crossImgContainer: {
    alignSelf: 'flex-start',
  },
  crossImg: {
    height: 30 * heightRatio,
    width: 30 * widthRatio,
  },
  outerImageContainer: {
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  imageStyles: {
    width: '100%',
    height: '80%' ,
  },
});
