import { Flex, Heading, Link, Text } from '@chakra-ui/react';
import { WindowInformation } from '@prisma/client';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';
import Head from 'next/head';
import { useState } from 'react';
import Video from '../../components/General/Video';
import DiscordGame from '../../components/General/Video/DiscordGame';
import LikeButton from '../../components/General/Video/LikeButton';
import ClipUser from '../../components/General/Video/User';
import WindowInfo from '../../components/General/Video/WindowInfo';
import Navbar from '../../components/Navbar';
import { prisma } from '../../util/db';


export type SmallUser = {
    name: string | null,
    id: string | null
}

type Props = {
    clip: {
        title: string,
        id: string,
        dcGameId: string,
        windowInfo: WindowInformation,
        uploader: SmallUser
    },
    url: string
}

export default function Page({ clip, url }: Props) {
    const { title, id, dcGameId, uploader, windowInfo } = clip
    const [width, setWidth] = useState("100%")

    if (typeof id !== "string")
        return <Heading>Invalid Clip Id given</Heading>

    const clipUrl = `api/clip/get/${id}`
    return <>
        <Head>
            <meta property='og:type' content='video.other' />
            <meta property="og:url" content={`${url}/clip/${id}`} />
            <meta name="theme-color" content="#b721ff" />
            <meta property="og:video" content={`${url}/${clipUrl}`} />
            <meta property="og:video:type" content="video/mp4" />
            <meta name="og:title" content={`${title} - Clipture`} />
            <title>{title} - Clipture</title>
        </Head>
        {/*//TODO Change later */}
        <Flex w='100%' h='100%' flexDir='column'>
            <Navbar />
            <Flex w='100%' h='calc(100% - 64px)' justifyContent='center' alignItems='center' flexDir='column' p='10'>
                <Video
                    src={`https://clipture.sshcrack.me/${clipUrl}`}
                    title={title}
                    setWidth={setWidth}
                >
                    <Flex
                        flex='1'
                        justifyContent='center'
                        alignItems='center'
                    >
                        <Text
                            fontSize='xl'
                            boxShadow='0 0 10px 6px black'
                            bg='black'
                        >{title}</Text>
                    </Flex>
                </Video>
                <Flex style={{ width: width }}>
                    {dcGameId && <DiscordGame imgSize='2.5rem' fontSize='xl' id={dcGameId} />}
                    {windowInfo && <WindowInfo imgSize='2.5rem' fontSize='xl' info={windowInfo} />}
                    <Flex
                        w='100%'
                        justifyContent='center'
                        alignItems='center'
                    >
                        <LikeButton id={id} />
                    </Flex>
                    <ClipUser user={uploader} />
                </Flex>
                <Link href='mailto:getclipture@gmail.com'>Report</Link>
            </Flex>
        </Flex>
    </>
}

export async function getServerSideProps({ params }: { params: NextParsedUrlQuery }) {
    const { id } = params
    if (typeof id !== "string")
        return {
            notFound: true,
        }

    const clip = await prisma.clip.findFirst({
        where: { id }, include: {
            windowInfo: true, uploader: {
                select: {
                    image: true,
                    name: true,
                    id: true
                }
            }
        }
    })
    if (!clip)
        return {
            notFound: true
        }

    const { title, dcGameId, windowInfo, uploader } = clip

    // Pass data to the page via props
    return { props: { clip: { title, id, dcGameId, windowInfo, uploader }, url: process.env.NEXTAUTH_URL } }
}
