import React from 'react'
import styles from "../../styles/General/GradientButton.module.scss"

export type GradientButtonProps = {
    from: string,
    to: string
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

export default function GradientButton({ from, to, children, ...props }: React.PropsWithChildren<GradientButtonProps>) {
    return <button
        className={styles.gradientBtn}
        {...props}
        style={{
            "--gradient-from": from,
            "--gradient-to": to,
            ...(props?.style ?? {})
        } as any}
    >{children}</button>
}