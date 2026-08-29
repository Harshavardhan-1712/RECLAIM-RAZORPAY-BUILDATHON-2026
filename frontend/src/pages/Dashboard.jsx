import React, { useState } from 'react';
import simulationData from '../data/simulation_results.json';
import axios from 'axios';

const formatCurrency = (value) => {
  if (!value) return '₹0';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)} K`;
  return `₹${value.toLocaleString('en-IN')}`;
};

export default function Dashboard() {
  const [data] = useState(simulationData);
  
  const [txId, setTxId] = useState('RP_DEMO_999');
  const [amount, setAmount] = useState(8500);
  const [errorCode, setErrorCode] = useState('GATEWAY_TIMEOUT');
  const [loading, setLoading] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/recovery/evaluate', {
        id: txId,
        amount: parseFloat(amount),
        error_code: errorCode,
        historical_success_rate: 0.85,
        previous_failed_attempts: 1,
        time_of_day: 14,
        device_type: 'Mobile'
      });
      setEvaluationResult(response.data);
    } catch (err) {
      alert("Backend API error. Ensure FastAPI is running on port 8000 with CORS enabled!");
    } finally {
      setLoading(false);
    }
  };

  const uplift = data.reclaim.actual_net - data.baselines.naive_retry.net;
  const upliftPercentage = ((uplift / data.baselines.naive_retry.net) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900 font-sans">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-5 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight m-0">RECLAIM</h1>
            <span className="text-xs bg-sky-100 text-sky-800 px-3 py-1 rounded-full font-extrabold tracking-wide">RAZORPAY BUILDATHON 2026</span>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">Counterfactual Revenue Recovery & Agentic Orchestration Engine</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md text-xs font-bold border border-emerald-200">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            API & Gemini 1.5 Online
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Batch Evaluated</span>
            <span className="text-sm font-bold bg-white px-3 py-1.5 rounded-md shadow-sm border border-slate-200">
              {data.total_transactions?.toLocaleString()} Transactions
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Revenue At Risk</p>
          <h3 className="text-3xl font-black">{formatCurrency(data.total_revenue_at_risk)}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Cost of Interventions</p>
          <h3 className="text-3xl font-black text-rose-600">{formatCurrency(data.reclaim.cost)}</h3>
          <p className="text-xs text-slate-400 mt-1">Smart bounded optimization</p>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md md:col-span-2 relative overflow-hidden">
          <p className="text-xs text-emerald-400 uppercase font-bold tracking-wider mb-2">Net Revenue Recovered (Uplift)</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-black">+{formatCurrency(uplift)}</h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded">
              +{upliftPercentage}% vs Baseline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">After factoring all API, gateway, and incentive costs.</p>
        </div>
      </div>

      {/* Strategy Summary */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h3 className="text-xs font-extrabold uppercase tracking-wider mb-4 text-slate-500">Strategy Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 font-semibold mb-1">Do Nothing Net</p>
            <p className="text-xl font-black text-slate-800">{formatCurrency(data.baselines.no_action.net)}</p>
          </div>
          <div className="p-4 bg-rose-50/50 rounded-lg border border-rose-100">
            <p className="text-xs text-rose-700 font-semibold mb-1">Naive Retry Net</p>
            <p className="text-xl font-black text-rose-700">{formatCurrency(data.baselines.naive_retry.net)}</p>
          </div>
          <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <p className="text-xs text-emerald-700 font-semibold mb-1">RECLAIM AI Net</p>
            <p className="text-xl font-black text-emerald-700">{formatCurrency(data.reclaim.actual_net)}</p>
          </div>
        </div>
      </div>

      {/* Live Interactive Testing Playground */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h3 className="text-base font-black uppercase tracking-wider mb-1">⚡ Live Counterfactual Decision Playground</h3>
        <p className="text-xs text-slate-500 mb-6">Test real-time predictions, policy guardrails, and Gemini explanations via FastAPI backend.</p>
        
        <form onSubmit={handleEvaluate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">Transaction ID</label>
            <input type="text" value={txId} onChange={(e) => setTxId(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">Amount (₹)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">Error Code</label>
            <select value={errorCode} onChange={(e) => setErrorCode(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600">
              <option value="GATEWAY_TIMEOUT">GATEWAY_TIMEOUT</option>
              <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS</option>
              <option value="CUSTOMER_ABANDONED">CUSTOMER_ABANDONED</option>
              <option value="RISK_BLOCKED">RISK_BLOCKED</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2.5 rounded-lg text-sm transition shadow-sm cursor-pointer disabled:opacity-50">
            {loading ? 'Evaluating...' : 'Run Decision Engine'}
          </button>
        </form>

        {evaluationResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h4 className="m-0 text-base font-extrabold text-slate-800">Selected Optimal Action: <span className="text-blue-600 uppercase">{evaluationResult.selected_action}</span></h4>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md font-bold">Expected Net: ₹{evaluationResult.expected_net_recovery}</span>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4 shadow-xs">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">🤖 Gemini LLM Audit Justification</p>
              <p className="text-sm italic text-slate-700 m-0">"{evaluationResult.llm_explanation}"</p>
            </div>

            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">All Counterfactual Paths Evaluated:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {evaluationResult.detailed_evaluations.map((evalItem, idx) => (
                <div key={idx} className={`bg-white p-3.5 rounded-lg border ${evalItem.action === evaluationResult.selected_action ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200'}`}>
                  <p className="text-xs font-extrabold uppercase m-0 mb-1 text-slate-800">{evalItem.action}</p>
                  <p className={`text-[11px] font-bold m-0 mb-1 ${evalItem.is_allowed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {evalItem.is_allowed ? `Allowed (P: ${(evalItem.p_recovery * 100).toFixed(1)}%)` : `Blocked`}
                  </p>
                  {evalItem.is_allowed && <p className="text-[11px] text-slate-500 m-0 font-medium">Net: ₹{evalItem.expected_net_recovery}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="text-center mt-12 pt-6 border-t border-slate-200 text-slate-400 text-xs font-semibold">
        RECLAIM AI Engine • Built with Precision for Razorpay Buildathon 2026 by <span className="text-slate-700 font-extrabold">Harsha Vardhan B S </span>
      </div>
    </div>
  );
}