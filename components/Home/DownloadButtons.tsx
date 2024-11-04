import { Text } from '@chakra-ui/react';
import Link from 'next/link';
import { BsArrowDown } from "react-icons/bs";
import GlowingButton from '../General/GlowingButton';

export default function DownloadButtons() {
    return <>
        <GlowingButton
            href='/api/download'
            label="Download"
            icon={<BsArrowDown style={{
                width: "100%",
                height: "100%",
                minHeight: "1.5em",
                minWidth: "1.5em"
            }} />}
        />
        <Link href='https://github.com/sshcrack/clipture/releases/latest' style={{ paddingTop: "var(--chakra-spacing-8)" }}>
            <Text>More download options</Text>
        </Link>
    </>
}