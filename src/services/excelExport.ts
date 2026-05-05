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
    if (!transactionsByItem.has(tx.item_id)) {
      transactionsByItem.set(tx.item_id, [])
    }
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
      const bytes = new Uint8Array(binary.length)

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }

      return bytes.buffer
    }

    const res = await fetch(url)
    if (!res.ok) return null

    return await res.arrayBuffer()
  } catch {
    return null
  }
}

function getImageExtension(url: string): 'jpeg' | 'png' {
  return url.includes('.png') ? 'png' : 'jpeg'
}

export class ExcelExportService {
  static async exportSingleCard(
    item: any,
    transactions: RunningBalance[],
    itemCode: string,
    itemName: string
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(
      this.createSafeSheetName(itemName, itemCode)
    )

    await this.createProfessionalWorksheet(
      worksheet,
      item,
      transactions,
      itemCode,
      itemName
    )

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
    const workbook = new ExcelJS.Workbook()
    let success_count = 0
    const failed_items: string[] = []

    const { data: { session } } = await supabase.auth.getSession()
    const tenantId = session?.user?.user_metadata?.tenant_id

    const { data: allTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('tenant_id', tenantId)

    const balancesMap = calculateRunningBalancesForItems(items, allTransactions || [])

    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      if (onProgress) {
        onProgress(i + 1, items.length, `${item.name} (${item.code})`)
      }

      try {
        const worksheet = workbook.addWorksheet(
          this.createSafeSheetName(item.name, item.code, i + 1)
        )

        const transactions = balancesMap.get(item.id) || []

        await this.createProfessionalWorksheet(
          worksheet,
          item,
          transactions,
          item.code,
          item.name
        )

        success_count++
      } catch (err) {
        failed_items.push(`${item.name} (${item.code})`)
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
      link.download = `كروت_الأصناف.xlsx`
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

    let rowIndex = 1

    for (const item of items) {
      const row = worksheet.getRow(rowIndex)

      row.getCell(1).value = item.name
      row.getCell(2).value = getWarehouseName(item.warehouseId)
      row.getCell(3).value = isUnitBased(item) ? 'وحدة' : 'كرتون'
      row.getCell(4).value = getStatusText(item.remainingQuantity)
      row.getCell(5).value = formatDate(item.updatedAt)

      if (item.photoUrl) {
        const buffer = await fetchImage(item.photoUrl)
        if (buffer) {
          const imageId = workbook.addImage({
            buffer,
            extension: getImageExtension(item.photoUrl)
          })

          worksheet.addImage(imageId, {
            tl: { col: 5, row: rowIndex - 1 } as any,
            br: { col: 6, row: rowIndex } as any
          })
        }
      }

      rowIndex++
    }

    const buffer = await workbook.xlsx.writeBuffer()

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'تقرير_المخزون.xlsx'
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
    worksheet.getCell('A1').value = `${itemName} (${itemCode})`

    let rowIndex = 3

    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i]

      worksheet.getRow(rowIndex).values = [
        i + 1,
        t.date,
        t.qty_in,
        t.qty_out,
        t.balance,
        cleanNotesForUnitItem(t.notes)
      ]

      rowIndex++
    }

    if (item.photoUrl) {
      const buffer = await fetchImage(item.photoUrl)
      if (buffer) {
        const imageId = worksheet.workbook.addImage({
          buffer,
          extension: getImageExtension(item.photoUrl)
        })

        worksheet.addImage(imageId, {
          tl: { col: 6, row: 0 } as any,
          br: { col: 8, row: 3 } as any
        })
      }
    }
  }

  private static createSafeSheetName(
    itemName: string,
    itemCode: string,
    index?: number
  ): string {
    let name = itemName || itemCode
    name = name.replace(/[\\/*?:[\]]/g, '')

    if (name.length > 31) {
      name = name.substring(0, 28) + '...'
    }

    if (index) {
      name = `${index}-${name}`
    }

    return name
  }
}
