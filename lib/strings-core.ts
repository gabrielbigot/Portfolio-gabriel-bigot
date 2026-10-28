// Partie commune (serveur + client) des textes de pages : aucun import serveur ici.
export type Dict = Record<string, Record<string, string>>
export type T = ((key: string) => string) & { has: (key: string) => boolean }
export const makeT = (dict: Dict | undefined, ns: string): T => Object.assign((key: string): string => dict?.[ns]?.[key] ?? key, { has: (key: string) => dict?.[ns]?.[key] !== undefined })
