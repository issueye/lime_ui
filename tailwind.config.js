/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  corePlugins: {
    preflight: false
  },
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg_color: "var(--el-bg-color)",
        primary: "var(--el-color-primary)",
        primary_light_9: "var(--el-color-primary-light-9)",
        text_color_primary: "var(--el-text-color-primary)",
        text_color_regular: "var(--el-text-color-regular)",
        text_color_disabled: "var(--el-text-color-disabled)",
        'primary': {
          '100': '#EBFBF6',
          '200': '#D8F8F1',
          '300': '#BEECE5',
          '400': '#A5D9D6',
          '500': '#83C0C1',
          '600': '#5F9EA5',
          '700': '#427D8A',
          '800': '#295C6F',
          '900': '#19445C',
        },
        'success': {
          '100': '#F2FBD5',
          '200': '#E3F7AD',
          '300': '#C9E97F',
          '400': '#AAD35C',
          '500': '#82B72D',
          '600': '#689D20',
          '700': '#518316',
          '800': '#3C6A0E',
          '900': '#2D5708',
        },
        'info': {
          '100': '#DEE6FF',
          '200': '#BDCDFF',
          '300': '#9CB2FF',
          '400': '#839CFF',
          '500': '#5B79FF',
          '600': '#425BDB',
          '700': '#2D41B7',
          '800': '#1D2B93',
          '900': '#111C7A',
        },
        'warning': {
          '100': '#FEF9D3',
          '200': '#FDF2A7',
          '300': '#F9E77B',
          '400': '#F4DA59',
          '500': '#EDC825',
          '600': '#CBA71B',
          '700': '#AA8812',
          '800': '#896A0B',
          '900': '#715507',
        },
        'danger': {
          '100': '#FFEADE',
          '200': '#FFD1BE',
          '300': '#FFB19E',
          '400': '#FF9486',
          '500': '#FF635E',
          '600': '#DB444C',
          '700': '#B72F42',
          '800': '#931D38',
          '900': '#7A1232',
        }
      }
    }
  }
};