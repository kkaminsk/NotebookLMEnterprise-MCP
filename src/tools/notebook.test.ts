import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleNotebookCreate, notebookCreateToolDefinition } from './notebook-create.js'
import { handleNotebookList, notebookListToolDefinition } from './notebook-list.js'
import { handleNotebookDelete, notebookDeleteToolDefinition } from './notebook-delete.js'
import { handleNotebookShare, notebookShareToolDefinition } from './notebook-share.js'
import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { McpError, ErrorCodes } from '../errors/index.js'

describe('notebook_create', () => {
  let mockClient: {
    getRawClient: ReturnType<typeof vi.fn>
    getParent: ReturnType<typeof vi.fn>
  }
  let mockRawClient: { createNotebook: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    mockRawClient = {
      createNotebook: vi.fn(),
    }
    mockClient = {
      getRawClient: vi.fn().mockReturnValue(mockRawClient),
      getParent: vi.fn().mockReturnValue('projects/test/locations/us'),
    }
  })

  it('should have correct tool definition', () => {
    expect(notebookCreateToolDefinition.name).toBe('notebook_create')
    expect(notebookCreateToolDefinition.inputSchema.required).toContain('display_name')
  })

  it('should create notebook with display_name', async () => {
    mockRawClient.createNotebook.mockResolvedValue([
      {
        name: 'projects/test/locations/us/notebooks/nb-123',
        displayName: 'Test Notebook',
        createTime: '2025-01-01T00:00:00Z',
      },
    ])

    const result = await handleNotebookCreate(
      mockClient as unknown as DiscoveryEngineClient,
      { display_name: 'Test Notebook' }
    )

    expect(result.name).toBe('projects/test/locations/us/notebooks/nb-123')
    expect(result.display_name).toBe('Test Notebook')
  })

  it('should throw validation error for missing display_name', async () => {
    await expect(
      handleNotebookCreate(mockClient as unknown as DiscoveryEngineClient, {
        display_name: '',
      })
    ).rejects.toThrow('display_name is required')
  })
})

describe('notebook_list', () => {
  let mockClient: {
    getRawClient: ReturnType<typeof vi.fn>
    getParent: ReturnType<typeof vi.fn>
  }
  let mockRawClient: {
    listNotebooks: ReturnType<typeof vi.fn>
    listRecentlyViewedNotebooks: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockRawClient = {
      listNotebooks: vi.fn(),
      listRecentlyViewedNotebooks: vi.fn(),
    }
    mockClient = {
      getRawClient: vi.fn().mockReturnValue(mockRawClient),
      getParent: vi.fn().mockReturnValue('projects/test/locations/us'),
    }
  })

  it('should have correct tool definition', () => {
    expect(notebookListToolDefinition.name).toBe('notebook_list')
  })

  it('should list notebooks', async () => {
    mockRawClient.listNotebooks.mockResolvedValue([
      {
        notebooks: [
          { name: 'nb-1', displayName: 'Notebook 1', createTime: { seconds: '1000' } },
          { name: 'nb-2', displayName: 'Notebook 2', createTime: { seconds: '2000' } },
        ],
        nextPageToken: 'token123',
      },
    ])

    const result = await handleNotebookList(
      mockClient as unknown as DiscoveryEngineClient,
      {}
    )

    expect(result.notebooks).toHaveLength(2)
    expect(result.next_page_token).toBe('token123')
  })

  it('should use listRecentlyViewedNotebooks when recently_viewed is true', async () => {
    mockRawClient.listRecentlyViewedNotebooks.mockResolvedValue([
      { notebooks: [], nextPageToken: undefined },
    ])

    await handleNotebookList(mockClient as unknown as DiscoveryEngineClient, {
      recently_viewed: true,
    })

    expect(mockRawClient.listRecentlyViewedNotebooks).toHaveBeenCalled()
    expect(mockRawClient.listNotebooks).not.toHaveBeenCalled()
  })
})

