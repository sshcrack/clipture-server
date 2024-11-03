import { Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { AiFillGithub } from "react-icons/ai";
import Card from '../../General/Card';
import CardHeader from '../../General/Card/header';

export default function OpenSource() {
    return <Card>
        <a href='https://github.com/sshcrack/clipture' target='_blank' rel="noreferrer noopener">
            <CardHeader>
                <AiFillGithub style={{ width: "5em", height: "5em" }} />
                <Heading>Open Source</Heading>
            </CardHeader>
        </a>
        <Text>
            Clipture being open source, everybody can view the source code.
            <br />
            <br />
            If you want to view the source code of clipture, click <Link target="_blank" rel="noreferrer" href='https://github.com/sshcrack/clipture' style={{ color: "var(--chakra-colors-blue-500)" }}>
                here
            </Link>
            <br />
            The server is available <Link href='https://github.com/sshcrack/clipture-server' style={{ color: "var(--chakra-colors-blue-500)" }} target='_blank' rel="noreferrer">
                here
            </Link>
        </Text>
    </Card>
}