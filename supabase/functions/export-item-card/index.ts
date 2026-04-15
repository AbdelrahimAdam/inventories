// supabase/functions/export-item-card/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import * as ExcelJS from 'https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const { itemId, type, items } = await req.json()
    
    // Initialize Supabase client with service role (bypass RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // ========== GET ITEMS DATA ==========
    let itemsToExport = []
    
    if (type === 'single' && itemId) {
      // Get single item
      const { data: item, error } = await supabaseClient
        .from('items')
        .select('*, warehouses(name)')
        .eq('id', itemId)
        .single()
      
      if (error) throw error
      itemsToExport = [item]
    } else if (type === 'multiple' && items) {
      // Get multiple items
      const { data: itemsData, error } = await supabaseClient
        .from('items')
        .select('*, warehouses(name)')
        .in('id', items)
      
      if (error) throw error
      itemsToExport = itemsData
    } else {
      // Get all items for tenant
      const { data: allItems, error } = await supabaseClient
        .from('items')
        .select('*, warehouses(name)')
        .eq('tenant_id', req.headers.get('x-tenant-id') || '')
      
      if (error) throw error
      itemsToExport = allItems
    }

    // ========== GET TRANSACTIONS FOR EACH ITEM ==========
    for (const item of itemsToExport) {
      const { data: transactions } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('item_id', item.id)
        .order('created_at', { ascending: true })
      
      item.transactions = transactions || []
    }

    // ========== CREATE WORKBOOK ==========
    const workbook = new ExcelJS.Workbook()
    
    for (const item of itemsToExport) {
      const sheetName = createSafeSheetName(item.name, item.code)
      const worksheet = workbook.addWorksheet(sheetName)
      
      await createItemWorksheet(worksheet, item, supabaseClient)
    }

    // ========== GENERATE BUFFER ==========
    const buffer = await workbook.xlsx.writeBuffer()
    
    // ========== RETURN RESPONSE ==========
    return new Response(buffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="item_cards_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ========== HELPER FUNCTIONS ==========

async function fetchImageAsBuffer(imageUrl: string | null, supabaseClient: any): Promise<Buffer | null> {
  if (!imageUrl) return null
  
  try {
    // Handle Supabase storage URLs
    let url = imageUrl
    if (url.startsWith('/')) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      url = `${supabaseUrl}/storage/v1/object/public${url}`
    }
    
    const response = await fetch(url)
    if (!response.ok) return null
    
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error('Error fetching image:', error)
    return null
  }
}

