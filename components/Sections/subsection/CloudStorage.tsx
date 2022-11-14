import { Heading, Text } from '@chakra-ui/react';
import { AiOutlineCloud } from "react-icons/ai";
import Card from '../../General/Card';
import CardHeader from '../../General/Card/header';

export default function CloudStorage() {
    return <Card>
        <CardHeader>
            <AiOutlineCloud style={{ width: "5em", height: "5em" }} />
            <Heading>10 GB Cloud Storage</Heading>
        </CardHeader>
        <Text>
            You can upload and share thousands of clips with 10GB of storage
        </Text>
    </Card>
}