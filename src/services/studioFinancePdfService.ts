import { Quotation, Invoice, PaymentReceipt, StudioBusinessProfile } from '../types/studioFinance';
import { StudioBranding } from '../types/studioBranding';

/**
 * 🖨️ Open printable vector sheet in dedicated print window (triggers native Save as PDF)
 */
function openPrintWindow(title: string, htmlContent: string) {
  if (typeof window === 'undefined') return;
  const printWin = window.open('', '_blank', 'width=900,height=1000');
  if (!printWin) {
    alert('Please allow popups to download or print this document.');
    return;
  }

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Plus Jakarta Sans', sans-serif; background: #FAF6EE; color: #20181A; padding: 24px; }
          .doc-sheet { max-width: 800px; margin: 0 auto; background: #FFF; border: 1px solid #E8DFD1; border-radius: 16px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
          .header { background: #540D1E; color: #FFF; border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .header h1 { font-family: 'Cinzel', serif; font-size: 20px; letter-spacing: 0.5px; }
          .badge { background: #F4D06F; color: #120306; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; text-transform: uppercase; }
          .coords { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding-bottom: 20px; border-bottom: 1px solid #F2ECE1; margin-bottom: 20px; font-size: 12px; }
          .table-box { border: 1px solid #E8DFD1; border-radius: 12px; overflow: hidden; margin-bottom: 20px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; text-align: left; }
          th { background: #FAF8F5; padding: 10px 14px; font-size: 10px; font-family: monospace; text-transform: uppercase; color: #736567; border-bottom: 1px solid #E8DFD1; }
          td { padding: 12px 14px; border-bottom: 1px solid #F2ECE1; }
          .totals-box { margin-left: auto; width: 280px; background: #FAF6EE; border: 1px solid #E8DFD1; border-radius: 12px; padding: 14px; font-size: 12px; margin-bottom: 20px; }
          .totals-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .grand-total { font-weight: 700; font-size: 14px; color: #540D1E; border-top: 1px solid #E8DFD1; padding-top: 8px; margin-top: 6px; }
          .terms { font-size: 11px; color: #736567; padding-top: 14px; border-top: 1px solid #F2ECE1; }
          .footer { text-align: center; font-size: 10px; color: #9C8C8E; margin-top: 24px; }
          @media print {
            body { background: #FFF; padding: 0; }
            .doc-sheet { border: none; box-shadow: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="doc-sheet">
          ${htmlContent}
        </div>
        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWin.document.close();
}

/**
 * 🖨️ Export Quotation to Printable / PDF Document
 */
export function generateQuotationPdf(
  quotation: Quotation,
  profile: StudioBusinessProfile,
  branding?: StudioBranding
): void {
  const primaryColor = branding?.primary_color || '#540D1E';

  const rows = quotation.line_items.map(item => `
    <tr>
      <td>
        <strong>${item.name}</strong>
        ${item.description ? `<div style="font-size: 10px; color: #736567;">${item.description}</div>` : ''}
      </td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">INR ${(item.unit_price_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      <td style="text-align: right; font-weight: 700;">INR ${(item.line_subtotal_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  const html = `
    <div class="header" style="background: ${primaryColor};">
      <div>
        <div class="badge">Official Quotation</div>
        <h1>${profile.display_business_name}</h1>
      </div>
      <div style="text-align: right; font-size: 11px;">
        <div style="font-weight: 700;">${quotation.quotation_number}</div>
        <div>Date: ${quotation.issue_date}</div>
        <div>Valid Until: ${quotation.expiry_date}</div>
      </div>
    </div>

    <div class="coords">
      <div>
        <span style="font-size: 10px; font-family: monospace; color: #736567; text-transform: uppercase;">Issued By</span>
        <div style="font-weight: 700; font-size: 13px; margin-top: 2px;">${profile.legal_business_name}</div>
        <div>${profile.business_address}</div>
        <div>${profile.city}, ${profile.state} - ${profile.pin_code}</div>
        ${profile.gst_registered && profile.gstin ? `<div style="color: #540D1E; font-family: monospace;">GSTIN: ${profile.gstin}</div>` : ''}
      </div>
      <div style="text-align: right;">
        <span style="font-size: 10px; font-family: monospace; color: #736567; text-transform: uppercase;">Prepared For</span>
        <div style="font-weight: 700; font-size: 13px; margin-top: 2px;">${quotation.client_name}</div>
        <div>Phone: ${quotation.client_phone || '—'}</div>
        <div>Email: ${quotation.client_email || '—'}</div>
        ${quotation.client_state ? `<div>Place of Supply: ${quotation.client_state}</div>` : ''}
      </div>
    </div>

    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>Item / Service</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <div class="totals-box">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>INR ${(quotation.subtotal_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
      ${quotation.discount_paise > 0 ? `
        <div class="totals-row" style="color: #8C4A4A;">
          <span>Discount:</span>
          <span>- INR ${(quotation.discount_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      ` : ''}
      ${quotation.total_tax_paise > 0 ? `
        ${quotation.cgst_paise > 0 ? `
          <div class="totals-row">
            <span>CGST (9%):</span>
            <span>INR ${(quotation.cgst_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="totals-row">
            <span>SGST (9%):</span>
            <span>INR ${(quotation.sgst_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        ` : `
          <div class="totals-row">
            <span>IGST (18%):</span>
            <span>INR ${(quotation.igst_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        `}
      ` : ''}
      <div class="totals-row grand-total">
        <span>Grand Total:</span>
        <span>INR ${(quotation.total_amount_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>

    <div class="terms">
      <strong>Terms &amp; Payment Conditions:</strong>
      <p style="margin-top: 4px;">${quotation.terms_and_conditions || profile.default_payment_terms}</p>
    </div>

    <div class="footer">
      Generated securely by ${profile.display_business_name} · AmantranLink Studio ERP
    </div>
  `;

  openPrintWindow(`Quotation_${quotation.quotation_number}`, html);
}

/**
 * 🖨️ Export Invoice to Printable / PDF Document
 */
export function generateInvoicePdf(
  invoice: Invoice,
  profile: StudioBusinessProfile,
  branding?: StudioBranding
): void {
  const primaryColor = branding?.primary_color || '#540D1E';

  const rows = invoice.line_items.map(item => `
    <tr>
      <td>
        <strong>${item.name}</strong>
        ${item.description ? `<div style="font-size: 10px; color: #736567;">${item.description}</div>` : ''}
      </td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">INR ${(item.unit_price_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      <td style="text-align: right; font-weight: 700;">INR ${(item.line_total_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  const html = `
    <div class="header" style="background: ${primaryColor};">
      <div>
        <div class="badge">${profile.gst_registered ? 'Tax Invoice' : 'Bill of Supply'}</div>
        <h1>${profile.display_business_name}</h1>
      </div>
      <div style="text-align: right; font-size: 11px;">
        <div style="font-weight: 700;">${invoice.invoice_number}</div>
        <div>Issue Date: ${invoice.issue_date}</div>
        <div>Due Date: ${invoice.due_date}</div>
      </div>
    </div>

    <div class="coords">
      <div>
        <span style="font-size: 10px; font-family: monospace; color: #736567; text-transform: uppercase;">Billed By (Supplier)</span>
        <div style="font-weight: 700; font-size: 13px; margin-top: 2px;">${profile.legal_business_name}</div>
        <div>${profile.business_address}</div>
        <div>${profile.city}, ${profile.state} - ${profile.pin_code}</div>
        ${profile.gst_registered && profile.gstin ? `<div style="color: #540D1E; font-family: monospace;">GSTIN: ${profile.gstin}</div>` : ''}
      </div>
      <div style="text-align: right;">
        <span style="font-size: 10px; font-family: monospace; color: #736567; text-transform: uppercase;">Billed To (Client)</span>
        <div style="font-weight: 700; font-size: 13px; margin-top: 2px;">${invoice.client_name}</div>
        <div>Phone: ${invoice.client_phone || '—'}</div>
        <div>Email: ${invoice.client_email || '—'}</div>
        ${invoice.client_state ? `<div>Place of Supply: ${invoice.client_state}</div>` : ''}
      </div>
    </div>

    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <div class="totals-box">
      <div class="totals-row">
        <span>Invoice Total:</span>
        <span>INR ${(invoice.total_amount_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="totals-row" style="color: #136A4E;">
        <span>Amount Paid:</span>
        <span>INR ${(invoice.total_paid_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="totals-row grand-total">
        <span>Balance Due:</span>
        <span>INR ${(invoice.remaining_balance_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>

    ${profile.bank_account_number || profile.upi_id ? `
      <div class="terms" style="background: #FAF8F5; padding: 12px; border-radius: 8px; border: 1px solid #E8DFD1;">
        <strong>Bank &amp; Payment Details:</strong>
        ${profile.bank_name ? `<div>Bank: ${profile.bank_name} | A/C: ${profile.bank_account_number} | IFSC: ${profile.bank_ifsc}</div>` : ''}
        ${profile.upi_id ? `<div>UPI ID: ${profile.upi_id}</div>` : ''}
      </div>
    ` : ''}

    <div class="footer">
      Generated securely by ${profile.display_business_name} · AmantranLink Studio ERP
    </div>
  `;

  openPrintWindow(`Invoice_${invoice.invoice_number}`, html);
}

/**
 * 🖨️ Export Payment Receipt
 */
export function generateReceiptPdf(
  receipt: PaymentReceipt,
  profile: StudioBusinessProfile
): void {
  const html = `
    <div class="header" style="background: #136A4E;">
      <div>
        <div class="badge">Official Receipt</div>
        <h1>${profile.display_business_name}</h1>
      </div>
      <div style="text-align: right; font-size: 11px;">
        <div style="font-weight: 700;">${receipt.receipt_number}</div>
        <div>Date: ${new Date(receipt.payment_date).toLocaleDateString('en-IN')}</div>
      </div>
    </div>

    <div style="background: #EDF7F2; border: 1px solid #BCE3D1; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
      <span style="font-size: 10px; font-family: monospace; color: #136A4E; text-transform: uppercase;">Amount Received with Thanks</span>
      <div style="font-size: 24px; font-weight: 700; color: #136A4E; margin-top: 4px;">
        INR ${(receipt.amount_paid_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </div>
      <div style="font-size: 11px; color: #247559; margin-top: 4px;">
        Received from: <strong>${receipt.client_details_snapshot?.name || 'Valued Client'}</strong> via ${receipt.payment_method.toUpperCase()}
      </div>
      <div style="font-size: 11px; color: #247559; margin-top: 2px;">
        Remaining Balance Due: <strong>INR ${(receipt.remaining_balance_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
      </div>
    </div>

    <div class="footer">
      Official Payment Receipt · ${profile.display_business_name}
    </div>
  `;

  openPrintWindow(`Receipt_${receipt.receipt_number}`, html);
}
