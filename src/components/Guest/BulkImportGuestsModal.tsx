import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Download, AlertCircle, CheckCircle2, FileText, ArrowRight, Loader2, Users, Heart } from 'lucide-react';
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
      `Vikram Sharma,9825145678,vikram@example.com,Sharma Family,2,Friend\n` +
      `Rajesh Shah,9898234567,rajesh@example.com,Shah Family,3,VIP\n` +
      `Amitabh Verma,9428012345,amitabh@example.com,Verma Parivar,1,Relative\n`;

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AmantranLink_Guest_Import_Template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Parse CSV File with friendly row validation
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

      const dataLines = lines.slice(1);
      const rows: ImportGuestRow[] = dataLines.map((line, idx) => {
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
          errors.push('Guest name is missing or too short.');
        }
        if (!phone || phone.replace(/[^0-9]/g, '').length < 7) {
          errors.push('Valid mobile phone number required.');
        }

        return {
          rowNumber: idx + 2,
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

  const totalMembersFound = parsedRows.reduce((sum, r) => sum + (r.members || 1), 0);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-manrope">
      <div className={`relative w-full overflow-hidden rounded-3xl bg-white border border-[#E8DFD1] shadow-2xl text-[#241A17] flex flex-col ${
        importResult ? 'max-w-lg' : 'max-w-2xl max-h-[90vh]'
      }`}>
        
        {/* Top Gold Ornament Line */}
        <div className="h-1.5 w-full bg-linear-to-r from-[#C49A35] via-[#F4D06F] to-[#C49A35] shrink-0" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#FAF6EE] text-[#736567] transition-colors cursor-pointer z-10"
          title="Close Modal (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {importResult ? (
          /* Success Screen */
          <div className="p-8 sm:p-10 text-center space-y-4 animate-scaleUp">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#EDF7F2] border border-[#BCE3D1] flex items-center justify-center text-[#167A5A] shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="font-serif italic text-xs text-[#C49A35] block">
                ॥ आमंत्रण सूची सम्पन्न ॥
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#241A17] font-normal">
                {importResult.count} {importResult.count === 1 ? 'Family' : 'Families'} Welcomed!
              </h3>
              <p className="text-xs sm:text-sm text-[#736567] max-w-sm mx-auto leading-relaxed">
                Personalized royal invitation links have been created for everyone on your list.
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#6E1020] hover:bg-[#540D1E] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mx-auto"
              >
                <Users className="w-4 h-4 text-[#F4D06F]" />
                <span>Open Family Guest Book</span>
              </button>
            </div>
          </div>
        ) : (
          /* Guided CSV Import Workflow */
          <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
            
            {/* Header */}
            <div className="space-y-1">
              <span className="font-serif italic text-xs text-[#C49A35] block">
                Bring Your Existing Guest List
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#241A17] font-normal">
                Import Families from Spreadsheet
              </h2>
              <p className="text-xs text-[#736567] font-light">
                Easily upload contacts from Excel, Numbers, or Google Sheets.
              </p>
            </div>

            {/* Template Download Card */}
            <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E8DFD1] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#241A17]">
                <FileText className="w-4 h-4 text-[#C49A35] shrink-0" />
                <span>Want to check the standard format first?</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F5EFE4] text-[#241A17] border border-[#E8DFD1] text-[11px] font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#C49A35]" />
                <span>Sample CSV</span>
              </button>
            </div>

            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 rounded-2xl border-2 border-dashed border-[#D6C7B2] hover:border-[#6E1020] bg-[#FAF6EE]/50 hover:bg-[#FAF6EE] text-center cursor-pointer transition-colors space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-[#C49A35] mx-auto" />
              <div>
                <span className="text-xs font-semibold text-[#241A17]">
                  {fileName ? fileName : 'Click to choose your CSV guest list file'}
                </span>
                <p className="text-[11px] text-[#736567] mt-0.5">Supports standard UTF-8 CSV spreadsheets</p>
              </div>
            </div>

            {/* Clean Parsed Preview */}
            {parsedRows.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E8DFD1] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-serif text-base font-semibold text-[#241A17]">
                      {parsedRows.length} families found
                    </span>
                    <span className="text-xs text-[#736567] ml-1.5">
                      ({totalMembersFound} guests found)
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#167A5A] font-semibold">
                      ✓ {validRows.length} rows ready
                    </span>
                    {errorRows.length > 0 && (
                      <span className="text-[#8C4A4A] font-semibold">
                        ⚠ {errorRows.length} rows need attention
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-[#E8DFD1] overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF6EE] text-[#736567] font-mono text-[10px] uppercase font-bold sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Row</th>
                        <th className="py-2.5 px-3">Primary Guest</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Family</th>
                        <th className="py-2.5 px-3">Members</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2ECE1]">
                      {parsedRows.map((r) => (
                        <tr key={r.rowNumber} className={r.isValid ? 'hover:bg-[#FAF6EE]' : 'bg-[#FDF2F2]/60'}>
                          <td className="py-2 px-3 font-mono text-[11px] text-[#736567]">#{r.rowNumber}</td>
                          <td className="py-2 px-3 font-medium text-[#241A17]">{r.name || '—'}</td>
                          <td className="py-2 px-3 font-mono text-[#736567] text-[11px]">{r.phone || '—'}</td>
                          <td className="py-2 px-3 text-[#736567]">{r.family || '—'}</td>
                          <td className="py-2 px-3 font-semibold text-[#6E1020]">{r.members}</td>
                          <td className="py-2 px-3">
                            {r.isValid ? (
                              <span className="text-[#167A5A] font-medium text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Ready
                              </span>
                            ) : (
                              <span className="text-[#8C4A4A] font-medium text-[11px]" title={r.errors.join(', ')}>
                                {r.errors[0]}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E8DFD1]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#736567] hover:text-[#241A17] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={validRows.length === 0 || loading}
                className="px-6 py-2.5 rounded-xl bg-[#6E1020] hover:bg-[#540D1E] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-40"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Welcome {validRows.length} Families to Guest Book</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkImportGuestsModal;
