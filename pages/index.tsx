import { Flex, Heading, Text } from '@chakra-ui/react'
import Clipture from "../public/img/logo-var.svg"
import type { NextPage } from 'next'
import "../styles/Home.module.scss"

const Home: NextPage = () => {
  return <Flex
    w='100%'
    h='100%'
    flexDir='column'
  >
    <Flex
      w='100%'
      h='100%'
      justifyContent='center'
      alignItems='center'
    >
      <Clipture style={{ width: '10%', height: "10%" }} />
      <Flex
        justifyContent='center'
        alignItems='center'
        flexDir='column'
      >
        <Heading>Clipture</Heading>
        <Text>A clip platform reimagined.</Text>
      </Flex>
    </Flex>
  </Flex>
}

export default Home
