/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        sm: '480px',
        md: '768px',
      },
      colors: {
        primaryColor: '#A52238',
        textColor: '#1B1869',
        whiteColor: '#FFFFFF',
        blackColor: '#000000',
        greyColor: '#A6A8D6',
        bgGrayColor: '#EDEEF5',
        activeColor: '#A52238',
        inActiveColor: '#1B1869',
        fieldGrayColor: 'rgba(166, 168, 214, 0.25)',
        fieldTextColor: 'rgba(144, 147, 216, 1)',
        greyBorder: '#9093D8',
        toggleColor: '#9C2B5F',
        greyColor50: 'rgba(166, 168, 214, 0.5)',
        greyColor10: 'rgba(166, 168, 214, 0.1)',
        greyColor25: 'rgba(166, 168, 214, 0.25)',
        errorColor: '#DF0C34',
        blackColor50: 'rgba(0, 0, 0, 0.5)',
        onlineColor: '#3AA352',
        offlineColor: '#9093D8'
      }
    },
    fontFamily: {
      InterBold: 'Inter-Bold',    // font weight = 700
      InterLight: 'Inter-Light',  // font weight = 200
      InterMedium: 'Inter-Medium',    // font weight = 500 
      InterRegular: 'Inter-Regular',  // font weight = 400
      InterSemiBold: 'Inter-SemiBold',    // font weight = 600 
      HelveticaBold: 'Helvetica-Bold',   //font-weight = 700
      HelveticaLight: 'HelveticaNeueLight',// font-weight = 200
      HelveticaMedium: 'HelveticaNeueMedium', //font-wight = 500
      // HelveticaRegular: 'HelveticaNeueRoman',//font-wight = 400
      Helvetica:'Helvetica'//font-wight = 500
    }
  },
  plugins: [],
}

