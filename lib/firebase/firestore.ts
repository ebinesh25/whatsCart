import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  Query,
  CollectionReference,
} from 'firebase/firestore'
import { db } from './config'
import type { SharedCart } from '@/lib/types/user'

/**
 * Get a document by ID
 */
export async function getDocument<T extends DocumentData>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as unknown as T
  }
  return null
}

/**
 * Get all documents from a collection
 * @param collectionName - Name of the collection
 * @param constraints - Array of constraints. Can be QueryConstraint objects or raw arrays like ['field', '==', 'value']
 */
export async function getCollection<T extends DocumentData>(
  collectionName: string,
  constraints?: any[]
): Promise<T[]> {
  const collectionRef = collection(db, collectionName) as CollectionReference<T>

  let q: Query<T> | CollectionReference<T> = collectionRef
  if (constraints && constraints.length > 0) {
    // Convert raw array constraints to QueryConstraint objects
    const queryConstraints = constraints.map((constraint) => {
      if (Array.isArray(constraint) && constraint.length === 3) {
        // Raw array format: ['field', 'operator', 'value']
        return where(constraint[0], constraint[1], constraint[2])
      }
      // Already a QueryConstraint object
      return constraint
    })
    q = query(collectionRef, ...queryConstraints)
  }

  const querySnapshot = await getDocs(q as Query<T>)
  return querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as T[]
}

/**
 * Add a new document
 */
export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), data)
  return docRef.id
}

/**
 * Update a document
 */
export async function updateDocument(
  collectionName: string,
  id: string,
  data: Partial<DocumentData>
): Promise<void> {
  const docRef = doc(db, collectionName, id)
  await updateDoc(docRef, data)
}

/**
 * Delete a document
 */
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  const docRef = doc(db, collectionName, id)
  await deleteDoc(docRef)
}

/**
 * Get a reference to a collection
 */
export function getCollectionRef<T extends DocumentData>(collectionName: string) {
  return collection(db, collectionName) as CollectionReference<T>
}

/**
 * Get a reference to a document
 */
export function getDocumentRef(collectionName: string, id: string) {
  return doc(db, collectionName, id)
}

/**
 * Create a shared cart and return the cartId
 */
export async function createSharedCart(data: {
  storeId: string
  storeName: string
  storeSlug: string
  storeColor: string
  items: {
    productId: string
    productName: string
    quantity: number
    price: number
    productImage?: string
  }[]
  totalAmount: number
  creatorUserId?: string
}): Promise<string> {
  // First, check if there's a Firebase Functions endpoint for this
  // For now, we'll create directly from frontend (in production, use callable function)

  const cartData = {
    ...data,
    cartId: generateShortCartId(), // Generate client-side for now
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }

  const docId = await addDocument('carts', cartData)
  return cartData.cartId
}

/**
 * Generate a short cart ID (client-side)
 */
function generateShortCartId(length: number = 9): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

/**
 * Get a shared cart by cartId
 */
export async function getSharedCart(cartId: string): Promise<SharedCart | null> {
  const carts = await getCollection<SharedCart>('carts', [
    ['cartId', '==', cartId],
  ])

  return carts.length > 0 ? carts[0] : null
}
