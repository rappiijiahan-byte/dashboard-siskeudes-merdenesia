// Export Service - handles Excel and PDF generation
import ExcelJS from 'exceljs'

// Format currency for Excel
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Export APBDes to Excel with Enhanced Styling and Autofit
export async function exportToExcel(data) {
  const { pendapatan, belanja, tahun, version } = data

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SISKEUDES M-V'
  workbook.created = new Date()

  // Helper: Applied Borders
  const thinBorder = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }

  // ============= PENDAPATAN SHEET =============
  const pendapatanSheet = workbook.addWorksheet('Pendapatan', {
    properties: { tabColor: { argb: '06b6d4' } }
  })

  // Header Styling
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFF' }, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '0891b2' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: thinBorder
  }

  // Professional Title Section
  pendapatanSheet.mergeCells('A1:D1')
  const titleCell = pendapatanSheet.getCell('A1')
  titleCell.value = `ANGGARAN PENDAPATAN DESA - TAHUN ${tahun}`
  titleCell.font = { bold: true, size: 16, color: { argb: '0891b2' }, name: 'Arial' }
  titleCell.alignment = { horizontal: 'center' }

  pendapatanSheet.mergeCells('A2:D2')
  const subTitleCell = pendapatanSheet.getCell('A2')
  subTitleCell.value = `Status Dokumen: Versi ${version} | Dicetak: ${new Date().toLocaleString('id-ID')}`
  subTitleCell.font = { size: 10, italic: true, color: { argb: '666666' } }
  subTitleCell.alignment = { horizontal: 'center' }

  pendapatanSheet.addRow([]) // Blank row for spacing

  // Headers
  const pendapatanHeaders = pendapatanSheet.addRow(['NO', 'KODE', 'SUMBER PENDAPATAN', 'JUMLAH (RP)'])
  pendapatanHeaders.height = 25
  pendapatanHeaders.eachCell((cell) => {
    Object.assign(cell, headerStyle)
  })

  // Data Rows
  let totalPendapatan = 0
  pendapatan.forEach((item, index) => {
    const row = pendapatanSheet.addRow([
      index + 1,
      item.kode,
      item.sumber,
      item.jumlah
    ])
    row.getCell(4).numFmt = '#,##0'
    row.eachCell(cell => {
      cell.border = thinBorder
      cell.font = { name: 'Arial', size: 10 }
    })
    if (index % 2 === 1) {
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f8fafc' } }
      })
    }
    totalPendapatan += item.jumlah
  })

  // Total Row
  const totalRow = pendapatanSheet.addRow(['', '', 'TOTAL PAGU PENDAPATAN', totalPendapatan])
  totalRow.font = { bold: true, size: 12, name: 'Arial' }
  totalRow.height = 25
  totalRow.getCell(3).alignment = { horizontal: 'right' }
  totalRow.getCell(4).numFmt = '#,##0'
  totalRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'e0f2fe' } }
  totalRow.eachCell(cell => { if (cell.value) cell.border = thinBorder })

  // ============= BELANJA SHEET =============
  const belanjaSheet = workbook.addWorksheet('Belanja', {
    properties: { tabColor: { argb: 'd946ef' } },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 3 }]
  })

  const printDate = new Date().toLocaleString('id-ID')

  // Title
  belanjaSheet.mergeCells('A1:G1')
  const bTitle = belanjaSheet.getCell('A1')
  bTitle.value = `ANGGARAN BELANJA DESA - TAHUN ${tahun}`
  bTitle.font = { bold: true, size: 16, color: { argb: '701a75' }, name: 'Arial' }
  bTitle.alignment = { horizontal: 'center' }

  belanjaSheet.mergeCells('A2:G2')
  const bSubtitle = belanjaSheet.getCell('A2')
  bSubtitle.value = `Dicetak pada: ${printDate}`
  bSubtitle.font = { italic: true, size: 9, color: { argb: '475569' } }
  bSubtitle.alignment = { horizontal: 'center' }

  // Headers
  const bHeaders = belanjaSheet.addRow(['KODE', 'URAIAN', 'ANGGARAN', 'TOTAL', 'VOL', 'SAT', 'HARGA'])
  bHeaders.height = 25
  bHeaders.eachCell((cell) => {
    Object.assign(cell, {
      ...headerStyle,
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '701a75' } }
    })
  })

  // Recommendation Styles
  const hrStyle = (color) => ({
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: color } },
    border: thinBorder,
    font: { name: 'Arial', size: 10 }
  })

  const styles = {
    bidang: hrStyle('f3e8ff'),
    subBidang: hrStyle('fae8ff'),
    kegiatan: hrStyle('fdf4ff'),
    paket: { font: { bold: true, color: { argb: '701a75' }, size: 10, name: 'Arial' }, border: thinBorder },
    rab: { font: { bold: true, color: { argb: '0891b2' }, size: 9, name: 'Arial' }, border: thinBorder }
  }

  let totalBelanja = 0
  belanja.forEach(bidang => {
    const bRow = belanjaSheet.addRow([bidang.kode, bidang.nama, '', bidang.total, '', '', ''])
    bRow.eachCell(cell => Object.assign(cell, styles.bidang))
    bRow.font = { bold: true, name: 'Arial' }
    bRow.getCell(4).numFmt = '#,##0'
    totalBelanja += (bidang.total || 0)

    bidang.subBidang?.forEach(sub => {
      const sRow = belanjaSheet.addRow([sub.kode, `  ${sub.nama}`, '', sub.total, '', '', ''])
      sRow.eachCell(cell => Object.assign(cell, styles.subBidang))
      sRow.getCell(4).numFmt = '#,##0'

      sub.kegiatan?.forEach(keg => {
        const kRow = belanjaSheet.addRow([keg.kode, `    ${keg.nama}`, '', keg.total, '', '', ''])
        kRow.eachCell(cell => Object.assign(cell, styles.kegiatan))
        kRow.getCell(4).numFmt = '#,##0'

        keg.paket?.forEach(pkt => {
          const pRow = belanjaSheet.addRow(['', `      ${pkt.namaSubRincian}`, pkt.anggaran, pkt.jumlah, '', '', ''])
          pRow.eachCell(cell => Object.assign(cell, styles.paket))
          pRow.getCell(4).numFmt = '#,##0'

          pkt.rab?.forEach(rab => {
            const rRow = belanjaSheet.addRow([rab.kode, `        ${rab.namaRekening}`, rab.anggaran, rab.jumlah, '', '', ''])
            rRow.eachCell(cell => Object.assign(cell, styles.rab))
            rRow.getCell(4).numFmt = '#,##0'

            rab.rabRinci?.forEach((item, idx) => {
              const iRow = belanjaSheet.addRow([
                '',
                `          ${item.uraian}`,
                item.anggaran,
                item.jumlah,
                item.volume,
                item.satuan,
                item.hargaSatuan
              ])
              iRow.eachCell(cell => {
                cell.border = thinBorder
                cell.font = { name: 'Arial', size: 9 }
              })
              if (idx % 2 === 1) {
                iRow.eachCell(cell => {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f1f5f9' } }
                })
              }
              iRow.getCell(4).numFmt = '#,##0'
              iRow.getCell(7).numFmt = '#,##0'
            })
          })
        })
      })
    })
  })

  // Final Total Belanja
  const bTotalRow = belanjaSheet.addRow(['', 'TOTAL BELANJA', '', totalBelanja, '', '', ''])
  bTotalRow.font = { bold: true, size: 12, name: 'Arial' }; bTotalRow.height = 30
  bTotalRow.getCell(4).numFmt = '#,##0'
  bTotalRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fae8ff' } }
  bTotalRow.eachCell(cell => { if (cell.value) cell.border = thinBorder })

  // ============= RINGKASAN SHEET =============
  const ringkasanSheet = workbook.addWorksheet('Ringkasan', {
    properties: { tabColor: { argb: '22c55e' } }
  })

  ringkasanSheet.mergeCells('A1:C1')
  const rTitle = ringkasanSheet.getCell('A1')
  rTitle.value = `RINGKASAN APBDes - TAHUN ${tahun}`
  rTitle.font = { bold: true, size: 16, name: 'Arial' }
  rTitle.alignment = { horizontal: 'center' }

  ringkasanSheet.addRow([])

  const rHeader = ringkasanSheet.addRow(['URAIAN', '', 'JUMLAH (RP)'])
  rHeader.eachCell(cell => Object.assign(cell, headerStyle))

  const ringkasanData = [
    ['Total Pendapatan', '', totalPendapatan],
    ['Total Belanja', '', totalBelanja],
    ['Sisa Pagu (Surplus/Defisit)', '', totalPendapatan - totalBelanja]
  ]

  ringkasanData.forEach((row, idx) => {
    const rRow = ringkasanSheet.addRow(row)
    rRow.height = 25
    rRow.getCell(3).numFmt = '#,##0'
    rRow.eachCell(cell => {
      cell.border = thinBorder
      cell.font = { name: 'Arial', size: 11, bold: idx === 2 }
    })
    if (idx === 2) {
      const color = (totalPendapatan - totalBelanja) >= 0 ? 'dcfce7' : 'fee2e2'
      rRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } }
    }
  })

  // ============= AUTOFIT ALL SHEETS =============
  workbook.worksheets.forEach(sheet => {
    sheet.columns.forEach(column => {
      let maxColumnLength = 0
      column.eachCell({ includeEmpty: true }, (cell) => {
        const value = cell.value ? cell.value.toString() : ''
        const cellLength = value.length
        if (cellLength > maxColumnLength) maxColumnLength = cellLength
      })
      column.width = Math.min(Math.max(10, maxColumnLength + 2), 50)
    })
  })

  return await workbook.xlsx.writeBuffer()
}

