import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadConfig, getEndpoint, ConfigError } from './config.js'

describe('loadConfig', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should throw ConfigError when GOOGLE_CLOUD_PROJECT is missing', () => {
    delete process.env['GOOGLE_CLOUD_PROJECT']

    expect(() => loadConfig()).toThrow(ConfigError)
    expect(() => loadConfig()).toThrow('GOOGLE_CLOUD_PROJECT environment variable is required')
  })

  it('should load config with required project and defaults', () => {
    process.env['GOOGLE_CLOUD_PROJECT'] = 'my-project'

    const config = loadConfig()

    expect(config.googleCloudProject).toBe('my-project')
    expect(config.location).toBe('us')
    expect(config.timeoutMs).toBe(120000)
    expect(config.logLevel).toBe('info')
  })

  it('should accept valid location values', () => {
    process.env['GOOGLE_CLOUD_PROJECT'] = 'my-project'

    process.env['NOTEBOOKLM_LOCATION'] = 'eu'
    expect(loadConfig().location).toBe('eu')

    process.env['NOTEBOOKLM_LOCATION'] = 'global'
    expect(loadConfig().location).toBe('global')

    process.env['NOTEBOOKLM_LOCATION'] = 'us'
    expect(loadConfig().location).toBe('us')
  })

  it('should throw ConfigError for invalid location', () => {
    process.env['GOOGLE_CLOUD_PROJECT'] = 'my-project'
    process.env['NOTEBOOKLM_LOCATION'] = 'asia'

    expect(() => loadConfig()).toThrow(ConfigError)
    expect(() => loadConfig()).toThrow('Invalid NOTEBOOKLM_LOCATION')
  })

  it('should parse custom timeout', () => {
    process.env['GOOGLE_CLOUD_PROJECT'] = 'my-project'
    process.env['NOTEBOOKLM_TIMEOUT_MS'] = '300000'

    const config = loadConfig()

    expect(config.timeoutMs).toBe(300000)
  })

  it('should throw ConfigError for invalid timeout', () => {
    process.env['GOOGLE_CLOUD_PROJECT'] = 'my-project'
    process.env['NOTEBOOKLM_TIMEOUT_MS'] = 'not-a-number'

    expect(() => loadConfig()).toThrow(ConfigError)
    expect(() => loadConfig()).toThrow('Invalid NOTEBOOKLM_TIMEOUT_MS')
  })

  it('should accept valid log levels', () => {
    process.env['GOOGLE_CLOUD_PROJECT'] = 'my-project'

    process.env['LOG_LEVEL'] = 'debug'
    expect(loadConfig().logLevel).toBe('debug')

    process.env['LOG_LEVEL'] = 'warn'
    expect(loadConfig().logLevel).toBe('warn')

    process.env['LOG_LEVEL'] = 'error'
    expect(loadConfig().logLevel).toBe('error')
  })

  it('should throw ConfigError for invalid log level', () => {
    process.env['GOOGLE_CLOUD_PROJECT'] = 'my-project'
    process.env['LOG_LEVEL'] = 'verbose'

    expect(() => loadConfig()).toThrow(ConfigError)
    expect(() => loadConfig()).toThrow('Invalid LOG_LEVEL')
  })
})

describe('getEndpoint', () => {
  it('should return US endpoint for us location', () => {
    expect(getEndpoint('us')).toBe('us-discoveryengine.googleapis.com')
  })

  it('should return EU endpoint for eu location', () => {
    expect(getEndpoint('eu')).toBe('eu-discoveryengine.googleapis.com')
  })

  it('should return global endpoint for global location', () => {
    expect(getEndpoint('global')).toBe('discoveryengine.googleapis.com')
  })

  it('should return US endpoint as default', () => {
    expect(getEndpoint('unknown')).toBe('us-discoveryengine.googleapis.com')
  })
})
