import { useSelector } from "react-redux"
import { View, Text } from 'react-native'
import React from 'react'

export const CommonColor = () => {
    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    let primaryColor = instituteInfo.college_data[0].font_color
    return instituteInfo
}
