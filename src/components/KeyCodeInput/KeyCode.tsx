import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Platform } from 'react-native';
import PropTypes from 'prop-types';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';

export const KeycodeInput = (props: any) => {
    const [inputValue, setInputValue] = useState(props.defaultValue);

    useEffect(() => {
        if (props.value !== undefined && props.value !== inputValue) {
            setInputValue(props.value);
        }
    }, [props.value]);

    if (props.value !== undefined && !props.onChange) {
        throw new Error(
            'To use the KeycodeInput as a controlled component, ' +
            'you need to supply both the value and onChange props.'
        );
    }

    const changeText = (value: any) => {
        if (props.uppercase) {
            value = value.toUpperCase();
        }
        if (props.alphaNumeric) {
            value = value.replace('/[^a-z0-9]/i', '');
        }

        setInputValue(value);

        if (props.onChange) {
            props.onChange(value);
        }

        if (value.length < props.length) {
            props.btninvisible()
            return;
        }

        if (props.onComplete) {
            props.onComplete(value);
            props.btnvisible()
        }
    };

    const renderBoxes = () => {
        let elements = [];
        let i = 0;
        let vals = inputValue.split('');
        while (i < props.length) {
            let active = i === inputValue.length;
            elements.push(
                <View style={[props.length == 5 ? styles.box1 : styles.box, { borderColor: active ? props.hasErr ? Colors.primaryColor : Colors.black : props.hasErr ? Colors.primaryColor : Colors.bgGrayColor, backgroundColor: props.tintColor }]} className={`${props.hasErr ? 'border-[1px] border-errorColor' : 'border-null'}`} key={i}>
                    <Text style={styles.text} className={`${props.hasErr ? 'text-errorColor' : 'text-textColor'} text-[14px]`}>{vals[i] || ''}</Text>
                </View>
            );

            i++;
        }

        return elements;
    };

    let keyboardType = props.numeric ? 'numeric' : (Platform.OS === 'ios' ? 'ascii-capable' : 'default');

    return (
        <View style={[styles.container]}>
            <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%'}}>
                {renderBoxes()}
            </View>
            <TextInput
                ref={(component) => {
                    if (props.inputRef) {
                        props.inputRef(component);
                    }
                }}
                style={[styles.input, { color: props.textColor, width: 60 * props.length }]}
                autoFocus={props.autoFocus}
                autoCorrect={false}
                autoCapitalize='characters'
                value={inputValue}
                onSubmitEditing={props.onSubmitEditing}
                blurOnSubmit={false}
                keyboardType='number-pad'
                maxLength={props.length}
                disableFullscreenUI
                clearButtonMode='never'
                spellCheck={false}
                returnKeyType='go'
                underlineColorAndroid='transparent'
                onChangeText={(text) => changeText(text)}
                caretHidden
                cursorColor={Colors.black} />
        </View>
    );
};

KeycodeInput.propTypes = {
    length: PropTypes.number,
    tintColor: PropTypes.string,
    textColor: PropTypes.string,
    onChange: PropTypes.func,
    onComplete: PropTypes.func,
    autoFocus: PropTypes.bool,
    uppercase: PropTypes.bool,
    alphaNumeric: PropTypes.bool,
    numeric: PropTypes.bool,
    value: PropTypes.string,
    style: PropTypes.any,
    inputRef: PropTypes.func,
    btnvisible: PropTypes.func,
    btninvisible: PropTypes.func
};

KeycodeInput.defaultProps = {
    tintColor: Colors.fieldGrayColor,
    textColor: Colors.textColor,
    length: 4,
    autoFocus: false,
    numeric: false,
    alphaNumeric: true,
    uppercase: true,
    defaultValue: '',
    hasErr: false
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    input: {
        height: 60,
        position: 'absolute',
        opacity: 0,
        zIndex: 100
    },
    box: {
        width: 62,
        height: 60,
        marginHorizontal: 5,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    box1: {
        width: 57,
        height: 55,
        marginHorizontal: 5,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bar: {
        backgroundColor: '#CED5DB',
        height: 1,
        width: 50
    },
    barActive: {
        width: 50,
    },
    text: {
        fontSize: 14,
        color: Colors.textColor, fontFamily: Fonts.InterRegular
    }
});
