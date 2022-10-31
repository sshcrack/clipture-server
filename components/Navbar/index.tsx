import { Flex, Link, Spinner, Text } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Headroom from "react-headroom";
import { FaDiscord } from 'react-icons/fa';
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
            <Flex>
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
            <Flex
                w='100%'
                justifyContent='center'
                alignItems='center'
            >
                <Flex
                    justifyContent='center'
                    alignItems='center'
                    gap='2'
                    cursor='pointer'
                    onClick={() => window.open("https://discord.gg/WHYhUF4")}
                >
                    <FaDiscord style={{ color: "#5865F2", width: "2rem", height: "2rem" }} />
                    <Link fontSize='xl'>Discord</Link>
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