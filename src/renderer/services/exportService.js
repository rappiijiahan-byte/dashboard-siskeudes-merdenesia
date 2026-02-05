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
  const { pendapatan, belanja, pembiayaan1, pembiayaan2, tahun, version } = data

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

  // Header Styling
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFF' }, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '0891b2' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: thinBorder
  }

  // ============= PENDAPATAN SHEET =============
  const pendapatanSheet = workbook.addWorksheet('Pendapatan', {
    properties: { tabColor: { argb: '06b6d4' } }
  })

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
    (pendapatan || []).forEach((cat, index) => {
      const catTotal = (cat.items || []).reduce((acc, it) => acc + (parseFloat(it.jumlah) || 0), 0)
      const row = pendapatanSheet.addRow([
        index + 1,
        cat.kode,
        cat.sumber,
        catTotal
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
      totalPendapatan += catTotal
    })

  // Total Row
  const totalRow = pendapatanSheet.addRow(['', '', 'TOTAL PAGU PENDAPATAN', totalPendapatan])
  totalRow.font = { bold: true, size: 12, name: 'Arial' }
  totalRow.height = 25
  totalRow.getCell(3).alignment = { horizontal: 'right' }
  totalRow.getCell(4).numFmt = '#,##0'
  totalRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'e0f2fe' } }
  totalRow.eachCell(cell => { if (cell.value) cell.border = thinBorder })

  // ============= PEMBIAYAAN 1 SHEET =============
  const p1Sheet = workbook.addWorksheet('Pembiayaan 1', {
    properties: { tabColor: { argb: '22c55e' } }
  })

  p1Sheet.mergeCells('A1:D1')
  const p1Title = p1Sheet.getCell('A1')
  p1Title.value = `PENERIMAAN PEMBIAYAAN - TAHUN ${tahun}`
  p1Title.font = { bold: true, size: 16, color: { argb: '16a34a' }, name: 'Arial' }
  p1Title.alignment = { horizontal: 'center' }

  p1Sheet.addRow([])
  const p1Headers = p1Sheet.addRow(['NO', 'KODE', 'URAIAN', 'JUMLAH (RP)'])
  p1Headers.eachCell(cell => Object.assign(cell, { ...headerStyle, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '16a34a' } } }))

  let totalP1 = 0
  pembiayaan1?.forEach((kat, kIdx) => {
    (kat.subKategori || []).forEach((sub, sIdx) => {
      const subTotal = (sub.items || []).reduce((acc, it) => acc + (it.jumlah || 0), 0)
      const row = p1Sheet.addRow(['', sub.kode, sub.nama, subTotal])
      row.getCell(4).numFmt = '#,##0'
      row.eachCell(cell => { cell.border = thinBorder; cell.font = { name: 'Arial', size: 10 } })
      totalP1 += subTotal
    })
  })
  const p1TotalRow = p1Sheet.addRow(['', '', 'TOTAL PEMBIAYAAN 1', totalP1])
  p1TotalRow.font = { bold: true }; p1TotalRow.getCell(4).numFmt = '#,##0'

  // ============= PEMBIAYAAN 2 SHEET =============
  const p2Sheet = workbook.addWorksheet('Pembiayaan 2', {
    properties: { tabColor: { argb: '8b5cf6' } }
  })

  p2Sheet.mergeCells('A1:D1')
  const p2Title = p2Sheet.getCell('A1')
  p2Title.value = `PENGELUARAN PEMBIAYAAN - TAHUN ${tahun}`
  p2Title.font = { bold: true, size: 16, color: { argb: '7c3aed' }, name: 'Arial' }
  p2Title.alignment = { horizontal: 'center' }

  p2Sheet.addRow([])
  const p2Headers = p2Sheet.addRow(['NO', 'KODE', 'URAIAN', 'JUMLAH (RP)'])
  p2Headers.eachCell(cell => Object.assign(cell, { ...headerStyle, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '7c3aed' } } }))

  let totalP2 = 0
  pembiayaan2?.forEach((kat, kIdx) => {
    (kat.subKategori || []).forEach((sub, sIdx) => {
      const subTotal = (sub.items || []).reduce((acc, it) => acc + (it.jumlah || 0), 0)
      const row = p2Sheet.addRow(['', sub.kode, sub.nama, subTotal])
      row.getCell(4).numFmt = '#,##0'
      row.eachCell(cell => { cell.border = thinBorder; cell.font = { name: 'Arial', size: 10 } })
      totalP2 += subTotal
    })
  })
  const p2TotalRow = p2Sheet.addRow(['', '', 'TOTAL PEMBIAYAAN 2', totalP2])
  p2TotalRow.font = { bold: true }; p2TotalRow.getCell(4).numFmt = '#,##0'

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

  // Styles
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
    (belanja || []).forEach(bidang => {
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

  const paguIndikatif = totalPendapatan + totalP1 + totalP2

  const ringkasanData = [
    ['Total Pendapatan (4.)', '', totalPendapatan],
    ['Total Pembiayaan 1 (6.1)', '', totalP1],
    ['Total Pembiayaan 2 (6.2)', '', totalP2],
    ['PAGU INDIKATIF (P1 + P2 + PEND)', '', paguIndikatif],
    ['Total Belanja (5.)', '', totalBelanja],
    ['Sisa Pagu (Surplus/Defisit)', '', paguIndikatif - totalBelanja]
  ]

  ringkasanData.forEach((row, idx) => {
    const rRow = ringkasanSheet.addRow(row)
    rRow.height = 25
    rRow.getCell(3).numFmt = '#,##0'
    rRow.eachCell(cell => {
      cell.border = thinBorder
      cell.font = { name: 'Arial', size: 11, bold: idx >= 3 }
    })
    if (idx === 5) {
      const color = (paguIndikatif - totalBelanja) >= 0 ? 'dcfce7' : 'fee2e2'
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


// Helper: Trigger Download
export function downloadFile(buffer, filename, type) {
  const blob = new Blob([buffer], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// ============= INDIVIDUAL PAGE EXPORTS =============

// Common styles
const getCommonStyles = () => {
  const thinBorder = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }
  return { thinBorder }
}

// Export Pendapatan Page
export async function exportPendapatanPage(data, tahun) {
  const { pendapatan } = data
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SISKEUDES M-V'
  const { thinBorder } = getCommonStyles()

  const sheet = workbook.addWorksheet('Pendapatan', {
    properties: { tabColor: { argb: '06b6d4' } }
  })

  // Title
  sheet.mergeCells('A1:D1')
  const title = sheet.getCell('A1')
  title.value = `PENDAPATAN DESA - TAHUN ${tahun}`
  title.font = { bold: true, size: 18, color: { argb: '0891b2' }, name: 'Arial' }
  title.alignment = { horizontal: 'center' }
  sheet.getRow(1).height = 30

  sheet.mergeCells('A2:D2')
  sheet.getCell('A2').value = `Dicetak: ${new Date().toLocaleString('id-ID')}`
  sheet.getCell('A2').font = { italic: true, size: 10, color: { argb: '64748b' } }
  sheet.getCell('A2').alignment = { horizontal: 'center' }

  sheet.addRow([])

  // Header
  const headerRow = sheet.addRow(['NO', 'KODE', 'SUMBER PENDAPATAN', 'JUMLAH (Rp)'])
  headerRow.height = 25
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0891b2' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = thinBorder
  })

  // Data
  let total = 0
  let rowNum = 0
    (pendapatan || []).forEach((cat, catIdx) => {
      // Category row
      const catTotal = (cat.items || []).reduce((acc, it) => acc + (parseFloat(it.jumlah) || 0), 0)
      rowNum++
      const catRow = sheet.addRow([rowNum, cat.kode, cat.sumber, catTotal])
      catRow.eachCell(cell => {
        cell.border = thinBorder
        cell.font = { bold: true, size: 11, name: 'Arial' }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'e0f2fe' } }
      })
      catRow.getCell(4).numFmt = '#,##0'
      total += catTotal

      // Items
      cat.items?.forEach((item, idx) => {
        const row = sheet.addRow(['', item.kode || '', item.sumber || item.uraian, item.jumlah || 0])
        row.eachCell(cell => {
          cell.border = thinBorder
          cell.font = { size: 10, name: 'Arial' }
          if (idx % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f8fafc' } }
        })
        row.getCell(4).numFmt = '#,##0'
      })
    })

  // Total
  const totalRow = sheet.addRow(['', '', 'TOTAL PENDAPATAN', total])
  totalRow.height = 28
  totalRow.eachCell(cell => {
    cell.border = thinBorder
    cell.font = { bold: true, size: 12, name: 'Arial' }
  })
  totalRow.getCell(3).alignment = { horizontal: 'right' }
  totalRow.getCell(4).numFmt = '#,##0'
  totalRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '22d3ee' } }
  totalRow.getCell(4).font = { bold: true, size: 12, color: { argb: 'FFFFFF' } }

  // Auto-fit
  sheet.columns = [
    { width: 6 },
    { width: 18 },
    { width: 50 },
    { width: 20 }
  ]

  return await workbook.xlsx.writeBuffer()
}

// Export Pembiayaan 1 Page
export async function exportPembiayaan1Page(data, tahun) {
  const { kategoriPembiayaan1 } = data
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SISKEUDES M-V'
  const { thinBorder } = getCommonStyles()

  const sheet = workbook.addWorksheet('Pembiayaan 1', {
    properties: { tabColor: { argb: '22c55e' } }
  })

  // Title
  sheet.mergeCells('A1:D1')
  const title = sheet.getCell('A1')
  title.value = `PEMBIAYAAN 1 (PENERIMAAN) - TAHUN ${tahun}`
  title.font = { bold: true, size: 18, color: { argb: '16a34a' }, name: 'Arial' }
  title.alignment = { horizontal: 'center' }
  sheet.getRow(1).height = 30

  sheet.mergeCells('A2:D2')
  sheet.getCell('A2').value = `Dicetak: ${new Date().toLocaleString('id-ID')}`
  sheet.getCell('A2').font = { italic: true, size: 10, color: { argb: '64748b' } }
  sheet.getCell('A2').alignment = { horizontal: 'center' }

  sheet.addRow([])

  // Header
  const headerRow = sheet.addRow(['NO', 'KODE', 'URAIAN', 'JUMLAH (Rp)'])
  headerRow.height = 25
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '16a34a' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = thinBorder
  })

  // Data
  let total = 0
  let rowNum = 0
  kategoriPembiayaan1?.forEach(kat => {
    // Kategori row
    const katRow = sheet.addRow(['', kat.kode, kat.nama, ''])
    katRow.eachCell(cell => {
      cell.border = thinBorder
      cell.font = { bold: true, size: 11 }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'dcfce7' } }
    })

      (kat.subKategori || []).forEach(sub => {
        // Sub kategori
        const subTotal = (sub.items || []).reduce((acc, it) => acc + (it.jumlah || 0), 0)
        const subRow = sheet.addRow(['', sub.kode, `  ${sub.nama}`, subTotal])
        subRow.eachCell(cell => {
          cell.border = thinBorder
          cell.font = { size: 10 }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f0fdf4' } }
        })
        subRow.getCell(4).numFmt = '#,##0'

        // Items
        sub.items?.forEach((item, idx) => {
          rowNum++
          const row = sheet.addRow([rowNum, item.kode || '', `    ${item.uraian}`, item.jumlah || 0])
          row.eachCell(cell => {
            cell.border = thinBorder
            cell.font = { size: 10 }
            if (idx % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f8fafc' } }
          })
          row.getCell(4).numFmt = '#,##0'
          total += (item.jumlah || 0)
        })
      })
  })

  // Total
  const totalRow = sheet.addRow(['', '', 'TOTAL PEMBIAYAAN 1', total])
  totalRow.height = 28
  totalRow.eachCell(cell => {
    cell.border = thinBorder
    cell.font = { bold: true, size: 12 }
  })
  totalRow.getCell(3).alignment = { horizontal: 'right' }
  totalRow.getCell(4).numFmt = '#,##0'
  totalRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '22c55e' } }
  totalRow.getCell(4).font = { bold: true, size: 12, color: { argb: 'FFFFFF' } }

  sheet.columns = [{ width: 6 }, { width: 18 }, { width: 50 }, { width: 20 }]
  return await workbook.xlsx.writeBuffer()
}

