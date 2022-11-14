import React, { useEffect } from "react"
import { getPageURL } from '../../util/url';

function LoggedOutPage() {
    useEffect(() => {
        const params = new Proxy(new URLSearchParams(location.search), {
            get: (searchParams, prop) => searchParams.get(prop as string),
        }) as unknown as { [key: string]: string };

        if (params?.redirectHome)
            location.href = getPageURL("/", "")
    }, [])
    return <h1>Signed out.</h1>
}

export default LoggedOutPage