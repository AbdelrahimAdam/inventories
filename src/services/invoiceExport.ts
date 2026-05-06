// src/services/invoiceExport.ts
import * as ExcelJS from 'exceljs'

export interface ExportOptions {
  search?: string
  status?: string
  type?: string
  dateRange?: string
  companyInfo?: {
    name: string
    taxNumber: string
    address: string
    phone: string
    email: string
  }
}

export class InvoiceExportService {
  static async exportToExcel(invoices: any[], options: ExportOptions = {}): Promise<void> {
    const MAX_INVOICES_PER_EXPORT = 50
    
    let invoicesToExport = invoices
    if (invoicesToExport.length > MAX_INVOICES_PER_EXPORT) {
      invoicesToExport = invoicesToExport.slice(0, MAX_INVOICES_PER_EXPORT)
    }
    
    if (invoicesToExport.length === 0) {
      alert('لا توجد فواتير للتصدير')
      return
    }
    
    const workbook = new ExcelJS.Workbook()
    workbook.creator = options.companyInfo?.name || 'P.commerce'
    workbook.created = new Date()
    
    const summarySheet = workbook.addWorksheet('ملخص الفواتير')
    this.createProfessionalSummarySheet(summarySheet, invoicesToExport, options)
    
    const MAX_INDIVIDUAL_SHEETS = 20
    for (let i = 0; i < Math.min(invoicesToExport.length, MAX_INDIVIDUAL_SHEETS); i++) {
      const invoice = invoicesToExport[i]
      const sheetName = this.createSafeSheetName(`فاتورة_${invoice.invoice_number}`, i + 1)
      const worksheet = workbook.addWorksheet(sheetName)
      this.createProfessionalInvoiceWorksheet(worksheet, invoice, options)
    }
    
    if (options.companyInfo) {
      const companySheet = workbook.addWorksheet('معلومات الشركة')
      this.createCompanyInfoSheet(companySheet, options.companyInfo)
    }
    
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const companyName = options.companyInfo?.name?.replace(/\s/g, '_') || 'invoices'
    link.href = url
    link.download = `الفواتير_${companyName}_${new Date().toISOString().split('T')[0]}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  }
  
  private static createProfessionalSummarySheet(worksheet: ExcelJS.Worksheet, invoices: any[], options: ExportOptions): void {
    worksheet.pageSetup = {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 }
    }
    
    const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F75B5' } }
    const subheaderFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } }
    const evenRowFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }
    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    }
    
    let currentRow = 1
    
    // Title (two lines)
    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const titleRow = worksheet.getRow(currentRow)
    titleRow.height = 40
    const titleCell = titleRow.getCell(1)
    titleCell.value = options.companyInfo?.name || 'لوكسري برفيوم للتجارة'
    titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFFFF' } }
    titleCell.fill = headerFill
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    currentRow++
    
    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const subtitleRow = worksheet.getRow(currentRow)
    subtitleRow.height = 30
    const subtitleCell = subtitleRow.getCell(1)
    subtitleCell.value = 'تقرير الفواتير'
    subtitleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
    subtitleCell.fill = headerFill
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    currentRow++
    currentRow++
    
    // Statistics (no emojis)
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
    const paidCount = invoices.filter(inv => inv.status === 'paid').length
    const issuedCount = invoices.filter(inv => inv.status === 'issued').length
    const draftCount = invoices.filter(inv => inv.status === 'draft').length
    const cancelledCount = invoices.filter(inv => inv.status === 'cancelled').length
    
    worksheet.mergeCells(currentRow, 1, currentRow, 4)
    worksheet.mergeCells(currentRow, 5, currentRow, 8)
    const statsRow = worksheet.getRow(currentRow)
    statsRow.height = 28
    const statsCell1 = statsRow.getCell(1)
    statsCell1.value = `إجمالي الفواتير: ${invoices.length} | الإجمالي: ${totalAmount.toLocaleString()} ج.م`
    statsCell1.font = { name: 'Arial', size: 12, bold: true }
    statsCell1.fill = subheaderFill
    statsCell1.alignment = { horizontal: 'center', vertical: 'middle' }
    
    const statsCell5 = statsRow.getCell(5)
    statsCell5.value = `مدفوعة: ${paidCount} | صادرة: ${issuedCount} | مسودة: ${draftCount} | ملغاة: ${cancelledCount}`
    statsCell5.font = { name: 'Arial', size: 12, bold: true }
    statsCell5.fill = subheaderFill
    statsCell5.alignment = { horizontal: 'center', vertical: 'middle' }
    currentRow++
    currentRow++
    
    // Table headers
    const headers = ['#', 'رقم الفاتورة', 'العميل', 'الهاتف', 'التاريخ', 'تاريخ الاستحقاق', 'المبلغ', 'الحالة']
    const headerRow = worksheet.getRow(currentRow)
    headerRow.height = 28
    for (let i = 0; i < headers.length; i++) {
      const cell = headerRow.getCell(i + 1)
      cell.value = headers[i]
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = headerFill
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = thinBorder
    }
    currentRow++
    
    // Data rows with alternating fill
    for (let i = 0; i < invoices.length; i++) {
      const inv = invoices[i]
      const row = worksheet.getRow(currentRow)
      row.height = 22
      
      if (i % 2 === 0) {
        for (let col = 1; col <= 8; col++) {
          row.getCell(col).fill = evenRowFill
        }
      }
      
      row.getCell(1).value = i + 1
      row.getCell(2).value = inv.invoice_number
      row.getCell(3).value = inv.customer?.name || '—'
      row.getCell(4).value = inv.customer?.phone || '—'
      row.getCell(5).value = this.formatDate(inv.invoice_date)
      row.getCell(6).value = this.formatDate(inv.due_date)
      row.getCell(7).value = inv.total_amount || 0
      row.getCell(8).value = this.getStatusText(inv.status)
      
      for (let col = 1; col <= 8; col++) {
        const cell = row.getCell(col)
        cell.font = { name: 'Arial', size: 10 }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = thinBorder
        if (col === 8) {
          if (inv.status === 'paid') {
            cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF16A34A' } }
          } else if (inv.status === 'issued') {
            cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF2F75B5' } }
          } else if (inv.status === 'cancelled') {
            cell.font = { name: 'Arial', size: 10, color: { argb: 'FFDC2626' } }
          }
        }
      }
      row.getCell(7).numFmt = '#,##0.00'
      currentRow++
    }
    currentRow++
    
    // Footer
    worksheet.mergeCells(currentRow, 1, currentRow, 8)
    const footerRow = worksheet.getRow(currentRow)
    footerRow.height = 24
    const footerCell = footerRow.getCell(1)
    footerCell.value = `تم التصدير في: ${new Date().toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    footerCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF666666' } }
    footerCell.alignment = { horizontal: 'center', vertical: 'middle' }
    footerCell.border = thinBorder
    
    worksheet.columns = [
      { width: 8 }, { width: 15 }, { width: 25 }, { width: 15 },
      { width: 15 }, { width: 15 }, { width: 15 }, { width: 12 }
    ]
  }
  
  private static createProfessionalInvoiceWorksheet(worksheet: ExcelJS.Worksheet, invoice: any, options: ExportOptions): void {
    worksheet.pageSetup = {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 }
    }
    
    const companyName = options.companyInfo?.name || 'لوكسري برفيوم للتجارة'
    
    const titleFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 20, bold: true, color: { argb: 'FFFFFFFF' } }
    const headerFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
    const labelFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 11, bold: true }
    const valueFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 11 }
    const tableHeaderFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    const tableFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 10 }
    const totalFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 14, bold: true }
    
    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    }
    const thickBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thick', color: { argb: 'FF2F75B5' } },
      left: { style: 'thick', color: { argb: 'FF2F75B5' } },
      bottom: { style: 'thick', color: { argb: 'FF2F75B5' } },
      right: { style: 'thick', color: { argb: 'FF2F75B5' } }
    }
    
    const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F75B5' } }
    const subheaderFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } }
    const accentFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8CBAD' } }
    const totalFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC5E0B4' } }
    const evenRowFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }
    
    worksheet.columns = [
      { width: 8 }, { width: 35 }, { width: 12 }, { width: 12 }, { width: 15 }, { width: 18 }
    ]
    
    let currentRow = 1
    
    // Header with company name only (full details are in separate sheet)
    worksheet.mergeCells(currentRow, 1, currentRow, 6)
    const headerRow = worksheet.getRow(currentRow)
    headerRow.height = 50
    const headerCell = headerRow.getCell(1)
    headerCell.value = `${companyName}\nفاتورة ضريبية`
    headerCell.font = titleFont
    headerCell.fill = headerFill
    headerCell.alignment = { horizontal: 'center', vertical: 'middle' }
    headerCell.border = thickBorder
    currentRow++
    
    // Invoice info
    worksheet.mergeCells(currentRow, 1, currentRow, 3)
    worksheet.mergeCells(currentRow, 4, currentRow, 6)
    const infoRow = worksheet.getRow(currentRow)
    infoRow.height = 28
    const infoCell1 = infoRow.getCell(1)
    infoCell1.value = `رقم الفاتورة: ${invoice.invoice_number}`
    infoCell1.font = { name: 'Arial', size: 12, bold: true }
    infoCell1.fill = subheaderFill
    infoCell1.alignment = { horizontal: 'right', vertical: 'middle' }
    infoCell1.border = thinBorder
    
    const infoCell4 = infoRow.getCell(4)
    infoCell4.value = `التاريخ: ${this.formatDate(invoice.invoice_date)}`
    infoCell4.font = { name: 'Arial', size: 12, bold: true }
    infoCell4.fill = subheaderFill
    infoCell4.alignment = { horizontal: 'right', vertical: 'middle' }
    infoCell4.border = thinBorder
    currentRow++
    currentRow++
    
    // Customer section only (company removed)
    worksheet.mergeCells(currentRow, 1, currentRow, 6)
    const customerHeaderRow = worksheet.getRow(currentRow)
    customerHeaderRow.height = 24
    const customerHeaderCell = customerHeaderRow.getCell(1)
    customerHeaderCell.value = 'بيانات العميل'
    customerHeaderCell.font = headerFont
    customerHeaderCell.fill = headerFill
    customerHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' }
    customerHeaderCell.border = thinBorder
    currentRow++
    
    let row = worksheet.getRow(currentRow)
    row.height = 22
    
    let cell = row.getCell(1)
    cell.value = 'اسم العميل:'
    cell.font = labelFont
    cell.fill = accentFill
    cell.alignment = { horizontal: 'right', vertical: 'middle' }
    cell.border = thinBorder
    
    cell = row.getCell(2)
    cell.value = invoice.customer?.name || '—'
    cell.font = valueFont
    cell.alignment = { horizontal: 'left', vertical: 'middle' }
    cell.border = thinBorder
    
    cell = row.getCell(4)
    cell.value = 'الهاتف:'
    cell.font = labelFont
    cell.fill = accentFill
    cell.alignment = { horizontal: 'right', vertical: 'middle' }
    cell.border = thinBorder
    
    cell = row.getCell(5)
    cell.value = invoice.customer?.phone || '—'
    cell.font = valueFont
    cell.alignment = { horizontal: 'left', vertical: 'middle' }
    cell.border = thinBorder
    
    worksheet.mergeCells(currentRow, 3, currentRow, 3)
    row.getCell(3).border = thinBorder
    currentRow++
    
    row = worksheet.getRow(currentRow)
    row.height = 22
    
    cell = row.getCell(1)
    cell.value = 'البريد الإلكتروني:'
    cell.font = labelFont
    cell.fill = accentFill
    cell.alignment = { horizontal: 'right', vertical: 'middle' }
    cell.border = thinBorder
    
    cell = row.getCell(2)
    cell.value = invoice.customer?.email || '—'
    cell.font = valueFont
    cell.alignment = { horizontal: 'left', vertical: 'middle' }
    cell.border = thinBorder
    
    cell = row.getCell(4)
    cell.value = 'العنوان:'
    cell.font = labelFont
    cell.fill = accentFill
    cell.alignment = { horizontal: 'right', vertical: 'middle' }
    cell.border = thinBorder
    
    cell = row.getCell(5)
    cell.value = invoice.customer?.address || '—'
    cell.font = valueFont
    cell.alignment = { horizontal: 'left', vertical: 'middle' }
    cell.border = thinBorder
    
    worksheet.mergeCells(currentRow, 3, currentRow, 3)
    row.getCell(3).border = thinBorder
    currentRow++
    
    row = worksheet.getRow(currentRow)
    row.height = 22
    
    cell = row.getCell(1)
    cell.value = 'الرقم الضريبي:'
    cell.font = labelFont
    cell.fill = accentFill
    cell.alignment = { horizontal: 'right', vertical: 'middle' }
    cell.border = thinBorder
    
    cell = row.getCell(2)
    cell.value = invoice.customer?.tax_number || '—'
    cell.font = valueFont
    cell.alignment = { horizontal: 'left', vertical: 'middle' }
    cell.border = thinBorder
    
    worksheet.mergeCells(currentRow, 3, currentRow, 6)
    row.getCell(3).border = thinBorder
    currentRow++
    currentRow++
    
    // Items table
    worksheet.mergeCells(currentRow, 1, currentRow, 6)
    const itemsHeaderRow = worksheet.getRow(currentRow)
    itemsHeaderRow.height = 24
    const itemsHeaderCell = itemsHeaderRow.getCell(1)
    itemsHeaderCell.value = 'الأصناف'
    itemsHeaderCell.font = headerFont
    itemsHeaderCell.fill = headerFill
    itemsHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' }
    itemsHeaderCell.border = thinBorder
    currentRow++
    
    const headers = ['م', 'الصنف', 'الكود', 'الكمية', 'سعر الوحدة', 'الإجمالي']
    const headerRow2 = worksheet.getRow(currentRow)
    headerRow2.height = 28
    for (let i = 0; i < headers.length; i++) {
      const headerCellItem = headerRow2.getCell(i + 1)
      headerCellItem.value = headers[i]
      headerCellItem.font = tableHeaderFont
      headerCellItem.fill = headerFill
      headerCellItem.alignment = { horizontal: 'center', vertical: 'middle' }
      headerCellItem.border = thinBorder
    }
    currentRow++
    
    const items = invoice.items || []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const dataRow = worksheet.getRow(currentRow)
      dataRow.height = 22
      
      if (i % 2 === 0) {
        for (let col = 1; col <= 6; col++) {
          dataRow.getCell(col).fill = evenRowFill
        }
      }
      
      dataRow.getCell(1).value = i + 1
      dataRow.getCell(2).value = item.name || '—'
      dataRow.getCell(3).value = item.code || '—'
      dataRow.getCell(4).value = item.quantity || 0
      dataRow.getCell(5).value = item.unit_price || 0
      dataRow.getCell(6).value = item.total || 0
      
      for (let col = 1; col <= 6; col++) {
        const dataCell = dataRow.getCell(col)
        dataCell.font = tableFont
        dataCell.alignment = { horizontal: 'center', vertical: 'middle' }
        dataCell.border = thinBorder
        if (col === 5 || col === 6) {
          dataCell.numFmt = '#,##0.00'
        }
      }
      currentRow++
    }
    currentRow++
    
    // Totals
    worksheet.mergeCells(currentRow, 1, currentRow, 4)
    const subtotalRow = worksheet.getRow(currentRow)
    subtotalRow.height = 24
    const subtotalCell1 = subtotalRow.getCell(1)
    subtotalCell1.value = 'المجموع الفرعي'
    subtotalCell1.font = labelFont
    subtotalCell1.alignment = { horizontal: 'left', vertical: 'middle' }
    subtotalCell1.border = thinBorder
    
    const subtotalCell5 = subtotalRow.getCell(5)
    subtotalCell5.value = invoice.subtotal || 0
    subtotalCell5.font = valueFont
    subtotalCell5.alignment = { horizontal: 'center', vertical: 'middle' }
    subtotalCell5.border = thinBorder
    subtotalCell5.numFmt = '#,##0.00'
    currentRow++
    
    worksheet.mergeCells(currentRow, 1, currentRow, 4)
    const discountRow = worksheet.getRow(currentRow)
    discountRow.height = 24
    const discountCell1 = discountRow.getCell(1)
    discountCell1.value = `الخصم (${invoice.discount_value || 0} ${invoice.discount_type === 'percentage' ? '%' : 'ج.م'})`
    discountCell1.font = labelFont
    discountCell1.alignment = { horizontal: 'left', vertical: 'middle' }
    discountCell1.border = thinBorder
    
    const discountCell5 = discountRow.getCell(5)
    discountCell5.value = -(invoice.discount_amount || 0)
    discountCell5.font = { ...valueFont, color: { argb: 'FFDC2626' } }
    discountCell5.alignment = { horizontal: 'center', vertical: 'middle' }
    discountCell5.border = thinBorder
    discountCell5.numFmt = '#,##0.00'
    currentRow++
    
    worksheet.mergeCells(currentRow, 1, currentRow, 4)
    const shippingRow = worksheet.getRow(currentRow)
    shippingRow.height = 24
    const shippingCell1 = shippingRow.getCell(1)
    shippingCell1.value = 'الشحن'
    shippingCell1.font = labelFont
    shippingCell1.alignment = { horizontal: 'left', vertical: 'middle' }
    shippingCell1.border = thinBorder
    
    const shippingCell5 = shippingRow.getCell(5)
    shippingCell5.value = invoice.shipping_cost || 0
    shippingCell5.font = valueFont
    shippingCell5.alignment = { horizontal: 'center', vertical: 'middle' }
    shippingCell5.border = thinBorder
    shippingCell5.numFmt = '#,##0.00'
    currentRow++
    
    worksheet.mergeCells(currentRow, 1, currentRow, 4)
    const vatRow = worksheet.getRow(currentRow)
    vatRow.height = 24
    const vatCell1 = vatRow.getCell(1)
    vatCell1.value = `الضريبة (${invoice.vat_rate || 0}%)`
    vatCell1.font = labelFont
    vatCell1.alignment = { horizontal: 'left', vertical: 'middle' }
    vatCell1.border = thinBorder
    
    const vatCell5 = vatRow.getCell(5)
    vatCell5.value = invoice.vat_amount || 0
    vatCell5.font = valueFont
    vatCell5.alignment = { horizontal: 'center', vertical: 'middle' }
    vatCell5.border = thinBorder
    vatCell5.numFmt = '#,##0.00'
    currentRow++
    
    worksheet.mergeCells(currentRow, 1, currentRow, 4)
    const totalRow = worksheet.getRow(currentRow)
    totalRow.height = 32
    const totalCell1 = totalRow.getCell(1)
    totalCell1.value = 'الإجمالي النهائي'
    totalCell1.font = totalFont
    totalCell1.fill = totalFill
    totalCell1.alignment = { horizontal: 'left', vertical: 'middle' }
    totalCell1.border = thickBorder
    
    const totalCell5 = totalRow.getCell(5)
    totalCell5.value = invoice.total_amount || 0
    totalCell5.font = { ...totalFont, color: { argb: 'FF16A34A' } }
    totalCell5.fill = totalFill
    totalCell5.alignment = { horizontal: 'center', vertical: 'middle' }
    totalCell5.border = thickBorder
    totalCell5.numFmt = '#,##0.00'
    currentRow++
    currentRow++
    
    // Signature section (top border only, matching item card style)
    const signaturesRow = worksheet.getRow(currentRow)
    signaturesRow.height = 50
    
    worksheet.mergeCells(currentRow, 1, currentRow, 3)
    const sigCell1 = signaturesRow.getCell(1)
    sigCell1.value = 'توقيع العميل'
    sigCell1.font = { name: 'Arial', size: 10, italic: true }
    sigCell1.alignment = { horizontal: 'center', vertical: 'bottom' }
    sigCell1.border = { top: { style: 'thin', color: { argb: 'FF000000' } } }
    
    worksheet.mergeCells(currentRow, 4, currentRow, 6)
    const sigCell4 = signaturesRow.getCell(4)
    sigCell4.value = 'توقيع البائع'
    sigCell4.font = { name: 'Arial', size: 10, italic: true }
    sigCell4.alignment = { horizontal: 'center', vertical: 'bottom' }
    sigCell4.border = { top: { style: 'thin', color: { argb: 'FF000000' } } }
    currentRow++
    currentRow++
    
    // Footer
    worksheet.mergeCells(currentRow, 1, currentRow, 6)
    const footerRow = worksheet.getRow(currentRow)
    footerRow.height = 24
    const footerCell = footerRow.getCell(1)
    footerCell.value = `تم التصدير في: ${new Date().toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    footerCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF666666' } }
    footerCell.alignment = { horizontal: 'center', vertical: 'middle' }
    footerCell.border = thinBorder
  }
  
  private static createCompanyInfoSheet(worksheet: ExcelJS.Worksheet, companyInfo: any): void {
    worksheet.pageSetup = {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 }
    }
    
    const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F75B5' } }
    const labelFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8CBAD' } }
    const evenRowFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }
    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    }
    
    let currentRow = 1
    
    // Title
    worksheet.mergeCells(currentRow, 1, currentRow, 2)
    const titleRow = worksheet.getRow(currentRow)
    titleRow.height = 40
    const titleCell = titleRow.getCell(1)
    titleCell.value = 'معلومات الشركة'
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
    titleCell.fill = headerFill
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.border = thinBorder
    currentRow++
    currentRow++
    
    const companyData = [
      { label: 'اسم الشركة', value: companyInfo.name || '—' },
      { label: 'السجل الضريبي', value: companyInfo.taxNumber || '—' },
      { label: 'العنوان', value: companyInfo.address || '—' },
      { label: 'رقم الهاتف', value: companyInfo.phone || '—' },
      { label: 'البريد الإلكتروني', value: companyInfo.email || '—' },
      { label: 'تاريخ التصدير', value: new Date().toLocaleString('ar-EG') }
    ]
    
    for (let i = 0; i < companyData.length; i++) {
      const data = companyData[i]
      const row = worksheet.getRow(currentRow)
      row.height = 24
      
      if (i % 2 === 0) {
        row.getCell(1).fill = evenRowFill
        row.getCell(2).fill = evenRowFill
      }
      
      const labelCell = row.getCell(1)
      labelCell.value = data.label
      labelCell.font = { name: 'Arial', size: 12, bold: true }
      if (i % 2 !== 0) labelCell.fill = labelFill
      labelCell.alignment = { horizontal: 'right', vertical: 'middle' }
      labelCell.border = thinBorder
      
      const valueCell = row.getCell(2)
      valueCell.value = data.value
      valueCell.font = { name: 'Arial', size: 12 }
      if (i % 2 !== 0) valueCell.fill = labelFill
      valueCell.alignment = { horizontal: 'left', vertical: 'middle' }
      valueCell.border = thinBorder
      
      currentRow++
    }
    
    worksheet.columns = [{ width: 25 }, { width: 50 }]
  }
  
  private static formatDate(date: any): string {
    if (!date) return '—'
    const d = new Date(date)
    return d.toLocaleDateString('ar-EG')
  }
  
  private static getStatusText(status: string): string {
    const texts: Record<string, string> = { draft: 'مسودة', issued: 'صادرة', paid: 'مدفوعة', cancelled: 'ملغاة' }
    return texts[status] || status
  }
  
  private static createSafeSheetName(baseName: string, index?: number): string {
    let name = baseName
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
