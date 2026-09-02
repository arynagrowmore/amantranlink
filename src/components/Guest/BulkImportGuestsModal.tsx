import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Download, AlertCircle, CheckCircle2, FileText, ArrowRight, Loader2, Users } from 'lucide-react';
import { bulkImportGuests } from '../../services/guestService';
import { ImportGuestRow, GuestCategory } from '../../types/guest';

interface BulkImportGuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weddingSiteId: string;
  weddingSlug?: string;
  userId: string;
  onImportComplete: (count: number) => void;
}

export const BulkImportGuestsModal: React.FC<BulkImportGuestsModalProps> = ({
  isOpen,
  onClose,
  weddingSiteId,
  weddingSlug,
  userId,
  onImportComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<ImportGuestRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{ success: boolean; count: number } | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setParsedRows([]);
      setFileName('');
      setLoading(false);
      setImportResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Download Sample CSV Template
  const handleDownloadSample = () => {
    const csvContent = `Name,Phone,Email,Family,Members,Category\n` +
      `Mukeshbhai Patel,9409360336,mukesh@example.com,Patel Parivar,4,Family\n` +
      `Vikram Sharma,9825145678,vikram@example.com,,2,Friend\n` +
      `Rajesh Shah,9898234567,,Shah Family,3,VIP\n` +
      `Amitabh Verma,9428012345,amitabh@example.com,,1,Relative\n`;

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AmantranLink_Guest_Import_Template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Parse CSV File with row validation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = (evt.target?.result as string) || '';
      const lines = text.split(/\r\n|\n/).map(l => l.trim()).filter(Boolean);

      if (lines.length <= 1) {
        setParsedRows([]);
        return;
      }

      // Skip header line
      const dataLines = lines.slice(1);
      const rows: ImportGuestRow[] = dataLines.map((line, idx) => {
        // Handle quoted CSV cells
        const cols: string[] = [];
        let inQuote = false;
        let buffer = '';

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuote = !inQuote;
          } else if (char === ',' && !inQuote) {
            cols.push(buffer.trim());
            buffer = '';
          } else {
            buffer += char;
          }
        }
        cols.push(buffer.trim());

        const name = cols[0] || '';
        const phone = cols[1] || '';
        const email = cols[2] || '';
        const family = cols[3] || '';
        const members = parseInt(cols[4], 10) || 1;
        const rawCategory = cols[5] || 'Family';

        const validCategories: GuestCategory[] = ['Family', 'Friend', 'Relative', 'VIP', 'Business', 'Other'];
        const matchedCat = validCategories.find(c => c.toLowerCase() === rawCategory.toLowerCase()) || 'Family';

        const errors: string[] = [];
        if (!name || name.trim().length < 2) {
          errors.push('Guest name is required (min 2 chars).');
        }
        if (!phone || phone.replace(/[^0-9]/g, '').length < 7) {
          errors.push('Valid mobile phone number is required.');
        }

        return {
          rowNumber: idx + 2, // Header is row 1
          name,
          phone,
          email,
          family,
          members: Math.max(1, members),
          category: matchedCat,
          isValid: errors.length === 0,
          errors,
        };
      });

      setParsedRows(rows);
    };

    reader.readAsText(file);
  };

  const validRows = parsedRows.filter(r => r.isValid);
  const errorRows = parsedRows.filter(r => !r.isValid);

  // 3. Confirm Import
  const handleConfirmImport = async () => {
    if (validRows.length === 0) return;
    setLoading(true);

    const res = await bulkImportGuests(weddingSiteId, userId, validRows, weddingSlug);
    setLoading(false);

    if (res.success) {
      setImportResult({ success: true, count: res.importedCount });
      onImportComplete(res.importedCount);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className={`relative w-full overflow-hidden rounded-3xl bg-white border border-[#E8DFD1] shadow-2xl text-[#20181A] font-manrope flex flex-col ${
        importResult ? 'max-w-lg' : 'max-w-2xl max-h-[90vh]'
      }`}>
        
        {/* Subtle Top Accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-[#9C772F] via-[#F4D06F] to-[#9C772F] shrink-0" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F4EFE6] text-[#736567] transition-colors cursor-pointer z-10"
          title="Close Modal (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {importResult ? (
          /* ========================================================================= */
          /* 🎉 SUCCESS STATE (Compact, Intentional, High Contrast)                     */
          /* ========================================================================= */
          <div className="p-6 sm:p-8 text-center animate-scaleUp">
            
            {/* Emerald Checkmark Icon */}
            <div className="w-14 h-14 mx-auto rounded-full bg-[#EDF7F2] border-2 border-[#167A5A] flex items-center justify-center text-[#167A5A] shadow-xs mb-3.5">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            {/* Success Heading & Description */}
            <div className="space-y-1">
              <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#350811]">
                {importResult.count} {importResult.count === 1 ? 'Guest' : 'Guests'} Imported Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-[#6C5D60] max-w-sm mx-auto leading-relaxed">
                Personalized invitation links have been created for all imported guests.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#E8DFD1] my-5" />

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                {/* PRIMARY: View Guest List */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#540D1E] hover:bg-[#681025] active:bg-[#430914] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[#F4D06F]" />
                  <span>View Guest List</span>
                </button>
              </div>

              {/* TERTIARY: Done */}
              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-medium text-[#736567] hover:text-[#20181A] hover:underline cursor-pointer py-1"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 📥 MAIN IMPORT FLOW                                                       */
          /* ========================================================================= */
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            
            {/* Header */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
                Bulk Guest Import
              </span>
              <h2 className="font-cormorant text-2xl font-bold text-[#350811]">
                Import Guests from CSV Spreadsheet
              </h2>
              <p className="text-xs text-[#6C5D60]">
                Quickly upload your guest list from Excel or Google Sheets.
              </p>
            </div>

            {/* Template Download Notice */}
            <div className="p-3 rounded-2xl bg-[#FAF6EF] border border-[#E8DFD1] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#4A3E40]">
                <FileText className="w-4 h-4 text-[#9C772F] shrink-0" />
                <span>Need the standard CSV format? Download our prepared template.</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F5EFE4] text-[#8C6D2E] border border-[#E8DFD1] text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample</span>
              </button>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl border-2 border-dashed border-[#D6C7B2] hover:border-[#540D1E] bg-[#FCFAF7] hover:bg-[#FAF6EF] text-center cursor-pointer transition-colors space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-[#9C772F] mx-auto" />
              <div>
                <span className="text-xs font-bold text-[#350811] hover:underline">
                  {fileName ? fileName : 'Click to select or drag CSV spreadsheet here'}
                </span>
                <p className="text-[11px] text-[#736567] mt-0.5">Supports .csv exported from Excel or Google Sheets</p>
              </div>
            </div>

            {/* Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#350811]">
                    Rows Detected: {parsedRows.length}
                  </span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-[#136A4E] font-semibold">{validRows.length} Valid</span>
                    {errorRows.length > 0 && (
                      <span className="text-[#8C4A4A] font-semibold">{errorRows.length} Need Attention</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-[#E8DFD1] overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF6EF] text-[#736567] font-mono text-[10px] uppercase font-bold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Phone</th>
                        <th className="py-2 px-3">Family</th>
                        <th className="py-2 px-3">Members</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2ECE1]">
                      {parsedRows.map((r, idx) => (
                        <tr key={idx} className={r.isValid ? 'hover:bg-[#FAF6EF]' : 'bg-[#FDF2F2]/60'}>
                          <td className="py-2 px-3">
                            {r.isValid ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#167A5A]" />
                            ) : (
                              <span className="text-[10px] text-[#8C4A4A] font-bold" title={r.errors.join(', ')}>
                                ⚠️ Invalid
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-semibold text-[#20181A]">{r.name || '—'}</td>
                          <td className="py-2 px-3 font-mono text-[#736567]">{r.phone || '—'}</td>
                          <td className="py-2 px-3 text-[#4A3E40]">{r.family || '—'}</td>
                          <td className="py-2 px-3 font-bold text-[#540D1E]">{r.members}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#F0EAE1]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#6C5D60] hover:text-[#20181A] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={validRows.length === 0 || loading}
                className="px-5 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-40"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Import {validRows.length} Valid Guests</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkImportGuestsModal;
