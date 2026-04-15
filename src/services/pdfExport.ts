// src/services/pdfExport.ts
import html2pdf from 'html2pdf.js'

export class PDFExportService {
  static async generateInvoicePDF(invoice: any, companyInfo?: any): Promise<void> {
    const htmlContent = this.generateInvoiceHTML(invoice, companyInfo)
    
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
      filename: `invoice_${invoice.invoice_number}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff',
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const 
      }
    }
    
    // Create a temporary container
    const container = document.createElement('div')
    container.innerHTML = htmlContent
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = '800px'
    container.style.backgroundColor = 'white'
    container.style.padding = '20px'
    container.style.direction = 'rtl'
    document.body.appendChild(container)
    
    try {
      await html2pdf().set(opt).from(container).save()
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
          <title>فاتورة رقم ${invoice.invoice_number}</title>
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
              border-bottom: 2px solid #2F75B5;
            }
            
            .logo {
              display: inline-block;
              padding: 15px;
              background: linear-gradient(135deg, #d97706, #16a34a);
              border-radius: 50%;
              margin-bottom: 15px;
            }
            
            .logo svg {
              width: 50px;
              height: 50px;
            }
            
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
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
              margin: 6px 0;
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
            }
            
            tbody tr:hover {
              background-color: #f9fafb;
            }
            
            /* Totals */
            .totals {
              width: 100%;
              max-width: 400px;
              margin-right: auto;
            }
            
            .totals table {
              width: 100%;
            }
            
            .totals td {
              padding: 8px 12px;
              text-align: left;
            }
            
            .totals td:first-child {
              text-align: right;
              font-weight: bold;
            }
            
            .grand-total {
              background-color: #f0fdf4;
              font-weight: bold;
              font-size: 16px;
            }
            
            .grand-total td:last-child {
              color: #16a34a;
              font-size: 18px;
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
              padding-top: 40px;
              border-top: 1px solid #9ca3af;
              margin-top: 10px;
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
            
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              .invoice-container {
                padding: 0;
              }
              .info-box {
                break-inside: avoid;
              }
              table {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="logo">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 class="title">فاتورة ضريبية</h1>
              <div class="invoice-number">
                رقم الفاتورة: <span>${invoice.invoice_number}</span> &nbsp;|&nbsp;
                التاريخ: <span>${formatDate(invoice.invoice_date)}</span>
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
                    <th>#</th>
                    <th>الصنف</th>
                    <th>الكود</th>
                    <th>الكمية</th>
                    <th>سعر الوحدة</th>
                    <th>الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  ${(invoice.items || []).map((item: any, idx: number) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>${item.name}</td>
                      <td>${item.code || '—'}</td>
                      <td>${item.quantity}</td>
                      <td>${formatCurrency(item.unit_price)}</td>
                      <td>${formatCurrency(item.total)}</td>
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
                <tr>
                  <td>الخصم (${invoice.discount_value || 0} ${invoice.discount_type === 'percentage' ? '%' : 'ج.م'})</td>
                  <td style="color: #dc2626;">-${formatCurrency(invoice.discount_amount)}</td>
                </tr>
                <tr>
                  <td>الشحن</td>
                  <td>${formatCurrency(invoice.shipping_cost)}</td>
                </tr>
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
            
            <!-- Signatures -->
            <div class="signatures">
              <div class="signature"><p>توقيع العميل</p></div>
              <div class="signature"><p>توقيع البائع</p></div>
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