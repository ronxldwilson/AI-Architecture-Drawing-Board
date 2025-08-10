export default async function handler(req, res) {
  const { id } = req.query;
  const url = process.env.BACKEND_URL || 'http://localhost:8000';
  
  try {
    const backendRes = await fetch(`${url}/train/${id}`);
    if (!backendRes.ok) {
      const errorData = await backendRes.json();
      return res.status(backendRes.status).json(errorData);
    }
    const data = await backendRes.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
