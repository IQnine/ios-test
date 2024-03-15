import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const GradientButton = ({ onPress, text, colors, disable }: any) => {
    return (
        <TouchableOpacity onPress={onPress} disabled={disable}>
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className={`px-3 py-4 justify-center items-center rounded-[4px] ${disable == true ? 'opacity-40' : 'opacity-100'}`}
            >
                <Text className='text-whiteColor font-HelveticaBold text-[16px] leading-4'>{text}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};
export default GradientButton  