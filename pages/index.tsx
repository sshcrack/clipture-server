import { Flex } from '@chakra-ui/react'
import type { NextPage } from 'next'
import DownloadButtons from '../components/Home/DownloadButtons'
import LogoMain from '../components/Home/LogoMain'

const Home: NextPage = () => {
  return <Flex
    w='100%'
    h='100%'
    flexDir='column'
    justifyContent='center'
    alignItems='center'
  >
    <LogoMain>
      <DownloadButtons />
    </LogoMain>

  </Flex>
}

export default Home
