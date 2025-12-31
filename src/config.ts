export interface Config {
  googleCloudProject: string
  location: string
  timeoutMs: number
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

export function loadConfig(): Config {
  const googleCloudProject = process.env['GOOGLE_CLOUD_PROJECT']
  if (!googleCloudProject) {
    throw new ConfigError(
      'GOOGLE_CLOUD_PROJECT environment variable is required. ' +
        'Set it to your Google Cloud project ID.'
    )
  }

  const location = process.env['NOTEBOOKLM_LOCATION'] ?? 'us'
  const validLocations = ['us', 'eu', 'global']
  if (!validLocations.includes(location)) {
    throw new ConfigError(
      `Invalid NOTEBOOKLM_LOCATION: ${location}. Valid values: ${validLocations.join(', ')}`
    )
  }

  const timeoutMsStr = process.env['NOTEBOOKLM_TIMEOUT_MS'] ?? '120000'
  const timeoutMs = parseInt(timeoutMsStr, 10)
  if (isNaN(timeoutMs) || timeoutMs <= 0) {
    throw new ConfigError(`Invalid NOTEBOOKLM_TIMEOUT_MS: ${timeoutMsStr}. Must be a positive number.`)
  }

  const logLevel = (process.env['LOG_LEVEL'] ?? 'info') as Config['logLevel']
  const validLogLevels = ['debug', 'info', 'warn', 'error']
  if (!validLogLevels.includes(logLevel)) {
    throw new ConfigError(
      `Invalid LOG_LEVEL: ${logLevel}. Valid values: ${validLogLevels.join(', ')}`
    )
  }

  return {
    googleCloudProject,
    location,
    timeoutMs,
    logLevel,
  }
}

export function getEndpoint(location: string): string {
  switch (location) {
    case 'eu':
      return 'eu-discoveryengine.googleapis.com'
    case 'global':
      return 'discoveryengine.googleapis.com'
    case 'us':
    default:
      return 'us-discoveryengine.googleapis.com'
  }
}
