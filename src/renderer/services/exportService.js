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

// Export APBDes to Excel
export async function exportToExcel(data) {
    const { pendapatan, belanja, tahun, version } = data

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'APBDes Version Control'
    workbook.created = new Date()

    // ============= PENDAPATAN SHEET =============
    const pendapatanSheet = workbook.addWorksheet('Pendapatan', {
        properties: { tabColor: { argb: '06b6d4' } }
    })

    // Header styling
    const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '0891b2' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    }

    // Title
    pendapatanSheet.mergeCells('A1:D1')
    pendapatanSheet.getCell('A1').value = `PENDAPATAN DESA - APBDes ${tahun}`
    pendapatanSheet.getCell('A1').font = { bold: true, size: 14, color: { argb: '0891b2' } }
    pendapatanSheet.getCell('A1').alignment = { horizontal: 'center' }

    pendapatanSheet.mergeCells('A2:D2')
    pendapatanSheet.getCell('A2').value = `Versi: ${version} | Diekspor: ${new Date().toLocaleDateString('id-ID')}`
    pendapatanSheet.getCell('A2').font = { size: 10, color: { argb: '666666' } }
    pendapatanSheet.getCell('A2').alignment = { horizontal: 'center' }

    // Headers
    pendapatanSheet.addRow([])
    const pendapatanHeaders = pendapatanSheet.addRow(['No', 'Kode', 'Sumber Dana', 'Jumlah (Rp)'])
    pendapatanHeaders.eachCell((cell) => {
        Object.assign(cell, headerStyle)
    })

    // Column widths
    pendapatanSheet.getColumn(1).width = 5
    pendapatanSheet.getColumn(2).width = 12
    pendapatanSheet.getColumn(3).width = 40
    pendapatanSheet.getColumn(4).width = 20

    // Data rows
    let totalPendapatan = 0
    pendapatan.forEach((item, index) => {
        const row = pendapatanSheet.addRow([
            index + 1,
            item.kode,
            item.sumber,
            item.jumlah
        ])
        row.getCell(4).numFmt = '#,##0'
        totalPendapatan += item.jumlah
    })

    // Total row
    const totalRow = pendapatanSheet.addRow(['', '', 'TOTAL PAGU INDIKATIF', totalPendapatan])
    totalRow.font = { bold: true }
    totalRow.getCell(3).alignment = { horizontal: 'right' }
    totalRow.getCell(4).numFmt = '#,##0'
    totalRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'e0f2fe' } }

    // ============= BELANJA SHEET =============
    const belanjaSheet = workbook.addWorksheet('Belanja', {
        properties: { tabColor: { argb: 'd946ef' } }
    })

    // Title
    belanjaSheet.mergeCells('A1:E1')
    belanjaSheet.getCell('A1').value = `BELANJA DESA - APBDes ${tahun}`
    belanjaSheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'd946ef' } }
    belanjaSheet.getCell('A1').alignment = { horizontal: 'center' }

    // Headers
    belanjaSheet.addRow([])
    const belanjaHeaders = belanjaSheet.addRow(['Kode', 'Uraian', 'Volume', 'Satuan', 'Jumlah (Rp)'])
    belanjaHeaders.eachCell((cell) => {
        Object.assign(cell, {
            ...headerStyle,
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'a855f7' } }
        })
    })

    // Column widths
    belanjaSheet.getColumn(1).width = 15
    belanjaSheet.getColumn(2).width = 45
    belanjaSheet.getColumn(3).width = 10
    belanjaSheet.getColumn(4).width = 12
    belanjaSheet.getColumn(5).width = 20

    // Data - hierarchical
    let totalBelanja = 0
    belanja.forEach(bidang => {
        // Bidang row
        const bidangRow = belanjaSheet.addRow([bidang.kode, bidang.nama, '', '', bidang.total])
        bidangRow.font = { bold: true }
        bidangRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f3e8ff' } }
        bidangRow.getCell(5).numFmt = '#,##0'
        totalBelanja += bidang.total

        // Sub Bidang
        bidang.subBidang?.forEach(sub => {
            const subRow = belanjaSheet.addRow([sub.kode, `  ${sub.nama}`, '', '', sub.total])
            subRow.getCell(5).numFmt = '#,##0'

            // Kegiatan
            sub.kegiatan?.forEach(keg => {
                const kegRow = belanjaSheet.addRow([keg.kode, `    ${keg.nama}`, '', '', keg.total])
                kegRow.font = { italic: true }
                kegRow.getCell(5).numFmt = '#,##0'

                // Items
                keg.items?.forEach(item => {
                    const itemRow = belanjaSheet.addRow([
                        '',
                        `      ${item.nama}`,
                        item.volume,
                        item.satuan,
                        item.total
                    ])
                    itemRow.getCell(5).numFmt = '#,##0'
                })
            })
        })
    })

    // Total row
    belanjaSheet.addRow([])
    const totalBelanjaRow = belanjaSheet.addRow(['', 'TOTAL BELANJA', '', '', totalBelanja])
    totalBelanjaRow.font = { bold: true }
    totalBelanjaRow.getCell(5).numFmt = '#,##0'
    totalBelanjaRow.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fae8ff' } }

    // ============= RINGKASAN SHEET =============
    const ringkasanSheet = workbook.addWorksheet('Ringkasan', {
        properties: { tabColor: { argb: '22c55e' } }
    })

    ringkasanSheet.mergeCells('A1:C1')
    ringkasanSheet.getCell('A1').value = `RINGKASAN APBDes ${tahun}`
    ringkasanSheet.getCell('A1').font = { bold: true, size: 16 }
    ringkasanSheet.getCell('A1').alignment = { horizontal: 'center' }

    ringkasanSheet.addRow([])
    ringkasanSheet.addRow(['Uraian', '', 'Jumlah (Rp)'])
    ringkasanSheet.addRow(['Total Pendapatan', '', totalPendapatan])
    ringkasanSheet.addRow(['Total Belanja', '', totalBelanja])
    ringkasanSheet.addRow(['Sisa Pagu', '', totalPendapatan - totalBelanja])

    ringkasanSheet.getColumn(1).width = 25
    ringkasanSheet.getColumn(3).width = 20

    // Format numbers
    for (let i = 4; i <= 6; i++) {
        ringkasanSheet.getRow(i).getCell(3).numFmt = '#,##0'
    }

    // Sisa row styling
    const sisaRow = ringkasanSheet.getRow(6)
    sisaRow.font = { bold: true }
    if (totalPendapatan - totalBelanja >= 0) {
        sisaRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'dcfce7' } }
    } else {
        sisaRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fee2e2' } }
    }

    // Generate buffer and download
    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
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
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        h1 { text-align: center; color: #0891b2; margin-bottom: 5px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 20px; }
        h2 { color: #374151; margin: 20px 0 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #0891b2; color: white; padding: 10px; text-align: left; }
        td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
        .amount { text-align: right; font-family: monospace; }
        .total-row { background: #f0f9ff; font-weight: bold; }
        .bidang { background: #f3e8ff; font-weight: bold; }
        .sub { padding-left: 20px; }
        .kegiatan { padding-left: 40px; font-style: italic; }
        .item { padding-left: 60px; color: #666; }
        .ringkasan { background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px; }
        .ringkasan h3 { margin-bottom: 10px; }
        .ringkasan-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #e5e7eb; }
        .sisa { font-size: 1.2em; font-weight: bold; color: ${sisaPagu >= 0 ? '#22c55e' : '#ef4444'}; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>ANGGARAN PENDAPATAN DAN BELANJA DESA</h1>
      <p class="subtitle">Tahun Anggaran ${tahun} | Versi ${version}</p>
      
      <h2>A. PENDAPATAN</h2>
      <table>
        <thead>
          <tr><th style="width:50px">No</th><th style="width:80px">Kode</th><th>Sumber Dana</th><th style="width:150px" class="amount">Jumlah (Rp)</th></tr>
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
            <td colspan="3" style="text-align:right">TOTAL PAGU INDIKATIF</td>
            <td class="amount">${formatCurrency(totalPendapatan)}</td>
          </tr>
        </tbody>
      </table>
      
      <h2>B. BELANJA</h2>
      <table>
        <thead>
          <tr><th style="width:100px">Kode</th><th>Uraian</th><th style="width:150px" class="amount">Jumlah (Rp)</th></tr>
        </thead>
        <tbody>
          ${belanja.map(bidang => `
            <tr class="bidang">
              <td>${bidang.kode}</td>
              <td>${bidang.nama}</td>
              <td class="amount">${formatCurrency(bidang.total)}</td>
            </tr>
            ${(bidang.subBidang || []).map(sub => `
              <tr>
                <td>${sub.kode}</td>
                <td class="sub">${sub.nama}</td>
                <td class="amount">${formatCurrency(sub.total)}</td>
              </tr>
              ${(sub.kegiatan || []).map(keg => `
                <tr>
                  <td>${keg.kode}</td>
                  <td class="kegiatan">${keg.nama}</td>
                  <td class="amount">${formatCurrency(keg.total)}</td>
                </tr>
                ${(keg.items || []).map(item => `
                  <tr>
                    <td></td>
                    <td class="item">${item.nama} (${item.volume} ${item.satuan} @ ${formatCurrency(item.harga)})</td>
                    <td class="amount">${formatCurrency(item.total)}</td>
                  </tr>
                `).join('')}
              `).join('')}
            `).join('')}
          `).join('')}
          <tr class="total-row">
            <td colspan="2" style="text-align:right">TOTAL BELANJA</td>
            <td class="amount">${formatCurrency(totalBelanja)}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="ringkasan">
        <h3>RINGKASAN</h3>
        <div class="ringkasan-row">
          <span>Total Pendapatan</span>
          <span>${formatCurrency(totalPendapatan)}</span>
        </div>
        <div class="ringkasan-row">
          <span>Total Belanja</span>
          <span>${formatCurrency(totalBelanja)}</span>
        </div>
        <div class="ringkasan-row sisa">
          <span>Sisa Pagu</span>
          <span>${formatCurrency(sisaPagu)}</span>
        </div>
      </div>
      
      <br>
      <button onclick="window.print()" style="padding:10px 20px;background:#0891b2;color:white;border:none;border-radius:5px;cursor:pointer;">
        🖨️ Cetak / Save as PDF
      </button>
    </body>
    </html>
  `

    printWindow.document.write(html)
    printWindow.document.close()
}
