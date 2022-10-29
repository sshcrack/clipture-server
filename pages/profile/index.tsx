import { Avatar, Box, Button, Flex, Heading, Spinner, Text } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import Navbar from '../../components/Navbar'

export default function Profile() {
    const { status, data } = useSession()
    if (status === "loading") {
        return <Flex w='100%' h='100%' flexDir='column'>
            <Navbar />
            <Flex w='100%' h='100%' justifyContent='center' alignItems='center' flexDir='column'>
                <Spinner />
                <Text>Loading...</Text>
            </Flex>
        </Flex>
    }

    if (status === "unauthenticated" || !data) {
        return <Flex w='100%' h='100%' flexDir='column'>
            <Navbar />
            <Flex w='100%' h='100%' justifyContent='center' alignItems='center' flexDir='column'>
                <h1>Not logged in.</h1>
                <Button colorScheme='green' onClick={() => location.pathname = "/"}>Go Back</Button>
            </Flex>
        </Flex>
    }


    const { name } = data.user ?? {}
    return <Flex w='100%' h='100%' flexDir='column'>
        <Navbar />
        <Heading flex='0' alignSelf='center'>Profile</Heading>
        <Flex w='100%' h='100%' justifyContent='center' alignItems='center' flexDir='column'>
            <Text>Ur moma</Text>
        </Flex>
    </Flex>
}