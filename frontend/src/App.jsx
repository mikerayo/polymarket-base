import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function App() {
  const [markets, setMarkets] = useState([]);
  const [form, setForm] = useState({
    questionId: '',
    ancillaryData: '',
    outcomeSlotCount: 2,
    endTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const res = await axios.get('/api/markets');
        setMarkets(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchMarkets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTxHash('');
    setLoading(true);
    try {
      const payload = {
        questionId: form.questionId,
        ancillaryData: form.ancillaryData,
        outcomeSlotCount: Number(form.outcomeSlotCount),
        endTime: Number(new Date(form.endTime).getTime() / 1000),
      };
      const res = await axios.post('/api/markets/create', payload);
      setTxHash(res.data.txHash);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h1>Polymarket Base</h1>
      <h2>Mercados</h2>
      {markets.length === 0 ? (
        <p>No hay mercados disponibles.</p>
      ) : (
        <ul>
          {markets.map((m) => (
            <li key={m.id}>{m.question} ({m.state})</li>
          ))}
        </ul>
      )}

      <h2>Crear mercado</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label>
          Question ID (bytes32 hex):
          <input type="text" name="questionId" value={form.questionId} onChange={handleChange} required />
        </label>
        <label>
          Ancillary data:
          <input type="text" name="ancillaryData" value={form.ancillaryData} onChange={handleChange} required />
        </label>
        <label>
          Número de outcomes:
          <input type="number" name="outcomeSlotCount" value={form.outcomeSlotCount} onChange={handleChange} min="2" max="256" />
        </label>
        <label>
          Fecha fin (UTC):
          <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} required />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear mercado'}
        </button>
      </form>
      {txHash && (
        <p style={{ color: 'green' }}>Mercado creado. TxHash: {txHash}</p>
      )}
      {error && (
        <p style={{ color: 'red' }}>Error: {error}</p>
      )}
    </div>
  );
}