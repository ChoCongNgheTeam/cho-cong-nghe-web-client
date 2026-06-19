let _authInitialized = false;
let _authInitPromise: Promise<void> | null = null;
let _authInitResolve: (() => void) | null = null;

export const waitForAuthInit = (): Promise<void> => {
  if (_authInitialized) return Promise.resolve();
  if (_authInitPromise) return _authInitPromise;
  _authInitPromise = new Promise((resolve) => {
    _authInitResolve = resolve;
  });
  return _authInitPromise;
};

export const resolveAuthInit = () => {
  _authInitialized = true;
  _authInitResolve?.();
};

export const resetAuthInit = () => {
  _authInitialized = false;
  _authInitPromise = null;
  _authInitResolve = null;
};
