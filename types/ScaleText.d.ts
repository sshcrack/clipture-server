
declare module "react-scale-text" {
    export type ScaleTextProps = {
        widthOnly?: boolean,
        minFontSize?: number,
        maxFontSize?: number
    }
    export default function ScaleText(props: React.PropsWithChildren<ScaleTextProps>): JSX.Element
}