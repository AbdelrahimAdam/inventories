// src/services/pdfExport.ts
import html2pdf from 'html2pdf.js'

export class PDFExportService {
  static async generateInvoicePDF(
    invoice: any,
    companyInfo?: any
  ): Promise<void> {
    const htmlContent = this.generateInvoiceHTML(invoice, companyInfo)

    const container = document.createElement('div')

    container.innerHTML = htmlContent

    // Offscreen – prevents flashing
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    container.style.width = '794px'
    container.style.backgroundColor = '#ffffff'
    container.style.direction = 'rtl'
    container.style.zIndex = '2147483647'
    container.style.display = 'block'
    container.style.visibility = 'visible'
    container.style.opacity = '1'
    container.style.overflow = 'visible'
    container.style.pointerEvents = 'none'

    document.body.appendChild(container)

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve()
          })
        })
      })

      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready
        } catch (error) {
          console.warn('PDF font loading warning:', error)
        }
      }

      const images = Array.from(
        container.querySelectorAll('img')
      ) as HTMLImageElement[]

      await Promise.all(
        images.map(async (img) => {
          try {
            if (img.complete && img.naturalWidth > 0) {
              return
            }

            await new Promise<void>((resolve) => {
              const timeout = window.setTimeout(() => {
                resolve()
              }, 5000)

              img.addEventListener(
                'load',
                () => {
                  window.clearTimeout(timeout)
                  resolve()
                },
                { once: true }
              )

              img.addEventListener(
                'error',
                () => {
                  window.clearTimeout(timeout)
                  resolve()
                },
                { once: true }
              )
            })
          } catch (error) {
            console.warn('PDF image loading warning:', error)
          }
        })
      )

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve()
          })
        })
      })

      const containerRect = container.getBoundingClientRect()

      if (containerRect.width <= 0 || containerRect.height <= 0) {
        throw new Error(
          `PDF invoice container has invalid dimensions: ${containerRect.width}x${containerRect.height}`
        )
      }

      const contentElement = (
        container.querySelector('.pdf-invoice') || container
      ) as HTMLElement

      const contentRect = contentElement.getBoundingClientRect()

      if (contentRect.width <= 0 || contentRect.height <= 0) {
        throw new Error(
          `PDF invoice content has invalid dimensions: ${contentRect.width}x${contentRect.height}`
        )
      }

      const opt = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename: `فاتورة_${invoice.invoice_number || 'invoice'}.pdf`,
        image: {
          type: 'jpeg' as const,
          quality: 0.98
        },
        html2canvas: {
          scale: Math.min(2, window.devicePixelRatio || 1.5),
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 15000,
          removeContainer: true,
          foreignObjectRendering: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
          windowHeight: Math.max(
            1123,
            Math.ceil(contentRect.height)
          )
        },
        jsPDF: {
          unit: 'mm' as const,
          format: 'a4' as const,
          orientation: 'portrait' as const,
          compress: true
        },
        pagebreak: {
          mode: ['css', 'legacy'] as any
        }
      }

      await html2pdf()
        .set(opt)
        .from(contentElement)
        .toContainer()
        .toCanvas()
        .toPdf()
        .save()
    } catch (error) {
      console.error('PDF generation error:', error)

      if (error instanceof Error) {
        console.error(
          'PDF generation details:',
          error.message
        )
      }

      throw new Error(
        'فشل في تحميل الفاتورة بصيغة PDF. يرجى المحاولة مرة أخرى.'
      )
    } finally {
      if (container.parentNode) {
        container.parentNode.removeChild(container)
      }
    }
  }

  static generateInvoiceHTML(
    invoice: any,
    companyInfo?: any
  ): string {
    const defaultCompany = {
      name: 'لوكسري برفيوم للتجارة',
      taxNumber: '123-456-789',
      address: 'مصر - القاهرة - مدينة نصر',
      phone: '01234567890',
      email: 'info@luxuryperfume.com',
      logoUrl: null as string | null
    }

    const company = {
      ...defaultCompany,
      ...(companyInfo || {})
    }

    const companyLogo = company.logoUrl || null

    const escapeHtml = (value: any): string => {
      if (value === null || value === undefined) {
        return '—'
      }

      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }

    const formatCurrency = (value: number): string => {
      const numericValue = Number(value) || 0

      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: invoice.currency || 'EGP',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(numericValue)
      } catch {
        return `${numericValue.toFixed(2)} ${invoice.currency || 'EGP'}`
      }
    }

    const formatDate = (date: Date | string): string => {
      if (!date) {
        return '—'
      }

      const parsedDate = new Date(date)

      if (Number.isNaN(parsedDate.getTime())) {
        return '—'
      }

      return parsedDate.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const status = invoice.status || 'draft'

    const statusText =
      status === 'issued'
        ? 'صادرة'
        : status === 'paid'
          ? 'مدفوعة'
          : status === 'cancelled'
            ? 'ملغاة'
            : 'مسودة'

    const logoHTML = companyLogo
      ? `
        <img
          src="${escapeHtml(companyLogo)}"
          alt="شعار الشركة"
          crossorigin="anonymous"
          style="
            max-width:90px;
            max-height:80px;
            width:auto;
            height:auto;
            object-fit:contain;
            display:block;
            margin:0 auto;
            border-radius:50%;
          "
        />
        <div style="
          font-size:9px;
          color:#4b5563;
          margin-top:4px;
          text-align:center;
          direction:rtl;
          unicode-bidi:plaintext;
        ">
          ${escapeHtml(company.name)}
        </div>
      `
      : `
        <div style="
          font-size:11px;
          font-weight:bold;
          color:#1f2937;
          text-align:center;
          direction:rtl;
          unicode-bidi:plaintext;
        ">
          ${escapeHtml(company.name)}
        </div>
      `

    const itemsRows = (invoice.items || [])
      .map((item: any, idx: number) => {
        const codeHtml = item.code
          ? `
            <div
              style="
                font-size:9px;
                color:#6b7280;
                margin-top:2px;
                direction:rtl;
              "
            >
              الكود: ${escapeHtml(item.code)}
            </div>
          `
          : ''

        const sizeHtml = item.size
          ? `
            <div
              style="
                font-size:9px;
                color:#6b7280;
                margin-top:2px;
                direction:rtl;
              "
            >
              المقاس: ${escapeHtml(item.size)}
            </div>
          `
          : ''

        return `
          <tr>

            <td
              style="
                width:7%;
                padding:7px 6px;
                text-align:center;
                vertical-align:middle;
                border:1px solid #d9dee5;
                font-size:11px;
              "
            >
              ${idx + 1}
            </td>

            <td
              style="
                width:38%;
                padding:7px 8px;
                text-align:right;
                vertical-align:middle;
                border:1px solid #d9dee5;
                font-size:11px;
                direction:rtl;
                overflow-wrap:break-word;
                word-break:break-word;
              "
            >
              <div
                style="
                  font-weight:600;
                  color:#1f2937;
                  direction:rtl;
                  unicode-bidi:plaintext;
                "
              >
                ${escapeHtml(item.name || '—')}
              </div>

              ${codeHtml}
              ${sizeHtml}
            </td>

            <td
              style="
                width:15%;
                padding:7px 6px;
                text-align:center;
                vertical-align:middle;
                border:1px solid #d9dee5;
                font-size:11px;
                direction:rtl;
              "
            >
              ${escapeHtml(item.color || '—')}
            </td>

            <td
              style="
                width:10%;
                padding:7px 6px;
                text-align:center;
                vertical-align:middle;
                border:1px solid #d9dee5;
                font-size:11px;
              "
            >
              ${escapeHtml(item.quantity ?? 0)}
            </td>

            <td
              style="
                width:15%;
                padding:7px 6px;
                text-align:center;
                vertical-align:middle;
                border:1px solid #d9dee5;
                font-size:11px;
                direction:ltr;
                white-space:nowrap;
              "
            >
              ${formatCurrency(item.unit_price)}
            </td>

            <td
              style="
                width:15%;
                padding:7px 6px;
                text-align:center;
                vertical-align:middle;
                border:1px solid #d9dee5;
                font-size:11px;
                font-weight:bold;
                direction:ltr;
                white-space:nowrap;
              "
            >
              ${formatCurrency(item.total)}
            </td>

          </tr>
        `
      })
      .join('')

    const discountHtml =
      Number(invoice.discount_value) > 0
        ? `
          <tr>
            <td>
              الخصم (${escapeHtml(invoice.discount_value)}
              ${invoice.discount_type === 'percentage' ? '%' : 'ج.م'})
            </td>

            <td style="color:#dc2626;direction:ltr;">
              -${formatCurrency(invoice.discount_amount)}
            </td>
          </tr>
        `
        : ''

    const shippingHtml =
      Number(invoice.shipping_cost) > 0
        ? `
          <tr>
            <td>
              الشحن
            </td>

            <td style="direction:ltr;">
              ${formatCurrency(invoice.shipping_cost)}
            </td>
          </tr>
        `
        : ''

    const notesTermsHtml =
      invoice.notes || invoice.terms
        ? `
          <div class="notes-terms">

            ${
              invoice.notes
                ? `
                  <div class="note-box">
                    <p>ملاحظات:</p>
                    <p>${escapeHtml(invoice.notes)}</p>
                  </div>
                `
                : ''
            }

            ${
              invoice.terms
                ? `
                  <div class="note-box">
                    <p>شروط الدفع:</p>
                    <p>${escapeHtml(invoice.terms)}</p>
                  </div>
                `
                : ''
            }

          </div>
        `
        : ''

    return `
      <div
        class="pdf-invoice"
        dir="rtl"
        lang="ar"
        style="
          direction:rtl;
          width:100%;
          background:#ffffff;
          color:#1a1a1a;
          font-family:'Cairo','Segoe UI',Tahoma,Arial,sans-serif;
        "
      >

        <style>

          * {
            box-sizing:border-box;
          }

          html,
          body {
            margin:0;
            padding:0;
            width:100%;
            background:#ffffff;
          }

          .pdf-invoice {
            font-family:'Cairo','Segoe UI',Tahoma,Arial,sans-serif;
            direction:rtl;
            background:#ffffff;
            color:#1a1a1a;
            width:100%;
            padding:18px;
          }

          /* =========================
             HEADER
             ========================= */

          .pdf-header {
            display:flex;
            flex-direction:row;
            justify-content:space-between;
            align-items:center;
            width:100%;
            min-height:105px;
            padding:14px 16px;
            margin-bottom:18px;
            background:#ffffff;
            border:1px solid #e1e6eb;
            border-bottom:3px solid #2f75b5;
          }

          .pdf-header-info {
            flex:1;
            min-width:0;
            text-align:right;
            direction:rtl;
          }

          .pdf-header-title {
            margin:0;
            padding:0;
            font-size:24px;
            line-height:1.3;
            font-weight:800;
            color:#1f2937;
          }

          .pdf-header-subtitle {
            margin-top:8px;
            color:#4b5563;
            font-size:11px;
            line-height:1.7;
          }

          .pdf-header-subtitle span {
            font-weight:700;
            color:#1f2937;
          }

          .pdf-logo-box {
            width:120px;
            min-width:120px;
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            text-align:center;
            margin-right:18px;
          }

          .pdf-logo-box img {
            max-width:90px;
            max-height:80px;
            width:auto;
            height:auto;
            object-fit:contain;
            display:block;
            margin:0 auto;
            border-radius:50%;
          }

          .pdf-logo-box .company-name-below-logo {
            font-size:9px;
            color:#4b5563;
            margin-top:4px;
            text-align:center;
            direction:rtl;
            unicode-bidi:plaintext;
            word-break:break-word;
          }

          .status-badge {
            display:inline-block;
            margin-top:6px;
            padding:3px 12px;
            border-radius:9999px;
            font-size:10px;
            font-weight:bold;
          }

          .status-draft {
            background:#f3f4f6;
            color:#4b5563;
          }

          .status-issued {
            background:#dbeafe;
            color:#1d4ed8;
          }

          .status-paid {
            background:#d1fae5;
            color:#065f46;
          }

          .status-cancelled {
            background:#fee2e2;
            color:#991b1b;
          }

          /* =========================
             COMPANY / CUSTOMER
             ========================= */

          .info-grid {
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:14px;
            width:100%;
            margin-bottom:20px;
            direction:rtl;
          }

          .info-box {
            width:100%;
            min-width:0;
            border:1px solid #d9dee5;
            border-radius:6px;
            padding:12px;
            background:#f9fafb;
            min-height:145px;
            direction:rtl;
            text-align:right;
          }

          .info-box h3 {
            margin:0 0 9px 0;
            padding:7px 8px;
            background:#2f75b5;
            color:#ffffff;
            border-radius:3px;
            font-size:13px;
            font-weight:bold;
            text-align:center;
          }

          .info-box p {
            margin:5px 0;
            color:#4b5563;
            font-size:10.5px;
            line-height:1.55;
            text-align:right;
            direction:rtl;
            unicode-bidi:plaintext;
          }

          .info-box p strong {
            color:#1f2937;
            font-weight:700;
          }

          /* =========================
             ITEMS
             ========================= */

          .items-section {
            display:block;
            width:100% !important;
            max-width:none !important;
            min-width:100% !important;
            margin:0 0 18px 0;
            padding:0;
            direction:rtl;
          }

          .items-section h3 {
            display:block;
            width:100% !important;
            margin:0 0 9px 0;
            padding:8px;
            font-size:14px;
            font-weight:bold;
            color:#ffffff;
            background:#2f75b5;
            text-align:center;
            border-radius:3px;
          }

          .items-table {
            display:table !important;
            width:100% !important;
            min-width:100% !important;
            max-width:none !important;
            table-layout:fixed !important;
            border-collapse:collapse;
            border-spacing:0;
            direction:rtl;
            margin:0;
            padding:0;
          }

          .items-table col.col-number {
            width:7%;
          }

          .items-table col.col-name {
            width:38%;
          }

          .items-table col.col-color {
            width:15%;
          }

          .items-table col.col-quantity {
            width:10%;
          }

          .items-table col.col-unit-price {
            width:15%;
          }

          .items-table col.col-total {
            width:15%;
          }

          .items-table thead,
          .items-table tbody {
            width:100%;
          }

          .items-table tr {
            width:100%;
          }

          .items-table th,
          .items-table td {
            box-sizing:border-box;
            overflow:hidden;
          }

          .items-table th {
            background:#2f75b5;
            color:#ffffff;
            padding:8px 6px;
            text-align:center;
            vertical-align:middle;
            font-weight:bold;
            border:1px solid #246092;
            font-size:10.5px;
            line-height:1.35;
          }

          .items-table td {
            padding:7px 6px;
            text-align:center;
            vertical-align:middle;
            border:1px solid #d9dee5;
            color:#1a1a1a;
            font-size:10.5px;
            line-height:1.4;
          }

          .items-table td.item-name {
            text-align:right;
            direction:rtl;
            unicode-bidi:plaintext;
            overflow-wrap:anywhere;
            word-break:break-word;
          }

          .items-table td.number-cell {
            text-align:center;
          }

          .items-table td.numeric-cell {
            text-align:center;
            direction:ltr;
            white-space:nowrap;
          }

          .items-table tbody tr:nth-child(even) {
            background:#f8f9fa;
          }

          /* =========================
             TOTALS
             ========================= */

          .totals {
            width:100%;
            display:flex;
            justify-content:flex-start;
            direction:rtl;
            margin-bottom:20px;
          }

          .totals-table {
            width:380px;
            max-width:55%;
            border-collapse:collapse;
            font-size:11px;
          }

          .totals-table td {
            padding:6px 10px;
            border:none;
            border-bottom:1px solid #e5e7eb;
            vertical-align:middle;
          }

          .totals-table td:first-child {
            width:55%;
            text-align:right;
            font-weight:bold;
            color:#4b5563;
          }

          .totals-table td:last-child {
            width:45%;
            text-align:left;
            font-weight:600;
            color:#1f2937;
            direction:ltr;
          }

          .totals-table .grand-total {
            background:#f0fdf4;
            border-top:2px solid #16a34a;
          }

          .totals-table .grand-total td {
            border-bottom:none;
            font-size:14px;
            font-weight:800;
            padding-top:8px;
            padding-bottom:8px;
          }

          .totals-table .grand-total td:first-child {
            color:#1f2937;
            text-align:right;
          }

          .totals-table .grand-total td:last-child {
            color:#16a34a;
            text-align:left;
            font-size:15px;
            font-weight:800;
            direction:ltr;
          }

          /* =========================
             NOTES
             ========================= */

          .notes-terms {
            margin-bottom:18px;
            width:100%;
          }

          .note-box {
            padding:9px 11px;
            border:1px solid #d9dee5;
            border-radius:5px;
            background:#f9fafb;
            font-size:10.5px;
            margin-bottom:8px;
            direction:rtl;
            text-align:right;
          }

          .note-box p {
            margin:3px 0;
          }

          .note-box p:first-child {
            font-weight:bold;
            color:#1f2937;
          }

          .note-box p:last-child {
            color:#4b5563;
          }

          /* =========================
             SIGNATURES
             ========================= */

          .signatures {
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:35px;
            margin-top:28px;
            padding-top:18px;
            border-top:1px solid #d1d5db;
            direction:rtl;
            width:100%;
          }

          .signature {
            text-align:center;
            padding-top:18px;
          }

          .signature .line {
            border-top:1px solid #9ca3af;
            margin-bottom:8px;
          }

          .signature p {
            margin:0;
            color:#6b7280;
            font-size:10px;
          }

          /* =========================
             FOOTER - CENTERED
             ========================= */

          .footer {
            width:100%;
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            margin-top:18px;
            padding:12px 8px 4px 8px;
            border-top:1px solid #e5e7eb;
            color:#6b7280;
            font-size:9px;
            direction:rtl;
            text-align:center;
          }

          .footer p {
            margin:3px 0;
            text-align:center;
          }

          /* =========================
             PAGE BREAKS
             ========================= */

          .avoid-break {
            break-inside:avoid;
            page-break-inside:avoid;
          }

          .info-box,
          .totals,
          .signatures {
            break-inside:avoid;
            page-break-inside:avoid;
          }

          .items-table {
            page-break-inside:auto;
            break-inside:auto;
          }

          .items-table tr {
            page-break-inside:avoid;
            break-inside:avoid;
          }

          @media print {
            .pdf-invoice {
              padding:0;
            }

            .items-table {
              width:100% !important;
              min-width:100% !important;
              table-layout:fixed !important;
            }
          }

        </style>

        <!-- =========================
             HEADER
             ========================= -->

        <div class="pdf-header avoid-break">

          <div class="pdf-header-info">

            <h1 class="pdf-header-title">
              فاتورة ضريبية
            </h1>

            <div class="pdf-header-subtitle">

              رقم الفاتورة:

              <span dir="ltr">
                ${escapeHtml(
                  invoice.invoice_number || 'INV-001'
                )}
              </span>

              &nbsp;&nbsp;|&nbsp;&nbsp;

              التاريخ:

              <span>
                ${escapeHtml(
                  formatDate(
                    invoice.invoice_date || new Date()
                  )
                )}
              </span>

            </div>

            <div>

              <span
                class="status-badge status-${escapeHtml(status)}"
              >
                ${statusText}
              </span>

            </div>

          </div>

          <div class="pdf-logo-box">
            ${logoHTML}
          </div>

        </div>

        <!-- =========================
             COMPANY / CUSTOMER
             ========================= -->

        <div class="info-grid avoid-break">

          <div class="info-box">

            <h3>
              بيانات الشركة
            </h3>

            <p>
              <strong>
                ${escapeHtml(company.name)}
              </strong>
            </p>

            <p>
              السجل الضريبي:
              ${escapeHtml(company.taxNumber)}
            </p>

            <p>
              ${escapeHtml(company.address)}
            </p>

            <p>
              هاتف:
              ${escapeHtml(company.phone)}
            </p>

            <p>
              البريد الإلكتروني:
              ${escapeHtml(company.email)}
            </p>

          </div>

          <div class="info-box">

            <h3>
              بيانات العميل
            </h3>

            <p>
              <strong>
                ${escapeHtml(
                  invoice.customer?.name || '—'
                )}
              </strong>
            </p>

            <p>
              هاتف:
              ${escapeHtml(
                invoice.customer?.phone || '—'
              )}
            </p>

            <p>
              البريد الإلكتروني:
              ${escapeHtml(
                invoice.customer?.email || '—'
              )}
            </p>

            <p>
              العنوان:
              ${escapeHtml(
                invoice.customer?.address || '—'
              )}
            </p>

            <p>
              الرقم الضريبي:
              ${escapeHtml(
                invoice.customer?.tax_number || '—'
              )}
            </p>

          </div>

        </div>

        <!-- =========================
             ITEMS
             ========================= -->

        <div class="items-section">

          <h3>
            الأصناف
          </h3>

          <table
            class="items-table"
            dir="rtl"
          >

            <colgroup>

              <col class="col-number">

              <col class="col-name">

              <col class="col-color">

              <col class="col-quantity">

              <col class="col-unit-price">

              <col class="col-total">

            </colgroup>

            <thead>

              <tr>

                <th>
                  #
                </th>

                <th style="text-align:right;">
                  الصنف
                </th>

                <th>
                  اللون
                </th>

                <th>
                  الكمية
                </th>

                <th>
                  سعر الوحدة
                </th>

                <th>
                  الإجمالي
                </th>

              </tr>

            </thead>

            <tbody>
              ${itemsRows}
            </tbody>

          </table>

        </div>

        <!-- =========================
             TOTALS
             ========================= -->

        <div class="totals avoid-break">

          <table class="totals-table">

            <tr>

              <td>
                المجموع الفرعي
              </td>

              <td>
                ${formatCurrency(invoice.subtotal)}
              </td>

            </tr>

            ${discountHtml}

            ${shippingHtml}

            <tr>

              <td>
                الضريبة
                (${escapeHtml(invoice.vat_rate || 0)}%)
              </td>

              <td>
                ${formatCurrency(invoice.vat_amount)}
              </td>

            </tr>

            <tr class="grand-total">

              <td>
                الإجمالي النهائي
              </td>

              <td>
                ${formatCurrency(invoice.total_amount)}
              </td>

            </tr>

          </table>

        </div>

        <!-- =========================
             NOTES / TERMS
             ========================= -->

        ${notesTermsHtml}

        <!-- =========================
             SIGNATURES
             ========================= -->

        <div class="signatures avoid-break">

          <div class="signature">

            <div class="line"></div>

            <p>
              توقيع العميل
            </p>

          </div>

          <div class="signature">

            <div class="line"></div>

            <p>
              توقيع البائع
            </p>

          </div>

        </div>

        <!-- =========================
             FOOTER - now fully centered
             ========================= -->

        <div class="footer">

          <p>
            هذه الفاتورة صادرة من
            ${escapeHtml(company.name)}
            - شكراً لتعاملكم معنا
          </p>

          <p>
            للتواصل:
            ${escapeHtml(company.phone)}
            |
            البريد الإلكتروني:
            ${escapeHtml(company.email)}
          </p>

          <p>
            تم الإنشاء في:
            ${escapeHtml(
              new Date().toLocaleString('ar-EG')
            )}
          </p>

        </div>

      </div>
    `
  }
}