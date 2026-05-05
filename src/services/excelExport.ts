// src/services/excelExport.ts
import * as ExcelJS from 'exceljs'
import { supabase } from '@/services/supabase'
import type { RunningBalance } from '@/types'

function cleanNotesForUnitItem(notes: string): string {
  if (!notes) return '—'
  let cleaned = notes
  cleaned = cleaned.replace(/كرتون/g, 'وحدة')
  cleaned = cleaned.replace(/،\s*\d+\s*فردي/g, '')
  cleaned = cleaned.replace(/\d+\s*فردي/g, '')
  cleaned = cleaned.replace(/،\s*،/g, '،').trim()
  if (cleaned === '') return '—'
  return cleaned
}

function calculateRunningBalancesForItems(items: any[], allTransactions: any[]): Map<string, any[]> {
  const transactionsByItem = new Map<string, any[]>()
  for (const tx of allTransactions) {
    if (!transactionsByItem.has(tx.item_id)) transactionsByItem.set(tx.item_id, [])
    transactionsByItem.get(tx.item_id)!.push(tx)
  }

  const result = new Map<string, any[]>()

  for (const item of items) {
    const itemTransactions = transactionsByItem.get(item.id) || []

    const sorted = [...itemTransactions].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    let runningBalance = item.remaining_quantity || 0

    const processed = [...sorted]
      .reverse()
      .map((tx) => {
        const qty = Math.abs(tx.total_delta)
        const isIn = tx.total_delta > 0

        if (isIn) runningBalance -= qty
        else runningBalance += qty

        return {
          date: new Date(tx.created_at).toISOString().split('T')[0],
          voucher: tx.destination_id || '',
          qty_in: isIn ? qty : 0,
          qty_out: !isIn ? qty : 0,
          balance: runningBalance,
          party: tx.destination || '',
          notes: tx.notes || ''
        }
      })
      .reverse()

    result.set(item.id, processed)
  }

  return result
}

async function fetchImage(url: string | null | undefined): Promise<ArrayBuffer | null> {
  if (!url) return null

  try {
    if (url.startsWith('data:image')) {
      const base64 = url.split(',')[1]
      const binary = atob(base64)
      const len = binary.length
      const bytes = new Uint8Array(len)

      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i)
      }

      return bytes.buffer
    }

    const response = await fetch(url)
    if (!response.ok) return null

    return await response.arrayBuffer()
  } catch (err) {
    console.warn('Image fetch failed:', err)
    return null
  }
}

function getImageExtension(url: string): 'jpeg' | 'png' {
  if (url.includes('.png')) return 'png'
  return 'jpeg'
}

export class ExcelExportService {
  static async exportSingleCard(
    item: any,
    transactions: RunningBalance[],
    itemCode: string,
    itemName: string
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook()
    const sheetName = this.createSafeSheetName(itemName, itemCode)
    const worksheet = workbook.addWorksheet(sheetName)

    await this.createProfessionalWorksheet(worksheet, item, transactions, itemCode, itemName)

    const buffer = await workbook.xlsx.writeBuffer()

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `كرت_الصنف_${itemName}_${itemCode}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  }

  static async exportAllCards(
    items: any[],
    _getTransactionsFn: (item: any) => Promise<RunningBalance[]>,
    onProgress?: (current: number, total: number, itemCode: string) => void
  ): Promise<{ success_count: number; failed_items: string[] }> {
    const MAX_ITEMS_PER_BATCH = 50
    const totalItems = items.length
    let success_count = 0
    const failed_items: string[] = []
    const workbook = new ExcelJS.Workbook()

    for (let i = 0; i < items.length; i += MAX_ITEMS_PER_BATCH) {
      const batch = items.slice(i, i + MAX_ITEMS_PER_BATCH)
      const batchItemIds = batch.map((item) => item.id)

      const { data: { session } } = await supabase.auth.getSession()
      const tenantId = session?.user?.user_metadata?.tenant_id

      const { data: allTransactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .in('item_id', batchItemIds)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: true })

      if (txError) {
        for (const item of batch)
          failed_items.push(`${item.name} (${item.code}) - فشل جلب الحركات`)
        continue
      }

      const balancesMap = calculateRunningBalancesForItems(batch, allTransactions || [])

      for (let idx = 0; idx < batch.length; idx++) {
        const item = batch[idx]
        const globalIndex = i + idx + 1

        if (onProgress) onProgress(globalIndex, totalItems, `${item.name} (${item.code})`)

        try {
          const transactions = balancesMap.get(item.id) || []
          const sheetName = this.createSafeSheetName(item.name, item.code, globalIndex)
          const worksheet = workbook.addWorksheet(sheetName)

          await this.createProfessionalWorksheet(
            worksheet,
            item,
            transactions,
            item.code,
            item.name
          )

          success_count++
        } catch (err) {
          failed_items.push(`${item.name} (${item.code}) - ${err}`)
        }
      }
    }

    if (success_count > 0) {
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `كروت_الأصناف_${new Date().toISOString().split('T')[0]}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
    }

    return { success_count, failed_items }
  }

  static async exportStockReport(
    items: any[],
    summary: any,
    getWarehouseName: (id: string) => string,
    isUnitBased: (item: any) => boolean,
    getStatusText: (qty: number) => string,
    formatDate: (date: any) => string
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('تقرير المخزون')

    let currentRow = 1

    const imagePromises: Promise<void>[] = []
    const imagePositions: Array<{ rowNumber: number; imageId: number }> = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const row = worksheet.getRow(currentRow)
      row.height = 60

      if (item.photoUrl) {
        const rowNumber = currentRow

        const imagePromise = fetchImage(item.photoUrl).then((buffer) => {
          if (buffer) {
            const imageId = workbook.addImage({
              buffer,
              extension: getImageExtension(item.photoUrl)
            })

            imagePositions.push({ rowNumber, imageId })
          }
        })

        imagePromises.push(imagePromise)
      }

      currentRow++
    }

    await Promise.all(imagePromises)

    for (const { rowNumber, imageId } of imagePositions) {
      worksheet.addImage(imageId, {
        tl: { col: 0, row: rowNumber - 1 },
        br: { col: 1, row: rowNumber },
        editAs: 'oneCell'
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `تقرير_المخزون.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  }

  private static async createProfessionalWorksheet(
    worksheet: ExcelJS.Worksheet,
    item: any,
    transactions: any[],
    itemCode: string,
    itemName: string
  ): Promise<void> {
    let imageId: number | null = null

    if (item.photoUrl) {
      const buffer = await fetchImage(item.photoUrl)

      if (buffer) {
        imageId = worksheet.workbook.addImage({
          buffer,
          extension: getImageExtension(item.photoUrl)
        })

        worksheet.addImage(imageId, {
          tl: { col: 5, row: 1 },
          br: { col: 7, row: 3 },
          editAs: 'oneCell'
        })
      }
    }
  }

  private static createSafeSheetName(itemName: string, itemCode: string, index?: number): string {
    let baseName = itemName || itemCode
    baseName = baseName.replace(/[\\/*?:[\]]/g, '')

    if (baseName.length > 31) baseName = baseName.substring(0, 28) + '...'
    if (index) baseName = `${index}-${baseName}`

    return baseName
  }
}
