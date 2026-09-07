"use client";
import { useState } from "react";
export default function NewQuotePage() {
  const [customerName, setCustomerName] = useState("");
  const [holidayPark, setHolidayPark] = useState("");
  const [quoteReference, setQuoteReference] = useState("");
  const [description, setDescription] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");
  function handleSave() {
    const quote = { customerName, holidayPark, quoteReference, description, quoteAmount };
    const existingQuotes = JSON.parse(localStorage.getItem("quotes") || "[]");
    localStorage.setItem("quotes", JSON.stringify([...existingQuotes, quote]));
    alert("Quote saved");


}

  return (
    <main style={{ padding: "40px" }}>
      <a href="/jobs/quotes">← Back to Quotes</a>

      <h1>New Quote</h1>
      <p>Create a new customer quote.</p>
      <label>Customer Name</label>
      <input
  type="text"     
  value={customerName}
  onChange={(e) => setCustomerName(e.target.value)}
  style={{
    display: "block",
    marginTop: "8px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "300px",
  }}
/>
<label>Holiday Park / Site</label>
<input
  type="text"
  value={holidayPark}
  onChange={(e) => setHolidayPark(e.target.value)}
  style={{
    display: "block",
    marginTop: "8px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "300px",
  }}
/>

<label>Quote Reference</label>

<input
  type="text"
  value={quoteReference}
  onChange={(e) => setQuoteReference(e.target.value)}
  
  style={{
    display: "block",
    marginTop: "8px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "300px",
  }}
/>
<label>Description</label>
<textarea
  rows={4}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  style={{
    display: "block",
    marginTop: "8px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "300px",
  }}
/>
<label>Quote Amount (£)</label>
<input
  type="number"
  step="0.01"
  value={quoteAmount}
  onChange={(e) => setQuoteAmount(e.target.value)}
  style={{
    display: "block",
    marginTop: "8px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "300px",
  }}
/>

<button
  style={{
    display: "block",
    marginTop: "16px",
    padding: "10px 18px",
    border: "1px solid #ccc",
    backgroundColor: "#111827",
    color:"white" ,
    borderRadius: "6px",
    cursor: "pointer",
  }}
 onClick={handleSave}
>
  Save Quote
</button>

    </main>
  );
}
