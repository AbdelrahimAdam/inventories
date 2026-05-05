// src/services/excelExport.ts
import * as ExcelJS from 'exceljs'
import { supabase } from '@/services/supabase'
import type { RunningBalance } from '@/types'
import { Buffer } from 'buffer'

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

function formatDateForTable(date: Date | string): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
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
        date: formatDateForTable(tx.created_at),
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

async function fetchImageAsBuffer(url: string | null | undefined): Promise<Buffer | null> {
  if (!url) return null
  try {
    if (url.startsWith('data:image')) {
      const base64Data = url.split(',')[1]
      return Buffer.from(base64Data, 'base64')
    }
    const response = await fetch(url)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.warn('Failed to fetch image:', url, error)
    return null
  }
}

function asExcelJSBuffer(buffer: Buffer): any {
  return buffer as any
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
          await this.createProfessionalWorksheet(worksheet, item, transactions, item.code, item.name)
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

  static async exportStockReport(
    items: any[],
    summary: { totalItems: number; totalQuantity: number; lowStock: number; outOfStock: number },
    getWarehouseName: (id: string) => string,
    isUnitBased: (item: any) => boolean,
    getStatusText: (qty: number) => string,
    _formatDate: (date: any) => string,
    options?: { includeSize?: boolean; splitDetails?: boolean }
  ): Promise<void> {
    const includeSize = options?.includeSize ?? false
    const splitDetails = options?.splitDetails ?? false

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('تقرير المخزون')
    worksheet.views = [{ rightToLeft: true }]

    const titleFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 20, bold: true, color: { argb: 'FFFFFFFF' } }
    const headerFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
    const subheaderFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF333333' } }
    const tableHeaderFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
    const dataFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 14, bold: true }

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

    let headers: string[] = ['الصنف', 'الكود', 'المخزن']
    if (includeSize) headers.push('المقاس')
    if (splitDetails) {
      headers.push('الكراتين', 'وحدة لكل كرتون', 'فردي')
    } else {
      headers.push('تفاصيل الكمية')
    }
    headers.push('إجمالي الكمية', 'الحالة', 'المورد', 'الصورة')

    const totalColumns = headers.length
    let widths: number[] = [25, 15, 20]
    if (includeSize) widths.push(12)
    if (splitDetails) widths.push(12, 15, 10)
    else widths.push(25)
    widths.push(15, 12, 20, 20)
    worksheet.columns = widths.map(w => ({ width: w }))

    let currentRow = 1

    worksheet.mergeCells(currentRow, 1, currentRow, totalColumns)
    const titleRow = worksheet.getRow(currentRow)
    titleRow.height = 45
    const titleCell = titleRow.getCell(1)
    titleCell.value = 'تقرير المخزون'
    titleCell.font = titleFont
    titleCell.fill = titleFill
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.border = thickBorder
    currentRow++

    worksheet.mergeCells(currentRow, 1, currentRow, totalColumns)
    const summaryHeaderRow = worksheet.getRow(currentRow)
    summaryHeaderRow.height = 32
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

    const maxPairsPerRow = Math.floor(totalColumns / 2)

    for (let i = 0; i < summaryPairs.length; i += maxPairsPerRow) {
      const row = worksheet.getRow(currentRow)
      row.height = 26
      const pairsSlice = summaryPairs.slice(i, i + maxPairsPerRow)
      for (let j = 0; j < maxPairsPerRow; j++) {
        const labelCol = j * 2 + 1
        const valueCol = j * 2 + 2
        if (j < pairsSlice.length) {
          const pair = pairsSlice[j]
          const labelCell = row.getCell(labelCol)
          labelCell.value = pair.label
          labelCell.font = subheaderFont
          labelCell.fill = accentFill
          labelCell.alignment = { horizontal: 'right', vertical: 'middle' }
          labelCell.border = thinBorder
          const valueCell = row.getCell(valueCol)
          valueCell.value = pair.value
          valueCell.font = dataFont
          valueCell.alignment = { horizontal: 'left', vertical: 'middle' }
          valueCell.border = thinBorder
        } else {
          for (let col = labelCol; col <= valueCol; col++) {
            row.getCell(col).border = thinBorder
          }
        }
      }
      for (let col = maxPairsPerRow * 2 + 1; col <= totalColumns; col++) {
        row.getCell(col).border = thinBorder
      }
      currentRow++
    }
    currentRow++

    worksheet.mergeCells(currentRow, 1, currentRow, totalColumns)
    const tableTitleRow = worksheet.getRow(currentRow)
    tableTitleRow.height = 32
    const tableTitleCell = tableTitleRow.getCell(1)
    tableTitleCell.value = 'تفاصيل الأصناف'
    tableTitleCell.font = headerFont
    tableTitleCell.fill = headerFill
    tableTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    tableTitleCell.border = thinBorder
    currentRow++

    const headerRow = worksheet.getRow(currentRow)
    headerRow.height = 34
    for (let i = 0; i < headers.length; i++) {
      const cell = headerRow.getCell(i + 1)
      cell.value = headers[i]
      cell.font = tableHeaderFont
      cell.fill = headerFill
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = thinBorder
    }
    currentRow++

    interface ImagePosition {
      rowNumber: number
      imageId: number
      colIndex: number
    }
    const imagePromises: Promise<void>[] = []
    const imagePositions: ImagePosition[] = []

    const photoColIndex = totalColumns - 1

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const row = worksheet.getRow(currentRow)
      row.height = 80
      if (i % 2 === 0) {
        for (let col = 1; col <= totalColumns; col++) row.getCell(col).fill = evenRowFill
      }

      let col = 1
      row.getCell(col++).value = item.name
      row.getCell(col++).value = item.code
      row.getCell(col++).value = getWarehouseName(item.warehouseId)
      if (includeSize) row.getCell(col++).value = item.size || '—'

      if (splitDetails) {
        row.getCell(col++).value = (item.cartonsCount || 0).toLocaleString()
        row.getCell(col++).value = (item.perCartonCount || 0).toLocaleString()
        row.getCell(col++).value = (item.singleBottlesCount || 0).toLocaleString()
      } else {
        if (isUnitBased(item)) {
          row.getCell(col).value = 'وحدات مفردة'
          row.getCell(col).font = dataFont
        } else {
          row.getCell(col).value = `${item.cartonsCount} × ${item.perCartonCount} + ${item.singleBottlesCount}`
        }
        col++
      }

      row.getCell(col++).value = item.remainingQuantity.toLocaleString()
      row.getCell(col++).value = getStatusText(item.remainingQuantity)
      row.getCell(col++).value = item.supplier || '—'
      const photoCell = row.getCell(col++)
      photoCell.value = ''
      photoCell.alignment = { horizontal: 'center', vertical: 'middle' }
      photoCell.border = thinBorder

      for (let c = 1; c <= totalColumns; c++) {
        const cell = row.getCell(c)
        cell.font = dataFont
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = thinBorder
      }

      if (item.photoUrl) {
        const rowNumber = currentRow
        const imagePromise = fetchImageAsBuffer(item.photoUrl).then(buffer => {
          if (buffer) {
            const imageId = workbook.addImage({
              buffer: asExcelJSBuffer(buffer),
              extension: 'jpeg' as const
            })
            imagePositions.push({ rowNumber, imageId, colIndex: photoColIndex })
          }
        })
        imagePromises.push(imagePromise)
      }

      currentRow++
    }

    await Promise.all(imagePromises)

    for (const { rowNumber, imageId, colIndex } of imagePositions) {
      worksheet.addImage(imageId, {
        tl: { col: colIndex, row: rowNumber - 1 } as any,
        br: { col: colIndex + 1, row: rowNumber } as any,
        editAs: 'oneCell'
      } as any)
    }

    worksheet.mergeCells(currentRow, 1, currentRow, totalColumns)
    const footerRow = worksheet.getRow(currentRow)
    footerRow.height = 26
    const footerCell = footerRow.getCell(1)
    footerCell.value = `تم التصدير في: ${new Date().toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    footerCell.font = { name: 'Arial', size: 12, italic: true, color: { argb: 'FF666666' } }
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

  private static async createProfessionalWorksheet(
    worksheet: ExcelJS.Worksheet,
    item: any,
    transactions: any[],
    itemCode: string,
    itemName: string
  ): Promise<void> {
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
    const sectionHeaderFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
    const labelFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 16, bold: true }
    const valueFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 14 }
    const tableHeaderFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
    const tableFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 12 }

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

    // Prepare details array
    const details: { label: string; value: string }[] = [
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

    // Calculate number of rows needed for details (3 pairs per row)
    const requiredRows = Math.ceil(details.length / 3)
    const imageStartRow = 3
    const imageEndRow = imageStartRow + requiredRows - 1

    // Set column widths: columns 1-2 for image, 3-8 for details
    worksheet.columns = [
      { width: 20 }, // A
      { width: 20 }, // B
      { width: 15 }, // C
      { width: 15 }, // D
      { width: 15 }, // E
      { width: 15 }, // F
      { width: 15 }, // G
      { width: 15 }  // H
    ]

    worksheet.getRow(1).height = 40
    worksheet.getRow(2).height = 28

    // Title row
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

    // Image area: rows imageStartRow to imageEndRow, columns 1-2
    for (let r = imageStartRow; r <= imageEndRow; r++) {
      worksheet.getRow(r).height = 28
    }
    worksheet.mergeCells(imageStartRow, 1, imageEndRow, 2)

    let imageId: number | null = null
    if (item.photoUrl) {
      const buffer = await fetchImageAsBuffer(item.photoUrl)
      if (buffer) {
        imageId = worksheet.workbook.addImage({
          buffer: asExcelJSBuffer(buffer),
          extension: 'jpeg' as const
        })
        if (imageId !== null) {
          worksheet.addImage(imageId, {
            tl: { col: 0, row: imageStartRow - 1 } as any,
            br: { col: 2, row: imageEndRow } as any,
            editAs: 'oneCell'
          } as any)
        }
      }
    }
    // Thick border for image cell
    const imageCell = worksheet.getCell(imageStartRow, 1)
    imageCell.border = thickBorder

    // Details area: rows imageStartRow to imageEndRow, columns 3-8 (3 pairs per row)
    let rowIdx = imageStartRow
    let detailIndex = 0
    while (detailIndex < details.length) {
      const row = worksheet.getRow(rowIdx)
      row.height = 28
      for (let pair = 0; pair < 3 && detailIndex < details.length; pair++) {
        const labelCol = 3 + pair * 2
        const valueCol = labelCol + 1
        const detail = details[detailIndex]
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
        detailIndex++
      }
      rowIdx++
    }

    // Move currentRow after the details block
    currentRow = imageEndRow + 1

    // Transaction table
    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const transHeaderRow = worksheet.getRow(currentRow)
    transHeaderRow.height = 32
    const transHeaderCell = transHeaderRow.getCell(1)
    transHeaderCell.value = 'حركات الصنف'
    transHeaderCell.font = sectionHeaderFont
    transHeaderCell.fill = subheaderFill
    transHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' }
    transHeaderCell.border = mediumBorder
    currentRow++

    const headers = ['م', 'التاريخ', 'رقم الإذن', 'وارد', 'منصرف', 'الرصيد', 'الجهة', 'ملاحظات']
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

    if (!transactions || transactions.length === 0) {
      const emptyRow = worksheet.getRow(currentRow)
      emptyRow.height = 24
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
        row.height = 24
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

    // Fill remaining rows to reach minimum 25 transaction rows
    const totalRowsNeeded = 25
    for (let i = transactions.length; i < totalRowsNeeded; i++) {
      const row = worksheet.getRow(currentRow)
      row.height = 24
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

    // Summary row
    const totalIn = transactions.reduce((s, t) => s + (t.qty_in || 0), 0)
    const totalOut = transactions.reduce((s, t) => s + (t.qty_out || 0), 0)
    const finalBalance = transactions.length > 0 ? transactions[transactions.length - 1].balance : item.remainingQuantity

    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const summaryRow = worksheet.getRow(currentRow)
    summaryRow.height = 30
    const summaryCell = summaryRow.getCell(1)
    summaryCell.value = `إجمالي الحركات: ${transactions.length} حركة | وارد: ${totalIn} | منصرف: ${totalOut} | الرصيد النهائي: ${finalBalance}`
    summaryCell.font = { name: 'Arial', size: 14, bold: true }
    summaryCell.fill = summaryFill
    summaryCell.alignment = { horizontal: 'center', vertical: 'middle' }
    summaryCell.border = thickBorder
    currentRow++

    // Footer row
    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const footerRow = worksheet.getRow(currentRow)
    footerRow.height = 24
    const footerCell = footerRow.getCell(1)
    footerCell.value = `تم الإنشاء في: ${new Date().toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    footerCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: 'FF666666' } }
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
