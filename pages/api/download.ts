import { NextApiRequest, NextApiResponse } from 'next';
import got from 'got';


export default async function DownloadRoute(_: NextApiRequest, res: NextApiResponse) {
    const raw: ReleaseLatest = await got("https://api.github.com/repos/sshcrack/clipture/releases/latest")
        .then(e => JSON.parse(e.body))
        .catch(() => undefined)

    const lastUrl = raw?.assets?.find(e => e.browser_download_url.includes(".exe"))?.browser_download_url
    if (lastUrl)
        res.redirect(lastUrl)
    else
        res.send("<h1>Could not find any release</h1>")
}

export interface ReleaseLatest {
    url: string;
    assets_url: string;
    upload_url: string;
    html_url: string;
    id: number;
    author: Author;
    node_id: string;
    tag_name: string;
    target_commitish: string;
    name: string;
    draft: boolean;
    prerelease: boolean;
    created_at: string;
    published_at: string;
    assets: Asset[];
    tarball_url: string;
    zipball_url: string;
    body: null;
}

export interface Asset {
    url: string;
    id: number;
    node_id: string;
    name: string;
    label: string;
    uploader: Author;
    content_type: string;
    state: string;
    size: number;
    download_count: number;
    created_at: string;
    updated_at: string;
    browser_download_url: string;
}

export interface Author {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
}
