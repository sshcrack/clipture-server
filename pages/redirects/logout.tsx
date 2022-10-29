import { signOut } from "next-auth/react"
import { useEffect, useState } from 'react'

function LoginPage() {
    const [signedOut, setSignedOut] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const params = new Proxy(new URLSearchParams(location.search), {
            get: (searchParams, prop) => searchParams.get(prop as string),
        }) as unknown as { [key: string]: string };

        signOut({ callbackUrl: `/redirects/logged_out${params?.redirectHome ? "?redirectHome=true" : ""}` })
            .then(() => setSignedOut(true))
            .catch(e => setError(e))
    }, [])

    return <>
        {
            error && Object.values(error).length > 0 ?
                <h1>Error: {JSON.stringify(error)}</h1> :
                <h1>{signedOut ? "Signed out." : "Signing out..."}</h1>
        }
    </>
}

export default LoginPage