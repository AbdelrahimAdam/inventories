// src/services/excelExport.ts
import * as XLSX from 'xlsx'
import type { RunningBalance } from '@/types'

export class ExcelExportService {
  static async exportSingleCard(
    item: any,
    transactions: RunningBalance[],
    itemCode: string,
    itemName: string
  ): Promise<void> {
    const wb = XLSX.utils.book_new()
    const ws = this.createItemWorksheet(item, transactions, itemCode, itemName)
    XLSX.utils.book_append_sheet(wb, ws, this.createSafeSheetName(itemCode, item.size, item.warehouseId))
    XLSX.writeFile(wb, `كرت_الصنف_${itemCode}_${item.size || ''}_${item.warehouseId?.slice(0, 8) || ''}.xlsx`)
  }

  static async exportAllCards(
    items: any[],
    getTransactionsFn: (item: any) => Promise<RunningBalance[]>,
    onProgress?: (current: number, total: number, itemCode: string) => void
  ): Promise<{ success_count: number; failed_items: string[] }> {
    const wb = XLSX.utils.book_new()
    let success_count = 0
    const failed_items: string[] = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const itemCode = item.code
      const itemSize = item.size || ''

      if (onProgress) {
        onProgress(i + 1, items.length, `${itemCode} ${itemSize}`)
      }

      try {
        const transactions = await getTransactionsFn(item)
        const sheetName = this.createSafeSheetName(itemCode, item.size, i + 1)
        const ws = this.createItemWorksheet(item, transactions, itemCode, item.name)
        XLSX.utils.book_append_sheet(wb, ws, sheetName)
        success_count++
      } catch (error) {
        console.error(`Failed to export ${itemCode}:`, error)
        failed_items.push(`${itemCode} - ${error}`)
      }
    }

    if (success_count > 0) {
      XLSX.writeFile(wb, `كروت_الأصناف_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    return { success_count, failed_items }
  }

  private static createItemWorksheet(
    item: any,
    transactions: RunningBalance[],
    itemCode: string,
    itemName: string
  ): XLSX.WorkSheet {
    const data: any[][] = []

    // Header
    data.push([`كرت الصنف - ${itemCode} - ${itemName}`])
    data.push([])
    
    // Item Information
    data.push(['بيانات الصنف'])
    data.push(['الكود:', itemCode])
    data.push(['اسم الصنف:', itemName])
    data.push(['اللون:', item.color || '—'])
    data.push(['المقاس:', item.size || '—'])
    data.push(['المخزن:', item.warehouseName || item.warehouseId || '—'])
    data.push(['الرصيد الحالي:', item.remainingQuantity])
    data.push(['الكمية المضافة:', item.totalAdded || 0])
    data.push(['الكراتين:', item.cartonsCount])
    data.push(['وحدة لكل كرتون:', item.perCartonCount])
    data.push(['قطع فردية:', item.singleBottlesCount])
    data.push(['المورد:', item.supplier || '—'])
    data.push(['الموقع:', item.location || '—'])
    data.push([])

    // Transactions Header
    data.push(['حركات الصنف'])
    data.push(['م', 'التاريخ', 'رقم الإذن', 'وارد', 'منصرف', 'الرصيد', 'الجهة', 'ملاحظات'])

    // Transactions Data
    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i]
      data.push([
        i + 1,
        t.date,
        t.voucher,
        t.qty_in || '',
        t.qty_out || '',
        t.balance,
        t.party,
        t.notes
      ])
    }

    // Fill remaining rows
    for (let i = transactions.length; i < 25; i++) {
      data.push([i + 1, '', '', '', '', '', '', ''])
    }

    // Summary
    const totalIn = transactions.reduce((sum, t) => sum + t.qty_in, 0)
    const totalOut = transactions.reduce((sum, t) => sum + t.qty_out, 0)
    const finalBalance = transactions.length > 0 ? transactions[transactions.length - 1].balance : item.remainingQuantity

    data.push([])
    data.push([`إجمالي الحركات: ${transactions.length} | وارد: ${totalIn} | منصرف: ${totalOut} | الرصيد النهائي: ${finalBalance}`])
    data.push([])
    data.push([`تاريخ الطباعة: ${new Date().toLocaleString('ar-EG')}`])

    const ws = XLSX.utils.aoa_to_sheet(data)

    ws['!cols'] = [
      { wch: 6 },   // Serial
      { wch: 12 },  // Date
      { wch: 12 },  // Voucher
      { wch: 10 },  // In
      { wch: 10 },  // Out
      { wch: 12 },  // Balance
      { wch: 18 },  // Party
      { wch: 25 }   // Notes
    ]

    return ws
  }

  private static createSafeSheetName(itemCode: string, size?: string, index?: number): string {
    let baseName = index ? `${index}-${itemCode}` : `${itemCode}`
    if (size) {
      baseName += `-${size}`
    }
    baseName = baseName.replace(/[\\/*?:[\]]/g, '')
    return baseName.substring(0, 31)
  }
}