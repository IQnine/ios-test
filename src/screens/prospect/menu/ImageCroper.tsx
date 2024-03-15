import { View, Text, TouchableOpacity, Platform, ActivityIndicator } from 'react-native'
import React, { MutableRefObject, createRef, useState } from 'react'
import { CropView } from 'react-native-image-crop-tools';
import { useRef } from 'react';
import { Icons } from '../../../assets/Images';
import FastImage from 'react-native-fast-image';
import { Colors } from '../../../common/Colors';
import { useSelector } from 'react-redux';
import * as ProfileServices from '../../../services/prospect/profile/ProfileServices';
import { CometChat } from '@cometchat-pro/react-native-chat';
import { Utils } from '../../../common/Utils';
import GradientButton from '../../../components/Gradientbtn';

const ImageCroper = (props: any) => {
    console.log("profile pic:",props.profilePic)
    const [loader, setLoader] = useState(false);
    let cropViewRef = createRef<CropView>();
    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })

    const primaryColor = instituteInfo?.college_data[0].font_color ? instituteInfo?.college_data[0].font_color : Utils.getData('primaryColor');

    const createFormData = (photo: any) => {
        const data = new FormData();
        data.append('profile_image', {
            name: 'name' + "." + photo.fileName.split(".").pop(),
            type: photo.type,
            uri: Platform.OS === 'android' ? ('file://' + photo.uri) : photo.uri.replace('file://', ''),
        });
        return data;
    };

    const onSave = () => {
        try {
            const r = cropViewRef.current?.saveImage(true, 100)
        } catch (error) {
            console.log(error)
        }
    }

    const onCropDone = async (data: any) => {
        setLoader(true);
        try {
            let { uri } = data
            let r = uri.split('/')
            let fileName = r[r.length - 1]
            let photo = {
                fileName, uri, type: "image/jpeg"
            }
            let d = createFormData(photo)
            if (props.type === "_P_SIGNUP") {
                ProfileServices.upload_image_prospect_signup(d).then(async (res: any) => {
                    if (res.statusCode == 200) {
                        setLoader(false);
                        props.closeModal('file://' + photo.uri, res.data.profile_image)
                    }
                }).catch(e => {
                    console.log('Error =========>>>>', e)
                })
            } else {
                ProfileServices.upload_image(d).then(async (res: any) => {
                    if (res.statusCode == 202) {
                        // props.setProfilePic(photo.uri)
                        setLoader(false);
                        props.closeModal('file://' + photo.uri, res.data.image_url)
                    }
                }).catch(e => {
                    console.log('Error =========>>>>', e)
                })
            }

        } catch (e) {
            console.log(e)
        }
    }

    return (
        <View className='flex flex-1 bg-blackColor50'>
            <View className='flex flex-row items-center justify-between py-5 px-4' style={{ backgroundColor: primaryColor }}>
                <View className='flex flex-row'>
                    <TouchableOpacity onPress={() => { props.closeModal(props.profilePic2, props.profilePic2); }}>
                        <FastImage source={Icons.IcBackBtn} className='w-[35px] h-[35px]' tintColor={Colors.white} />
                    </TouchableOpacity>
                    <Text className='text-whiteColor text-[20px] leading-8 tracking-[0.44px] font-medium ml-2'>Crop Image</Text>
                </View>
                {
                    loader ?
                        <TouchableOpacity activeOpacity={0.25} className='flex px-4 py-2 bg-whiteColor rounded-[4px] opacity-40'>
                            <Text className='text-textColor text-[14px] font-InterBold font-bold'>Save</Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity className='flex px-4 py-2 bg-whiteColor rounded-[4px]' onPress={() => { onSave() }}>
                            <Text className='text-textColor text-[14px] font-InterBold font-bold'>Save</Text>
                        </TouchableOpacity>
                }
            </View>

            <View className='flex flex-1 justify-center items-center'>
                {
                    loader ?
                        <ActivityIndicator size={'large'} color={primaryColor} />
                        :
                        <CropView
                            sourceUrl={props.profilePic}
                            style={{ width: 400, height: 400 }}
                            ref={cropViewRef}
                            onImageCrop={(res) => onCropDone(res)}
                            // keepAspectRatio
                            aspectRatio={{ width: 10, height: 10 }}
                        />
                }
            </View>
        </View>
    )
}

export default ImageCroper