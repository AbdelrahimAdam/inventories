// src/services/excelExport.ts
import * as ExcelJS from 'exceljs'
import { supabase } from '@/services/supabase'
import type { RunningBalance } from '@/types'

// Helper to clean notes for unit‑based items (remove carton/individual references)
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

// Helper to calculate running balances for a given set of items and their transactions
function calculateRunningBalancesForItems(items: any[], allTransactions: any[]): Map<string, any[]> {
  const transactionsByItem = new Map<string, any[]>()
  for (const tx of allTransactions) {
    if (!transactionsByItem.has(tx.item_id)) transactionsByItem.set(tx.item_id, [])
    transactionsByItem.get(tx.item_id)!.push(tx)
  }
  const result = new Map<string, any[]>()
  for (const item of items) {
    const itemTransactions = transactionsByItem.get(item.id) || []
    const sorted = [...itemTransactions].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    let runningBalance = item.remaining_quantity || 0
    const processed = [...sorted].reverse().map(tx => {
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
    }).reverse()
    result.set(item.id, processed)
  }
  return result
}

export class ExcelExportService {
  // ========== SINGLE ITEM CARD ==========
  static async exportSingleCard(
    item: any,
    transactions: RunningBalance[],
    itemCode: string,
    itemName: string
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook()
    const sheetName = this.createSafeSheetName(itemName, itemCode)
    const worksheet = workbook.addWorksheet(sheetName)
    this.createProfessionalWorksheet(worksheet, item, transactions, itemCode, itemName)
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `كرت_الصنف_${itemName}_${itemCode}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  }

  // ========== BULK ITEM CARDS ==========
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
      const batchItemIds = batch.map(item => item.id)

      const { data: { session } } = await supabase.auth.getSession()
      const tenantId = session?.user?.user_metadata?.tenant_id

      const { data: allTransactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .in('item_id', batchItemIds)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: true })

      if (txError) {
        console.error('Error fetching transactions for batch:', txError)
        for (const item of batch) failed_items.push(`${item.name} (${item.code}) - فشل جلب الحركات`)
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
          this.createProfessionalWorksheet(worksheet, item, transactions, item.code, item.name)
          success_count++
        } catch (err) {
          console.error(`Failed to export ${item.code}:`, err)
          failed_items.push(`${item.name} (${item.code}) - ${err}`)
        }
      }
    }

    if (success_count > 0) {
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `كروت_الأصناف_${new Date().toISOString().split('T')[0]}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
    }

