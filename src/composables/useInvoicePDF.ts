// src/composables/useInvoicePDF.ts
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export function useInvoicePDF() {
  const generatePDF = async (elementId: string, fileName: string): Promise<void> => {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('عنصر الفاتورة غير موجود')
    }

    // إظهار مؤشر التحميل
    const loadingToast = document.createElement('div')
    loadingToast.innerText = 'جاري تحميل الفاتورة...'
    loadingToast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #333;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-family: sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `
    document.body.appendChild(loadingToast)

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${fileName}.pdf`)
    } catch (error) {
      console.error('PDF generation error:', error)
      throw new Error('حدث خطأ أثناء تحميل الفاتورة')
    } finally {
      document.body.removeChild(loadingToast)
    }
  }

  const printInvoice = (elementId: string): void => {
    const element = document.getElementById(elementId)
    if (!element) {
      alert('عنصر الفاتورة غير موجود')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('الرجاء السماح بالنوافذ المنبثقة للطباعة')
      return
    }

    const styles = document.querySelectorAll('style, link[rel="stylesheet"]')
    let stylesHTML = ''
    styles.forEach((style) => {
      if (style.tagName === 'STYLE') {
        stylesHTML += (style as HTMLStyleElement).innerHTML
      }
    })

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>فاتورة</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Cairo', 'Arial', sans-serif;
              padding: 20px;
              background: white;
              direction: rtl;
            }
            .print-invoice {
              max-width: 1100px;
              margin: 0 auto;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-8 { margin-bottom: 32px; }
            .mt-12 { margin-top: 48px; }
            .pt-2 { padding-top: 8px; }
            .pt-8 { padding-top: 32px; }
            .border-b { border-bottom: 1px solid #e5e7eb; }
            .border-t-2 { border-top: 2px solid #d1d5db; }
            .border-gray-200 { border-color: #e5e7eb; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .bg-gray-800 { background-color: #1f2937; }
            .text-white { color: white; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .gap-6 { gap: 24px; }
            .gap-8 { gap: 32px; }
            .text-sm { font-size: 13px; }
            .text-lg { font-size: 18px; }
            .text-3xl { font-size: 32px; }
            .text-green-600 { color: #16a34a; }
            .text-red-600 { color: #dc2626; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-800 { color: #1f2937; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 12px; text-align: right; border: 1px solid #e5e7eb; }
            th { background-color: #1f2937; color: white; font-weight: bold; }
            @media print {
              body { padding: 0; }
            }
          </style>
          ${stylesHTML}
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.print()
  }

  return { generatePDF, printInvoice }
}