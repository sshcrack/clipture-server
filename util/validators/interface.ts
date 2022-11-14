import { FixedLengthArray, ValueOf } from "type-fest";
import { AvailableMethods, CheckInterface } from "../interfaces/APIInterfaces";

export interface CheckArguments {
    method: AvailableMethods,
    requiredFields: string[],
    checks?: CheckInterface[],
    typeCheck: TypeCheckInterface[]
    ip?: boolean
}

export type CheckArgumentType = ValueOf<CheckArguments>
export type TypeCheckInterface = {
    name: string,
    type: TypeOfResults
}

export type TypeOfResults = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"
export type IFunctionArgs<T extends number> = FixedLengthArray<CheckArgumentType[], T>
export type IFunctions<T extends number> = FixedLengthArray<Function, T>
export type ReactSetState<T> = React.Dispatch<React.SetStateAction<T>>