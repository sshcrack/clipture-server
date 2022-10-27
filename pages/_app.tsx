import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import '../styles/globals.scss'
import theme from '../styles/theme'

function MyApp({ Component, pageProps }: AppProps) {
  return <SessionProvider
    session={pageProps.session}
  >
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  </SessionProvider>
}

export default MyApp
