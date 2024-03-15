import { StyleSheet } from 'react-native';
import theme from '../../../resources/theme';
import { Colors } from '../../../../../../common/Colors';
import { Fonts } from '../../../../../../common/Fonts';
export default StyleSheet.create({
  containerStyle: {
    flexDirection: 'row',
    marginTop: 5,
  },
  msgTimestampStyle: {
    fontSize: 11,
    fontFamily:Fonts.InterRegular,
    // fontWeight: '500',
    color: Colors.textColor,
    textTransform: 'uppercase',
  },
  tickImageStyle: {
    marginLeft: 3,
    width: 14,
    height: 10,
  },
});
