class OfflineService {
  private static instance: OfflineService
  private isOnline: boolean = true
  private listeners: Set<(isOnline: boolean) => void> = new Set()

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine
      window.addEventListener('online', () => this.setOnline(true))
      window.addEventListener('offline', () => this.setOnline(false))
    }
  }

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService()
    }
    return OfflineService.instance
  }

  private setOnline(status: boolean): void {
    this.isOnline = status
    this.listeners.forEach((listener) => listener(status))
  }

  getOnlineStatus(): boolean {
    return this.isOnline
  }

  subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  async saveOfflineData(key: string, data: any): Promise<void> {
    if (typeof indexedDB !== 'undefined') {
      const db = await this.openDB()
      const tx = db.transaction(['offlineData'], 'readwrite')
      const store = tx.objectStore('offlineData')
      store.put({ key, data, timestamp: Date.now() })
    } else {
      localStorage.setItem(`offline_${key}`, JSON.stringify(data))
    }
  }

  async getOfflineData(key: string): Promise<any> {
    if (typeof indexedDB !== 'undefined') {
      const db = await this.openDB()
      const tx = db.transaction(['offlineData'], 'readonly')
      const store = tx.objectStore('offlineData')
      const result = await store.get(key)
      return result?.data
    } else {
      const data = localStorage.getItem(`offline_${key}`)
      return data ? JSON.parse(data) : null
    }
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineDB', 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('offlineData')) {
          db.createObjectStore('offlineData', { keyPath: 'key' })
        }
      }
    })
  }
}

export const offline = OfflineService.getInstance()