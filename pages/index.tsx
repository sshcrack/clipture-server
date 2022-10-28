import { Box, Flex } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Footer from '../components/Home/Footer'
import LogoMain from '../components/Home/LogoMain'
import Sections from '../components/Sections'

const Home: NextPage = () => {
  return <Box
    w='100%'
    h='100%'
  >
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
