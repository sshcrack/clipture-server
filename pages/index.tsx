import { Box, Flex } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import Footer from '../components/Home/Footer'
import LogoMain from '../components/Home/LogoMain'
import Sections from '../components/Sections'

const Home: NextPage = () => {
  return <Box
    w='100%'
    h='100%'
  >
    <Head>
      <title>Clipture</title>
      <meta name="keywords" content="Clipture, Clip, Platform, Cloud, Cut, Electron, Typescript, Game" />
      <meta name="description" content="Record your favorite games!" />
      <meta name="author" content="sshcrack" />
      <meta name="og:type" content="website" />
      <meta name="og:url" content="https://clipture.sshcrack.me" />
      <meta name="og:site_name" content="Clipture" />
      <meta name="og:image" content="/img/cover/cover.png" />
      <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
    </Head>
    <Flex
      flexDir='column'
      w='100%'
      h='100vh'
      justifyContent='center'
      alignItems='center'
    >
      <LogoMain />
    </Flex>
    <Sections />
    <Footer />
  </Box>
}

export default Home
