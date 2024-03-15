import { StyleSheet } from 'react-native';
import theme from '../../../resources/theme';
import { widthRatio, heightRatio } from '../../../utils/consts';
import { Colors } from '../../../../../../common/Colors';
import { Fonts } from '../../../../../../common/Fonts';

export default StyleSheet.create({
  callMessageStyle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  callMessageTxtStyle: {
    alignSelf: 'center',
    fontSize: 12,
    fontWeight: '500',
    margin: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    height: 80,
    paddingRight: 12,
    elevation: 5,
    // backgroundColor:Colors.primaryColor,
    zIndex: 5,
    alignItems: 'center',
  },
  backButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 20,
    color: theme.color.blue,
  },
  headerDetailContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft:6
  },
  audioCallContainer: {
    paddingHorizontal: 8,
  },
  videoCallContainer: {
    paddingHorizontal: 0,
  },
  callIcon: {
    height: 28,
    width: 28,
  },
  videoIcon: { width: 34, height: 24, resizeMode: 'contain' },
  itemDetailContainer: {
    flex: 1,
  },
  itemNameText: {
    fontFamily:Fonts.InterMedium,
    fontSize: 18,
    fontWeight: '500',
    color:Colors.white
  },
  statusText: {
    fontFamily:Fonts.InterRegular,
    fontSize: 14,
    color: Colors.white,
  },
  avatarContainer: {
    height: 40,
    width: 40,
    borderRadius: 25,
    marginRight: 12,
  },
});
