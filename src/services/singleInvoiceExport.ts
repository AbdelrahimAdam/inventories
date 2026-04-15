// src/services/singleInvoiceExport.ts
import * as ExcelJS from 'exceljs'
import { supabase } from '@/services/supabase'

export class SingleInvoiceExportService {
  static async exportSingleInvoice(invoice: any): Promise<void> {
    // Get tenant info with complete settings
    let companyInfo = {
      name: 'لوكسري برفيوم للتجارة',
      taxNumber: '123-456-789',
      address: 'مصر - القاهرة - مدينة نصر',
      phone: '01234567890',
      email: 'info@luxuryperfume.com'
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Try to get tenant_id from session user metadata first
      let tenantId = session?.user?.user_metadata?.tenant_id
      
      // If not found in metadata, try to get from user's profile
      if (!tenantId && session?.user?.id) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', session.user.id)
          .single()
        
        if (!userError && userData) {
          tenantId = userData.tenant_id
        }
      }
      
      if (tenantId) {
        // Fetch complete tenant information including settings
        const { data, error } = await supabase
          .from('tenants')
          .select('name, settings')
          .eq('id', tenantId)
          .single()
        
        if (!error && data) {
          const settings = data.settings || {}
          
          companyInfo = {
            name: data.name || companyInfo.name,
            taxNumber: settings?.tax_number || settings?.taxNumber || companyInfo.taxNumber,
            address: settings?.address || settings?.company_address || companyInfo.address,
            phone: settings?.phone || settings?.company_phone || companyInfo.phone,
            email: settings?.email || settings?.company_email || companyInfo.email
          }
        }
      }
    } catch (error) {
      console.error('Error fetching tenant info:', error)
    }

    const workbook = new ExcelJS.Workbook()
    workbook.creator = companyInfo.name || 'P.commerce'
    workbook.created = new Date()
    
    const sheetName = this.createSafeSheetName(`فاتورة_${invoice.invoice_number}`)
    const worksheet = workbook.addWorksheet(sheetName)
    
