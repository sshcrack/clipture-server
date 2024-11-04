import { Center, Flex, Heading } from '@chakra-ui/react';
import { signIn, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from 'react';
import GlowingButton from '../../components/General/GlowingButton';
import { getPageURL } from '../../util/url';
import { IoOpenOutline } from "react-icons/io5";

// Password Generator
class Password {
    static _pattern = /[a-zA-Z0-9_\-\+\.]/;

    static _getRandomByte() {
        // http://caniuse.com/#feat=getrandomvalues
        if (window.crypto && window.crypto.getRandomValues) {
            var result = new Uint8Array(1);
            window.crypto.getRandomValues(result);
            return result[0];
        }
        else {
            return Math.floor(Math.random() * 256);
        }
    }

    static generate(length: number) {
        return Array.apply(null, Array(length))
            .map(() => {
                var result;
                while (true) {
                    result = String.fromCharCode(this._getRandomByte());
                    if (this._pattern.test(result)) {
                        return result;
                    }
                }
            })
            .join('');
    }

};


function LoginPage() {
    const { status } = useSession()
    const [secret, setSecret] = useState<string | null>(null)

    const params = useMemo(() => {
        if (typeof window === "undefined")
            return {}

        return new Proxy(new URLSearchParams(location.search), {
            get: (searchParams, prop) => searchParams.get(prop as string),
        }) as unknown as { [key: string]: string };
    }, [])
    useEffect(() => {
        if (status === "unauthenticated") {
            if (params?.redirectHome)
                localStorage.setItem("redirectHome", params?.redirectHome)
            else
                localStorage.removeItem("redirectHome")

            if (params?.appLogin)
                localStorage.setItem("appLogin", "true")
            else
                localStorage.removeItem("appLogin")

            signIn("discord", { redirect: true })
        }

        if (status === "authenticated") {
            const asyncRun = async () => {
                if (params?.appLogin ?? localStorage.getItem("appLogin")) {
                    // Handle app login for clipture-rs here
                    const innerSecret = Password.generate(64);

                    // Tell the server that with this secret the client can request the user's data
                    const res = await fetch(`/api/validation/report`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ secret: innerSecret })
                    })
                        .then(e => e.json())
                        .catch(() => undefined)

                    console.log("Server response", res)
                    setSecret(innerSecret)
                } else {
                    window.close()
                }
            }

            if (params?.redirectHome ?? localStorage.getItem("redirectHome")) {
                localStorage.removeItem("redirectHome")
                location.href = getPageURL("/", "")
            } else
                asyncRun()
        }
    }, [status])

    if (status === "loading")
        return <h1>Loading...</h1>

    if (status === "unauthenticated")
        return <h1>Redirecting...</h1>

    const isAppAuth = params?.appLogin ?? localStorage.getItem("appLogin")
    if (!isAppAuth)
        return <h1>Authenticated! Closing window...</h1>

    if(!secret)
        return <h1>Invalid state. Please try again</h1>

    return <Center h='100%'>
        <Flex
            w='50%'
            h='50%'
            flexDir='column'
            alignItems='center'
            p='10'
            gap='10'
            rounded='2xl'
        >
            <Heading as="h1" fontSize='4xl'>Authenticated!</Heading>
            <GlowingButton onClick={() => {
                const headers = new Headers()
                headers.set("Authorization", secret ?? "")
                fetch("/api/validation/report?waitUntilDone=true", {
                    headers
                }).then(e => e.text())
                .then(e => {
                    console.log("Done", e)
                    window.close()
                })
            }} href={`clipture://login?secret=${encodeURIComponent(secret)}`} label='Open App' icon={<IoOpenOutline style={{ animation: "inherit", width: "1.5rem", height: "1.5rem" }} />} />
        </Flex>
    </Center>
}

export default LoginPage