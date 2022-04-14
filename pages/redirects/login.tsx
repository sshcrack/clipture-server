import { parseCookies } from "nookies"
import { signIn, useSession } from "next-auth/react"
import { useEffect } from 'react'

function LoginPage() {
    const { status } = useSession()
    useEffect(() => {
        if (status === "unauthenticated")
            signIn("discord", { redirect: true })

        if (status === "authenticated")
            window.close()
    }, [status])

    return <>
        <h1>{status === "loading" ? "Loading" :
            (status === "unauthenticated" ? "Redirecting" : "Authenticated! Closing window...")}</h1>
    </>
}

export default LoginPage