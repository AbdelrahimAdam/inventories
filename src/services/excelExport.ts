// src/services/excelExport.ts
import * as ExcelJS from 'exceljs'
import { supabase } from '@/services/supabase'
import type { RunningBalance } from '@/types'

// Helper to calculate running balances for multiple items at once
function calculateRunningBalancesForItems(items: any[], allTransactions: any[]): Map<string, any[]> {
  const transactionsByItem = new Map<string, any[]>()
  
  // Group transactions by item_id
  for (const tx of allTransactions) {
    if (!transactionsByItem.has(tx.item_id)) {
      transactionsByItem.set(tx.item_id, [])
    }
    transactionsByItem.get(tx.item_id)!.push(tx)
  }
  
  const result = new Map<string, any[]>()
  
  for (const item of items) {
    const itemTransactions = transactionsByItem.get(item.id) || []
    
    // Sort transactions by date
    const sorted = [...itemTransactions].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    
    // Calculate running balances
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

  static async exportAllCards(
    items: any[],
    _getTransactionsFn: (item: any) => Promise<RunningBalance[]>,
    onProgress?: (current: number, total: number, itemCode: string) => void
  ): Promise<{ success_count: number; failed_items: string[] }> {
    // ========== OPTIMIZATION 1: Limit export size ==========
    const MAX_ITEMS_PER_EXPORT = 50
    if (items.length > MAX_ITEMS_PER_EXPORT) {
      alert(`لا يمكن تصدير أكثر من ${MAX_ITEMS_PER_EXPORT} صنف في المرة الواحدة. الرجاء تصفية النتائج أولاً.`)
      return { success_count: 0, failed_items: items.slice(MAX_ITEMS_PER_EXPORT).map(i => i.code) }
    }
    
    // ========== OPTIMIZATION 2: Batch fetch all transactions at once ==========
    const itemIds = items.map(item => item.id)
    
    // Get current user's tenant
    const { data: { session } } = await supabase.auth.getSession()
    const tenantId = session?.user?.user_metadata?.tenant_id
    
    // Fetch all transactions for all items in ONE query
    const { data: allTransactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .in('item_id', itemIds)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })
    
    if (txError) {
      console.error('Error fetching transactions:', txError)
      return { success_count: 0, failed_items: items.map(i => i.code) }
    }
    
    // ========== OPTIMIZATION 3: Calculate all running balances in memory ==========
    const balancesMap = calculateRunningBalancesForItems(items, allTransactions || [])
    
    const workbook = new ExcelJS.Workbook()
    let success_count = 0
    const failed_items: string[] = []
    
    // ========== OPTIMIZATION 4: Process items in parallel with batching ==========
    const BATCH_SIZE = 5
    const totalItems = items.length
    
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE)
      
      // Process batch in parallel
      await Promise.all(batch.map(async (item, batchIndex) => {
        const itemCode = item.code
        const itemName = item.name
        const globalIndex = i + batchIndex
        
        if (onProgress) {
          onProgress(globalIndex + 1, totalItems, `${itemName} (${itemCode})`)
        }
        
        try {
          const transactions = balancesMap.get(item.id) || []
          const sheetName = this.createSafeSheetName(itemName, itemCode, globalIndex + 1)
          const worksheet = workbook.addWorksheet(sheetName)
          this.createProfessionalWorksheet(worksheet, item, transactions, itemCode, itemName)
          success_count++
        } catch (error) {
          console.error(`Failed to export ${itemCode}:`, error)
          failed_items.push(`${itemName} (${itemCode}) - ${error}`)
        }
      }))
      
      // Small delay to let UI update
      await new Promise(resolve => setTimeout(resolve, 10))
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

  private static createProfessionalWorksheet(
    worksheet: ExcelJS.Worksheet,
    item: any,
    transactions: any[],
    itemCode: string,
    itemName: string
  ): void {
    // ========== PAGE SETUP ==========
    worksheet.pageSetup = {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 }
    }

    // ========== STYLES ==========
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

    // ========== COLUMN WIDTHS ==========
    worksheet.columns = [
      { width: 8 },   // A: Serial number
      { width: 14 },  // B: Date
      { width: 14 },  // C: Voucher number
      { width: 12 },  // D: IN quantity
      { width: 12 },  // E: OUT quantity
      { width: 14 },  // F: Balance
      { width: 22 },  // G: Party
      { width: 28 }   // H: Notes
    ]

    // ========== ROW HEIGHTS ==========
    worksheet.getRow(1).height = 40
    worksheet.getRow(2).height = 28

    let currentRow = 1

    // ========== HEADER ==========
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

    // ========== ITEM INFO HEADER ==========
    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const infoHeaderRow = worksheet.getRow(currentRow)
    const infoHeaderCell = infoHeaderRow.getCell(1)
    infoHeaderCell.value = 'بيانات الصنف'
    infoHeaderCell.font = headerFont
    infoHeaderCell.fill = subheaderFill
    infoHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' }
    infoHeaderCell.border = mediumBorder
    currentRow++

    // ========== ITEM DETAILS (4 columns layout) ==========
    const details = [
      { label: 'الكود:', value: itemCode },
      { label: 'اسم الصنف:', value: itemName },
      { label: 'اللون:', value: item.color || '—' },
      { label: 'المقاس:', value: item.size || '—' },
      { label: 'المخزن:', value: item.warehouseName || item.warehouseId || '—' },
      { label: 'الموقع:', value: item.location || '—' },
      { label: 'المورد:', value: item.supplier || '—' },
      { label: 'الرصيد الحالي:', value: `${(item.remainingQuantity || 0).toLocaleString()} وحدة` },
      { label: 'الكمية المضافة:', value: `${(item.totalAdded || 0).toLocaleString()} وحدة` },
      { label: 'الكراتين:', value: `${(item.cartonsCount || 0).toLocaleString()} كرتون` },
      { label: 'وحدة لكل كرتون:', value: `${(item.perCartonCount || 0).toLocaleString()} وحدة` },
      { label: 'قطع فردية:', value: `${(item.singleBottlesCount || 0).toLocaleString()} قطعة` }
    ]

    // Display details in 4 columns layout (3 rows of 4 items each)
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
      
      // Fill remaining cells in the row
      for (let j = (details.length - i); j < itemsPerRow; j++) {
        const labelCol = (j * 2) + 1
        const valueCol = (j * 2) + 2
        const labelEmptyCell = row.getCell(labelCol)
        labelEmptyCell.value = ''
        labelEmptyCell.border = thinBorder
        const valueEmptyCell = row.getCell(valueCol)
        valueEmptyCell.value = ''
        valueEmptyCell.border = thinBorder
      }
      
      currentRow++
    }

    currentRow++

    // ========== TRANSACTIONS SECTION ==========
    // Transactions header
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

    // Table headers
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

    // Transaction data rows
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
          for (let col = 1; col <= 8; col++) {
            row.getCell(col).fill = evenRowFill
          }
        }
        
        const cell1 = row.getCell(1)
        cell1.value = i + 1
        cell1.font = tableFont
        cell1.alignment = { horizontal: 'center', vertical: 'middle' }
        cell1.border = thinBorder
        
        const cell2 = row.getCell(2)
        cell2.value = t.date
        cell2.font = tableFont
        cell2.alignment = { horizontal: 'center', vertical: 'middle' }
        cell2.border = thinBorder
        
        const cell3 = row.getCell(3)
        cell3.value = t.voucher || '—'
        cell3.font = tableFont
        cell3.alignment = { horizontal: 'center', vertical: 'middle' }
        cell3.border = thinBorder
        
        const cell4 = row.getCell(4)
        cell4.value = t.qty_in || '—'
        cell4.font = tableFont
        cell4.alignment = { horizontal: 'center', vertical: 'middle' }
        cell4.border = thinBorder
        
        const cell5 = row.getCell(5)
        cell5.value = t.qty_out || '—'
        cell5.font = tableFont
        cell5.alignment = { horizontal: 'center', vertical: 'middle' }
        cell5.border = thinBorder
        
        const cell6 = row.getCell(6)
        cell6.value = t.balance
        cell6.font = tableFont
        cell6.alignment = { horizontal: 'center', vertical: 'middle' }
        cell6.border = thinBorder
        
        const cell7 = row.getCell(7)
        cell7.value = t.party || '—'
        cell7.font = tableFont
        cell7.alignment = { horizontal: 'center', vertical: 'middle' }
        cell7.border = thinBorder
        
        const cell8 = row.getCell(8)
        cell8.value = t.notes || '—'
        cell8.font = tableFont
        cell8.alignment = { horizontal: 'center', vertical: 'middle' }
        cell8.border = thinBorder
        
        currentRow++
      }
    }

    // Fill remaining empty rows to reach 25 rows total
    const totalRowsNeeded = 25
    for (let i = transactions.length; i < totalRowsNeeded; i++) {
      const row = worksheet.getRow(currentRow)
      row.height = 22
      
      const serialCell = row.getCell(1)
      serialCell.value = i + 1
      serialCell.font = tableFont
      serialCell.alignment = { horizontal: 'center', vertical: 'middle' }
      serialCell.border = thinBorder
      if (i % 2 === 0) {
        serialCell.fill = evenRowFill
      }
      
      for (let col = 2; col <= 8; col++) {
        const cell = row.getCell(col)
        cell.value = '—'
        cell.font = tableFont
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = thinBorder
        if (i % 2 === 0) {
          cell.fill = evenRowFill
        }
      }
      currentRow++
    }

    currentRow++

    // ========== SUMMARY SECTION ==========
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

    // ========== FOOTER ==========
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
    if (baseName.length > 31) {
      baseName = baseName.substring(0, 28) + '...'
    }
    if (index) {
      baseName = `${index}-${baseName}`
    }
    return baseName
  }
}