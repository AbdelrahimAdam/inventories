// src/services/pdfExport.ts
import html2pdf from 'html2pdf.js'

export class PDFExportService {
  static async generateInvoicePDF(invoice: any, companyInfo?: any): Promise<void> {
    const htmlContent = this.generateInvoiceHTML(invoice, companyInfo)

    // Create a temporary container with proper styling
    const container = document.createElement('div')
    container.innerHTML = htmlContent
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = '800px'
    container.style.background = 'white'
    container.style.padding = '20px'
    container.style.direction = 'rtl'
    container.style.fontFamily = "'Cairo', 'Segoe UI', Arial, sans-serif"
    document.body.appendChild(container)

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 200))

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
      filename: `invoice_${invoice.invoice_number || 'invoice'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff',
        letterRendering: true,
        width: 800,
        height: container.scrollHeight
      },
      jsPDF: { 
        unit: 'in' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const 
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as any }
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
      document.body.removeChild(container)
    }
  }

  static generateInvoiceHTML(invoice: any, companyInfo?: any): string {
    const defaultCompany = {
      name: 'لوكسري برفيوم للتجارة',
      taxNumber: '123-456-789',
      address: 'مصر - القاهرة - مدينة نصر',
      phone: '01234567890',
      email: 'info@luxuryperfume.com'
    }

    const company = companyInfo || defaultCompany

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

    return `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>فاتورة رقم ${invoice.invoice_number || 'INV-001'}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Cairo', 'Segoe UI', 'Tahoma', Arial, sans-serif;
              padding: 20px;
              background: white;
              direction: rtl;
              font-size: 14px;
              line-height: 1.5;
              color: #1a1a1a;
            }
            
            .invoice-container {
              max-width: 1100px;
              margin: 0 auto;
              background: white;
            }
            
            /* Header Styles */
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #2F75B5;
            }
            
            .logo {
              display: inline-block;
              padding: 12px;
              background: linear-gradient(135deg, #d97706, #16a34a);
              border-radius: 50%;
              margin-bottom: 15px;
            }
            
            .logo svg {
              width: 50px;
              height: 50px;
              display: block;
            }
            
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 8px;
            }
            
            .invoice-number {
              color: #4b5563;
              font-size: 14px;
            }
            
            .invoice-number span {
              font-weight: bold;
              color: #1f2937;
            }
            
            /* Info Grid */
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            
            .info-box {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              background-color: #f9fafb;
            }
            
            .info-box h3 {
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid #e5e7eb;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .info-box p {
              margin: 4px 0;
              color: #4b5563;
              font-size: 13px;
            }
            
            .info-box p strong {
              color: #1f2937;
              font-weight: 600;
            }
            
            /* Items Table */
            .items-section {
              margin-bottom: 30px;
            }
            
            .items-section h3 {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 2px solid #2F75B5;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            
            th {
              background-color: #1f2937;
              color: white;
              padding: 12px;
              text-align: center;
              font-weight: bold;
              font-size: 13px;
              border: 1px solid #374151;
            }
            
            td {
              padding: 10px 12px;
              text-align: center;
              border: 1px solid #e5e7eb;
              font-size: 13px;
              color: #1a1a1a;
            }
            
            tbody tr:nth-child(even) {
              background-color: #fafafa;
            }
            
            /* Totals */
            .totals {
              width: 100%;
              max-width: 400px;
              margin-right: auto;
              margin-top: 20px;
            }
            
            .totals table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .totals td {
              padding: 8px 12px;
              text-align: left;
              border: none;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .totals td:first-child {
              text-align: right;
              font-weight: bold;
              color: #4b5563;
            }
            
            .totals td:last-child {
              text-align: left;
              font-weight: 600;
              color: #1f2937;
            }
            
            .grand-total {
              background-color: #f0fdf4;
              border-top: 2px solid #16a34a;
            }
            
            .grand-total td {
              border-bottom: none;
              font-size: 16px;
            }
            
            .grand-total td:first-child {
              color: #1f2937;
              font-size: 16px;
            }
            
            .grand-total td:last-child {
              color: #16a34a;
              font-size: 18px;
              font-weight: 800;
            }
            
            /* Signatures */
            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            
            .signature {
              text-align: center;
              padding-top: 30px;
              margin-top: 10px;
            }
            
            .signature .line {
              border-top: 1px solid #9ca3af;
              margin-bottom: 8px;
            }
            
            .signature p {
              color: #6b7280;
              font-size: 12px;
            }
            
            /* Footer */
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #9ca3af;
              font-size: 11px;
            }
            
            /* Status Badge */
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: bold;
              margin-top: 10px;
            }
            
            .status-draft { background-color: #f3f4f6; color: #4b5563; }
            .status-issued { background-color: #dbeafe; color: #1d4ed8; }
            .status-paid { background-color: #d1fae5; color: #065f46; }
            .status-cancelled { background-color: #fee2e2; color: #991b1b; }
            
            /* Responsive */
            @media print {
              body { padding: 0; margin: 0; }
              .invoice-container { padding: 0; }
              .info-box { break-inside: avoid; }
              table { break-inside: avoid; }
              .totals { break-inside: avoid; }
              .signatures { break-inside: avoid; }
            }
            
            @media (max-width: 600px) {
              .info-grid { grid-template-columns: 1fr; }
              .totals { max-width: 100%; }
              table { font-size: 12px; }
              th, td { padding: 6px 8px; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="logo">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4v16h16V4H4z" />
                  <path d="M8 4v16" />
                  <path d="M16 4v16" />
                  <path d="M4 8h16" />
                  <path d="M4 16h16" />
                  <path d="M8 8v8" />
                  <path d="M16 8v8" />
                  <path d="M12 4v16" />
                </svg>
              </div>
              <h1 class="title">فاتورة ضريبية</h1>
              <div class="invoice-number">
                رقم الفاتورة: <span>${invoice.invoice_number || 'INV-001'}</span> &nbsp;|&nbsp;
                التاريخ: <span>${formatDate(invoice.invoice_date || new Date())}</span>
              </div>
              <div>
                <span class="status-badge status-${invoice.status || 'draft'}">
                  ${invoice.status === 'issued' ? 'صادرة' : 
                    invoice.status === 'paid' ? 'مدفوعة' : 
                    invoice.status === 'cancelled' ? 'ملغاة' : 'مسودة'}
                </span>
              </div>
            </div>
            
            <!-- Company & Customer Info -->
            <div class="info-grid">
              <div class="info-box">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  بيانات الشركة
                </h3>
                <p><strong>${company.name}</strong></p>
                <p>السجل الضريبي: ${company.taxNumber}</p>
                <p>${company.address}</p>
                <p>هاتف: ${company.phone}</p>
                <p>البريد الإلكتروني: ${company.email}</p>
              </div>
              
              <div class="info-box">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  بيانات العميل
                </h3>
                <p><strong>${invoice.customer?.name || '—'}</strong></p>
                <p>هاتف: ${invoice.customer?.phone || '—'}</p>
                <p>البريد الإلكتروني: ${invoice.customer?.email || '—'}</p>
                <p>العنوان: ${invoice.customer?.address || '—'}</p>
                <p>الرقم الضريبي: ${invoice.customer?.tax_number || '—'}</p>
              </div>
            </div>
            
            <!-- Items Table -->
            <div class="items-section">
              <h3>الأصناف</h3>
              <table>
                <thead>
                  <tr>
                    <th style="width: 50px;">#</th>
                    <th style="text-align: right;">الصنف</th>
                    <th style="width: 100px;">الكود</th>
                    <th style="width: 80px;">الكمية</th>
                    <th style="width: 120px;">سعر الوحدة</th>
                    <th style="width: 130px;">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  ${(invoice.items || []).map((item: any, idx: number) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td style="text-align: right;">
                        <div><strong>${item.name}</strong></div>
                        ${item.size ? `<div style="font-size: 11px; color: #6b7280;">المقاس: ${item.size}</div>` : ''}
                      </td>
                      <td>${item.code || '—'}</td>
                      <td>${item.quantity}</td>
                      <td>${formatCurrency(item.unit_price)}</td>
                      <td><strong>${formatCurrency(item.total)}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <!-- Totals -->
            <div class="totals">
              <table>
                <tr>
                  <td>المجموع الفرعي</td>
                  <td>${formatCurrency(invoice.subtotal)}</td>
                </tr>
                ${invoice.discount_value > 0 ? `
                <tr>
                  <td>الخصم (${invoice.discount_value} ${invoice.discount_type === 'percentage' ? '%' : 'ج.م'})</td>
                  <td style="color: #dc2626;">-${formatCurrency(invoice.discount_amount)}</td>
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
            
            <!-- Notes & Terms -->
            ${invoice.notes ? `
            <div style="margin-top: 20px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;">
              <p style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">ملاحظات:</p>
              <p style="color: #4b5563; font-size: 13px;">${invoice.notes}</p>
            </div>` : ''}
            
            ${invoice.terms ? `
            <div style="margin-top: 10px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;">
              <p style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">شروط الدفع:</p>
              <p style="color: #4b5563; font-size: 13px;">${invoice.terms}</p>
            </div>` : ''}
            
            <!-- Signatures -->
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
            
            <!-- Footer -->
            <div class="footer">
              <p>هذه الفاتورة صادرة من ${company.name} - شكراً لتعاملكم معنا</p>
              <p style="margin-top: 5px;">للتواصل: ${company.phone} | البريد الإلكتروني: ${company.email}</p>
              <p style="margin-top: 5px;">تم الإنشاء في: ${new Date().toLocaleString('ar-EG')}</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}