async function createItemWorksheet(worksheet: ExcelJS.Worksheet, item: any, supabaseClient: any): Promise<void> {
  // Page setup
  worksheet.pageSetup = {
    paperSize: 9,
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 }
  }

  // Styles
  const titleFont = { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFFFF' } }
  const headerFont = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
  const labelFont = { name: 'Arial', size: 12, bold: true }
  const valueFont = { name: 'Arial', size: 12 }
  const tableHeaderFont = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
  const tableFont = { name: 'Arial', size: 10 }

  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F75B5' } }
  const subheaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } }
  const accentFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8CBAD' } }
  const evenRowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }
  
  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  }
  
  const thickBorder = {
    top: { style: 'thick', color: { argb: 'FF000000' } },
    left: { style: 'thick', color: { argb: 'FF000000' } },
    bottom: { style: 'thick', color: { argb: 'FF000000' } },
    right: { style: 'thick', color: { argb: 'FF000000' } }
  }

  // Set columns
  worksheet.columns = [
    { width: 6 }, { width: 12 }, { width: 12 }, { width: 10 },
    { width: 10 }, { width: 12 }, { width: 20 }, { width: 25 }
  ]

  // Set row heights
  worksheet.getRow(1).height = 35
  worksheet.getRow(2).height = 25
  for (let i = 3; i <= 50; i++) worksheet.getRow(i).height = 20

  let currentRow = 1

  // ========== HEADER ==========
  const titleRow = worksheet.getRow(currentRow)
  const titleCell = titleRow.getCell(1)
  titleCell.value = `كرت الصنف - ${item.code} - ${item.name}`
  titleCell.font = titleFont
  titleCell.fill = headerFill
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  titleCell.border = thickBorder
  worksheet.mergeCells(currentRow, 1, currentRow, 8)
  currentRow++
  currentRow++

  // ========== ITEM INFO HEADER ==========
  const infoHeaderRow = worksheet.getRow(currentRow)
  const infoHeaderCell = infoHeaderRow.getCell(1)
  infoHeaderCell.value = 'بيانات الصنف'
  infoHeaderCell.font = headerFont
  infoHeaderCell.fill = subheaderFill
  infoHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' }
  infoHeaderCell.border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'medium' } }
  worksheet.mergeCells(currentRow, 1, currentRow, 8)
  currentRow++

  // ========== ITEM DETAILS ==========
  const details = [
    { label: 'الكود:', value: item.code, label2: 'المخزن:', value2: item.warehouses?.name || item.warehouse_id || '—' },
    { label: 'اسم الصنف:', value: item.name, label2: 'الموقع:', value2: item.item_location || '—' },
    { label: 'اللون:', value: item.color || '—', label2: 'المورد:', value2: item.supplier || '—' },
    { label: 'المقاس:', value: item.size || '—', label2: 'الرصيد الحالي:', value2: item.remaining_quantity },
    { label: 'الكراتين:', value: item.cartons_count, label2: 'الكمية المضافة:', value2: item.total_added || 0 },
    { label: 'وحدة لكل كرتون:', value: item.per_carton_count, label2: 'قطع فردية:', value2: item.single_bottles_count }
  ]

  for (const detail of details) {
    const row = worksheet.getRow(currentRow)
    
    const labelCell1 = row.getCell(1)
    labelCell1.value = detail.label
    labelCell1.font = labelFont
    labelCell1.fill = accentFill
    labelCell1.alignment = { horizontal: 'right', vertical: 'middle' }
    labelCell1.border = thinBorder
    
    const valueCell1 = row.getCell(2)
    valueCell1.value = detail.value
    valueCell1.font = valueFont
    valueCell1.alignment = { horizontal: 'center', vertical: 'middle' }
    valueCell1.border = thinBorder
    
    const labelCell2 = row.getCell(3)
    labelCell2.value = detail.label2
    labelCell2.font = labelFont
    labelCell2.fill = accentFill
    labelCell2.alignment = { horizontal: 'right', vertical: 'middle' }
    labelCell2.border = thinBorder
    
    const valueCell2 = row.getCell(4)
    valueCell2.value = detail.value2
    valueCell2.font = valueFont
    valueCell2.alignment = { horizontal: 'center', vertical: 'middle' }
    valueCell2.border = thinBorder
    
    worksheet.mergeCells(currentRow, 5, currentRow, 8)
    currentRow++
  }

  currentRow++

  // ========== IMAGE SECTION ==========
  const imageBuffer = await fetchImageAsBuffer(item.photo_url, supabaseClient)
  if (imageBuffer) {
    try {
      const imageId = worksheet.workbook.addImage({
        buffer: imageBuffer,
        extension: 'png'
      })
      
      const imageStartRow = currentRow
      const imageEndRow = currentRow + 5
      
      worksheet.mergeCells(imageStartRow, 1, imageEndRow, 4)
      
      for (let row = imageStartRow; row <= imageEndRow; row++) {
        for (let col = 1; col <= 4; col++) {
          const cell = worksheet.getCell(row, col)
          cell.border = thinBorder
        }
      }
      
      worksheet.addImage(imageId, {
        tl: { col: 0.5, row: imageStartRow - 1 },
        br: { col: 4.5, row: imageEndRow - 1 },
        editAs: 'oneCell'
      })
      
      const imageLabelRow = worksheet.getRow(imageStartRow)
      const imageLabelCell = imageLabelRow.getCell(1)
      imageLabelCell.value = 'صورة الصنف'
      imageLabelCell.font = { name: 'Arial', size: 11, bold: true }
      imageLabelCell.alignment = { horizontal: 'center', vertical: 'middle' }
      
      currentRow = imageEndRow + 1
    } catch (error) {
      console.error('Error adding image:', error)
      const noImageRow = worksheet.getRow(currentRow)
      noImageRow.getCell(1).value = '⚠️ لا يمكن عرض الصورة'
      worksheet.mergeCells(currentRow, 1, currentRow, 4)
      currentRow++
    }
  } else {
    const noImageRow = worksheet.getRow(currentRow)
    noImageRow.getCell(1).value = '📷 لا توجد صورة متاحة'
    noImageRow.getCell(1).font = { name: 'Arial', size: 11, italic: true, color: { argb: 'FF999999' } }
    worksheet.mergeCells(currentRow, 1, currentRow, 4)
    currentRow++
  }

  currentRow++

  // ========== TRANSACTIONS SECTION ==========
  const transactions = item.transactions || []
  
  // Calculate running balances
  let runningBalance = item.remaining_quantity || 0
  const processedTransactions = [...transactions].reverse().map(tx => {
    const qty = Math.abs(tx.total_delta)
    const isIn = tx.total_delta > 0
    if (isIn) runningBalance -= qty
    else runningBalance += qty
    return {
      date: new Date(tx.created_at).toISOString().split('T')[0],
      voucher: tx.destination_id || '',
      qty_in: isIn ? qty : 0,
      qty_out: !isIn ? qty : 0,
      balance: runningBalance,
      party: tx.destination || '',
      notes: tx.notes || ''
    }
  }).reverse()

  // Transactions header
  const transHeaderRow = worksheet.getRow(currentRow)
  transHeaderRow.getCell(1).value = 'حركات الصنف'
  transHeaderRow.getCell(1).font = headerFont
  transHeaderRow.getCell(1).fill = subheaderFill
  transHeaderRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.mergeCells(currentRow, 1, currentRow, 8)
  currentRow++

  // Table headers
  const headers = ['م', 'التاريخ', 'رقم الإذن', 'وارد', 'منصرف', 'الرصيد', 'الجهة', 'ملاحظات']
  const headerRow = worksheet.getRow(currentRow)
  for (let i = 0; i < headers.length; i++) {
    const cell = headerRow.getCell(i + 1)
    cell.value = headers[i]
    cell.font = tableHeaderFont
    cell.fill = headerFill
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = thinBorder
  }
  currentRow++

  // Transaction data
  for (let i = 0; i < processedTransactions.length; i++) {
    const t = processedTransactions[i]
    const row = worksheet.getRow(currentRow)
    
    if (i % 2 === 0) {
      for (let col = 1; col <= 8; col++) row.getCell(col).fill = evenRowFill
    }
    
    row.getCell(1).value = i + 1
    row.getCell(2).value = t.date
    row.getCell(3).value = t.voucher || '—'
    row.getCell(4).value = t.qty_in || '—'
    row.getCell(5).value = t.qty_out || '—'
    row.getCell(6).value = t.balance
    row.getCell(7).value = t.party || '—'
    row.getCell(8).value = t.notes || '—'
    
    for (let col = 1; col <= 8; col++) {
      const cell = row.getCell(col)
      cell.font = tableFont
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = thinBorder
    }
    currentRow++
  }

  // Fill empty rows
  for (let i = processedTransactions.length; i < 25; i++) {
    const row = worksheet.getRow(currentRow)
    row.getCell(1).value = i + 1
    for (let col = 2; col <= 8; col++) row.getCell(col).value = ''
    for (let col = 1; col <= 8; col++) {
      const cell = row.getCell(col)
      cell.font = tableFont
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = thinBorder
      if ((i) % 2 === 0) cell.fill = evenRowFill
    }
    currentRow++
  }

  currentRow++

  // Summary
  const totalIn = processedTransactions.reduce((s, t) => s + t.qty_in, 0)
  const totalOut = processedTransactions.reduce((s, t) => s + t.qty_out, 0)
  const finalBalance = processedTransactions.length > 0 ? processedTransactions[processedTransactions.length - 1].balance : item.remaining_quantity

  const summaryRow = worksheet.getRow(currentRow)
  summaryRow.getCell(1).value = `إجمالي الحركات: ${processedTransactions.length} | وارد: ${totalIn} | منصرف: ${totalOut} | الرصيد النهائي: ${finalBalance}`
  summaryRow.getCell(1).font = { name: 'Arial', size: 12, bold: true }
  summaryRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }
  summaryRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
  summaryRow.getCell(1).border = thickBorder
  worksheet.mergeCells(currentRow, 1, currentRow, 8)
  currentRow++

  // Footer
  const footerRow = worksheet.getRow(currentRow)
  footerRow.getCell(1).value = `تم الإنشاء في: ${new Date().toLocaleString('ar-EG')}`
  footerRow.getCell(1).font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF666666' } }
  footerRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
  worksheet.mergeCells(currentRow, 1, currentRow, 8)
}

function createSafeSheetName(name: string, code: string): string {
  let baseName = `${name} (${code})`
  baseName = baseName.replace(/[\\/*?:[\]]/g, '')
  if (baseName.length > 31) baseName = baseName.substring(0, 28) + '...'
  return baseName
}