import { Button, Flex, Heading, Image, Spinner, Text } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { FilteredClip } from '../../util/interfaces/APIInterfaces'
import { getPageURL } from '../../util/url'

export default function Profile() {
    const { status, data } = useSession()
    const [list, setList] = useState<FilteredClip[] | null>(null)


    useEffect(() => {
        if (status !== "authenticated")
            return

        fetch("/api/clip/list")
            .then(e => e.json())
            .then(e => setList(e))
    }, [status])

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


    const { } = data.user ?? {}
    return <Flex w='100%' h='100%' flexDir='column'>
        <Navbar />
        <Heading flex='0' alignSelf='center'>Profile</Heading>
        <Flex
            w='100%'
            h='100%'
            gap='5'
            p='10'
            flexDir='column'
            flexWrap='wrap'
        >
            {!list ? <Spinner /> :
                list.map(({ title, id }) => (
                    <Flex
                        key={title}
                        onClick={() => location.href = getPageURL(`/clip/${id}`, "")}
                        display='flex'
                        gap='5'
                        p='3'
                        rounded='md'
                        alignItems='center'
                        transition='all .2s ease-in-out'
                        cursor='pointer'
                        _hover={{
                            background: "gray.700"
                        }}
                    >
                        <Image
                        alt='Image thumbnail'
                        src={`/api/clip/thumbnail/${id}`}
                        rounded='md'
                        />
                        <Text>{title}</Text>
                    </Flex>
                ))
            }
        </Flex>
    </Flex>
}