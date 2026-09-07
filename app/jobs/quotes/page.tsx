"use client";
import { useEffect, useState } from "react";
export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Record<string, string>[]>([]);
  useEffect(() => {
 const savedQuotes = JSON.parse(localStorage.getItem("quotes") || "[]");   
 setQuotes(savedQuotes);


}, []);

  return (
    <main style={{ padding: "40px" }}>
      <a href="/jobs">← Back to Jobs</a>
      <h1>Quotes</h1>
      <p>Create and manage customer quotes.</p>
      <a href="/jobs/quotes/new">+ New Quote</a>
      {quotes.map((quote, index) => (
        <div key={index} style={{ border: "1px solid #ccc", padding: "12px", marginBottom: "12px", borderRadius: "8px", maxWidth: "600px", backgroundColor: "#f9f9f9" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "700" }}>{quote.customerName}</h3>
          <p><strong>Park / Site:</strong> {quote.holidayPark}</p>
          <p><strong>Quote Ref:</strong> {quote.quoteReference}</p>
          <p><strong>Description:</strong> {quote.description}</p>
          <p><strong>Amount: £{quote.quoteAmount}</strong></p>
        </div>
        ))}
    </main>
  );
}
