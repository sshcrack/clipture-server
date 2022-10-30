export function scaleKeepRatioSpecific(width: number, height: number, max: { height: number, width: number }, lowest = false) {
    const { width: maxWidth, height: maxHeight } = max
    const ratio = (lowest ? Math.max : Math.min)(width / maxWidth, height / maxHeight);
    return [width / ratio, height / ratio];
}
