import { Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { AiFillGithub } from "react-icons/ai";
import Card from '../../General/Card';
import CardHeader from '../../General/Card/header';

export default function OpenSource() {
    return <Card>
        <a href='https://github.com/sshcrack/clipture' target='_blank' rel="noreferrer">
            <CardHeader>
                <AiFillGithub style={{ width: "5em", height: "5em" }} />
                <Heading>Open Source</Heading>
            </CardHeader>
        </a>
        <Text>
            Clipture being open source, everybody can view the source code.
            <br />
            <br />
            If you want to view the source code of clipture, click <Link href='https://github.com/sshcrack/clipture'>
                <a style={{ color: "var(--chakra-colors-blue-500)" }} target='_blank' rel="noreferrer">here</a>
            </Link>
            <br />
            The server is available <Link href='https://github.com/sshcrack/clipture-server'>
                <a style={{ color: "var(--chakra-colors-blue-500)" }} target='_blank'  rel="noreferrer">here</a>
            </Link>
        </Text>
    </Card>
}