    return { success_count, failed_items }
  }

  // ========== STOCK REPORT EXPORT (RTL BEAUTIFUL LAYOUT) ==========
  static async exportStockReport(
    items: any[],
    summary: { totalItems: number; totalQuantity: number; lowStock: number; outOfStock: number },
    getWarehouseName: (id: string) => string,
    isUnitBased: (item: any) => boolean,
    getStatusText: (qty: number) => string,
    formatDate: (date: any) => string
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('تقرير المخزون')
    // Set RTL for the worksheet (correct way)
    worksheet.views = [{ rightToLeft: true }]

    // ========== STYLES ==========
    const titleFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFFFF' } }
    const headerFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
    const subheaderFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF333333' } }
    const tableHeaderFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    const tableFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 10 }

    const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F75B5' } }
    const titleFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } }
    const accentFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }
    const evenRowFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }

    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }
    const thickBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thick', color: { argb: 'FF000000' } },
      left: { style: 'thick', color: { argb: 'FF000000' } },
      bottom: { style: 'thick', color: { argb: 'FF000000' } },
      right: { style: 'thick', color: { argb: 'FF000000' } }
    }

    worksheet.columns = [
      { width: 25 }, { width: 15 }, { width: 20 }, { width: 25 },
      { width: 15 }, { width: 12 }, { width: 20 }, { width: 15 }
    ]

    let currentRow = 1

    // TITLE
    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const titleRow = worksheet.getRow(currentRow)
    titleRow.height = 40
    const titleCell = titleRow.getCell(1)
    titleCell.value = 'تقرير المخزون'
    titleCell.font = titleFont
    titleCell.fill = titleFill
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.border = thickBorder
    currentRow++

    // SUMMARY HEADER
    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const summaryHeaderRow = worksheet.getRow(currentRow)
    summaryHeaderRow.height = 28
    const summaryHeaderCell = summaryHeaderRow.getCell(1)
    summaryHeaderCell.value = 'ملخص التقرير'
    summaryHeaderCell.font = headerFont
    summaryHeaderCell.fill = headerFill
    summaryHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' }
    summaryHeaderCell.border = thinBorder
    currentRow++

    const summaryPairs = [
      { label: 'إجمالي الأصناف', value: summary.totalItems.toLocaleString() },
      { label: 'إجمالي الوحدات', value: summary.totalQuantity.toLocaleString() },
      { label: 'الأصناف منخفضة المخزون (≤50)', value: summary.lowStock.toLocaleString() },
      { label: 'الأصناف نفدت', value: summary.outOfStock.toLocaleString() },
      { label: 'نسبة الأصناف المنخفضة', value: `${summary.totalItems ? ((summary.lowStock / summary.totalItems) * 100).toFixed(1) : 0}%` },
      { label: 'نسبة الأصناف النافدة', value: `${summary.totalItems ? ((summary.outOfStock / summary.totalItems) * 100).toFixed(1) : 0}%` },
      { label: 'متوسط الوحدات لكل صنف', value: summary.totalItems ? Math.round(summary.totalQuantity / summary.totalItems).toLocaleString() : '0' },
      { label: 'تاريخ التقرير', value: new Date().toLocaleDateString('ar-EG') }
    ]

    const firstRowPairs = summaryPairs.slice(0, 4)
    const secondRowPairs = summaryPairs.slice(4, 8)

    const writeSummaryRow = (rowNumber: number, pairs: { label: string; value: string }[]) => {
      const row = worksheet.getRow(rowNumber)
      row.height = 24
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i]
        const labelCol = i * 2 + 1
        const valueCol = i * 2 + 2
        const labelCell = row.getCell(labelCol)
        labelCell.value = pair.label
        labelCell.font = subheaderFont
        labelCell.fill = accentFill
        labelCell.alignment = { horizontal: 'right', vertical: 'middle' }
        labelCell.border = thinBorder
        const valueCell = row.getCell(valueCol)
        valueCell.value = pair.value
        valueCell.font = { name: 'Arial', size: 12 }
        valueCell.alignment = { horizontal: 'left', vertical: 'middle' }
        valueCell.border = thinBorder
      }
    }

    writeSummaryRow(currentRow, firstRowPairs)
    currentRow++
    writeSummaryRow(currentRow, secondRowPairs)
    currentRow++
    currentRow++

    // TABLE HEADER
    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const tableTitleRow = worksheet.getRow(currentRow)
    tableTitleRow.height = 28
    const tableTitleCell = tableTitleRow.getCell(1)
    tableTitleCell.value = 'تفاصيل الأصناف'
    tableTitleCell.font = headerFont
    tableTitleCell.fill = headerFill
    tableTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    tableTitleCell.border = thinBorder
    currentRow++

    const headers = ['الصنف', 'الكود', 'المخزن', 'تفاصيل الكمية', 'إجمالي الكمية', 'الحالة', 'المورد', 'آخر تحديث']
    const headerRow = worksheet.getRow(currentRow)
    headerRow.height = 30
    for (let i = 0; i < headers.length; i++) {
      const cell = headerRow.getCell(i + 1)
      cell.value = headers[i]
      cell.font = tableHeaderFont
      cell.fill = headerFill
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = thinBorder
    }
    currentRow++

    // DATA ROWS
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const row = worksheet.getRow(currentRow)
      row.height = 24
      if (i % 2 === 0) {
        for (let col = 1; col <= 8; col++) row.getCell(col).fill = evenRowFill
      }

      row.getCell(1).value = item.name
      row.getCell(2).value = item.code
      row.getCell(3).value = getWarehouseName(item.warehouseId)
      if (isUnitBased(item)) {
        row.getCell(4).value = 'وحدات مفردة'
        row.getCell(4).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0066CC' } }
      } else {
        row.getCell(4).value = `${item.cartonsCount} × ${item.perCartonCount} + ${item.singleBottlesCount}`
      }
      row.getCell(5).value = item.remainingQuantity.toLocaleString()
      row.getCell(5).font = { name: 'Arial', size: 10, bold: true }
      row.getCell(6).value = getStatusText(item.remainingQuantity)
      row.getCell(7).value = item.supplier || '—'
      row.getCell(8).value = formatDate(item.updatedAt)

      for (let col = 1; col <= 8; col++) {
        row.getCell(col).font = tableFont
        row.getCell(col).alignment = { horizontal: 'center', vertical: 'middle' }
        row.getCell(col).border = thinBorder
      }
      currentRow++
    }

    // FOOTER
    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const footerRow = worksheet.getRow(currentRow)
    footerRow.height = 24
    const footerCell = footerRow.getCell(1)
    footerCell.value = `تم التصدير في: ${new Date().toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    footerCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF666666' } }
    footerCell.alignment = { horizontal: 'center', vertical: 'middle' }
    footerCell.border = thinBorder

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `تقرير_المخزون_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  }

  // ========== PROFESSIONAL WORKSHEET FOR ITEM CARDS ==========
  private static createProfessionalWorksheet(
    worksheet: ExcelJS.Worksheet,
    item: any,
    transactions: any[],
    itemCode: string,
    itemName: string
  ): void {
    const isUnitBased = item.perCartonCount === 1 && item.singleBottlesCount === 0

    worksheet.pageSetup = {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 }
    }

    const titleFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFFFF' } }
    const headerFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
    const labelFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 12, bold: true }
    const valueFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 12 }
    const tableHeaderFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    const tableFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 10 }
    
    const evenRowFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }
    const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F75B5' } }
    const subheaderFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } }
    const accentFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8CBAD' } }
    const summaryFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }
    
    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }
    const thickBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thick', color: { argb: 'FF000000' } },
      left: { style: 'thick', color: { argb: 'FF000000' } },
      bottom: { style: 'thick', color: { argb: 'FF000000' } },
      right: { style: 'thick', color: { argb: 'FF000000' } }
    }
    const mediumBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'medium', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'medium', color: { argb: 'FF000000' } }
    }

    worksheet.columns = [
      { width: 8 }, { width: 14 }, { width: 14 }, { width: 12 },
      { width: 12 }, { width: 14 }, { width: 22 }, { width: 28 }
    ]

    worksheet.getRow(1).height = 40
    worksheet.getRow(2).height = 28

    let currentRow = 1

    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const titleRow = worksheet.getRow(currentRow)
    const titleCell = titleRow.getCell(1)
    titleCell.value = `كرت الصنف - ${itemCode} - ${itemName}`
    titleCell.font = titleFont
    titleCell.fill = headerFill
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.border = thickBorder
    currentRow++
    currentRow++

    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const infoHeaderRow = worksheet.getRow(currentRow)
    const infoHeaderCell = infoHeaderRow.getCell(1)
    infoHeaderCell.value = 'بيانات الصنف'
    infoHeaderCell.font = headerFont
    infoHeaderCell.fill = subheaderFill
    infoHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' }
    infoHeaderCell.border = mediumBorder
    currentRow++

    let details: { label: string; value: string }[] = [
      { label: 'الكود:', value: itemCode },
      { label: 'اسم الصنف:', value: itemName },
      { label: 'اللون:', value: item.color || '—' },
      { label: 'المقاس:', value: item.size || '—' },
      { label: 'المخزن:', value: item.warehouseName || item.warehouseId || '—' },
      { label: 'الموقع:', value: item.location || '—' },
      { label: 'المورد:', value: item.supplier || '—' },
      { label: 'الرصيد الحالي:', value: `${(item.remainingQuantity || 0).toLocaleString()} وحدة` },
      { label: 'الكمية المضافة:', value: `${(item.totalAdded || 0).toLocaleString()} وحدة` }
    ]

    if (isUnitBased) {
      details.push({ label: 'نوع الصنف:', value: 'وحدات مفردة (غير معبأ)' })
    } else {
      details.push(
        { label: 'الكراتين:', value: `${(item.cartonsCount || 0).toLocaleString()} كرتون` },
        { label: 'وحدة لكل كرتون:', value: `${(item.perCartonCount || 0).toLocaleString()} وحدة` },
        { label: 'قطع فردية:', value: `${(item.singleBottlesCount || 0).toLocaleString()} قطعة` }
      )
    }

    const itemsPerRow = 4
    for (let i = 0; i < details.length; i += itemsPerRow) {
      const row = worksheet.getRow(currentRow)
      row.height = 24
      for (let j = 0; j < itemsPerRow && i + j < details.length; j++) {
        const detail = details[i + j]
        const labelCol = (j * 2) + 1
        const valueCol = (j * 2) + 2
        const labelCell = row.getCell(labelCol)
        labelCell.value = detail.label
        labelCell.font = labelFont
        labelCell.fill = accentFill
        labelCell.alignment = { horizontal: 'right', vertical: 'middle' }
        labelCell.border = thinBorder
        const valueCell = row.getCell(valueCol)
        valueCell.value = detail.value
        valueCell.font = valueFont
        valueCell.alignment = { horizontal: 'left', vertical: 'middle' }
        valueCell.border = thinBorder
      }
      for (let j = (details.length - i); j < itemsPerRow; j++) {
        const labelCol = (j * 2) + 1
        const valueCol = (j * 2) + 2
        row.getCell(labelCol).border = thinBorder
        row.getCell(valueCol).border = thinBorder
      }
      currentRow++
    }
    currentRow++

    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const transHeaderRow = worksheet.getRow(currentRow)
    transHeaderRow.height = 28
    const transHeaderCell = transHeaderRow.getCell(1)
    transHeaderCell.value = 'حركات الصنف'
    transHeaderCell.font = headerFont
    transHeaderCell.fill = subheaderFill
    transHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' }
    transHeaderCell.border = mediumBorder
    currentRow++

    const headers = ['م', 'التاريخ', 'رقم الإذن', 'وارد', 'منصرف', 'الرصيد', 'الجهة', 'ملاحظات']
    const headerRow = worksheet.getRow(currentRow)
    headerRow.height = 28
    for (let i = 0; i < headers.length; i++) {
      const cell = headerRow.getCell(i + 1)
      cell.value = headers[i]
      cell.font = tableHeaderFont
      cell.fill = headerFill
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = thinBorder
    }
    currentRow++

    if (transactions.length === 0) {
      const emptyRow = worksheet.getRow(currentRow)
      emptyRow.height = 22
      for (let i = 0; i < headers.length; i++) {
        const cell = emptyRow.getCell(i + 1)
        cell.value = '—'
        cell.font = tableFont
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = thinBorder
      }
      currentRow++
    } else {
      for (let i = 0; i < transactions.length; i++) {
        const t = transactions[i]
        const row = worksheet.getRow(currentRow)
        row.height = 22
        if (i % 2 === 0) {
          for (let col = 1; col <= 8; col++) row.getCell(col).fill = evenRowFill
        }
        row.getCell(1).value = i + 1
        row.getCell(2).value = t.date
        row.getCell(3).value = t.voucher || '—'
        row.getCell(4).value = t.qty_in || '—'
        row.getCell(5).value = t.qty_out || '—'
        row.getCell(6).value = t.balance
        row.getCell(7).value = t.party || '—'
        let notesValue = t.notes || '—'
        if (isUnitBased && notesValue !== '—') notesValue = cleanNotesForUnitItem(notesValue)
        row.getCell(8).value = notesValue
        for (let col = 1; col <= 8; col++) {
          row.getCell(col).font = tableFont
          row.getCell(col).alignment = { horizontal: 'center', vertical: 'middle' }
          row.getCell(col).border = thinBorder
        }
        currentRow++
      }
    }

    const totalRowsNeeded = 25
    for (let i = transactions.length; i < totalRowsNeeded; i++) {
      const row = worksheet.getRow(currentRow)
      row.height = 22
      row.getCell(1).value = i + 1
      if (i % 2 === 0) row.getCell(1).fill = evenRowFill
      for (let col = 2; col <= 8; col++) {
        const cell = row.getCell(col)
        cell.value = '—'
        if (i % 2 === 0) cell.fill = evenRowFill
        cell.font = tableFont
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = thinBorder
      }
      currentRow++
    }
    currentRow++

    const totalIn = transactions.reduce((s, t) => s + (t.qty_in || 0), 0)
    const totalOut = transactions.reduce((s, t) => s + (t.qty_out || 0), 0)
    const finalBalance = transactions.length > 0 ? transactions[transactions.length - 1].balance : item.remainingQuantity

    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const summaryRow = worksheet.getRow(currentRow)
    summaryRow.height = 28
    const summaryCell = summaryRow.getCell(1)
    summaryCell.value = `إجمالي الحركات: ${transactions.length} حركة | وارد: ${totalIn} | منصرف: ${totalOut} | الرصيد النهائي: ${finalBalance}`
    summaryCell.font = { name: 'Arial', size: 12, bold: true }
    summaryCell.fill = summaryFill
    summaryCell.alignment = { horizontal: 'center', vertical: 'middle' }
    summaryCell.border = thickBorder
    currentRow++

    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const footerRow = worksheet.getRow(currentRow)
    footerRow.height = 24
    const footerCell = footerRow.getCell(1)
    footerCell.value = `تم الإنشاء في: ${new Date().toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    footerCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF666666' } }
    footerCell.alignment = { horizontal: 'center', vertical: 'middle' }
  }

  private static createSafeSheetName(itemName: string, itemCode: string, index?: number): string {
    let baseName = itemName || itemCode
    baseName = baseName.replace(/[\\/*?:[\]]/g, '')
    if (baseName.length > 31) baseName = baseName.substring(0, 28) + '...'
    if (index) baseName = `${index}-${baseName}`
    return baseName
  }
}