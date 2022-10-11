import { Heading } from '@chakra-ui/react';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { prisma } from '../../util/db';

type Props = {
    clip: {
        title: string,
        id: string
    },
    url: string
}

export default function Page({ clip, url }: Props) {
    const { title, id } = clip

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
        </Head>
        <Heading>Work in progress.</Heading>
        <video autoPlay src={`/${clipUrl}`} controls/>
    </>
}

export async function getServerSideProps({ params }: { params: NextParsedUrlQuery }) {
    const { id } = params
    if (typeof id !== "string")
        return {
            notFound: true,
        }

    const clip = await prisma.clip.findFirst({ where: { id } })
    if (!clip)
        return {
            notFound: true
        }

    const { title } = clip

    // Pass data to the page via props
    return { props: { clip: { title, id }, url: process.env.NEXTAUTH_URL } }
}
