// src/services/singleInvoiceExport.ts
import * as ExcelJS from 'exceljs'
import { Buffer } from 'buffer'
import { supabase } from '@/services/supabase'

async function fetchImageAsBuffer(
  url: string | null | undefined
): Promise<Buffer | null> {
  if (!url) return null

  try {
    if (url.startsWith('data:image')) {
      const base64Data = url.split(',')[1]
      return Buffer.from(base64Data, 'base64')
    }

    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

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

export class SingleInvoiceExportService {
  static async exportSingleInvoice(invoice: any): Promise<void> {
    let companyInfo = {
      name: 'لوكسري برفيوم للتجارة',
      taxNumber: '123-456-789',
      address: 'مصر - القاهرة - مدينة نصر',
      phone: '01234567890',
      email: 'info@luxuryperfume.com',
      logoUrl: null as string | null
    }

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      let tenantId = session?.user?.user_metadata?.tenant_id

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
        const { data, error } = await supabase
          .from('tenants')
          .select('name, logo_url, settings')
          .eq('id', tenantId)
          .single()

        if (!error && data) {
          const settings = data.settings || {}

          companyInfo = {
            name: data.name || companyInfo.name,
            taxNumber:
              settings?.tax_number ||
              settings?.taxNumber ||
              companyInfo.taxNumber,
            address:
              settings?.address ||
              settings?.company_address ||
              companyInfo.address,
            phone:
              settings?.phone ||
              settings?.company_phone ||
              companyInfo.phone,
            email:
              settings?.email ||
              settings?.company_email ||
              companyInfo.email,
            logoUrl:
              data?.logo_url ||
              settings?.logo_url ||
              settings?.logo ||
              null
          }
        }
      }
    } catch (error) {
      console.error('Error fetching tenant info:', error)
    }

    const workbook = new ExcelJS.Workbook()
    workbook.creator = companyInfo.name || 'P.commerce'
    workbook.created = new Date()

    let logoImageId: number | null = null
    if (companyInfo.logoUrl) {
      try {
        const logoBuffer = await fetchImageAsBuffer(companyInfo.logoUrl)
        if (logoBuffer) {
          logoImageId = workbook.addImage({
            buffer: asExcelJSBuffer(logoBuffer),
            extension: 'png' as const
          })
        }
      } catch (e) {
        console.warn('Failed to add company logo:', e)
      }
    }

    const sheetName = this.createSafeSheetName(`فاتورة_${invoice.invoice_number}`)
    const worksheet = workbook.addWorksheet(sheetName)

    // Enable RTL for the worksheet
    // @ts-ignore - rightToLeft is supported at runtime even if types do not expose it
    worksheet.views = [{ rightToLeft: true, showGridLines: false, zoomScale: 90 }]

    this.createProfessionalInvoiceWorksheet(
      worksheet,
      invoice,
      companyInfo,
      logoImageId
    )

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
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
    companyInfo: any,
    logoImageId: number | null
  ): void {
    worksheet.pageSetup = {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3
      }
    }

    const titleFont: Partial<ExcelJS.Font> = {
      name: 'Cairo',
      size: 20,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    }

    const headerFont: Partial<ExcelJS.Font> = {
      name: 'Cairo',
      size: 14,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    }

    const labelFont: Partial<ExcelJS.Font> = {
      name: 'Cairo',
      size: 11,
      bold: true
    }

    const valueFont: Partial<ExcelJS.Font> = {
      name: 'Cairo',
      size: 11
    }

    const tableHeaderFont: Partial<ExcelJS.Font> = {
      name: 'Cairo',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    }

    const tableFont: Partial<ExcelJS.Font> = {
      name: 'Cairo',
      size: 10
    }

    const totalFont: Partial<ExcelJS.Font> = {
      name: 'Cairo',
      size: 14,
      bold: true
    }

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

    const headerFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2F75B5' }
    }

    const subheaderFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFBDD7EE' }
    }

    const accentFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF8CBAD' }
    }

    const totalFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFC5E0B4' }
    }

    const evenRowFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' }
    }

    // Column widths
    worksheet.columns = [
      { width: 8 },   // A - #
      { width: 44 },  // B - الصنف / client value area
      { width: 17 },  // C - الكود / client value area
      { width: 12 },  // D - الكمية / company label area
      { width: 18 },  // E - سعر الوحدة / company value area
      { width: 18 }   // F - الإجمالي / company value area
    ]

    let currentRow = 1

    // ============================================================
    // 1. LOGO AREA - Same approach as excelExport service
    //    Create a merged cell area for the logo
    // ============================================================

    const logoStartRow = currentRow
    const logoEndRow = currentRow + 3

    // Set heights for the rows that will contain the logo
    for (let r = logoStartRow; r <= logoEndRow; r++) {
      worksheet.getRow(r).height = 28
    }

    // Merge cells for logo area (columns 1-2)
    worksheet.mergeCells(logoStartRow, 1, logoEndRow, 2)

    if (logoImageId !== null) {
      try {
        // Use the exact same approach as excelExport
        // Place the image to fill the merged area using tl and br
        worksheet.addImage(logoImageId, {
          tl: { col: 0.3, row: logoStartRow - 0.15 } as any,
          br: { col: 2.3, row: logoEndRow + 0.15 } as any,
          editAs: 'absolute'
        } as any)

        // Apply thick border to the logo area like excelExport does
        const imageCell = worksheet.getCell(logoStartRow, 1)
        imageCell.border = thickBorder

        // Also apply border to all cells in the logo area
        for (let r = logoStartRow; r <= logoEndRow; r++) {
          for (let c = 1; c <= 2; c++) {
            const cell = worksheet.getCell(r, c)
            cell.border = thickBorder
          }
        }
      } catch (e) {
        console.warn('Failed to add logo:', e)
        // Apply border even if logo fails
        for (let r = logoStartRow; r <= logoEndRow; r++) {
          for (let c = 1; c <= 2; c++) {
            const cell = worksheet.getCell(r, c)
            cell.border = thickBorder
          }
        }
      }
    } else {
      // If no logo, apply border to the empty area
      for (let r = logoStartRow; r <= logoEndRow; r++) {
        for (let c = 1; c <= 2; c++) {
          const cell = worksheet.getCell(r, c)
          cell.border = thickBorder
        }
      }
    }

    // ============================================================
    // 2. TITLE ROW - Next to the logo
    // ============================================================

    // Merge columns 3-6 for the title
    worksheet.mergeCells(logoStartRow, 3, logoStartRow, 6)
    const titleRow = worksheet.getRow(logoStartRow)
    titleRow.height = 28
    const titleCell = titleRow.getCell(3)
    titleCell.value = `فاتورة ضريبية`
    titleCell.font = { name: 'Cairo', size: 18, bold: true, color: { argb: 'FFFFFFFF' } }
    titleCell.fill = headerFill
    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    }
    titleCell.border = thickBorder

    // ============================================================
    // 3. COMPANY NAME ROW - Below the title
    // ============================================================

    worksheet.mergeCells(logoStartRow + 1, 3, logoStartRow + 1, 6)
    const companyNameRow = worksheet.getRow(logoStartRow + 1)
    companyNameRow.height = 28
    const companyNameCell = companyNameRow.getCell(3)
    companyNameCell.value = companyInfo.name
    companyNameCell.font = { name: 'Cairo', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
    companyNameCell.fill = headerFill
    companyNameCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    }
    companyNameCell.border = thickBorder

    // Fill remaining rows in the logo area with empty cells
    for (let r = logoStartRow + 2; r <= logoEndRow; r++) {
      for (let c = 3; c <= 6; c++) {
        const cell = worksheet.getCell(r, c)
        cell.value = ''
        cell.border = thickBorder
        cell.fill = headerFill
      }
    }

    currentRow = logoEndRow + 1

    // ============================================================
    // 4. INVOICE INFO ROW
    // ============================================================

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
    currentRow += 2

    // ============================================================
    // 5. COMPANY & CUSTOMER CARDS - same start row
    // ============================================================

    const detailsStartRow = currentRow

    worksheet.mergeCells(detailsStartRow, 1, detailsStartRow, 3)
    worksheet.mergeCells(detailsStartRow, 4, detailsStartRow, 6)
    const cardHeaderRow = worksheet.getRow(detailsStartRow)
    cardHeaderRow.height = 24

    const customerHeader = cardHeaderRow.getCell(1)
    customerHeader.value = 'بيانات العميل'
    customerHeader.font = headerFont
    customerHeader.fill = headerFill
    customerHeader.alignment = { horizontal: 'center', vertical: 'middle' }
    customerHeader.border = thinBorder

    const companyHeader = cardHeaderRow.getCell(4)
    companyHeader.value = 'بيانات الشركة'
    companyHeader.font = headerFont
    companyHeader.fill = headerFill
    companyHeader.alignment = { horizontal: 'center', vertical: 'middle' }
    companyHeader.border = thinBorder

    const companyData = [
      { label: 'السجل الضريبي:', value: companyInfo.taxNumber || '—' },
      { label: 'هاتف:', value: companyInfo.phone || '—' },
      { label: 'العنوان:', value: companyInfo.address || '—' },
      { label: 'البريد الإلكتروني:', value: companyInfo.email || '—' }
    ]

    const customerData = [
      { label: 'اسم العميل:', value: invoice.customer?.name || '—' },
      { label: 'الهاتف:', value: invoice.customer?.phone || '—' },
      { label: 'البريد الإلكتروني:', value: invoice.customer?.email || '—' },
      { label: 'العنوان:', value: invoice.customer?.address || '—' },
      { label: 'الرقم الضريبي:', value: invoice.customer?.tax_number || '—' }
    ]

    const maxRows = Math.max(companyData.length, customerData.length)

    for (let i = 0; i < maxRows; i++) {
      const rowIndex = detailsStartRow + 1 + i
      const row = worksheet.getRow(rowIndex)
      row.height = 24

      // Customer block (A:C)
      if (i < customerData.length) {
        const data = customerData[i]

        const labelCell = row.getCell(1)
        labelCell.value = data.label
        labelCell.font = labelFont
        labelCell.fill = accentFill
        labelCell.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          wrapText: true
        }
        labelCell.border = thinBorder

        worksheet.mergeCells(rowIndex, 2, rowIndex, 3)
        const valueCell = row.getCell(2)
        valueCell.value = data.value
        valueCell.font = valueFont
        valueCell.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          wrapText: true
        }
        valueCell.border = thinBorder
      } else {
        worksheet.mergeCells(rowIndex, 1, rowIndex, 3)
        row.getCell(1).border = thinBorder
      }

      // Company block (D:F)
      if (i < companyData.length) {
        const data = companyData[i]

        const labelCell = row.getCell(4)
        labelCell.value = data.label
        labelCell.font = labelFont
        labelCell.fill = accentFill
        labelCell.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          wrapText: true
        }
        labelCell.border = thinBorder

        worksheet.mergeCells(rowIndex, 5, rowIndex, 6)
        const valueCell = row.getCell(5)
        valueCell.value = data.value
        valueCell.font = valueFont
        valueCell.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          wrapText: true
        }
        valueCell.border = thinBorder
      } else {
        worksheet.mergeCells(rowIndex, 4, rowIndex, 6)
        row.getCell(4).border = thinBorder
      }
    }

    currentRow = detailsStartRow + maxRows + 2

    // ============================================================
    // 6. ITEMS SECTION HEADER
    // ============================================================

    worksheet.mergeCells(currentRow, 1, currentRow, 6)
    const itemsHeaderRow = worksheet.getRow(currentRow)
    itemsHeaderRow.height = 28
    const itemsHeaderCell = itemsHeaderRow.getCell(1)
    itemsHeaderCell.value = 'الأصناف'
    itemsHeaderCell.font = headerFont
    itemsHeaderCell.fill = headerFill
    itemsHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' }
    itemsHeaderCell.border = thinBorder
    currentRow++

    // ============================================================
    // 7. TABLE HEADERS
    // ============================================================

    const headers = ['#', 'الصنف', 'الكود', 'الكمية', 'سعر الوحدة', 'الإجمالي']
    const headerRow2 = worksheet.getRow(currentRow)
    headerRow2.height = 30

    for (let i = 0; i < headers.length; i++) {
      const headerCellItem = headerRow2.getCell(i + 1)
      headerCellItem.value = headers[i]
      headerCellItem.font = tableHeaderFont
      headerCellItem.fill = headerFill
      headerCellItem.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      }
      headerCellItem.border = thinBorder
    }

    currentRow++

    // ============================================================
    // 8. ITEM ROWS
    // ============================================================

    const items = invoice.items || []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const dataRow = worksheet.getRow(currentRow)
      dataRow.height = 24

      if (i % 2 === 0) {
        for (let col = 1; col <= 6; col++) {
          dataRow.getCell(col).fill = evenRowFill
        }
      }

      dataRow.getCell(1).value = i + 1
      dataRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }

      dataRow.getCell(2).value = item.name || '—'
      dataRow.getCell(2).alignment = {
        horizontal: 'right',
        vertical: 'middle',
        wrapText: true
      }

      dataRow.getCell(3).value = item.code || '—'
      dataRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' }

      dataRow.getCell(4).value = item.quantity || 0
      dataRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' }
      dataRow.getCell(4).numFmt = '#,##0.##'

      dataRow.getCell(5).value = item.unit_price || 0
      dataRow.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' }
      dataRow.getCell(5).numFmt = '#,##0.00'

      dataRow.getCell(6).value = item.total || 0
      dataRow.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' }
      dataRow.getCell(6).numFmt = '#,##0.00'

      for (let col = 1; col <= 6; col++) {
        const dataCell = dataRow.getCell(col)
        dataCell.font = tableFont
        dataCell.border = thinBorder
      }

      currentRow++
    }

    currentRow++

    // ============================================================
    // 9. TOTALS
    // ============================================================

    worksheet.mergeCells(currentRow, 1, currentRow, 4)
    worksheet.mergeCells(currentRow, 5, currentRow, 6)
    const subtotalRow = worksheet.getRow(currentRow)
    subtotalRow.height = 24

    const subtotalCell1 = subtotalRow.getCell(1)
    subtotalCell1.value = 'المجموع الفرعي'
    subtotalCell1.font = labelFont
    subtotalCell1.alignment = { horizontal: 'right', vertical: 'middle' }
    subtotalCell1.border = thinBorder

    const subtotalCell5 = subtotalRow.getCell(5)
    subtotalCell5.value = invoice.subtotal || 0
    subtotalCell5.font = valueFont
    subtotalCell5.alignment = { horizontal: 'right', vertical: 'middle' }
    subtotalCell5.border = thinBorder
    subtotalCell5.numFmt = '#,##0.00'
    currentRow++

    worksheet.mergeCells(currentRow, 1, currentRow, 4)
    worksheet.mergeCells(currentRow, 5, currentRow, 6)
    const discountRow = worksheet.getRow(currentRow)
    discountRow.height = 24

    const discountCell1 = discountRow.getCell(1)
    discountCell1.value = `الخصم (${invoice.discount_value || 0} ${invoice.discount_type === 'percentage' ? '%' : 'ج.م'})`
    discountCell1.font = labelFont
    discountCell1.alignment = { horizontal: 'right', vertical: 'middle' }
    discountCell1.border = thinBorder

    const discountCell5 = discountRow.getCell(5)
    discountCell5.value = -(invoice.discount_amount || 0)
    discountCell5.font = { ...valueFont, color: { argb: 'FFDC2626' } }
    discountCell5.alignment = { horizontal: 'right', vertical: 'middle' }
    discountCell5.border = thinBorder
    discountCell5.numFmt = '#,##0.00'
    currentRow++

    worksheet.mergeCells(currentRow, 1, currentRow, 4)
    worksheet.mergeCells(currentRow, 5, currentRow, 6)
    const shippingRow = worksheet.getRow(currentRow)
    shippingRow.height = 24

    const shippingCell1 = shippingRow.getCell(1)
    shippingCell1.value = 'الشحن'
    shippingCell1.font = labelFont
    shippingCell1.alignment = { horizontal: 'right', vertical: 'middle' }
    shippingCell1.border = thinBorder

    const shippingCell5 = shippingRow.getCell(5)
    shippingCell5.value = invoice.shipping_cost || 0
    shippingCell5.font = valueFont
    shippingCell5.alignment = { horizontal: 'right', vertical: 'middle' }
    shippingCell5.border = thinBorder
    shippingCell5.numFmt = '#,##0.00'
    currentRow++

    worksheet.mergeCells(currentRow, 1, currentRow, 4)
    worksheet.mergeCells(currentRow, 5, currentRow, 6)
    const vatRow = worksheet.getRow(currentRow)
    vatRow.height = 24

    const vatCell1 = vatRow.getCell(1)
    vatCell1.value = `الضريبة (${invoice.vat_rate || 0}%)`
    vatCell1.font = labelFont
    vatCell1.alignment = { horizontal: 'right', vertical: 'middle' }
    vatCell1.border = thinBorder

    const vatCell5 = vatRow.getCell(5)
    vatCell5.value = invoice.vat_amount || 0
    vatCell5.font = valueFont
    vatCell5.alignment = { horizontal: 'right', vertical: 'middle' }
    vatCell5.border = thinBorder
    vatCell5.numFmt = '#,##0.00'
    currentRow++

    worksheet.mergeCells(currentRow, 1, currentRow, 4)
    worksheet.mergeCells(currentRow, 5, currentRow, 6)
    const totalRow = worksheet.getRow(currentRow)
    totalRow.height = 32

    const totalCell1 = totalRow.getCell(1)
    totalCell1.value = 'الإجمالي النهائي'
    totalCell1.font = totalFont
    totalCell1.fill = totalFill
    totalCell1.alignment = { horizontal: 'right', vertical: 'middle' }
    totalCell1.border = thickBorder

    const totalCell5 = totalRow.getCell(5)
    totalCell5.value = invoice.total_amount || 0
    totalCell5.font = { ...totalFont, color: { argb: 'FF16A34A' } }
    totalCell5.fill = totalFill
    totalCell5.alignment = { horizontal: 'right', vertical: 'middle' }
    totalCell5.border = thickBorder
    totalCell5.numFmt = '#,##0.00'
    currentRow += 2

    // ============================================================
    // 10. SIGNATURES
    // ============================================================

    const signaturesRow = worksheet.getRow(currentRow)
    signaturesRow.height = 50

    worksheet.mergeCells(currentRow, 1, currentRow, 3)
    const sigCell1 = signaturesRow.getCell(1)
    sigCell1.value = 'توقيع العميل'
    sigCell1.font = { name: 'Cairo', size: 10, italic: true }
    sigCell1.alignment = { horizontal: 'center', vertical: 'bottom' }
    sigCell1.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } }
    }

    worksheet.mergeCells(currentRow, 4, currentRow, 6)
    const sigCell4 = signaturesRow.getCell(4)
    sigCell4.value = 'توقيع البائع'
    sigCell4.font = { name: 'Cairo', size: 10, italic: true }
    sigCell4.alignment = { horizontal: 'center', vertical: 'bottom' }
    sigCell4.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } }
    }

    currentRow += 2

    // ============================================================
    // 11. FOOTER
    // ============================================================

    worksheet.mergeCells(currentRow, 1, currentRow, 6)
    const footerRow = worksheet.getRow(currentRow)
    footerRow.height = 40
    const footerCell = footerRow.getCell(1)
    const footerText = `هذه الفاتورة صادرة من ${companyInfo.name} - شكراً لتعاملكم معنا\nللتواصل: ${companyInfo.phone} | البريد الإلكتروني: ${companyInfo.email}\nتم الإنشاء في: ${new Date().toLocaleString('ar-EG')}`
    footerCell.value = footerText
    footerCell.font = {
      name: 'Cairo',
      size: 10,
      italic: true,
      color: { argb: 'FF444444' }
    }
    footerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF9FAFB' }
    }
    footerCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    }
    footerCell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    }

    // ============================================================
    // 12. FINAL FORMATTING
    // ============================================================

    for (let rowNumber = 1; rowNumber <= currentRow; rowNumber++) {
      const row = worksheet.getRow(rowNumber)
      if (!row.height) {
        row.height = 22
      }
    }

    // Keep RTL after formatting
    // @ts-ignore - runtime support
    worksheet.views = [{ rightToLeft: true, showGridLines: false, zoomScale: 90 }]
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