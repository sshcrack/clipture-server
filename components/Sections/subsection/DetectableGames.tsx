import { Heading, Text } from '@chakra-ui/react';
import { IoGameControllerOutline } from "react-icons/io5";
import Card from '../../General/Card';
import CardHeader from '../../General/Card/header';

export default function DetectableGame() {
    return <Card>
        <CardHeader>
            <IoGameControllerOutline style={{ width: "5em", height: "5em" }} />
            <Heading>1,800+ Games</Heading>
        </CardHeader>
        <Text>
            Clipture knows over 1,800 games, and you can even include and exclude your own, if clipture doesn&apos;t know them.
        </Text>
    </Card>
}