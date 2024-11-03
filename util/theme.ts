import { createSystem, defaultConfig, defineTokens } from '@chakra-ui/react'

type TokenDefinition = Parameters<typeof defineTokens>[0]
const fonts: TokenDefinition["fonts"] = {
    heading: { value: `'Quattrocento', sans-serif` },
    body: { value: `'Quattrocento', sans-serif` },
}

const colors: TokenDefinition["colors"] = {
    editor: {
        highlight: { value: "#d6d6d6" }
    },
    brandPrimary: {
        50: { value: "hsl(281, 100%, 84%)" },
        100: { value: "hsl(281, 100%, 88%)" },
        200: { value: "hsl(281, 100%, 84%)" },
        300: { value: "hsl(281, 100%, 80%)" },
        400: { value: "hsl(281, 100%, 76%)" },
        500: { value: "hsl(281, 100%, 72%)" },
        600: { value: "hsl(281, 100%, 68%)" },
        700: { value: "hsl(281, 100%, 64%)" },
        800: { value: "hsl(281, 100%, 60%)" },
        900: { value: "hsl(281, 100%, 56%)" },
        1000: { value: "hsl(281, 100%, 52%)" },
        1100: { value: "hsl(281, 100%, 48%)" },
        1200: { value: "hsl(281, 100%, 34%)" },
        1300: { value: "hsl(281, 100%, 30%)" },
        1400: { value: "hsl(281, 100%, 26%)" },
    },
    brandSecondary: {
        50: { value: "hsl(202, 98%, 84%)" },
        100: { value: "hsl(202, 98%, 88%)" },
        200: { value: "hsl(202, 98%, 84%)" },
        300: { value: "hsl(202, 98%, 80%)" },
        400: { value: "hsl(202, 98%, 76%)" },
        500: { value: "hsl(202, 98%, 72%)" },
        600: { value: "hsl(202, 98%, 68%)" },
        700: { value: "hsl(202, 98%, 64%)" },
        800: { value: "hsl(202, 98%, 60%)" },
        900: { value: "hsl(202, 98%, 56%)" },
        1000: { value: "hsl(202, 98%, 52%)" },
        1100: { value: "hsl(202, 98%, 48%)" },
        1200: { value: "hsl(202, 98%, 34%)" },
        1300: { value: "hsl(202, 98%, 30%)" },
        1400: { value: "hsl(202, 98%, 26%)" },
    },
    brand: {
        primary: { value: "#b721ff" },
        secondary: { value: "#21aefd" },
        bg: { value: "#152B3F" }
    },
    illustration: {
        bg: { value: "#04294F" },
        primary: { value: "#FFB400" },
        secondary: { value: "#F04E23" },
        tertiary: { value: "#00AEE0" }
    }
}

const tokens = defineTokens({
    fonts,
    colors
})

const component = {
    Button: {
        colorScheme: {
            'dark-red': {
                bg: 'red.700'
            },
        }
    }
}

//TODO component

export const theme = createSystem(defaultConfig, { theme: { tokens } })
