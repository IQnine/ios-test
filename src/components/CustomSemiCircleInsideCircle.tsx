import React from 'react';
import { View } from 'react-native';
import { Svg, Circle, Path, Image } from 'react-native-svg';
import { Colors } from '../common/Colors';
import FastImage from 'react-native-fast-image';
import { Images } from '../assets/Images';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native';

const CustomSemiCircleInsideCircle = ({ radius, strokeWidth, color, semiCircleAngle, imageSource, imageSize, pickImage }: { radius: any, strokeWidth: any, color: any, semiCircleAngle: any, imageSource: any, imageSize: any, pickImage: any }) => {
    const circleRadius = radius - strokeWidth / 2;
    const startAngle = 90 - semiCircleAngle / 2;
    const endAngle = 90 + semiCircleAngle / 2;

    const startX = radius + circleRadius * Math.cos(startAngle * Math.PI / 180);
    const startY = radius + circleRadius * Math.sin(startAngle * Math.PI / 180);

    const endX = radius + circleRadius * Math.cos(endAngle * Math.PI / 180);
    const endY = radius + circleRadius * Math.sin(endAngle * Math.PI / 180);

    const imageX = radius - imageSize / 2;
    const imageY = radius - circleRadius - imageSize / 2;

    return (
        <TouchableOpacity onPress={() => { pickImage() }}>
            <Svg width={radius * 2} height={radius * 2} style={{ position: 'relative', zIndex: 99 }}>
                <Circle
                    cx={radius}
                    cy={radius}
                    r={circleRadius}
                    fill={Colors.transparent}
                />
                <Path
                    d={`M${startX},${startY} A${circleRadius},${circleRadius} 0 0,1 ${endX},${endY}`}
                fill={Colors.blackColor50}
        />
            </Svg>
            <View className=' absolute bottom-10 left-4' style={{ zIndex: 200 }}>
                <Text className='text-whiteColor text-[10px] leading-4 tracking-[1.5px] text-center uppercase font-InterMedium font-semibold'>CHANGE IMAGE</Text>
            </View>
            <TouchableOpacity
                className=' rounded-[100px] justify-center items-center absolute'
                style={{ height: radius * 2, width: radius * 2, zIndex: 90 }}
                onPress={() => { pickImage() }}>
                <FastImage source={imageSource == '' ? Images.pic3 : { uri: imageSource }} resizeMode='contain' className='w-full h-full rounded-full' />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

export default CustomSemiCircleInsideCircle;