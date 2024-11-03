"use client"

import { ChakraProvider, SystemContext } from "@chakra-ui/react"
import { ColorModeProvider } from "./color-mode"

export function Provider(props: React.PropsWithChildren<{ value: SystemContext }>) {
  return (
    <ChakraProvider value={props.value}>
      <ColorModeProvider>{props.children}</ColorModeProvider>
    </ChakraProvider>
  )
}
