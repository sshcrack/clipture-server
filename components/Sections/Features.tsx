import { Flex, Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { AiFillGithub } from "react-icons/ai"
import Card from '../General/Card';
import CardHeader from '../General/Card/header';
import CloudStorage from './subsection/CloudStorage';
import DetectableGame from './subsection/DetectableGames';
import OpenSource from './subsection/OpenSource';

export default function Features() {
    return <Flex
        w='100%'
        h='100%'
        justifyContent='space-around'
        gap='5em'
        p='10'
    >
        <OpenSource />
        <DetectableGame />
        <CloudStorage />
    </Flex>
}