import { createSystem, defaultConfig, Theme } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import '../styles/globals.scss'

import { ColorModeProvider } from '../components/ui/color-mode';
import { Provider } from '../components/ui/provider';
import theme from '../util/theme';

function MyApp({ Component, pageProps }: AppProps) {
  if (typeof window !== "undefined")
    localStorage.setItem("chakra-ui-color-mode", "dark")

  return <SessionProvider
    session={pageProps.session}
  >
    <Provider value={theme}>
      <Theme appearance='dark'>
        <Component {...pageProps} />
      </Theme>
    </Provider>
  </SessionProvider>
}

export default MyApp
