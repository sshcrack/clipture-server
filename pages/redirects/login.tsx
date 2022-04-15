import { parseCookies, setCookie } from "nookies"
import { signIn, useSession } from "next-auth/react"
import { useEffect } from 'react'

function LoginPage() {
    const { status } = useSession()
    useEffect(() => {
        console.log(status)

        const params = new Proxy(new URLSearchParams(location.search), {
            get: (searchParams, prop) => searchParams.get(prop as string),
        }) as unknown as { [key: string]: string };

        if (status === "unauthenticated") {
            const id = params?.id
            if (id)
                setCookie(null, 'id', id, {
                    maxAge: 30 * 24 * 60 * 60,
                    path: '/',
                })

            signIn("discord", { redirect: true })
        }

        if (status === "authenticated") {
            const asyncRun = async () => {
                const id = params?.id ?? parseCookies()?.id ?? {}
                console.log("Id is", parseCookies(), params.id)
                if (id) {
                    const res = await fetch(`/api/validation/report`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ id: id })
                    })
                        .then(e => e.json())
                        .catch(() => undefined)

                    console.log("validation", res)
                }
                //window.close()
            }

            asyncRun()
        }
    }, [status])

    return <>
        <h1>{status === "loading" ? "Loading" :
            (status === "unauthenticated" ? "Redirecting" : "Authenticated! Closing window...")}</h1>
    </>
}

export default LoginPage