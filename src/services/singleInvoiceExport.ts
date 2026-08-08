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

    const sheetName = this.createSafeSheetName(
      `فاتورة_${invoice.invoice_number}`
    )

    const worksheet = workbook.addWorksheet(sheetName)

    /*
     * IMPORTANT:
     * rightToLeft belongs to WorksheetView, not WorkbookView.
     *
     * Some ExcelJS TypeScript versions do not expose this property
     * correctly in their typings even though ExcelJS writes it correctly
     * at runtime.
     */
    // @ts-ignore - ExcelJS supports rightToLeft at runtime
    worksheet.views = [
      {
        rightToLeft: true,
        showGridLines: false,
        zoomScale: 90
      }
    ]

    this.createProfessionalInvoiceWorksheet(
      worksheet,
      invoice,
      companyInfo,
      logoImageId
    )

    const buffer = await workbook.xlsx.writeBuffer()

    const blob = new Blob(
      [buffer],
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    )

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')

    const companyName = companyInfo.name.replace(/\s/g, '_')

    link.href = url

    link.download =
      `فاتورة_${invoice.invoice_number}_${companyName}_${new Date()
        .toISOString()
        .split('T')[0]}.xlsx`

    link.click()

    URL.revokeObjectURL(url)
  }

  private static createProfessionalInvoiceWorksheet(
    worksheet: ExcelJS.Worksheet,
    invoice: any,
    companyInfo: any,
    logoImageId: number | null
  ): void {
    // ============================================================
    // PAGE SETTINGS
    // ============================================================

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

    // ============================================================
    // FONTS
    // ============================================================

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

    // ============================================================
    // BORDERS
    // ============================================================

    const thinBorder: Partial<ExcelJS.Borders> = {
      top: {
        style: 'thin',
        color: { argb: 'FFCCCCCC' }
      },
      left: {
        style: 'thin',
        color: { argb: 'FFCCCCCC' }
      },
      bottom: {
        style: 'thin',
        color: { argb: 'FFCCCCCC' }
      },
      right: {
        style: 'thin',
        color: { argb: 'FFCCCCCC' }
      }
    }

    const thickBorder: Partial<ExcelJS.Borders> = {
      top: {
        style: 'thick',
        color: { argb: 'FF2F75B5' }
      },
      left: {
        style: 'thick',
        color: { argb: 'FF2F75B5' }
      },
      bottom: {
        style: 'thick',
        color: { argb: 'FF2F75B5' }
      },
      right: {
        style: 'thick',
        color: { argb: 'FF2F75B5' }
      }
    }

    const logoBorder: Partial<ExcelJS.Borders> = {
      top: {
        style: 'thick',
        color: { argb: 'FF2F75B5' }
      },
      left: {
        style: 'thick',
        color: { argb: 'FF2F75B5' }
      },
      bottom: {
        style: 'thick',
        color: { argb: 'FF2F75B5' }
      },
      right: {
        style: 'thick',
        color: { argb: 'FF2F75B5' }
      }
    }

    // ============================================================
    // FILLS
    // ============================================================

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

    // ============================================================
    // COLUMN WIDTHS
    //
    // IMPORTANT:
    // With a TRUE RTL worksheet:
    //
    // A = visually RIGHT
    // B
    // C
    // D
    // E
    // F = visually LEFT
    //
    // Therefore:
    //
    // A = #
    // B = الصنف
    // C = الكود
    // D = الكمية
    // E = سعر الوحدة
    // F = الإجمالي
    //
    // This is the correct physical mapping for the desired RTL
    // visual order.
    // ============================================================

    worksheet.columns = [
      { width: 8 },   // A - #
      { width: 40 },  // B - الصنف
      { width: 15 },  // C - الكود
      { width: 12 },  // D - الكمية
      { width: 18 },  // E - سعر الوحدة
      { width: 18 }   // F - الإجمالي
    ]

    let currentRow = 1

    // ============================================================
    // 1. HEADER WITH LOGO IN TOP LEFT CORNER
    // ============================================================

    // Create the header row with logo on the left and title centered
    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      6
    )

    const headerRow = worksheet.getRow(currentRow)
    headerRow.height = 70

    const headerCell = headerRow.getCell(1)

    // Set the title text
    headerCell.value = 'فاتورة ضريبية'
    headerCell.font = titleFont
    headerCell.fill = headerFill
    headerCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    }
    headerCell.border = thickBorder

    // Place logo in the top-left corner (visually right since RTL)
    if (logoImageId !== null) {
      try {
        // In RTL, column 0 is visually on the right side
        // We want the logo on the left side visually, so we place it in column 4-5
        worksheet.addImage(logoImageId, {
          tl: {
            col: 4.1,
            row: currentRow - 1 + 0.05
          } as any,
          ext: {
            width: 60,
            height: 60
          } as any,
          editAs: 'absolute'
        } as any)
      } catch (e) {
        console.warn('Failed to add logo:', e)
      }
    }

    currentRow++

    // ============================================================
    // 2. COMPANY NAME ROW (below the header)
    // ============================================================

    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      6
    )

    const companyNameRow = worksheet.getRow(currentRow)
    companyNameRow.height = 28

    const companyNameCell = companyNameRow.getCell(1)
    companyNameCell.value = companyInfo.name
    companyNameCell.font = {
      name: 'Cairo',
      size: 12,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    }
    companyNameCell.fill = headerFill
    companyNameCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    }
    companyNameCell.border = logoBorder

    currentRow++

    // ============================================================
    // 3. INVOICE INFORMATION
    //
    // RTL visual layout:
    //
    // RIGHT: رقم الفاتورة
    // LEFT:  التاريخ
    // ============================================================

    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      3
    )

    worksheet.mergeCells(
      currentRow,
      4,
      currentRow,
      6
    )

    const infoRow = worksheet.getRow(currentRow)

    infoRow.height = 28

    const invoiceNumberCell = infoRow.getCell(1)

    invoiceNumberCell.value =
      `رقم الفاتورة: ${invoice.invoice_number}`

    invoiceNumberCell.font = {
      name: 'Cairo',
      size: 12,
      bold: true
    }

    invoiceNumberCell.fill = subheaderFill

    invoiceNumberCell.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    invoiceNumberCell.border = thinBorder

    const dateCell = infoRow.getCell(4)

    dateCell.value =
      `التاريخ: ${this.formatDate(invoice.invoice_date)}`

    dateCell.font = {
      name: 'Cairo',
      size: 12,
      bold: true
    }

    dateCell.fill = subheaderFill

    dateCell.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    dateCell.border = thinBorder

    currentRow += 2

    // ============================================================
    // 4. COMPANY + CUSTOMER DETAILS
    //
    // BOTH CARDS START ON EXACTLY THE SAME ROW.
    //
    // RTL:
    //
    // A:C = RIGHT SIDE = CUSTOMER
    // D:F = LEFT SIDE  = COMPANY
    // ============================================================

    const detailsStartRow = currentRow

    // -------------------------
    // Section headers
    // -------------------------

    worksheet.mergeCells(
      detailsStartRow,
      1,
      detailsStartRow,
      3
    )

    worksheet.mergeCells(
      detailsStartRow,
      4,
      detailsStartRow,
      6
    )

    const cardHeaderRow =
      worksheet.getRow(detailsStartRow)

    cardHeaderRow.height = 26

    // Customer - RIGHT side
    const customerHeader =
      cardHeaderRow.getCell(1)

    customerHeader.value = 'بيانات العميل'

    customerHeader.font = headerFont

    customerHeader.fill = headerFill

    customerHeader.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    }

    customerHeader.border = thinBorder

    // Company - LEFT side
    const companyHeader =
      cardHeaderRow.getCell(4)

    companyHeader.value = 'بيانات الشركة'

    companyHeader.font = headerFont

    companyHeader.fill = headerFill

    companyHeader.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    }

    companyHeader.border = thinBorder

    // ============================================================
    // DATA
    // ============================================================

    const companyData = [
      {
        label: 'السجل الضريبي:',
        value: companyInfo.taxNumber || '—'
      },
      {
        label: 'الهاتف:',
        value: companyInfo.phone || '—'
      },
      {
        label: 'العنوان:',
        value: companyInfo.address || '—'
      },
      {
        label: 'البريد الإلكتروني:',
        value: companyInfo.email || '—'
      }
    ]

    const customerData = [
      {
        label: 'اسم العميل:',
        value: invoice.customer?.name || '—'
      },
      {
        label: 'الهاتف:',
        value: invoice.customer?.phone || '—'
      },
      {
        label: 'البريد الإلكتروني:',
        value: invoice.customer?.email || '—'
      },
      {
        label: 'العنوان:',
        value: invoice.customer?.address || '—'
      },
      {
        label: 'الرقم الضريبي:',
        value: invoice.customer?.tax_number || '—'
      }
    ]

    const maxRows = Math.max(
      companyData.length,
      customerData.length
    )

    // ============================================================
    // CREATE BOTH CARDS ROW-BY-ROW
    // ============================================================

    for (let i = 0; i < maxRows; i++) {
      const rowIndex =
        detailsStartRow + 1 + i

      const row =
        worksheet.getRow(rowIndex)

      row.height = 24

      // ==========================================================
      // CUSTOMER - RIGHT SIDE - A:C
      // ==========================================================

      if (i < customerData.length) {
        const data = customerData[i]

        const customerLabel =
          row.getCell(1)

        const customerValue =
          row.getCell(2)

        // Label
        customerLabel.value = data.label

        customerLabel.font = labelFont

        customerLabel.fill = accentFill

        customerLabel.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          wrapText: true
        }

        customerLabel.border = thinBorder

        // Value occupies B:C
        worksheet.mergeCells(
          rowIndex,
          2,
          rowIndex,
          3
        )

        customerValue.value = data.value

        customerValue.font = valueFont

        customerValue.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          wrapText: true
        }

        customerValue.border = thinBorder
      } else {
        // Keep the complete customer block height
        worksheet.mergeCells(
          rowIndex,
          1,
          rowIndex,
          3
        )

        row.getCell(1).border = thinBorder
      }

      // ==========================================================
      // COMPANY - LEFT SIDE - D:F
      // ==========================================================

      if (i < companyData.length) {
        const data = companyData[i]

        const companyLabel =
          row.getCell(4)

        const companyValue =
          row.getCell(5)

        // Label
        companyLabel.value = data.label

        companyLabel.font = labelFont

        companyLabel.fill = accentFill

        companyLabel.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          wrapText: true
        }

        companyLabel.border = thinBorder

        // Value occupies E:F
        worksheet.mergeCells(
          rowIndex,
          5,
          rowIndex,
          6
        )

        companyValue.value = data.value

        companyValue.font = valueFont

        companyValue.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          wrapText: true
        }

        companyValue.border = thinBorder
      } else {
        // Keep the complete company block height
        worksheet.mergeCells(
          rowIndex,
          4,
          rowIndex,
          6
        )

        row.getCell(4).border = thinBorder
      }
    }

    currentRow =
      detailsStartRow +
      maxRows +
      2

    // ============================================================
    // 5. ITEMS SECTION HEADER
    // ============================================================

    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      6
    )

    const itemsHeaderRow =
      worksheet.getRow(currentRow)

    itemsHeaderRow.height = 28

    const itemsHeaderCell =
      itemsHeaderRow.getCell(1)

    itemsHeaderCell.value = 'الأصناف'

    itemsHeaderCell.font = headerFont

    itemsHeaderCell.fill = headerFill

    itemsHeaderCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    }

    itemsHeaderCell.border = thinBorder

    currentRow++

    // ============================================================
    // 6. ITEMS TABLE
    //
    // Physical Excel columns:
    //
    // A = #
    // B = الصنف
    // C = الكود
    // D = الكمية
    // E = سعر الوحدة
    // F = الإجمالي
    //
    // Because the worksheet is RTL:
    //
    // VISUAL RIGHT -> LEFT:
    //
    // # | الصنف | الكود | الكمية | سعر الوحدة | الإجمالي
    // ============================================================

    const headers = [
      '#',
      'الصنف',
      'الكود',
      'الكمية',
      'سعر الوحدة',
      'الإجمالي'
    ]

    const headerRow2 =
      worksheet.getRow(currentRow)

    headerRow2.height = 30

    for (let i = 0; i < headers.length; i++) {
      const headerCellItem =
        headerRow2.getCell(i + 1)

      headerCellItem.value =
        headers[i]

      headerCellItem.font =
        tableHeaderFont

      headerCellItem.fill =
        headerFill

      headerCellItem.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      }

      headerCellItem.border =
        thinBorder
    }

    currentRow++

    const items =
      invoice.items || []

    // ============================================================
    // ITEM ROWS
    // ============================================================

    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      const dataRow =
        worksheet.getRow(currentRow)

      dataRow.height = 26

      // Alternating background
      if (i % 2 === 0) {
        for (let col = 1; col <= 6; col++) {
          dataRow
            .getCell(col)
            .fill = evenRowFill
        }
      }

      // # - Column A
      const numberCell =
        dataRow.getCell(1)

      numberCell.value = i + 1

      numberCell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }

      // Item - Column B
      const itemCell =
        dataRow.getCell(2)

      itemCell.value =
        item.name || '—'

      itemCell.alignment = {
        horizontal: 'right',
        vertical: 'middle',
        wrapText: true
      }

      // Code - Column C
      const codeCell =
        dataRow.getCell(3)

      codeCell.value =
        item.code || '—'

      codeCell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }

      // Quantity - Column D
      const quantityCell =
        dataRow.getCell(4)

      quantityCell.value =
        item.quantity || 0

      quantityCell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }

      quantityCell.numFmt =
        '#,##0.##'

      // Unit price - Column E
      const unitPriceCell =
        dataRow.getCell(5)

      unitPriceCell.value =
        item.unit_price || 0

      unitPriceCell.alignment = {
        horizontal: 'right',
        vertical: 'middle'
      }

      unitPriceCell.numFmt =
        '#,##0.00'

      // Total - Column F
      const totalCell =
        dataRow.getCell(6)

      totalCell.value =
        item.total || 0

      totalCell.alignment = {
        horizontal: 'right',
        vertical: 'middle'
      }

      totalCell.numFmt =
        '#,##0.00'

      // Common styling
      for (let col = 1; col <= 6; col++) {
        const dataCell =
          dataRow.getCell(col)

        dataCell.font =
          tableFont

        dataCell.border =
          thinBorder
      }

      currentRow++
    }

    currentRow++

    // ============================================================
    // 7. TOTALS
    //
    // RTL visual structure:
    //
    // RIGHT side = labels
    // LEFT side  = values
    //
    // We use A:D for labels and E:F for amounts.
    // ============================================================

    // -------------------------
    // Subtotal
    // -------------------------

    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      4
    )

    worksheet.mergeCells(
      currentRow,
      5,
      currentRow,
      6
    )

    const subtotalRow =
      worksheet.getRow(currentRow)

    subtotalRow.height = 24

    const subtotalLabel =
      subtotalRow.getCell(1)

    subtotalLabel.value =
      'المجموع الفرعي'

    subtotalLabel.font =
      labelFont

    subtotalLabel.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    subtotalLabel.border =
      thinBorder

    const subtotalValue =
      subtotalRow.getCell(5)

    subtotalValue.value =
      invoice.subtotal || 0

    subtotalValue.font =
      valueFont

    subtotalValue.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    subtotalValue.border =
      thinBorder

    subtotalValue.numFmt =
      '#,##0.00'

    currentRow++

    // -------------------------
    // Discount
    // -------------------------

    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      4
    )

    worksheet.mergeCells(
      currentRow,
      5,
      currentRow,
      6
    )

    const discountRow =
      worksheet.getRow(currentRow)

    discountRow.height = 24

    const discountLabel =
      discountRow.getCell(1)

    discountLabel.value =
      `الخصم (${invoice.discount_value || 0} ${
        invoice.discount_type === 'percentage'
          ? '%'
          : 'ج.م'
      })`

    discountLabel.font =
      labelFont

    discountLabel.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    discountLabel.border =
      thinBorder

    const discountValue =
      discountRow.getCell(5)

    discountValue.value =
      -(invoice.discount_amount || 0)

    discountValue.font = {
      ...valueFont,
      color: {
        argb: 'FFDC2626'
      }
    }

    discountValue.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    discountValue.border =
      thinBorder

    discountValue.numFmt =
      '#,##0.00'

    currentRow++

    // -------------------------
    // Shipping
    // -------------------------

    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      4
    )

    worksheet.mergeCells(
      currentRow,
      5,
      currentRow,
      6
    )

    const shippingRow =
      worksheet.getRow(currentRow)

    shippingRow.height = 24

    const shippingLabel =
      shippingRow.getCell(1)

    shippingLabel.value =
      'الشحن'

    shippingLabel.font =
      labelFont

    shippingLabel.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    shippingLabel.border =
      thinBorder

    const shippingValue =
      shippingRow.getCell(5)

    shippingValue.value =
      invoice.shipping_cost || 0

    shippingValue.font =
      valueFont

    shippingValue.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    shippingValue.border =
      thinBorder

    shippingValue.numFmt =
      '#,##0.00'

    currentRow++

    // -------------------------
    // VAT
    // -------------------------

    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      4
    )

    worksheet.mergeCells(
      currentRow,
      5,
      currentRow,
      6
    )

    const vatRow =
      worksheet.getRow(currentRow)

    vatRow.height = 24

    const vatLabel =
      vatRow.getCell(1)

    vatLabel.value =
      `الضريبة (${invoice.vat_rate || 0}%)`

    vatLabel.font =
      labelFont

    vatLabel.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    vatLabel.border =
      thinBorder

    const vatValue =
      vatRow.getCell(5)

    vatValue.value =
      invoice.vat_amount || 0

    vatValue.font =
      valueFont

    vatValue.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    vatValue.border =
      thinBorder

    vatValue.numFmt =
      '#,##0.00'

    currentRow++

    // -------------------------
    // Final total
    // -------------------------

    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      4
    )

    worksheet.mergeCells(
      currentRow,
      5,
      currentRow,
      6
    )

    const totalRow =
      worksheet.getRow(currentRow)

    totalRow.height = 34

    const totalLabel =
      totalRow.getCell(1)

    totalLabel.value =
      'الإجمالي النهائي'

    totalLabel.font =
      totalFont

    totalLabel.fill =
      totalFill

    totalLabel.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    totalLabel.border =
      thickBorder

    const totalValue =
      totalRow.getCell(5)

    totalValue.value =
      invoice.total_amount || 0

    totalValue.font = {
      ...totalFont,
      color: {
        argb: 'FF16A34A'
      }
    }

    totalValue.fill =
      totalFill

    totalValue.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    totalValue.border =
      thickBorder

    totalValue.numFmt =
      '#,##0.00'

    currentRow += 2

    // ============================================================
    // 8. SIGNATURES
    // ============================================================

    const signaturesRow =
      worksheet.getRow(currentRow)

    signaturesRow.height = 50

    // Customer signature - RIGHT
    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      3
    )

    const customerSignature =
      signaturesRow.getCell(1)

    customerSignature.value =
      'توقيع العميل'

    customerSignature.font = {
      name: 'Cairo',
      size: 10,
      italic: true
    }

    customerSignature.alignment = {
      horizontal: 'center',
      vertical: 'bottom'
    }

    customerSignature.border = {
      top: {
        style: 'thin',
        color: { argb: 'FF000000' }
      }
    }

    // Seller signature - LEFT
    worksheet.mergeCells(
      currentRow,
      4,
      currentRow,
      6
    )

    const sellerSignature =
      signaturesRow.getCell(4)

    sellerSignature.value =
      'توقيع البائع'

    sellerSignature.font = {
      name: 'Cairo',
      size: 10,
      italic: true
    }

    sellerSignature.alignment = {
      horizontal: 'center',
      vertical: 'bottom'
    }

    sellerSignature.border = {
      top: {
        style: 'thin',
        color: { argb: 'FF000000' }
      }
    }

    currentRow += 2

    // ============================================================
    // 9. FOOTER
    // ============================================================

    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      6
    )

    const footerRow =
      worksheet.getRow(currentRow)

    footerRow.height = 45

    const footerCell =
      footerRow.getCell(1)

    const footerText =
      `هذه الفاتورة صادرة من ${companyInfo.name} - شكراً لتعاملكم معنا\n` +
      `للتواصل: ${companyInfo.phone} | البريد الإلكتروني: ${companyInfo.email}\n` +
      `تم الإنشاء في: ${new Date().toLocaleString('ar-EG')}`

    footerCell.value =
      footerText

    footerCell.font = {
      name: 'Cairo',
      size: 10,
      italic: true,
      color: {
        argb: 'FF444444'
      }
    }

    footerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'FFF9FAFB'
      }
    }

    footerCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    }

    footerCell.border = {
      top: {
        style: 'thin',
        color: { argb: 'FFCCCCCC' }
      },
      bottom: {
        style: 'thin',
        color: { argb: 'FFCCCCCC' }
      }
    }

    // ============================================================
    // FINAL WORKSHEET FORMATTING
    // ============================================================

    // Ensure all used rows are vertically centered by default
    for (let rowNumber = 1; rowNumber <= currentRow; rowNumber++) {
      const row =
        worksheet.getRow(rowNumber)

      if (!row.height) {
        row.height = 22
      }
    }

    // Keep the worksheet RTL after all formatting operations.
    // @ts-ignore - ExcelJS runtime support
    worksheet.views = [
      {
        rightToLeft: true,
        showGridLines: false,
        zoomScale: 90
      }
    ]
  }

  private static formatDate(date: any): string {
    if (!date) {
      return '—'
    }

    const d = new Date(date)

    return d.toLocaleDateString('ar-EG')
  }

  private static createSafeSheetName(
    baseName: string,
    index?: number
  ): string {
    let name = baseName

    name = name.replace(
      /[\\/*?:[\]]/g,
      ''
    )

    if (name.length > 31) {
      name =
        name.substring(0, 28) +
        '...'
    }

    if (index) {
      name =
        `${index}-${name}`
    }

    return name
  }
}