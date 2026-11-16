/** Builds the valley and the foreground massif off the main thread (see terrainBuild.ts). */
import { buildEnvironmentData, transferables } from './terrainBuild'

const data = buildEnvironmentData()
postMessage(data, { transfer: transferables(data) })
