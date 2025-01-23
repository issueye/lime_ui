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
          '100': '#D6E4FF',
          '200': '#ADC8FF',
          '300': '#84A9FF',
          '400': '#6690FF',
          '500': '#3366FF',
          '600': '#254EDB',
          '700': '#1939B7',
          '800': '#102693',
          '900': '#091A7A',
        },
        'info': {
          '100': '#D8FFFC',
          '200': '#B2FFFE',
          '300': '#8BF6FF',
          '400': '#6FEAFF',
          '500': '#3FD5FF',
          '600': '#2EA8DB',
          '700': '#1F80B7',
          '800': '#145B93',
          '900': '#0C427A',
        },
        'danger': {
          '100': '#FFE6D6',
          '200': '#FFC7AE',
          '300': '#FFA185',
          '400': '#FF7D67',
          '500': '#FF4235',
          '600': '#DB262A',
          '700': '#B71A2A',
          '800': '#931029',
          '900': '#7A0A28',
        },
        'warning': {
          '100': '#FFF6CE',
          '200': '#FFEA9C',
          '300': '#FFDB6C',
          '400': '#FFCD47',
          '500': '#FFB50A',
          '600': '#DB9407',
          '700': '#B77605',
          '800': '#935A03',
          '900': '#7A4701',
        },
        'success': {
          '100': '#E0FCD8',
          '200': '#BAFAB1',
          '300': '#8BF088',
          '400': '#67E16E',
          '500': '#39CE50',
          '600': '#29B14B',
          '700': '#1C9445',
          '800': '#12773E',
          '900': '#0A6239',
        }
      }
    }
  }
};