    this.createProfessionalInvoiceWorksheet(worksheet, invoice, companyInfo)
    
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const companyName = companyInfo.name.replace(/\s/g, '_')
    link.href = url
    link.download = `فاتورة_${invoice.invoice_number}_${companyName}_${new Date().toISOString().split('T')[0]}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  }
  
  private static createProfessionalInvoiceWorksheet(
    worksheet: ExcelJS.Worksheet, 
    invoice: any, 
    companyInfo: any
  ): void {
    // Page setup
    worksheet.pageSetup = {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 }
    }
    
    // Styles with proper typing
    const titleFont: Partial<ExcelJS.Font> = { name: 'Cairo', size: 20, bold: true, color: { argb: 'FFFFFFFF' } }
    const headerFont: Partial<ExcelJS.Font> = { name: 'Cairo', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
    const labelFont: Partial<ExcelJS.Font> = { name: 'Cairo', size: 11, bold: true }
    const valueFont: Partial<ExcelJS.Font> = { name: 'Cairo', size: 11 }
    const tableHeaderFont: Partial<ExcelJS.Font> = { name: 'Cairo', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    const tableFont: Partial<ExcelJS.Font> = { name: 'Cairo', size: 10 }
    const totalFont: Partial<ExcelJS.Font> = { name: 'Cairo', size: 14, bold: true }
    
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
    
    // Column widths
    worksheet.columns = [
      { width: 8 }, { width: 35 }, { width: 12 }, { width: 12 }, { width: 15 }, { width: 18 }
    ]
    
    let currentRow = 1
    
    // Header with company logo area
    worksheet.mergeCells(currentRow, 1, currentRow, 6)
    const headerRow = worksheet.getRow(currentRow)
    headerRow.height = 60
    const headerCell = headerRow.getCell(1)
    headerCell.value = `${companyInfo.name}\nفاتورة ضريبية`
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
    infoCell1.font = { name: 'Cairo', size: 12, bold: true }
    infoCell1.fill = subheaderFill
    infoCell1.alignment = { horizontal: 'right', vertical: 'middle' }
    infoCell1.border = thinBorder
    
    const infoCell4 = infoRow.getCell(4)
    infoCell4.value = `التاريخ: ${this.formatDate(invoice.invoice_date)}`
    infoCell4.font = { name: 'Cairo', size: 12, bold: true }
    infoCell4.fill = subheaderFill
    infoCell4.alignment = { horizontal: 'right', vertical: 'middle' }
    infoCell4.border = thinBorder
    currentRow++
    currentRow++
    
    // Company section
    worksheet.mergeCells(currentRow, 1, currentRow, 6)
    const companyHeaderRow = worksheet.getRow(currentRow)
    companyHeaderRow.height = 24
    const companyHeaderCell = companyHeaderRow.getCell(1)
    companyHeaderCell.value = 'بيانات الشركة'
    companyHeaderCell.font = headerFont
    companyHeaderCell.fill = headerFill
    companyHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' }
    companyHeaderCell.border = thinBorder
    currentRow++
    
    let row = worksheet.getRow(currentRow)
    row.height = 22
    
    let cell = row.getCell(1)
    cell.value = 'السجل الضريبي:'
    cell.font = labelFont
    cell.fill = accentFill
    cell.alignment = { horizontal: 'right', vertical: 'middle' }
    cell.border = thinBorder
    
    cell = row.getCell(2)
    cell.value = companyInfo.taxNumber
    cell.font = valueFont
    cell.alignment = { horizontal: 'left', vertical: 'middle' }
    cell.border = thinBorder
    
    cell = row.getCell(4)
    cell.value = 'هاتف:'
    cell.font = labelFont
    cell.fill = accentFill
    cell.alignment = { horizontal: 'right', vertical: 'middle' }
    cell.border = thinBorder
    
    cell = row.getCell(5)
    cell.value = companyInfo.phone
    cell.font = valueFont
    cell.alignment = { horizontal: 'left', vertical: 'middle' }
    cell.border = thinBorder
    
    worksheet.mergeCells(currentRow, 3, currentRow, 3)
    row.getCell(3).border = thinBorder
    currentRow++
    
    row = worksheet.getRow(currentRow)
    row.height = 22
    
    cell = row.getCell(1)
    cell.value = 'العنوان:'
    cell.font = labelFont
    cell.fill = accentFill
    cell.alignment = { horizontal: 'right', vertical: 'middle' }
    cell.border = thinBorder
    
    cell = row.getCell(2)
    cell.value = companyInfo.address
    cell.font = valueFont
    cell.alignment = { horizontal: 'left', vertical: 'middle' }
    cell.border = thinBorder
    
    cell = row.getCell(4)
    cell.value = 'البريد الإلكتروني:'
    cell.font = labelFont
    cell.fill = accentFill
    cell.alignment = { horizontal: 'right', vertical: 'middle' }
    cell.border = thinBorder
    
    cell = row.getCell(5)
    cell.value = companyInfo.email
    cell.font = valueFont
    cell.alignment = { horizontal: 'left', vertical: 'middle' }
    cell.border = thinBorder
    
    worksheet.mergeCells(currentRow, 3, currentRow, 3)
    row.getCell(3).border = thinBorder
    currentRow++
    currentRow++
    
    // Customer section
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
    
    row = worksheet.getRow(currentRow)
    row.height = 22
    
    cell = row.getCell(1)
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
    
    const headers = ['#', 'الصنف', 'الكود', 'الكمية', 'سعر الوحدة', 'الإجمالي']
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
      
      const cell1 = dataRow.getCell(1)
      cell1.value = i + 1
      cell1.alignment = { horizontal: 'center', vertical: 'middle' }
      
      const cell2 = dataRow.getCell(2)
      cell2.value = item.name || '—'
      cell2.alignment = { horizontal: 'right', vertical: 'middle' }
      
      const cell3 = dataRow.getCell(3)
      cell3.value = item.code || '—'
      cell3.alignment = { horizontal: 'center', vertical: 'middle' }
      
      const cell4 = dataRow.getCell(4)
      cell4.value = item.quantity || 0
      cell4.alignment = { horizontal: 'center', vertical: 'middle' }
      
      const cell5 = dataRow.getCell(5)
      cell5.value = item.unit_price || 0
      cell5.alignment = { horizontal: 'center', vertical: 'middle' }
      cell5.numFmt = '#,##0.00'
      
      const cell6 = dataRow.getCell(6)
      cell6.value = item.total || 0
      cell6.alignment = { horizontal: 'center', vertical: 'middle' }
      cell6.numFmt = '#,##0.00'
      
      for (let col = 1; col <= 6; col++) {
        const dataCell = dataRow.getCell(col)
        dataCell.font = tableFont
        dataCell.border = thinBorder
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
    
    // Signatures
    const signaturesRow = worksheet.getRow(currentRow)
    signaturesRow.height = 50
    
    worksheet.mergeCells(currentRow, 1, currentRow, 3)
    const sigCell1 = signaturesRow.getCell(1)
    sigCell1.value = 'توقيع العميل'
    sigCell1.font = { name: 'Cairo', size: 10, italic: true }
    sigCell1.alignment = { horizontal: 'center', vertical: 'middle' }
    sigCell1.border = { top: { style: 'thin' } }
    
    worksheet.mergeCells(currentRow, 4, currentRow, 6)
    const sigCell4 = signaturesRow.getCell(4)
    sigCell4.value = 'توقيع البائع'
    sigCell4.font = { name: 'Cairo', size: 10, italic: true }
    sigCell4.alignment = { horizontal: 'center', vertical: 'middle' }
    sigCell4.border = { top: { style: 'thin' } }
    currentRow++
    currentRow++
    
    // Footer with company info
    worksheet.mergeCells(currentRow, 1, currentRow, 6)
    const footerRow = worksheet.getRow(currentRow)
    footerRow.height = 28
    const footerCell = footerRow.getCell(1)
    footerCell.value = `هذه الفاتورة صادرة من ${companyInfo.name} - شكراً لتعاملكم معنا\n${companyInfo.phone} | ${companyInfo.email} | ${companyInfo.address}\nتم الإنشاء في: ${new Date().toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    footerCell.font = { name: 'Cairo', size: 9, italic: true, color: { argb: 'FF666666' } }
    footerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } }
    footerCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    footerCell.border = thinBorder
  }
  
  private static formatDate(date: any): string {
    if (!date) return '—'
    const d = new Date(date)
    return d.toLocaleDateString('ar-EG')
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