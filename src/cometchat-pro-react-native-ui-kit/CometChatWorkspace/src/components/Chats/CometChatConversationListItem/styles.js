import { StyleSheet } from 'react-native';
import { widthRatio } from '../../../utils/consts';
import theme from '../../../resources/theme';
import { Colors } from '../../../../../../common/Colors';

export default StyleSheet.create({
  listItem: {
    borderBottomWidth: 0.8,
    borderBottomColor: Colors.fieldGrayColor,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 80,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: Colors.bgGrayColor,
  },
  avatarStyle: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    width: 44,
    height: 44,
    marginRight: 15 * widthRatio,
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  itemDetailsContainer: {
    // borderBottomWidth: 1,
    flex: 1,
    height: '100%',
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingBottom: 10,
    color: theme.color.primary,
    // flexDirection: 'row',
  },
  itemLastMsgTimeStyle: {
    fontSize: 12,
    maxWidth: '100%',
    marginLeft: 2,
    lineHeight: 20,
    letterSpacing: 0.44
  },
  itemNameStyle: {
    fontSize: 14,
    width: '60%',
    color: Colors.textColor,
    marginBottom: 2,
    marginTop: 8,
    letterSpacing: 0.44,
    lineHeight: 20
  },
  itemMsgStyle: {
    width: '80%',
  },
  itemRowStyle: {
    width: '20%',
    alignItems: 'center',
  },
  itemLastMsgStyle: {
    width: '40%',
    alignItems: 'flex-end',
  },
  itemThumbnailStyle: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    width: 40,
    height: 40,
    backgroundColor: 'rgba(51,153,255,0.25)',
    borderRadius: 25,
  },
});
