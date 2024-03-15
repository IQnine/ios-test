import { useEffect } from 'react';
import { BackHandler } from 'react-native';

const useBackHandler = (handler: any) => {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handler,
    );

    return () => {
      backHandler.remove(); // Remove the back handler
    };
  }, [handler]);
};

export default useBackHandler;