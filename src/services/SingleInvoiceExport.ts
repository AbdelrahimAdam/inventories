// src/services/singleInvoiceExport.ts
import * as ExcelJS from 'exceljs'
import { Buffer } from 'buffer'
import { supabase } from '@/services/supabase'

async function fetchImageAsBuffer(url: string | null | undefined): Promise<Buffer | null> {
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
     * RTL belongs to the worksheet view.
     * Do not use workbook.views with rightToLeft.
     */
    worksheet.views = [
      {
        rightToLeft: true as any,
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
    // ============================================================

    worksheet.columns = [
      { width: 8 },   // A - #
      { width: 40 },  // B - Item name
      { width: 15 },  // C - Code
      { width: 12 },  // D - Quantity
      { width: 18 },  // E - Unit price
      { width: 18 }   // F - Total
    ]

    let currentRow = 1

    // ============================================================
    // 1. HEADER
    //
    // RTL visual layout:
    //
    // RIGHT:
    //   Invoice title
    //
    // LEFT:
    //   Logo
    //   Company name directly underneath
    //
    // Physical columns:
    //
    // A:C = RIGHT / invoice title
    // D:F = LEFT / logo + company name
    // ============================================================

    const headerStartRow = currentRow
    const headerEndRow = currentRow + 3

    // ------------------------------------------------------------
    // Invoice title block - RIGHT SIDE
    // ------------------------------------------------------------

    worksheet.mergeCells(
      headerStartRow,
      1,
      headerEndRow,
      3
    )

    const invoiceTitleCell =
      worksheet.getCell(headerStartRow, 1)

    invoiceTitleCell.value =
      'فاتورة ضريبية'

    invoiceTitleCell.font = {
      ...titleFont,
      size: 22
    }

    invoiceTitleCell.fill =
      headerFill

    invoiceTitleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
      readingOrder: 'rtl'
    } as any

    invoiceTitleCell.border =
      thickBorder

    // ------------------------------------------------------------
    // Logo area - LEFT SIDE
    // ------------------------------------------------------------

    worksheet.mergeCells(
      headerStartRow,
      4,
      headerStartRow + 2,
      6
    )

    const logoAreaCell =
      worksheet.getCell(headerStartRow, 4)

    logoAreaCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF7F9FC' }
    }

    logoAreaCell.border = {
      top: {
        style: 'thick',
        color: { argb: 'FF2F75B5' }
      },
      left: {
        style: 'thick',
        color: { argb: 'FF2F75B5' }
      },
      right: {
        style: 'thick',
        color: { argb: 'FF2F75B5' }
      }
    }

    logoAreaCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    }

    // ------------------------------------------------------------
    // Company name - directly BELOW logo
    // ------------------------------------------------------------

    worksheet.mergeCells(
      headerStartRow + 3,
      4,
      headerStartRow + 3,
      6
    )

    const companyNameCell =
      worksheet.getCell(headerStartRow + 3, 4)

    companyNameCell.value =
      companyInfo.name

    companyNameCell.font = {
      name: 'Cairo',
      size: 13,
      bold: true,
      color: { argb: 'FF2F75B5' }
    }

    companyNameCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF7F9FC' }
    }

    companyNameCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
      readingOrder: 'rtl'
    } as any

    companyNameCell.border = {
      bottom: {
        style: 'thick',
        color: { argb: 'FF2F75B5' }
      },
      left: {
        style: 'thick',
        color: { argb: 'FF2F75B5' }
      },
      right: {
        style: 'thick',
        color: { argb: 'FF2F75B5' }
      }
    }

    // ------------------------------------------------------------
    // Header row heights
    // ------------------------------------------------------------

    worksheet.getRow(headerStartRow).height = 28
    worksheet.getRow(headerStartRow + 1).height = 28
    worksheet.getRow(headerStartRow + 2).height = 28
    worksheet.getRow(headerStartRow + 3).height = 32

    // ------------------------------------------------------------
    // Add logo centered inside the LEFT block
    // ------------------------------------------------------------

    if (logoImageId !== null) {
      try {
        worksheet.addImage(logoImageId, {
          tl: {
            col: 4.55,
            row: 0.20
          } as any,
          ext: {
            width: 78,
            height: 78
          } as any,
          editAs: 'absolute'
        } as any)
      } catch (e) {
        console.warn('Failed to add logo:', e)
      }
    }

    currentRow = headerEndRow + 1

    // ============================================================
    // 2. INVOICE INFORMATION
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

    const infoRow =
      worksheet.getRow(currentRow)

    infoRow.height = 28

    const invoiceNumberCell =
      infoRow.getCell(1)

    invoiceNumberCell.value =
      `رقم الفاتورة: ${invoice.invoice_number}`

    invoiceNumberCell.font = {
      name: 'Cairo',
      size: 12,
      bold: true
    }

    invoiceNumberCell.fill =
      subheaderFill

    invoiceNumberCell.alignment = {
      horizontal: 'right',
      vertical: 'middle',
      readingOrder: 'rtl'
    } as any

    invoiceNumberCell.border =
      thinBorder

    const dateCell =
      infoRow.getCell(4)

    dateCell.value =
      `التاريخ: ${this.formatDate(invoice.invoice_date)}`

    dateCell.font = {
      name: 'Cairo',
      size: 12,
      bold: true
    }

    dateCell.fill =
      subheaderFill

    dateCell.alignment = {
      horizontal: 'right',
      vertical: 'middle',
      readingOrder: 'rtl'
    } as any

    dateCell.border =
      thinBorder

    currentRow += 2

    // ============================================================
    // 3. COMPANY & CUSTOMER
    // ============================================================

    const detailsStartRow = currentRow

    // Customer - RIGHT SIDE
    worksheet.mergeCells(
      detailsStartRow,
      1,
      detailsStartRow,
      3
    )

    // Company - LEFT SIDE
    worksheet.mergeCells(
      detailsStartRow,
      4,
      detailsStartRow,
      6
    )

    const cardHeaderRow =
      worksheet.getRow(detailsStartRow)

    cardHeaderRow.height = 24

    const customerHeader =
      cardHeaderRow.getCell(1)

    customerHeader.value =
      'بيانات العميل'

    customerHeader.font =
      headerFont

    customerHeader.fill =
      headerFill

    customerHeader.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      readingOrder: 'rtl'
    } as any

    customerHeader.border =
      thinBorder

    const companyHeader =
      cardHeaderRow.getCell(4)

    companyHeader.value =
      'بيانات الشركة'

    companyHeader.font =
      headerFont

    companyHeader.fill =
      headerFill

    companyHeader.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      readingOrder: 'rtl'
    } as any

    companyHeader.border =
      thinBorder

    const companyData = [
      {
        label: 'السجل الضريبي:',
        value: companyInfo.taxNumber || '—'
      },
      {
        label: 'هاتف:',
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

    for (let i = 0; i < maxRows; i++) {
      const rowIndex =
        detailsStartRow + 1 + i

      const row =
        worksheet.getRow(rowIndex)

      row.height = 22

      // ==========================================================
      // CUSTOMER - RIGHT SIDE
      // ==========================================================

      if (i < customerData.length) {
        const data =
          customerData[i]

        const labelCell =
          row.getCell(1)

        labelCell.value =
          data.label

        labelCell.font =
          labelFont

        labelCell.fill =
          accentFill

        labelCell.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          readingOrder: 'rtl'
        } as any

        labelCell.border =
          thinBorder

        const valueCell =
          row.getCell(2)

        valueCell.value =
          data.value

        valueCell.font =
          valueFont

        valueCell.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          readingOrder: 'rtl'
        } as any

        valueCell.border =
          thinBorder

        worksheet.mergeCells(
          rowIndex,
          2,
          rowIndex,
          3
        )

        row.getCell(3).border =
          thinBorder
      } else {
        worksheet.mergeCells(
          rowIndex,
          1,
          rowIndex,
          3
        )

        row.getCell(1).border =
          thinBorder
      }

      // ==========================================================
      // COMPANY - LEFT SIDE
      // ==========================================================

      if (i < companyData.length) {
        const data =
          companyData[i]

        const labelCell =
          row.getCell(4)

        labelCell.value =
          data.label

        labelCell.font =
          labelFont

        labelCell.fill =
          accentFill

        labelCell.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          readingOrder: 'rtl'
        } as any

        labelCell.border =
          thinBorder

        const valueCell =
          row.getCell(5)

        valueCell.value =
          data.value

        valueCell.font =
          valueFont

        valueCell.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          readingOrder: 'rtl'
        } as any

        valueCell.border =
          thinBorder

        worksheet.mergeCells(
          rowIndex,
          5,
          rowIndex,
          6
        )

        row.getCell(6).border =
          thinBorder
      } else {
        worksheet.mergeCells(
          rowIndex,
          4,
          rowIndex,
          6
        )

        row.getCell(4).border =
          thinBorder
      }
    }

    currentRow =
      detailsStartRow +
      maxRows +
      2

    // ============================================================
    // 4. ITEMS TABLE
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

    itemsHeaderCell.value =
      'الأصناف'

    itemsHeaderCell.font =
      headerFont

    itemsHeaderCell.fill =
      headerFill

    itemsHeaderCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      readingOrder: 'rtl'
    } as any

    itemsHeaderCell.border =
      thinBorder

    currentRow++

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
        readingOrder: 'rtl'
      } as any

      headerCellItem.border =
        thinBorder
    }

    currentRow++

    const items =
      invoice.items || []

    for (let i = 0; i < items.length; i++) {
      const item =
        items[i]

      const dataRow =
        worksheet.getRow(currentRow)

      dataRow.height = 24

      if (i % 2 === 0) {
        for (let col = 1; col <= 6; col++) {
          dataRow.getCell(col).fill =
            evenRowFill
        }
      }

      // #
      dataRow.getCell(1).value =
        i + 1

      dataRow.getCell(1).alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }

      // Item name
      dataRow.getCell(2).value =
        item.name || '—'

      dataRow.getCell(2).alignment = {
        horizontal: 'right',
        vertical: 'middle',
        readingOrder: 'rtl'
      } as any

      // Code
      dataRow.getCell(3).value =
        item.code || '—'

      dataRow.getCell(3).alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }

      // Quantity
      dataRow.getCell(4).value =
        item.quantity || 0

      dataRow.getCell(4).alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }

      // Unit price
      dataRow.getCell(5).value =
        item.unit_price || 0

      dataRow.getCell(5).alignment = {
        horizontal: 'right',
        vertical: 'middle'
      }

      dataRow.getCell(5).numFmt =
        '#,##0.00'

      // Total
      dataRow.getCell(6).value =
        item.total || 0

      dataRow.getCell(6).alignment = {
        horizontal: 'right',
        vertical: 'middle'
      }

      dataRow.getCell(6).numFmt =
        '#,##0.00'

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
    // 5. TOTALS
    // ============================================================

    // Subtotal
    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      4
    )

    const subtotalRow =
      worksheet.getRow(currentRow)

    subtotalRow.height = 24

    const subtotalCell1 =
      subtotalRow.getCell(1)

    subtotalCell1.value =
      'المجموع الفرعي'

    subtotalCell1.font =
      labelFont

    subtotalCell1.alignment = {
      horizontal: 'right',
      vertical: 'middle',
      readingOrder: 'rtl'
    } as any

    subtotalCell1.border =
      thinBorder

    worksheet.mergeCells(
      currentRow,
      5,
      currentRow,
      6
    )

    const subtotalCell5 =
      subtotalRow.getCell(5)

    subtotalCell5.value =
      invoice.subtotal || 0

    subtotalCell5.font =
      valueFont

    subtotalCell5.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    subtotalCell5.border =
      thinBorder

    subtotalCell5.numFmt =
      '#,##0.00'

    currentRow++

    // Discount
    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      4
    )

    const discountRow =
      worksheet.getRow(currentRow)

    discountRow.height = 24

    const discountCell1 =
      discountRow.getCell(1)

    discountCell1.value =
      `الخصم (${invoice.discount_value || 0} ${
        invoice.discount_type === 'percentage'
          ? '%'
          : 'ج.م'
      })`

    discountCell1.font =
      labelFont

    discountCell1.alignment = {
      horizontal: 'right',
      vertical: 'middle',
      readingOrder: 'rtl'
    } as any

    discountCell1.border =
      thinBorder

    worksheet.mergeCells(
      currentRow,
      5,
      currentRow,
      6
    )

    const discountCell5 =
      discountRow.getCell(5)

    discountCell5.value =
      -(invoice.discount_amount || 0)

    discountCell5.font = {
      ...valueFont,
      color: { argb: 'FFDC2626' }
    }

    discountCell5.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    discountCell5.border =
      thinBorder

    discountCell5.numFmt =
      '#,##0.00'

    currentRow++

    // Shipping
    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      4
    )

    const shippingRow =
      worksheet.getRow(currentRow)

    shippingRow.height = 24

    const shippingCell1 =
      shippingRow.getCell(1)

    shippingCell1.value =
      'الشحن'

    shippingCell1.font =
      labelFont

    shippingCell1.alignment = {
      horizontal: 'right',
      vertical: 'middle',
      readingOrder: 'rtl'
    } as any

    shippingCell1.border =
      thinBorder

    worksheet.mergeCells(
      currentRow,
      5,
      currentRow,
      6
    )

    const shippingCell5 =
      shippingRow.getCell(5)

    shippingCell5.value =
      invoice.shipping_cost || 0

    shippingCell5.font =
      valueFont

    shippingCell5.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    shippingCell5.border =
      thinBorder

    shippingCell5.numFmt =
      '#,##0.00'

    currentRow++

    // VAT
    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      4
    )

    const vatRow =
      worksheet.getRow(currentRow)

    vatRow.height = 24

    const vatCell1 =
      vatRow.getCell(1)

    vatCell1.value =
      `الضريبة (${invoice.vat_rate || 0}%)`

    vatCell1.font =
      labelFont

    vatCell1.alignment = {
      horizontal: 'right',
      vertical: 'middle',
      readingOrder: 'rtl'
    } as any

    vatCell1.border =
      thinBorder

    worksheet.mergeCells(
      currentRow,
      5,
      currentRow,
      6
    )

    const vatCell5 =
      vatRow.getCell(5)

    vatCell5.value =
      invoice.vat_amount || 0

    vatCell5.font =
      valueFont

    vatCell5.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    vatCell5.border =
      thinBorder

    vatCell5.numFmt =
      '#,##0.00'

    currentRow++

    // Final total
    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      4
    )

    const totalRow =
      worksheet.getRow(currentRow)

    totalRow.height = 32

    const totalCell1 =
      totalRow.getCell(1)

    totalCell1.value =
      'الإجمالي النهائي'

    totalCell1.font =
      totalFont

    totalCell1.fill =
      totalFill

    totalCell1.alignment = {
      horizontal: 'right',
      vertical: 'middle',
      readingOrder: 'rtl'
    } as any

    totalCell1.border =
      thickBorder

    worksheet.mergeCells(
      currentRow,
      5,
      currentRow,
      6
    )

    const totalCell5 =
      totalRow.getCell(5)

    totalCell5.value =
      invoice.total_amount || 0

    totalCell5.font = {
      ...totalFont,
      color: { argb: 'FF16A34A' }
    }

    totalCell5.fill =
      totalFill

    totalCell5.alignment = {
      horizontal: 'right',
      vertical: 'middle'
    }

    totalCell5.border =
      thickBorder

    totalCell5.numFmt =
      '#,##0.00'

    currentRow += 2

    // ============================================================
    // 6. SIGNATURES
    // ============================================================

    const signaturesRow =
      worksheet.getRow(currentRow)

    signaturesRow.height = 50

    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      3
    )

    const sigCell1 =
      signaturesRow.getCell(1)

    sigCell1.value =
      'توقيع العميل'

    sigCell1.font = {
      name: 'Cairo',
      size: 10,
      italic: true
    }

    sigCell1.alignment = {
      horizontal: 'center',
      vertical: 'bottom'
    }

    sigCell1.border = {
      top: {
        style: 'thin',
        color: { argb: 'FF000000' }
      }
    }

    worksheet.mergeCells(
      currentRow,
      4,
      currentRow,
      6
    )

    const sigCell4 =
      signaturesRow.getCell(4)

    sigCell4.value =
      'توقيع البائع'

    sigCell4.font = {
      name: 'Cairo',
      size: 10,
      italic: true
    }

    sigCell4.alignment = {
      horizontal: 'center',
      vertical: 'bottom'
    }

    sigCell4.border = {
      top: {
        style: 'thin',
        color: { argb: 'FF000000' }
      }
    }

    currentRow += 2

    // ============================================================
    // 7. FOOTER
    // ============================================================

    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      6
    )

    const footerRow =
      worksheet.getRow(currentRow)

    footerRow.height = 40

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
      wrapText: true,
      readingOrder: 'rtl'
    } as any

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
  }

  private static formatDate(date: any): string {
    if (!date) return '—'

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