const values = new Map<string, string>();
const storage = {
  clear: () => values.clear(),
  getItem: (key: string) => values.get(key) ?? null,
  key: (index: number) => [...values.keys()][index] ?? null,
  get length() {
    return values.size;
  },
  removeItem: (key: string) => values.delete(key),
  setItem: (key: string, value: string) => values.set(key, value),
};

Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
Object.defineProperty(window, 'localStorage', { configurable: true, value: storage });
