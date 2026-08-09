// src/services/pdfExport.ts
import html2pdf from 'html2pdf.js'

export class PDFExportService {
  static async generateInvoicePDF(invoice: any, companyInfo?: any): Promise<void> {
    const htmlContent = this.generateInvoiceHTML(invoice, companyInfo)

    const container = document.createElement('div')
    container.innerHTML = htmlContent
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = '794px'
    container.style.background = 'white'
    container.style.padding = '20px'
    container.style.direction = 'rtl'
    container.style.zIndex = '-9999'
    document.body.appendChild(container)

    await new Promise(resolve => setTimeout(resolve, 500))

    const opt = {
      margin: 10,
      filename: `فاتورة_${invoice.invoice_number || 'invoice'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        width: container.scrollWidth,
        height: container.scrollHeight,
        windowHeight: container.scrollHeight
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }

    try {
      await html2pdf()
        .set(opt)
        .from(container)
        .save()
    } catch (error) {
      console.error('PDF generation error:', error)
      throw new Error('فشل في تحميل الفاتورة. يرجى المحاولة مرة أخرى.')
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container)
      }
    }
  }

  static generateInvoiceHTML(invoice: any, companyInfo?: any): string {
    const defaultCompany = {
      name: 'لوكسري برفيوم للتجارة',
      taxNumber: '123-456-789',
      address: 'مصر - القاهرة - مدينة نصر',
      phone: '01234567890',
      email: 'info@luxuryperfume.com',
      logoUrl: null as string | null
    }

    const company = companyInfo || defaultCompany
    const companyLogo = company.logoUrl || null

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: invoice.currency || 'EGP',
        minimumFractionDigits: 2
      }).format(value || 0)
    }

    const formatDate = (date: Date | string) => {
      if (!date) return '—'
      return new Date(date).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const logoHTML = companyLogo
      ? `<img src="${companyLogo}" alt="شعار الشركة" style="max-height:60px;width:auto;border-radius:50%;" />`
      : ''

    const itemsRows = (invoice.items || []).map((item: any, idx: number) => {
      const codeHtml = item.code ? `<div style="font-size:9px;color:#6b7280;">الكود: ${item.code}</div>` : ''
      const sizeHtml = item.size ? `<div style="font-size:9px;color:#6b7280;">المقاس: ${item.size}</div>` : ''
      return `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:5px 8px;text-align:center;border:1px solid #e5e7eb;font-size:11px;">${idx + 1}</td>
          <td style="padding:5px 8px;text-align:right;border:1px solid #e5e7eb;font-size:11px;">
            <div style="font-weight:500;color:#1f2937;">${item.name}</div>
            ${codeHtml}
            ${sizeHtml}
          </td>
          <td style="padding:5px 8px;text-align:center;border:1px solid #e5e7eb;font-size:11px;">${item.quantity}</td>
          <td style="padding:5px 8px;text-align:center;border:1px solid #e5e7eb;font-size:11px;">${formatCurrency(item.unit_price)}</td>
          <td style="padding:5px 8px;text-align:center;border:1px solid #e5e7eb;font-size:11px;font-weight:bold;">${formatCurrency(item.total)}</td>
        </tr>
      `
    }).join('')

    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة ${invoice.invoice_number || 'INV-001'}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box;}
          body{font-family:'Cairo','Segoe UI',Arial,sans-serif;padding:20px;background:white;direction:rtl;font-size:12px;line-height:1.5;color:#1a1a1a;}
          .container{max-width:1100px;margin:0 auto;background:white;padding:10px;}
          .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid #2F75B5;}
          .header-left{flex:1;}
          .header-title{font-size:22px;font-weight:bold;color:#1f2937;margin:0;}
          .header-subtitle{color:#4b5563;font-size:12px;margin-top:4px;}
          .header-subtitle span{font-weight:bold;color:#1f2937;}
          .header-logo{flex-shrink:0;margin-right:20px;}
          .header-logo img{max-height:60px;width:auto;border-radius:50%;display:block;}
          .status-badge{display:inline-block;padding:2px 10px;border-radius:9999px;font-size:10px;font-weight:bold;}
          .status-draft{background:#f3f4f6;color:#4b5563;}
          .status-issued{background:#dbeafe;color:#1d4ed8;}
          .status-paid{background:#d1fae5;color:#065f46;}
          .status-cancelled{background:#fee2e2;color:#991b1b;}
          .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:20px;}
          .info-box{border:1px solid #e5e7eb;border-radius:6px;padding:12px;background:#f9fafb;}
          .info-box h3{font-size:14px;font-weight:bold;color:#1f2937;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;}
          .info-box p{margin:3px 0;color:#4b5563;font-size:11px;}
          .info-box p strong{color:#1f2937;font-weight:600;}
          .items-section{margin-bottom:20px;}
          .items-section h3{font-size:15px;font-weight:bold;color:#1f2937;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #2F75B5;}
          table{width:100%;border-collapse:collapse;font-size:11px;}
          th{background:#1f2937;color:white;padding:6px 8px;text-align:center;font-weight:bold;border:1px solid #374151;}
          td{padding:5px 8px;text-align:center;border:1px solid #e5e7eb;color:#1a1a1a;}
          td:first-child{text-align:center;}
          td:nth-child(2){text-align:right;}
          tbody tr:nth-child(even){background:#fafafa;}
          .totals{display:flex;justify-content:flex-end;margin-bottom:20px;}
          .totals table{width:100%;max-width:350px;border-collapse:collapse;font-size:11px;}
          .totals td{padding:4px 10px;text-align:left;border:none;border-bottom:1px solid #e5e7eb;}
          .totals td:first-child{text-align:right;font-weight:bold;color:#4b5563;}
          .totals td:last-child{text-align:left;font-weight:600;color:#1f2937;}
          .totals .grand-total{background:#f0fdf4;border-top:2px solid #16a34a;}
          .totals .grand-total td{border-bottom:none;font-size:14px;}
          .totals .grand-total td:first-child{color:#1f2937;font-size:14px;}
          .totals .grand-total td:last-child{color:#16a34a;font-size:15px;font-weight:800;}
          .notes-terms{margin-bottom:15px;}
          .note-box{padding:10px;border:1px solid #e5e7eb;border-radius:6px;background:#f9fafb;font-size:11px;margin-bottom:8px;}
          .note-box p:first-child{font-weight:bold;color:#1f2937;margin-bottom:3px;}
          .note-box p:last-child{color:#4b5563;}
          .signatures{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:30px;padding-top:15px;border-top:1px solid #e5e7eb;}
          .signature{text-align:center;padding-top:20px;margin-top:8px;}
          .signature .line{border-top:1px solid #9ca3af;margin-bottom:8px;}
          .signature p{color:#6b7280;font-size:10px;}
          .footer{text-align:center;margin-top:20px;padding-top:15px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:9px;}
          .footer p{margin:3px 0;}
          @media print{body{padding:0;margin:0;}.container{padding:0;}.info-box{break-inside:avoid;}table{break-inside:avoid;}.totals{break-inside:avoid;}.signatures{break-inside:avoid;}}
          @media (max-width:600px){.info-grid{grid-template-columns:1fr;}.totals table{max-width:100%;}table{font-size:10px;}th,td{padding:4px 6px;}}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-left">
              <h1 class="header-title">فاتورة ضريبية</h1>
              <div class="header-subtitle">
                رقم الفاتورة: <span>${invoice.invoice_number || 'INV-001'}</span> &nbsp;|&nbsp;
                التاريخ: <span>${formatDate(invoice.invoice_date || new Date())}</span>
              </div>
              <div style="margin-top:4px;">
                <span class="status-badge status-${invoice.status || 'draft'}">
                  ${invoice.status === 'issued' ? 'صادرة' :
                    invoice.status === 'paid' ? 'مدفوعة' :
                    invoice.status === 'cancelled' ? 'ملغاة' : 'مسودة'}
                </span>
              </div>
            </div>
            ${companyLogo ? `<div class="header-logo">${logoHTML}</div>` : ''}
          </div>

          <div class="info-grid">
            <div class="info-box">
              <h3>بيانات الشركة</h3>
              <p><strong>${company.name}</strong></p>
              <p>السجل الضريبي: ${company.taxNumber}</p>
              <p>${company.address}</p>
              <p>هاتف: ${company.phone}</p>
              <p>البريد الإلكتروني: ${company.email}</p>
            </div>
            <div class="info-box">
              <h3>بيانات العميل</h3>
              <p><strong>${invoice.customer?.name || '—'}</strong></p>
              <p>هاتف: ${invoice.customer?.phone || '—'}</p>
              <p>البريد الإلكتروني: ${invoice.customer?.email || '—'}</p>
              <p>العنوان: ${invoice.customer?.address || '—'}</p>
              <p>الرقم الضريبي: ${invoice.customer?.tax_number || '—'}</p>
            </div>
          </div>

          <div class="items-section">
            <h3>الأصناف</h3>
            <table>
              <thead>
                <tr>
                  <th style="width:8%;">#</th>
                  <th style="text-align:right;width:42%;">الصنف</th>
                  <th style="width:15%;">الكود</th>
                  <th style="width:10%;">الكمية</th>
                  <th style="width:15%;">سعر الوحدة</th>
                  <th style="width:15%;">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
          </div>

          <div class="totals">
            <table>
              <tr>
                <td>المجموع الفرعي</td>
                <td>${formatCurrency(invoice.subtotal)}</td>
              </tr>
              ${invoice.discount_value > 0 ? `
              <tr>
                <td>الخصم (${invoice.discount_value} ${invoice.discount_type === 'percentage' ? '%' : 'ج.م'})</td>
                <td style="color:#dc2626;">-${formatCurrency(invoice.discount_amount)}</td>
              </tr>` : ''}
              ${invoice.shipping_cost > 0 ? `
              <tr>
                <td>الشحن</td>
                <td>${formatCurrency(invoice.shipping_cost)}</td>
              </tr>` : ''}
              <tr>
                <td>الضريبة (${invoice.vat_rate || 0}%)</td>
                <td>${formatCurrency(invoice.vat_amount)}</td>
              </tr>
              <tr class="grand-total">
                <td>الإجمالي النهائي</td>
                <td>${formatCurrency(invoice.total_amount)}</td>
              </tr>
            </table>
          </div>

          ${invoice.notes || invoice.terms ? `
          <div class="notes-terms">
            ${invoice.notes ? `
            <div class="note-box">
              <p>ملاحظات:</p>
              <p>${invoice.notes}</p>
            </div>` : ''}
            ${invoice.terms ? `
            <div class="note-box">
              <p>شروط الدفع:</p>
              <p>${invoice.terms}</p>
            </div>` : ''}
          </div>` : ''}

          <div class="signatures">
            <div class="signature">
              <div class="line"></div>
              <p>توقيع العميل</p>
            </div>
            <div class="signature">
              <div class="line"></div>
              <p>توقيع البائع</p>
            </div>
          </div>

          <div class="footer">
            <p>هذه الفاتورة صادرة من ${company.name} - شكراً لتعاملكم معنا</p>
            <p>للتواصل: ${company.phone} | البريد الإلكتروني: ${company.email}</p>
            <p>تم الإنشاء في: ${new Date().toLocaleString('ar-EG')}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}