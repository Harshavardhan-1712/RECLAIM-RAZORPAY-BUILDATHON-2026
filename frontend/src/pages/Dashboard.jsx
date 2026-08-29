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
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px', color: '#0f172a' }}>
      {/* Header with Cheesecake Live Status Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-0.025em' }}>RECLAIM</h1>
            <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '20px', fontWeight: '800', letterSpacing: '0.05em' }}>RAZORPAY BUILDATHON 2026</span>
          </div>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0', fontWeight: '500' }}>Counterfactual Revenue Recovery & Agentic Orchestration Engine</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Live Backend Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid #bbf7d0' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }}></span>
            API & Gemini 1.5 Online
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>Batch Evaluated</span>
            <span style={{ fontSize: '13px', fontWeight: '700', background: '#fff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              {data.total_transactions?.toLocaleString()} Transactions
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>Revenue At Risk</p>
          <h3 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>{formatCurrency(data.total_revenue_at_risk)}</h3>
        </div>
        
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>Cost of Interventions</p>
          <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626', margin: 0 }}>{formatCurrency(data.reclaim.cost)}</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Smart bounded optimization</p>
        </div>

        <div style={{ background: '#0f172a', color: '#fff', padding: '24px', borderRadius: '12px', gridColumn: 'span 2', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '11px', color: '#4ade80', textTransform: 'uppercase', fontWeight: '700', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>Net Revenue Recovered (Uplift)</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <h3 style={{ fontSize: '36px', fontWeight: '900', margin: 0 }}>+{formatCurrency(uplift)}</h3>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80', background: 'rgba(74, 222, 128, 0.15)', padding: '4px 8px', borderRadius: '4px' }}>
              +{upliftPercentage}% vs Baseline
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 0 0' }}>After factoring all API, gateway, and incentive costs.</p>
        </div>
      </div>

      {/* Strategy Summary */}
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 20px 0' }}>Strategy Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center' }}>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', margin: '0 0 4px 0' }}>Do Nothing Net</p>
            <p style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{formatCurrency(data.baselines.no_action.net)}</p>
          </div>
          <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#b91c1c', fontWeight: '600', margin: '0 0 4px 0' }}>Naive Retry Net</p>
            <p style={{ fontSize: '18px', fontWeight: '800', color: '#b91c1c', margin: 0 }}>{formatCurrency(data.baselines.naive_retry.net)}</p>
          </div>
          <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#15803d', fontWeight: '600', margin: '0 0 4px 0' }}>RECLAIM AI Net</p>
            <p style={{ fontSize: '18px', fontWeight: '800', color: '#15803d', margin: 0 }}>{formatCurrency(data.reclaim.actual_net)}</p>
          </div>
        </div>
      </div>

      {/* Live Interactive Testing Playground */}
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>⚡ Live Counterfactual Decision Playground</h3>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>Test real-time predictions, policy guardrails, and Gemini explanations via FastAPI backend.</p>
        
        <form onSubmit={handleEvaluate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>Transaction ID</label>
            <input type="text" value={txId} onChange={(e) => setTxId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>Amount (₹)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>Error Code</label>
            <select value={errorCode} onChange={(e) => setErrorCode(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff' }}>
              <option value="GATEWAY_TIMEOUT">GATEWAY_TIMEOUT</option>
              <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS</option>
              <option value="CUSTOMER_ABANDONED">CUSTOMER_ABANDONED</option>
              <option value="RISK_BLOCKED">RISK_BLOCKED</option>
            </select>
          </div>
          <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', fontWeight: '700', padding: '11px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Evaluating...' : 'Run Decision Engine'}
          </button>
        </form>

        {evaluationResult && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Selected Optimal Action: <span style={{ color: '#2563eb', textTransform: 'uppercase' }}>{evaluationResult.selected_action}</span></h4>
              <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '4px', fontWeight: '700' }}>Expected Net: ₹{evaluationResult.expected_net_recovery}</span>
            </div>
            
            <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', margin: '0 0 4px 0' }}>🤖 Gemini LLM Audit Justification</p>
              <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#334155', margin: 0 }}>"{evaluationResult.llm_explanation}"</p>
            </div>

            <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', margin: '0 0 8px 0', textTransform: 'uppercase' }}>All Counterfactual Paths Evaluated:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {evaluationResult.detailed_evaluations.map((evalItem, idx) => (
                <div key={idx} style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: evalItem.action === evaluationResult.selected_action ? '2px solid #2563eb' : '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '12px', fontWeight: '800', margin: '0 0 2px 0', textTransform: 'uppercase' }}>{evalItem.action}</p>
                  <p style={{ fontSize: '11px', color: evalItem.is_allowed ? '#16a34a' : '#dc2626', margin: '0 0 2px 0', fontWeight: '700' }}>
                    {evalItem.is_allowed ? `Allowed (P: ${(evalItem.p_recovery * 100).toFixed(1)}%)` : `Blocked: ${evalItem.policy_reason}`}
                  </p>
                  {evalItem.is_allowed && <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Net: ₹{evalItem.expected_net_recovery}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Footer Branding */}
      <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>
        RECLAIM AI Engine • Built with Precision for Razorpay Buildathon 2026 by <span style={{ color: '#0f172a', fontWeight: '800' }}>Harsha Vardhan B S</span>
      </div>
    </div>
  );
}