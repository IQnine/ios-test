import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../../../../../common/Colors';

const screenWidth = Dimensions.get('window').width;

export default StyleSheet.create({
  sectionStyle: {
    width: '100%',
    alignSelf: 'center',
    height: '100%',
    // flex:1
  },
  sectionHeaderStyle: {
    margin: 0,
    width: '100%',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 20,
    // textTransform: 'uppercase',
    marginLeft: 5,
    marginTop: 3
  },
  sectionContentStyle: {
    width: '100%',
    // marginVertical: 6,
    flexDirection: 'column',
  },
  mediaBtnStyle: {
    // borderRadius: 8,
    // backgroundColor: 'rgba(20, 20, 20, 0.08)',
    backgroundColor: Colors.white,
    width: '100%',
    // padding: 2,
    // marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    height: 70
  },
  buttonTextStyle: {
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center',
    color: Colors.greyBorder
  },
  activeButtonTextStyle: {
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center',
    color: Colors.textColor
  },
  activeButtonStyle: {
    width: '33.33%',
    alignSelf: 'flex-start',
    padding: 5,
    backgroundColor: '#fff',
    // borderRadius: 7,
    textAlign: 'center',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    height: '100%',
    justifyContent: 'center',
    // borderBottomColor: Colors.primaryColor,
    borderBottomWidth: 2,
  },
  buttonStyle: {
    width: '33.33%',
    alignSelf: 'flex-start',
    padding: 5,
    textAlign: 'center',
    backgroundColor: Colors.white,
    height: '100%',
    justifyContent: 'center'
  },
  mediaItemStyle: {
    justifyContent: 'center',
    flexGrow: 1,
  },
  mediaItemColumnStyle: {
    alignItems: 'start',
    marginTop: 2,
  },
  itemStyle: {
    // borderRadius: 8,
    overflow: 'hidden',
    textAlign: 'center',
    width:122,
    height:122    
  },
  imageStyle: {
    width: (screenWidth - 40) /2,
    height: 128,
  },
  videoPlayerStyle: {
    height: '100%',
    width: '100%',
    borderRadius: 12,
    alignSelf: 'center',
  },
  videoStyle: {
    width: '33%',
    height: 128,
    paddingHorizontal:10
    // borderRadius: 12,
    // backgroundColor: '#f2f2f2',
  },
  fileItemStyle: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    borderWidth:1,
    borderColor:Colors.fieldGrayColor,
    padding:8
  },
  fileStyle: {
    maxWidth: '100%',
    maxHeight: '100%',
    // marginTop: 15,
    fontSize: 13,
    textAlign: 'left',
    fontWeight:'600'
  },
  separator: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  emptyComponentContainerStyle: { alignItems: 'center', height: Dimensions.get('window').height - 250, width: Dimensions.get('screen').width, justifyContent: 'center', backgroundColor: Colors.bottomBg },
  emptyComponentStyle: {
    fontSize: 20,
    color: Colors.greyBorder,
    fontWeight: '700',
    alignSelf: 'center',
    marginTop:10
  },
});
