import React from 'react';
import { Modal, TouchableWithoutFeedback, View } from 'react-native';
import style from './styles';
import Actions from './actions';
// import BottomSheet from 'reanimated-bottom-sheet';
import BottomSheet from '@gorhom/bottom-sheet';

export default class CometChatMessageActions extends React.Component {
  sheetRef = React.createRef(null);
  bottomSheetRef = React.useRef < BottomSheet > (null);
  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open) {
      this.sheetRef.current?.snapTo(0);
    }
  }

  renderContent = () => (
    <Actions {...this.props} message={this.props.message} />
  );

  renderHeader = () => <View style={style.header} />;

  render() {
    const { open, close } = this.props;
    return (
      <Modal transparent animated animationType="fade" visible={open}>
        <View style={style.bottomSheetContainer}>
          <TouchableWithoutFeedback
            onPress={() => {
              this.sheetRef?.current?.snapTo(1);
              this.props.close();
            }}>
            <View style={style.fullFlex}>
              <BottomSheet
                ref={this.bottomSheetRef}
                snapPoints={['25%', '30%']}
                borderRadius={30}
                index={1}
                enablePanDownToClose={true}
                // snapPoints={[250, 0]}
                // borderRadius={30}
                // initialSnap={1}
                // enabledInnerScrolling={false}
                // renderHeader={this.renderHeader}
                // enabledContentTapInteraction
                // overdragResistanceFactor={10}
                // renderContent={this.renderContent}
              >
                {this.renderHeader()}
                {this.renderContent()}
              </BottomSheet>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    );
  }
}
