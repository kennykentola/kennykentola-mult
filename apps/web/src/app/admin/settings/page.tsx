'use client';

import React, { useEffect, useState } from 'react';
import { client } from '@/lib/appwrite';
import { Databases, Query, ID } from 'appwrite';
import { Building2, Save } from 'lucide-react';
import { BankAccount } from '@company/shared';

export default function AdminSettingsPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State for new/edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  
  // Analytics State
  const [analyticsUrl, setAnalyticsUrl] = useState('');
  const [savingAnalytics, setSavingAnalytics] = useState(false);

  // Pricing State
  const [siteSettingsIds, setSiteSettingsIds] = useState<Record<string, string>>({});
  const [pricingSettings, setPricingSettings] = useState({
    price_pro_student: '',
    price_bootcamp: '',
    price_print_bw: '',
    price_print_color: '',
    price_binding: '',
    price_id_card: '',
    price_mvp: '',
    price_website: ''
  });
  const [savingPricing, setSavingPricing] = useState(false);

  useEffect(() => {
    fetchBankDetails();
    fetchSiteSettings();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      const res = await databases.listDocuments(dbId, 'bank_accounts');

      if (res.documents.length > 0) {
        setBankAccounts(res.documents as unknown as BankAccount[]);
      }
    } catch (err) {
      console.error('Failed to fetch bank details:', err);
    } finally {
      // Don't set loading false here because we have two things loading
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
      
      const res = await databases.listDocuments(dbId, 'site_settings', [
        Query.limit(50)
      ]);

      const newPricing = { ...pricingSettings };
      const newIds: Record<string, string> = {};

      for (const doc of res.documents) {
        if (doc.key === 'analytics_iframe_url') {
          setAnalyticsUrl(doc.value);
        } else if (doc.key in newPricing) {
          (newPricing as any)[doc.key] = doc.value;
          newIds[doc.key] = doc.$id;
        }
      }
      setPricingSettings(newPricing);
      setSiteSettingsIds(newIds);
    } catch (err) {
      console.error('Failed to fetch site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      const data = {
        bankName,
        accountName,
        accountNumber,
        isActive: true
      };

      if (editingId) {
        // Update existing
        const res = await databases.updateDocument(dbId, 'bank_accounts', editingId, data);
        setBankAccounts(prev => prev.map(acc => acc.$id === editingId ? res as unknown as BankAccount : acc));
        alert('Bank details updated successfully!');
      } else {
        // Create new
        const res = await databases.createDocument(dbId, 'bank_accounts', ID.unique(), data);
        setBankAccounts(prev => [...prev, res as unknown as BankAccount]);
        alert('Bank details saved successfully!');
      }

      // Reset form
      setEditingId(null);
      setBankName('');
      setAccountName('');
      setAccountNumber('');
    } catch (err: any) {
      console.error('Failed to save bank details:', err);
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPricing(true);
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
      
      for (const [key, value] of Object.entries(pricingSettings)) {
        const docId = siteSettingsIds[key];
        if (docId) {
          await databases.updateDocument(dbId, 'site_settings', docId, { value });
        } else {
          const res = await databases.createDocument(dbId, 'site_settings', ID.unique(), { key, value });
          setSiteSettingsIds(prev => ({ ...prev, [key]: res.$id }));
        }
      }
      alert('General pricing rules updated successfully!');
    } catch (err: any) {
      console.error('Failed to save pricing:', err);
      alert('Error: ' + err.message);
    } finally {
      setSavingPricing(false);
    }
  };

  const handleEdit = (acc: BankAccount) => {
    setEditingId(acc.$id || null);
    setBankName(acc.bankName);
    setAccountName(acc.accountName);
    setAccountNumber(acc.accountNumber);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
      await databases.deleteDocument(dbId, 'bank_accounts', id);
      setBankAccounts(prev => prev.filter(acc => acc.$id !== id));
    } catch (err: any) {
      alert('Error deleting bank account: ' + err.message);
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading settings...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">System Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage global platform configurations.</p>
      </div>

      <div className="glass-panel border border-border bg-slate-900/50 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border bg-slate-900/80 flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-white">Company Bank Details</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-400">
            These details will be displayed to clients when they choose "Bank Transfer" at checkout.
          </p>

          {/* List of existing bank accounts */}
          <div className="space-y-4">
            {bankAccounts.map((acc) => (
              <div key={acc.$id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">{acc.bankName}</p>
                  <p className="text-sm text-slate-400">{acc.accountName}</p>
                  <p className="text-sm font-mono text-slate-300">{acc.accountNumber}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(acc)} className="text-blue-400 hover:text-blue-300 text-sm font-bold">Edit</button>
                  <button onClick={() => acc.$id && handleDelete(acc.$id)} className="text-rose-400 hover:text-rose-300 text-sm font-bold">Delete</button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSave} className="border-t border-slate-800 pt-6 space-y-6">
            <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Bank Account' : 'Add New Bank Account'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Bank Name</label>
                <input 
                  required
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. Guaranty Trust Bank"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Account Name</label>
                <input 
                  required
                  type="text"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  placeholder="e.g. Kennykentola Multi-Company Ltd"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Account Number</label>
                <input 
                  required
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="0123456789"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => { setEditingId(null); setBankName(''); setAccountName(''); setAccountNumber(''); }}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4" /> Save Bank Details
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="glass-panel border border-border bg-slate-900/50 rounded-2xl overflow-hidden mt-8">
        <div className="p-6 border-b border-border bg-slate-900/80 flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-white">Analytics Dashboard Embed</h2>
        </div>
        
        <form onSubmit={async (e) => {
          e.preventDefault();
          setSavingAnalytics(true);
          try {
            const databases = new Databases(client);
            const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

            const existing = await databases.listDocuments(dbId, 'site_settings', [
              Query.equal('key', 'analytics_iframe_url')
            ]);

            if (existing.documents.length > 0) {
              await databases.updateDocument(dbId, 'site_settings', existing.documents[0].$id, { value: analyticsUrl });
            } else {
              await databases.createDocument(dbId, 'site_settings', ID.unique(), { key: 'analytics_iframe_url', value: analyticsUrl });
            }
            alert('Analytics URL saved successfully!');
          } catch (err: any) {
            alert('Error: ' + err.message);
          } finally {
            setSavingAnalytics(false);
          }
        }} className="p-6 space-y-6">
          <p className="text-sm text-slate-400">
            Paste the "Embed Report" URL from Google Looker Studio here. The website will automatically pull this URL to display your traffic dashboard on the Analytics page.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Looker Studio URL</label>
            <input 
              required
              type="text"
              value={analyticsUrl}
              onChange={e => setAnalyticsUrl(e.target.value)}
              placeholder="https://datastudio.google.com/embed/reporting/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button 
              type="submit"
              disabled={savingAnalytics}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {savingAnalytics ? 'Saving...' : (
                <>
                  <Save className="h-4 w-4" /> Save Analytics URL
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel border border-border bg-slate-900/50 rounded-2xl overflow-hidden mt-8">
        <div className="p-6 border-b border-border bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">General Pricing Configuration</h2>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSavePricing} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'price_pro_student', label: 'Pro Student Course (₦)' },
                { key: 'price_bootcamp', label: 'Bootcamp Cohort (₦)' },
                { key: 'price_print_bw', label: 'Black & White Print (₦)' },
                { key: 'price_print_color', label: 'Color Print (₦)' },
                { key: 'price_binding', label: 'Document Binding (₦)' },
                { key: 'price_id_card', label: 'ID Card Design & Print (₦)' },
                { key: 'price_mvp', label: 'Custom Software MVP (From ₦)' },
                { key: 'price_website', label: 'Website Design (From ₦)' },
              ].map(item => (
                <div key={item.key}>
                  <label className="block text-sm font-medium text-slate-400 mb-1">{item.label}</label>
                  <input
                    type="text"
                    value={(pricingSettings as any)[item.key]}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, [item.key]: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. 5,000"
                  />
                </div>
              ))}
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={savingPricing}
                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {savingPricing ? 'Saving...' : 'Save Pricing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
