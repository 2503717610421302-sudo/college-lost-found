'use client'

import { DEMO_PRESET_ITEMS } from './constants'

const STORAGE_KEY = 'campusfinder_items_v2'

export function getStoredItems() {
  if (typeof window === 'undefined') return DEMO_PRESET_ITEMS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_PRESET_ITEMS))
      return DEMO_PRESET_ITEMS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_PRESET_ITEMS
  } catch (e) {
    return DEMO_PRESET_ITEMS
  }
}

export const getAllItems = getStoredItems

export function saveStoredItems(items) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {}
}

export function addNewItem(newItem) {
  const items = getStoredItems()
  const created = {
    ...newItem,
    id: newItem.id || `item-${Date.now()}`,
    status: newItem.status || 'active',
    created_at: new Date().toISOString(),
    event_date: newItem.event_date || new Date().toISOString().split('T')[0],
  }
  const updated = [created, ...items]
  saveStoredItems(updated)
  return created
}

export function updateItemStatus(itemId, newStatus) {
  const items = getStoredItems()
  const updated = items.map((item) =>
    item.id === itemId ? { ...item, status: newStatus, updated_at: new Date().toISOString() } : item
  )
  saveStoredItems(updated)
  return updated
}

export function deleteItem(itemId) {
  const items = getStoredItems()
  const updated = items.filter((item) => item.id !== itemId)
  saveStoredItems(updated)
  return updated
}

export function resetToDemoItems() {
  if (typeof window === 'undefined') return DEMO_PRESET_ITEMS
  saveStoredItems(DEMO_PRESET_ITEMS)
  return DEMO_PRESET_ITEMS
}
