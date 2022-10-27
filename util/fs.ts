import fsProm from 'fs/promises';

export function existsProm(file: string) {
    return fsProm.stat(file).then(() => true).catch(() => false)
}