describe('notebook_delete', () => {
  let mockClient: { getRawClient: ReturnType<typeof vi.fn> }
  let mockRawClient: { deleteNotebook: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    mockRawClient = {
      deleteNotebook: vi.fn(),
    }
    mockClient = {
      getRawClient: vi.fn().mockReturnValue(mockRawClient),
    }
  })

  it('should have correct tool definition', () => {
    expect(notebookDeleteToolDefinition.name).toBe('notebook_delete')
    expect(notebookDeleteToolDefinition.inputSchema.required).toContain('notebook_names')
  })

  it('should delete single notebook', async () => {
    mockRawClient.deleteNotebook.mockResolvedValue({})

    const result = await handleNotebookDelete(
      mockClient as unknown as DiscoveryEngineClient,
      { notebook_names: ['projects/test/locations/us/notebooks/nb-1'] }
    )

    expect(result.all_succeeded).toBe(true)
    expect(result.results[0]?.success).toBe(true)
  })

  it('should handle partial failure', async () => {
    mockRawClient.deleteNotebook
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(Object.assign(new Error('Not found'), { code: 5 }))

    const result = await handleNotebookDelete(
      mockClient as unknown as DiscoveryEngineClient,
      { notebook_names: ['nb-1', 'nb-2'] }
    )

    expect(result.all_succeeded).toBe(false)
    expect(result.results[0]?.success).toBe(true)
    expect(result.results[1]?.success).toBe(false)
  })

  it('should throw validation error for empty array', async () => {
    await expect(
      handleNotebookDelete(mockClient as unknown as DiscoveryEngineClient, {
        notebook_names: [],
      })
    ).rejects.toThrow('must have at least 1 item')
  })
})

describe('notebook_share', () => {
  let mockClient: { getRawClient: ReturnType<typeof vi.fn> }
  let mockRawClient: {
    getIamPolicy: ReturnType<typeof vi.fn>
    setIamPolicy: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockRawClient = {
      getIamPolicy: vi.fn(),
      setIamPolicy: vi.fn(),
    }
    mockClient = {
      getRawClient: vi.fn().mockReturnValue(mockRawClient),
    }
  })

  it('should have correct tool definition', () => {
    expect(notebookShareToolDefinition.name).toBe('notebook_share')
    expect(notebookShareToolDefinition.inputSchema.required).toContain('notebook_name')
    expect(notebookShareToolDefinition.inputSchema.required).toContain('principals')
    expect(notebookShareToolDefinition.inputSchema.required).toContain('role')
  })

  it('should share notebook with viewer role', async () => {
    mockRawClient.getIamPolicy.mockResolvedValue([{ bindings: [], etag: 'abc' }])
    mockRawClient.setIamPolicy.mockResolvedValue([{}])

    const result = await handleNotebookShare(
      mockClient as unknown as DiscoveryEngineClient,
      {
        notebook_name: 'projects/test/locations/us/notebooks/nb-1',
        principals: ['user@example.com'],
        role: 'viewer',
      }
    )

    expect(result.iam_role).toBe('roles/discoveryengine.viewer')
    expect(mockRawClient.setIamPolicy).toHaveBeenCalled()
  })

  it('should share notebook with editor role', async () => {
    mockRawClient.getIamPolicy.mockResolvedValue([{ bindings: [], etag: 'abc' }])
    mockRawClient.setIamPolicy.mockResolvedValue([{}])

    const result = await handleNotebookShare(
      mockClient as unknown as DiscoveryEngineClient,
      {
        notebook_name: 'projects/test/locations/us/notebooks/nb-1',
        principals: ['user@example.com'],
        role: 'editor',
      }
    )

    expect(result.iam_role).toBe('roles/discoveryengine.editor')
  })

  it('should throw validation error for invalid role', async () => {
    await expect(
      handleNotebookShare(mockClient as unknown as DiscoveryEngineClient, {
        notebook_name: 'nb-1',
        principals: ['user@example.com'],
        role: 'admin' as 'viewer',
      })
    ).rejects.toThrow('must be one of: viewer, editor')
  })
})
