/** Evidence is not an authorization to flash. No model has a qualified stock path. */
export const MODELS = ['glow-c', 'element', 'v1', 'glow'] as const;
export type Model = typeof MODELS[number];

export function parseModel(value: unknown): Model {
  if (typeof value !== 'string' || !MODELS.includes(value as Model)) {
    throw new Error(`Specify a model: ${MODELS.join(', ')}. Model names are not hardware verification.`);
  }
  return value as Model;
}

export function report<T>(kind: string, model: Model, observations: T, limits: string[]) {
  return {
    schemaVersion: 1 as const,
    toolVersion: '0.1.0',
    kind,
    model: parseModel(model),
    modelSource: 'user-supplied' as const,
    collectedAt: new Date().toISOString(),
    stockMigration: 'unverified' as const,
    deviceWriteOperations: 0 as const,
    verification: {
      stockImageAcceptance: 'unknown' as const,
      serverIdentityValidation: 'unknown' as const,
      bootVerification: 'unknown' as const
    },
    observations,
    limits
  };
}

export function compatibility(model: Model) {
  return report('compatibility', model, {
    qualifiedStockMigrationProfiles: 0,
    availableOperations: ['metadata-only-ble', 'offline-firmware-analysis', 'offline-capture-analysis'],
    flashAvailable: false
  }, [
    'No stock-to-custom installation has been qualified by this toolkit.',
    'Model, board revision, stock version, image acceptance, boot and recovery require device evidence.',
    'Do not factory-reset a legacy Awair to make it discoverable.'
  ]);
}
