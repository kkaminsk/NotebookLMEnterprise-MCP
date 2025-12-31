import { DiscoveryEngineClient as GcpDiscoveryEngineClient } from '@google-cloud/discoveryengine'
import type { Config } from '../config.js'
import { getEndpoint } from '../config.js'
import { mapGcpError } from '../errors/index.js'
import type { Operation, OperationName } from '../types/index.js'

export class DiscoveryEngineClient {
  private client: GcpDiscoveryEngineClient
  private config: Config

  constructor(config: Config) {
    this.config = config
    const endpoint = getEndpoint(config.location)

    this.client = new GcpDiscoveryEngineClient({
      apiEndpoint: endpoint,
      projectId: config.googleCloudProject,
    })
  }

  get projectId(): string {
    return this.config.googleCloudProject
  }

  get location(): string {
    return this.config.location
  }

  get timeoutMs(): number {
    return this.config.timeoutMs
  }

  getParent(): string {
    return `projects/${this.config.googleCloudProject}/locations/${this.config.location}`
  }

  getNotebookPath(notebookId: string): string {
    return `${this.getParent()}/notebooks/${notebookId}`
  }

  // Operation management
  async getOperation(operationName: OperationName): Promise<Operation> {
    try {
      const [operation] = await this.client.operationsClient.getOperation({
        name: operationName,
      })

      return {
        name: operationName,
        done: operation.done ?? false,
        status: this.mapOperationStatus(operation),
        error: operation.error
          ? {
              code: operation.error.code ?? 0,
              message: operation.error.message ?? 'Unknown error',
            }
          : undefined,
        result: operation.response ?? undefined,
        metadata: this.extractOperationMetadata(operation.metadata),
      }
    } catch (error) {
      throw mapGcpError(error)
    }
  }

  private mapOperationStatus(operation: { done?: boolean | null; error?: { code?: number | null } | null }): Operation['status'] {
    if (!operation.done) {
      return 'RUNNING'
    }
    if (operation.error && operation.error.code !== 0) {
      return 'FAILED'
    }
    return 'DONE'
  }

  private extractOperationMetadata(
    metadata: unknown
  ): Operation['metadata'] | undefined {
    if (!metadata || typeof metadata !== 'object') {
      return undefined
    }

    const meta = metadata as Record<string, unknown>
    return {
      createTime: typeof meta['createTime'] === 'string' ? meta['createTime'] : undefined,
      endTime: typeof meta['endTime'] === 'string' ? meta['endTime'] : undefined,
      progressPercent: typeof meta['progressPercent'] === 'number' ? meta['progressPercent'] : undefined,
    }
  }

  // Get the raw client for advanced operations
  getRawClient(): GcpDiscoveryEngineClient {
    return this.client
  }

  async close(): Promise<void> {
    await this.client.close()
  }
}

// Singleton instance management
let clientInstance: DiscoveryEngineClient | null = null

export function getClient(config: Config): DiscoveryEngineClient {
  if (!clientInstance) {
    clientInstance = new DiscoveryEngineClient(config)
  }
  return clientInstance
}

export async function closeClient(): Promise<void> {
  if (clientInstance) {
    await clientInstance.close()
    clientInstance = null
  }
}
