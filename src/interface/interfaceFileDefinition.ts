/**
 * Interface for a single file definition
 */
export interface InterfaceFileDefinition {
  src: string
  dest: string
}

export type typeFileHandling = string | InterfaceFileDefinition
