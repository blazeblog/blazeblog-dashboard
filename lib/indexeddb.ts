export interface DraftPost {
  id: string // post ID or 'new' for new posts
  title: string
  content: string
  heroImage?: string
  categoryId?: string
  excerpt?: string
  status: 'draft' | 'published' | 'archived' | 'scheduled'
  lastSaved: number
  userId?: string
}

interface ConnectivityStatus {
  online: boolean
  lastChecked: number
}

class PostDraftDB {
  private dbName = 'BlogDraftsDB'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve()
        return
      }

      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create drafts store
        if (!db.objectStoreNames.contains('drafts')) {
          const draftsStore = db.createObjectStore('drafts', { keyPath: 'id' })
          draftsStore.createIndex('lastSaved', 'lastSaved', { unique: false })
          draftsStore.createIndex('userId', 'userId', { unique: false })
        }

        // Create connectivity store
        if (!db.objectStoreNames.contains('connectivity')) {
          db.createObjectStore('connectivity', { keyPath: 'id' })
        }
      }
    })
  }

  async saveDraft(draft: DraftPost): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) throw new Error('Database not available')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readwrite')
      const store = transaction.objectStore('drafts')
      
      const draftWithTimestamp = {
        ...draft,
        lastSaved: Date.now()
      }
      
      const request = store.put(draftWithTimestamp)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getDraft(id: string): Promise<DraftPost | null> {
    if (!this.db) await this.init()
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readonly')
      const store = transaction.objectStore('drafts')
      const request = store.get(id)
      
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllDrafts(userId?: string): Promise<DraftPost[]> {
    if (!this.db) await this.init()
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readonly')
      const store = transaction.objectStore('drafts')
      
      let request: IDBRequest<DraftPost[]>
      
      if (userId) {
        const index = store.index('userId')
        request = index.getAll(userId)
      } else {
        request = store.getAll()
      }
      
      request.onsuccess = () => {
        const drafts = request.result.sort((a, b) => b.lastSaved - a.lastSaved)
        resolve(drafts)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteDraft(id: string): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) throw new Error('Database not available')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readwrite')
      const store = transaction.objectStore('drafts')
      const request = store.delete(id)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearOldDrafts(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) return

    const cutoff = Date.now() - maxAge

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readwrite')
      const store = transaction.objectStore('drafts')
      const index = store.index('lastSaved')
      const request = index.openCursor(IDBKeyRange.upperBound(cutoff))
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  async saveConnectivityStatus(status: ConnectivityStatus): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['connectivity'], 'readwrite')
      const store = transaction.objectStore('connectivity')
      const request = store.put({ id: 'current', ...status })
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getConnectivityStatus(): Promise<ConnectivityStatus | null> {
    if (!this.db) await this.init()
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['connectivity'], 'readonly')
      const store = transaction.objectStore('connectivity')
      const request = store.get('current')
      
      request.onsuccess = () => {
        const result = request.result
        if (result) {
          resolve({ online: result.online, lastChecked: result.lastChecked })
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }
}

export const draftDB = new PostDraftDB()
export type { ConnectivityStatus }