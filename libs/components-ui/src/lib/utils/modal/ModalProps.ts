import { ReactNode } from "react"

export interface IModalProps  {
    open: boolean
    children: ReactNode
    hideBackdrop?: boolean
    onClose: () => void
}