// Export Pembiayaan 2 Page
export async function exportPembiayaan2Page(data, tahun) {
  const { kategoriPembiayaan2 } = data
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SISKEUDES M-V'
  const { thinBorder } = getCommonStyles()

  const sheet = workbook.addWorksheet('Pembiayaan 2', {
    properties: { tabColor: { argb: '8b5cf6' } }
  })

  // Title
  sheet.mergeCells('A1:D1')
  const title = sheet.getCell('A1')
  title.value = `PEMBIAYAAN 2 (PENGELUARAN) - TAHUN ${tahun}`
  title.font = { bold: true, size: 18, color: { argb: '7c3aed' }, name: 'Arial' }
  title.alignment = { horizontal: 'center' }
  sheet.getRow(1).height = 30

  sheet.mergeCells('A2:D2')
  sheet.getCell('A2').value = `Dicetak: ${new Date().toLocaleString('id-ID')}`
  sheet.getCell('A2').font = { italic: true, size: 10, color: { argb: '64748b' } }
  sheet.getCell('A2').alignment = { horizontal: 'center' }

  sheet.addRow([])

  // Header
  const headerRow = sheet.addRow(['NO', 'KODE', 'URAIAN', 'JUMLAH (Rp)'])
  headerRow.height = 25
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7c3aed' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = thinBorder
  })

  // Data
  let total = 0
  let rowNum = 0
  kategoriPembiayaan2?.forEach(kat => {
    const katRow = sheet.addRow(['', kat.kode, kat.nama, ''])
    katRow.eachCell(cell => {
      cell.border = thinBorder
      cell.font = { bold: true, size: 11 }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ede9fe' } }
    })

      (kat.subKategori || []).forEach(sub => {
        const subTotal = (sub.items || []).reduce((acc, it) => acc + (it.jumlah || 0), 0)
        const subRow = sheet.addRow(['', sub.kode, `  ${sub.nama}`, subTotal])
        subRow.eachCell(cell => {
          cell.border = thinBorder
          cell.font = { size: 10 }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f5f3ff' } }
        })
        subRow.getCell(4).numFmt = '#,##0'

        sub.items?.forEach((item, idx) => {
          rowNum++
          const row = sheet.addRow([rowNum, item.kode || '', `    ${item.uraian}`, item.jumlah || 0])
          row.eachCell(cell => {
            cell.border = thinBorder
            cell.font = { size: 10 }
            if (idx % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f8fafc' } }
          })
          row.getCell(4).numFmt = '#,##0'
          total += (item.jumlah || 0)
        })
      })
  })

  // Total
  const totalRow = sheet.addRow(['', '', 'TOTAL PEMBIAYAAN 2', total])
  totalRow.height = 28
  totalRow.eachCell(cell => {
    cell.border = thinBorder
    cell.font = { bold: true, size: 12 }
  })
  totalRow.getCell(3).alignment = { horizontal: 'right' }
  totalRow.getCell(4).numFmt = '#,##0'
  totalRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '8b5cf6' } }
  totalRow.getCell(4).font = { bold: true, size: 12, color: { argb: 'FFFFFF' } }

  sheet.columns = [{ width: 6 }, { width: 18 }, { width: 50 }, { width: 20 }]
  return await workbook.xlsx.writeBuffer()
}

