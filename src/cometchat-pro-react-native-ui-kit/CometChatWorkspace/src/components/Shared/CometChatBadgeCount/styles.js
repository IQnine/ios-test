import { StyleSheet } from 'react-native';
import { Fonts } from '../../../../../../common/Fonts';

export default StyleSheet.create({
  badgeStyle: {
    aspectRatio: 1,
    height: 22,
    borderRadius: 900,
    marginLeft: 4,
    marginRight: 2,
    opacity: 1,
    justifyContent: 'center',
  },
  textStyle: {
    fontSize: 11,
    overflow: 'hidden',
    textAlign: 'center',
    fontWeight: '400',
    opacity: 1,
    fontFamily:Fonts.InterRegular
  },
});
