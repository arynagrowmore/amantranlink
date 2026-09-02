import React, { useState, useEffect } from 'react';
import { 
  Globe, Plus, CheckCircle2, XCircle, AlertCircle, 
  RefreshCw, Trash2, ShieldCheck, Copy, Check, ExternalLink, Info
} from 'lucide-react';
import { CustomDomain } from '../../types/studioBranding';
import { 
  fetchCustomDomains, 
  addCustomDomain, 
  verifyCustomDomain, 
  removeCustomDomain 
} from '../../services/studioBrandingService';

interface CustomDomainsViewProps {
  studioId: string;
}

export const CustomDomainsView: React.FC<CustomDomainsViewProps> = ({ studioId }) => {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newDomain, setNewDomain] = useState<string>('');
  const [adding, setAdding] = useState<boolean>(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const list = await fetchCustomDomains(studioId);
    setDomains(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [studioId]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setAdding(true);
    setErrorMessage(null);

    const res = await addCustomDomain(studioId, newDomain);
    setAdding(false);

    if (res.success && res.domain) {
      setDomains([res.domain, ...domains]);
      setNewDomain('');
    } else {
      setErrorMessage(res.error || 'Failed to add custom domain.');
    }
  };

  const handleVerify = async (domainId: string) => {
    setVerifyingId(domainId);
    setErrorMessage(null);

    const res = await verifyCustomDomain(domainId, studioId);
    setVerifyingId(null);

    if (res.success && res.domain) {
      setDomains(prev => prev.map(d => d.id === domainId ? res.domain! : d));
    } else {
      setErrorMessage(res.error || 'DNS Verification could not be confirmed yet. Please ensure CNAME is propagated.');
    }
  };

  const handleRemove = async (domain: CustomDomain) => {
    if (!window.confirm(`Disconnect domain ${domain.domain}? This will deactivate custom URL routing.`)) {
      return;
    }

    await removeCustomDomain(domain.id, studioId);
    setDomains(prev => prev.filter(d => d.id !== domain.id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTarget(text);
    setTimeout(() => setCopiedTarget(null), 2500);
  };

  return (
    <div className="space-y-8 font-manrope text-[#20181A]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD1] pb-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
            Custom Hostname &amp; DNS Routing
          </span>
          <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#350811] mt-0.5">
            Custom Studio Domains
          </h2>
          <p className="text-xs sm:text-sm text-[#6C5D60] mt-0.5 max-w-xl">
            Host your client approval portals and invitations under your studio's own domain name (e.g. invites.yourstudio.com).
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-xl bg-white border border-[#E8DFD1] text-[#736567] hover:bg-[#FAF6EF] text-xs transition-colors cursor-pointer self-start sm:self-auto"
          title="Refresh Domains"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-[#FDF2F2] border border-[#F0D5D5] rounded-2xl text-xs text-[#8C4A4A] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Add New Domain Form */}
      <div className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#9C772F]" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
            Connect a New Studio Subdomain
          </h3>
        </div>

        <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              required
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. invites.royalweddingstudio.com"
              className="w-full px-4 py-2.5 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] placeholder:text-[#9C8C8E] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={adding || !newDomain.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {adding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Connect Domain</span>
          </button>
        </form>

        <div className="p-3.5 bg-[#FAF8F5] border border-[#E8DFD1] rounded-2xl text-xs text-[#736567] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#9C772F] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            We recommend creating a CNAME record on a subdomain like <strong className="text-[#350811]">invites</strong> or <strong className="text-[#350811]">clients</strong> pointing to <strong className="text-[#350811]">cname.amantranlink.com</strong>.
          </p>
        </div>
      </div>

      {/* Connected Domains List */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
          Configured Domains ({domains.length})
        </h3>

        {loading ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#736567]">Loading configured domains...</p>
          </div>
        ) : domains.length === 0 ? (
          <div className="p-8 bg-white border border-[#E8DFD1] rounded-3xl text-center space-y-2">
            <Globe className="w-8 h-8 text-[#9C8C8E] mx-auto opacity-70" />
            <h4 className="font-cormorant text-lg font-bold text-[#20181A]">No Custom Domains Connected</h4>
            <p className="text-xs text-[#736567] max-w-sm mx-auto">
              Add your agency's domain above to serve white-label wedding portals directly on your brand URL.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {domains.map((dom) => (
              <div
                key={dom.id}
                className="p-5 bg-white border border-[#E8DFD1] rounded-3xl shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#FAF6EF] border border-[#E8DFD1] flex items-center justify-center text-[#540D1E]">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#20181A]">{dom.domain}</span>
                        <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                          dom.status === 'verified'
                            ? 'bg-[#EDF7F2] text-[#136A4E] border border-[#BCE3D1]'
                            : 'bg-[#FFF8EC] text-[#976008] border border-[#F2DEB0]'
                        }`}>
                          {dom.status === 'verified' ? 'Connected & Verified' : 'DNS Setup Required'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#736567] mt-0.5">
                        SSL Status: <strong className="text-[#350811]">{dom.ssl_status === 'active' ? 'HTTPS Active' : 'SSL Provisioning'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {dom.status !== 'verified' && (
                      <button
                        type="button"
                        onClick={() => handleVerify(dom.id)}
                        disabled={verifyingId === dom.id}
                        className="px-3 py-1.5 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${verifyingId === dom.id ? 'animate-spin' : ''}`} />
                        <span>{verifyingId === dom.id ? 'Verifying DNS...' : 'Verify DNS'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemove(dom)}
                      className="p-2 rounded-xl text-[#736567] hover:text-[#8C4A4A] hover:bg-[#FDF2F2] transition-colors cursor-pointer"
                      title="Disconnect Domain"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* DNS Instructions Table */}
                <div className="p-4 bg-[#FAF6EF] border border-[#E8DFD1] rounded-2xl space-y-2">
                  <div className="text-[11px] font-mono uppercase font-bold text-[#736567]">
                    Required DNS Configuration
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-[#E8DFD1]">
                      <span className="text-[10px] text-[#8C7A7C] block">Record Type</span>
                      <strong className="text-[#20181A]">CNAME</strong>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-[#E8DFD1]">
                      <span className="text-[10px] text-[#8C7A7C] block">Host / Subdomain</span>
                      <strong className="text-[#20181A]">{dom.domain.split('.')[0]}</strong>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-[#E8DFD1] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#8C7A7C] block">Points To (Target)</span>
                        <strong className="text-[#540D1E] font-mono text-[11px]">{dom.cname_target}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(dom.cname_target)}
                        className="p-1 rounded-md text-[#736567] hover:text-[#20181A] transition-colors"
                        title="Copy CNAME Target"
                      >
                        {copiedTarget === dom.cname_target ? <Check className="w-3.5 h-3.5 text-[#167A5A]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomDomainsView;
