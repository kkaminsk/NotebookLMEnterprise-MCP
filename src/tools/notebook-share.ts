import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { validateRequired, validateArray, validateEnum, mapGcpError } from '../errors/index.js'

export interface NotebookShareInput {
  notebook_name: string
  principals: string[]
  role: 'viewer' | 'editor'
}

export interface NotebookShareOutput {
  notebook_name: string
  principals: string[]
  role: string
  iam_role: string
}

const ROLE_MAP = {
  viewer: 'roles/discoveryengine.viewer',
  editor: 'roles/discoveryengine.editor',
} as const

const VALID_ROLES = ['viewer', 'editor'] as const

export const notebookShareToolDefinition = {
  name: 'notebook_share',
  description: 'Share a notebook with specified users or service accounts via IAM.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      notebook_name: {
        type: 'string',
        description: 'Full resource name of the notebook to share',
      },
      principals: {
        type: 'array',
        items: { type: 'string' },
        description: 'Email addresses or service account identifiers to grant access',
        minItems: 1,
      },
      role: {
        type: 'string',
        enum: ['viewer', 'editor'],
        description: 'Access level: viewer (read-only) or editor (read-write)',
      },
    },
    required: ['notebook_name', 'principals', 'role'],
  },
}

export async function handleNotebookShare(
  client: DiscoveryEngineClient,
  input: NotebookShareInput
): Promise<NotebookShareOutput> {
  validateRequired(input.notebook_name, 'notebook_name')
  validateArray(input.principals, 'principals', 1)
  validateEnum(input.role, 'role', VALID_ROLES)

  const iamRole = ROLE_MAP[input.role]

  try {
    const rawClient = client.getRawClient()

    // Get current IAM policy
    const [currentPolicy] = await rawClient.getIamPolicy({
      resource: input.notebook_name,
    })

    // Build new bindings
    const newMembers = input.principals.map((p) => {
      if (p.includes('@') && !p.startsWith('user:') && !p.startsWith('serviceAccount:')) {
        // Determine if it's a service account or user
        if (p.includes('.iam.gserviceaccount.com')) {
          return `serviceAccount:${p}`
        }
        return `user:${p}`
      }
      return p
    })

    // Find or create binding for this role
    const bindings = currentPolicy.bindings ?? []
    const existingBinding = bindings.find((b) => b.role === iamRole)

    if (existingBinding) {
      // Add new members to existing binding
      const existingMembers = new Set(existingBinding.members ?? [])
      newMembers.forEach((m) => existingMembers.add(m))
      existingBinding.members = Array.from(existingMembers)
    } else {
      // Create new binding
      bindings.push({
        role: iamRole,
        members: newMembers,
      })
    }

    // Set updated policy
    await rawClient.setIamPolicy({
      resource: input.notebook_name,
      policy: {
        bindings,
        etag: currentPolicy.etag,
      },
    })

    return {
      notebook_name: input.notebook_name,
      principals: input.principals,
      role: input.role,
      iam_role: iamRole,
    }
  } catch (error) {
    throw mapGcpError(error)
  }
}
