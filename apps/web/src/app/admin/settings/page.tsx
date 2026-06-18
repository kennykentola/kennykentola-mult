'use client';

import React, { useEffect, useState } from 'react';
import { client } from '@/lib/appwrite';
import { Databases, Query, ID } from 'appwrite';
import { Building2, Save } from 'lucide-react';
import { BankAccount } from '@company/shared';

export default function AdminSettingsPage() {
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';

      const res = await databases.listDocuments(dbId, 'bank_accounts', [
        Query.limit(1)
      ]);

      if (res.documents.length > 0) {
        const acc = res.documents[0] as unknown as BankAccount;
        setBankAccount(acc);
        setBankName(acc.bankName);
        setAccountName(acc.accountName);
        setAccountNumber(acc.accountNumber);
      }
    } catch (err) {
      console.error('Failed to fetch bank details:', err);
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

      if (bankAccount && bankAccount.$id) {
        // Update existing
        await databases.updateDocument(dbId, 'bank_accounts', bankAccount.$id, data);
        alert('Bank details updated successfully!');
      } else {
        // Create new
        const res = await databases.createDocument(dbId, 'bank_accounts', ID.unique(), data);
        setBankAccount(res as unknown as BankAccount);
        alert('Bank details saved successfully!');
      }
    } catch (err: any) {
      console.error('Failed to save bank details:', err);
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
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
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <p className="text-sm text-slate-400">
            These details will be displayed to clients when they choose "Bank Transfer" at checkout.
          </p>

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

          <div className="pt-4 border-t border-slate-800 flex justify-end">
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
  );
}
