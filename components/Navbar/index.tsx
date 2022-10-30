import { Flex, Spinner, Text } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Headroom from "react-headroom";
import Clipture from "../../public/img/logo.svg";
import { getPageURL } from '../../util/url';
import LoginButton from './LoginButton';



const ProfileLazy = dynamic(
    () => import("./Profile"),
    {
        loading: () => <Spinner />
    }
)

export default function Navbar() {
    const { status } = useSession()

    return <Headroom style={{
        display: 'flex',
        justifyContent: 'center'
    }}>
        <Flex
            w='90%'
            justifyContent='center'
            alignItems='center'
        >
            <Flex
                w='100%'
            >
                <Flex
                    gap='1'
                    alignItems='center'
                    onClick={() => location.href = getPageURL("/", "")}
                    cursor='pointer'
                >
                    <Clipture style={{ width: "2rem", height: "2rem" }} />
                    <Text fontSize='xl'>Clipture</Text>
                </Flex>

            </Flex>
            {status === "loading" ?
                <Spinner /> : (
                    status === "authenticated" ?
                        <ProfileLazy flex='0' /> :
                        <LoginButton flex='0' />
                )
            }
        </Flex>
    </Headroom>
}