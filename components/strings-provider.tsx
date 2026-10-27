"use client"
import { createContext, useContext } from "react"
import { makeT, type Dict } from "@/lib/strings-core"

const Ctx = createContext<Dict>({})
export function StringsProvider({ dict, children }: { dict: Dict; children: React.ReactNode }) {
  return <Ctx.Provider value={dict}>{children}</Ctx.Provider>
}
/** Textes d'un composant client (espace « component.Nom »), modifiables dans le studio. */
export function useT(ns: string) { return makeT(useContext(Ctx), ns) }