// Export specific Row/RAB to PDF
export function exportRowToPDF(ctx, item, tahun) {
  const printWindow = window.open('', '_blank')
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Export PDF - ${item.uraian || item.namaRekening}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; line-height: 1.5; }
        .header { border-bottom: 3px solid #0891b2; padding-bottom: 10px; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: bold; color: #0891b2; text-transform: uppercase; }
        .meta { color: #6b7280; font-size: 14px; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        th { background: #0891b2; color: white; padding: 12px; text-align: left; font-size: 14px; text-transform: uppercase; }
        td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        .amount { text-align: right; font-family: 'Courier New', monospace; font-weight: bold; }
        .footer { margin-top: 50px; display: flex; justify-content: flex-end; }
        .signature { text-align: center; width: 200px; }
        .signature div { margin-top: 60px; border-top: 1px solid #000; padding-top: 5px; font-weight: bold; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Rincian Anggaran Belanja (RAB)</div>
        <div class="meta">Tahun Anggaran ${tahun} | Kode Rekening: ${ctx.rabCode || 'N/A'}</div>
      </div>
      
      <p><strong>Uraian Pekerjaan:</strong> ${item.uraian}</p>
      
      <table>
        <thead>
          <tr>
            <th>Kode</th>
            <th>Uraian</th>
            <th style="text-align:center">Volume</th>
            <th style="text-align:right">Harga Satuan</th>
            <th style="text-align:right">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${ctx.rabCode || '-'}</td>
            <td>${item.uraian}</td>
            <td style="text-align:center">${item.volume} ${item.satuan}</td>
            <td class="amount">${formatCurrency(item.hargaSatuan)}</td>
            <td class="amount" style="color:#0891b2">${formatCurrency(item.jumlah)}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <div class="signature">
            <p>Bendahara Desa</p>
            <div>( _________________ )</div>
        </div>
      </div>

      <div class="no-print" style="margin-top:40px; text-align:center;">
        <button onclick="window.print()" style="padding:12px 24px; background:#0891b2; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">
          Cetak Dokumen PDF
        </button>
      </div>
    </body>
    </html>`
  printWindow.document.write(html)
  printWindow.document.close()
}

// Download file helper
export function downloadFile(buffer, filename, mimeType) {
  const blob = new Blob([buffer], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export to PDF using print
export function exportToPDF(data) {
  const { pendapatan, belanja, tahun, version } = data

  // Calculate totals
  const totalPendapatan = pendapatan.reduce((acc, item) => acc + item.jumlah, 0)
  const totalBelanja = belanja.reduce((acc, b) => acc + b.total, 0)
  const sisaPagu = totalPendapatan - totalBelanja

  // Create print window with styled content
  const printWindow = window.open('', '_blank')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>APBDes ${tahun} - v${version}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1f2937; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0891b2; padding-bottom: 10px; }
        h1 { font-size: 20px; color: #0891b2; margin-bottom: 5px; text-transform: uppercase; }
        .subtitle { color: #6b7280; font-size: 14px; }
        h2 { font-size: 16px; color: #111827; margin: 25px 0 10px; background: #f3f4f6; padding: 8px; border-left: 4px solid #0891b2; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
        th { background: #0891b2; color: white; padding: 8px; text-align: left; text-transform: uppercase; }
        td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        .amount { text-align: right; font-family: monospace; font-weight: bold; }
        .total-row { background: #f0f9ff; font-weight: bold; font-size: 12px; }
        .lvl-1 { background: #f3e8ff; font-weight: bold; }
        .lvl-2 { background: #fae8ff; }
        .lvl-3 { font-weight: bold; font-style: italic; }
        .lvl-4 { color: #701a75; font-weight: bold; }
        .lvl-5 { color: #0891b2; font-weight: bold; padding-left: 20px; }
        .lvl-6 { color: #4b5563; padding-left: 30px; }
        .ringkasan { margin-top: 40px; padding: 20px; border: 2px solid #e5e7eb; border-radius: 10px; }
        .ringkasan h3 { margin-bottom: 15px; color: #0891b2; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        .ringkasan-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e5e7eb; }
        .sisa { font-size: 1.25em; font-weight: bold; color: ${sisaPagu >= 0 ? '#16a34a' : '#dc2626'}; border-bottom: none; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Anggaran Pendapatan dan Belanja Desa</h1>
        <p class="subtitle">Tahun Anggaran ${tahun} | Versi Dokumen: ${version}</p>
      </div>
      
      <h2>A. PENDAPATAN</h2>
      <table>
        <thead>
          <tr>
            <th style="width:40px">No</th>
            <th style="width:100px">Kode</th>
            <th>Sumber Dana</th>
            <th style="width:150px" class="amount">Jumlah (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${pendapatan.map((item, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${item.kode}</td>
              <td>${item.sumber}</td>
              <td class="amount">${formatCurrency(item.jumlah)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="3" style="text-align:right">TOTAL PENDAPATAN</td>
            <td class="amount">${formatCurrency(totalPendapatan)}</td>
          </tr>
        </tbody>
      </table>
      
      <h2>B. BELANJA</h2>
      <table>
        <thead>
          <tr>
            <th style="width:100px">Kode</th>
            <th>Uraian</th>
            <th style="width:80px">Vol/Sat</th>
            <th style="width:120px" class="amount">Harga (Rp)</th>
            <th style="width:130px" class="amount">Total (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${belanja.map(bidang => `
            <tr class="lvl-1">
              <td>${bidang.kode}</td>
              <td>${bidang.nama}</td>
              <td></td><td></td>
              <td class="amount">${formatCurrency(bidang.total)}</td>
            </tr>
            ${(bidang.subBidang || []).map(sub => `
              <tr class="lvl-2">
                <td>${sub.kode}</td>
                <td style="padding-left:15px">${sub.nama}</td>
                <td></td><td></td>
                <td class="amount">${formatCurrency(sub.total)}</td>
              </tr>
              ${(sub.kegiatan || []).map(keg => `
                <tr class="lvl-3">
                  <td>${keg.kode}</td>
                  <td style="padding-left:25px">${keg.nama}</td>
                  <td></td><td></td>
                  <td class="amount">${formatCurrency(keg.total)}</td>
                </tr>
                ${(keg.paket || []).map(pkt => `
                  <tr class="lvl-4">
                    <td></td>
                    <td style="padding-left:35px">Paket: ${pkt.namaSubRincian}</td>
                    <td></td><td></td>
                    <td class="amount">${formatCurrency(pkt.jumlah)}</td>
                  </tr>
                  ${(pkt.rab || []).map(rab => `
                    <tr class="lvl-5">
                      <td>${rab.kode}</td>
                      <td>${rab.namaRekening}</td>
                      <td></td><td></td>
                      <td class="amount">${formatCurrency(rab.jumlah)}</td>
                    </tr>
                    ${(rab.rabRinci || []).map(item => `
                      <tr class="lvl-6">
                        <td></td>
                        <td>${item.uraian}</td>
                        <td style="text-align:center">${item.volume} ${item.satuan}</td>
                        <td class="amount">${formatCurrency(item.hargaSatuan)}</td>
                        <td class="amount">${formatCurrency(item.jumlah)}</td>
                      </tr>
                    `).join('')}
                  `).join('')}
                `).join('')}
              `).join('')}
            `).join('')}
          `).join('')}
          <tr class="total-row">
            <td colspan="4" style="text-align:right">TOTAL BELANJA</td>
            <td class="amount">${formatCurrency(totalBelanja)}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="ringkasan">
        <h3>RINGKASAN ANGGARAN</h3>
        <div class="ringkasan-row">
          <span>Total Pendapatan</span>
          <span class="amount">${formatCurrency(totalPendapatan)}</span>
        </div>
        <div class="ringkasan-row">
          <span>Total Belanja</span>
          <span class="amount">${formatCurrency(totalBelanja)}</span>
        </div>
        <div class="ringkasan-row sisa">
          <span>Sisa Pagu (Surplus/Defisit)</span>
          <span class="amount">${formatCurrency(sisaPagu)}</span>
        </div>
      </div>
      
      <div class="no-print" style="margin-top:40px; text-align:center;">
        <button onclick="window.print()" style="padding:12px 24px; background:#0891b2; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          🖨️ Cetak Dokumen Lengkap (PDF)
        </button>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}