// Export Kegiatan Page
export async function exportKegiatanPage(data, tahun) {
  const { bidangKegiatan } = data
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SISKEUDES M-V'
  const { thinBorder } = getCommonStyles()

  const sheet = workbook.addWorksheet('Kegiatan', {
    properties: { tabColor: { argb: 'f59e0b' } }
  })

  // Title
  sheet.mergeCells('A1:F1')
  const title = sheet.getCell('A1')
  title.value = `DAFTAR KEGIATAN DESA - TAHUN ${tahun}`
  title.font = { bold: true, size: 18, color: { argb: 'd97706' }, name: 'Arial' }
  title.alignment = { horizontal: 'center' }
  sheet.getRow(1).height = 30

  sheet.mergeCells('A2:F2')
  sheet.getCell('A2').value = `Dicetak: ${new Date().toLocaleString('id-ID')}`
  sheet.getCell('A2').font = { italic: true, size: 10, color: { argb: '64748b' } }
  sheet.getCell('A2').alignment = { horizontal: 'center' }

  sheet.addRow([])

  // Header
  const headerRow = sheet.addRow(['KODE', 'NAMA BIDANG/SUB/KEGIATAN', 'PAKET', 'VOLUME', 'SATUAN', 'NILAI (Rp)'])
  headerRow.height = 25
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'd97706' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = thinBorder
  })

  // Data
  let totalNilai = 0
  bidangKegiatan?.forEach(bidang => {
    // Bidang
    const bRow = sheet.addRow([bidang.kode, bidang.nama, '', '', '', ''])
    bRow.eachCell(cell => {
      cell.border = thinBorder
      cell.font = { bold: true, size: 11, color: { argb: '92400e' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fef3c7' } }
    })

    bidang.subBidang?.forEach(sub => {
      // Sub Bidang
      const sRow = sheet.addRow([sub.kode, `  ${sub.nama}`, '', '', '', ''])
      sRow.eachCell(cell => {
        cell.border = thinBorder
        cell.font = { size: 10 }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fef9c3' } }
      })

      sub.kegiatan?.forEach(keg => {
        // Kegiatan
        const kRow = sheet.addRow([keg.kode, `    ${keg.nama}`, '', '', '', ''])
        kRow.eachCell(cell => {
          cell.border = thinBorder
          cell.font = { size: 10 }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fefce8' } }
        })

        keg.paket?.forEach((pkt, idx) => {
          // Paket
          const pRow = sheet.addRow([
            '',
            `      ${pkt.nama}`,
            pkt.uraianOutput || '',
            pkt.volume || '',
            pkt.satuan || '',
            pkt.nilai || 0
          ])
          pRow.eachCell(cell => {
            cell.border = thinBorder
            cell.font = { size: 9 }
            if (idx % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f8fafc' } }
          })
          pRow.getCell(6).numFmt = '#,##0'
          totalNilai += (pkt.nilai || 0)
        })
      })
    })
  })

  // Total
  const totalRow = sheet.addRow(['', 'TOTAL NILAI KEGIATAN', '', '', '', totalNilai])
  totalRow.height = 28
  totalRow.eachCell(cell => {
    cell.border = thinBorder
    cell.font = { bold: true, size: 12 }
  })
  totalRow.getCell(6).numFmt = '#,##0'
  totalRow.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f59e0b' } }
  totalRow.getCell(6).font = { bold: true, size: 12, color: { argb: 'FFFFFF' } }

  sheet.columns = [{ width: 20 }, { width: 50 }, { width: 30 }, { width: 10 }, { width: 10 }, { width: 18 }]
  return await workbook.xlsx.writeBuffer()
}

// Export Belanja Page
export async function exportBelanjaPage(data, tahun) {
  const { bidangData } = data
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SISKEUDES M-V'
  const { thinBorder } = getCommonStyles()

  const sheet = workbook.addWorksheet('Belanja', {
    properties: { tabColor: { argb: 'd946ef' } },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 4 }]
  })

  // Title
  sheet.mergeCells('A1:G1')
  const title = sheet.getCell('A1')
  title.value = `ANGGARAN BELANJA DESA - TAHUN ${tahun}`
  title.font = { bold: true, size: 18, color: { argb: 'a21caf' }, name: 'Arial' }
  title.alignment = { horizontal: 'center' }
  sheet.getRow(1).height = 30

  sheet.mergeCells('A2:G2')
  sheet.getCell('A2').value = `Dicetak: ${new Date().toLocaleString('id-ID')}`
  sheet.getCell('A2').font = { italic: true, size: 10, color: { argb: '64748b' } }
  sheet.getCell('A2').alignment = { horizontal: 'center' }

  sheet.addRow([])

  // Header
  const headerRow = sheet.addRow(['KODE', 'URAIAN', 'ANGGARAN', 'TOTAL', 'VOL', 'SAT', 'HARGA'])
  headerRow.height = 25
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'a21caf' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = thinBorder
  })

  // Styles
  const levelStyle = (color) => ({
    border: thinBorder,
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: color } }
  })

  // Data
  let totalBelanja = 0
  bidangData?.forEach(bidang => {
    const bRow = sheet.addRow([bidang.kode, bidang.nama, '', bidang.total, '', '', ''])
    bRow.eachCell(cell => Object.assign(cell, levelStyle('f3e8ff'), { font: { bold: true, size: 11 } }))
    bRow.getCell(4).numFmt = '#,##0'
    totalBelanja += (bidang.total || 0)

    bidang.subBidang?.forEach(sub => {
      const sRow = sheet.addRow([sub.kode, `  ${sub.nama}`, '', sub.total, '', '', ''])
      sRow.eachCell(cell => Object.assign(cell, levelStyle('fae8ff'), { font: { size: 10 } }))
      sRow.getCell(4).numFmt = '#,##0'

      sub.kegiatan?.forEach(keg => {
        const kRow = sheet.addRow([keg.kode, `    ${keg.nama}`, '', keg.total, '', '', ''])
        kRow.eachCell(cell => Object.assign(cell, levelStyle('fdf4ff'), { font: { size: 10 } }))
        kRow.getCell(4).numFmt = '#,##0'

        keg.paket?.forEach(pkt => {
          const pRow = sheet.addRow(['', `      ${pkt.namaSubRincian || pkt.nama}`, pkt.anggaran || '', pkt.jumlah || pkt.nilai || 0, '', '', ''])
          pRow.eachCell(cell => { cell.border = thinBorder; cell.font = { size: 9, bold: true, color: { argb: 'a21caf' } } })
          pRow.getCell(4).numFmt = '#,##0'

          pkt.rab?.forEach(rab => {
            const rRow = sheet.addRow([rab.kode, `        ${rab.namaRekening}`, rab.anggaran || '', rab.jumlah || 0, '', '', ''])
            rRow.eachCell(cell => { cell.border = thinBorder; cell.font = { size: 9, color: { argb: '0891b2' } } })
            rRow.getCell(4).numFmt = '#,##0'

            rab.rabRinci?.forEach((item, idx) => {
              const iRow = sheet.addRow(['', `          ${item.uraian}`, item.anggaran || '', item.jumlah || 0, item.volume || '', item.satuan || '', item.hargaSatuan || 0])
              iRow.eachCell(cell => { cell.border = thinBorder; cell.font = { size: 9 } })
              if (idx % 2 === 1) iRow.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f8fafc' } } })
              iRow.getCell(4).numFmt = '#,##0'
              iRow.getCell(7).numFmt = '#,##0'
            })
          })
        })
      })
    })
  })

  // Total
  const totalRow = sheet.addRow(['', 'TOTAL BELANJA', '', totalBelanja, '', '', ''])
  totalRow.height = 28
  totalRow.eachCell(cell => {
    cell.border = thinBorder
    cell.font = { bold: true, size: 12 }
  })
  totalRow.getCell(4).numFmt = '#,##0'
  totalRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'd946ef' } }
  totalRow.getCell(4).font = { bold: true, size: 12, color: { argb: 'FFFFFF' } }

  sheet.columns = [{ width: 18 }, { width: 50 }, { width: 15 }, { width: 18 }, { width: 8 }, { width: 10 }, { width: 15 }]
  return await workbook.xlsx.writeBuffer()
}

