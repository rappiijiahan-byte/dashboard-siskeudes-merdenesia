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

// Export functions removed as per request
