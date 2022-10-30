import { Flex, Spinner, Text, useToast } from '@chakra-ui/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { DetectableGame } from '../../../util/detection';

export default function DiscordGame({ id }: { id: string }) {
    const [games, setGames] = useState<DetectableGame[] | null>(null)
    const toast = useToast()

    useEffect(() => {
        fetch("/api/game/detection")
            .then(e => e.json() as Promise<DetectableGame[]>)
            .then(e => setGames(e))
            .catch(err => {
                console.error(err)
                toast({
                    status: "error",
                    title: "Error",
                    description: "Could not get detectable games"
                })
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!games)
        return <Spinner />

    const { icon, id: gameId, name } = games.find(e => e.id === id) ?? {}
    if (!icon || !gameId)
        return <Flex>
            <Image src='unknown.png' width={32} height={32} alt='Unknown Game' />
        </Flex>

    return <Flex
        p='3'
        justifyContent='center'
        alignItems='center'
        borderBottomRightRadius='md'
        gap='3'
    >
        {/*eslint-disable-next-line @next/next/no-img-element*/}
        <img
            src={`/api/game/image?id=${gameId}&icon=${icon}`}
            alt='Game Image'
            style={{
                width: "1.5rem",
                height: "1.5rem",
                borderRadius: "var(--chakra-radii-md)"
            }}
        />
        <Text>{name}</Text>
    </Flex>
}