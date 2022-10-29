export function getPageURL(pathname: string, query: string) {
    return window.location.protocol + "//" + window.location.host + pathname + query;

}
