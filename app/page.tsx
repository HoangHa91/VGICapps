"use client";

import { useState, useEffect } from "react";

type Expert = {
  name: string;
  title: string;
  country: string;
  domain: string;
  expertise: string;
  organization: string;
  email: string;
  website: string;
};

function getUniqueValues(data: Expert[], key: keyof Expert) {
  return Array.from(new Set(data.map((item) => item[key]).filter(Boolean))).sort();
}

export default function Home() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filtered, setFiltered] = useState<Expert[]>([]);
  const [filters, setFilters] = useState({
    country: "",
    domain: "",
    expertise: "",
    title: "",
    search: ""
  });

  useEffect(() => {
    fetch("/experts.json")
      .then((res) => res.json())
      .then((data) => {
        setExperts(data);
        setFiltered(data);
      });
  }, []);

  useEffect(() => {
    const result = experts.filter((e) =>
      (!filters.country || e.country === filters.country) &&
      (!filters.domain || e.domain?.includes(filters.domain)) &&
      (!filters.expertise || e.expertise?.includes(filters.expertise)) &&
      (!filters.title || e.title?.includes(filters.title)) &&
      (!filters.search || 
        e.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        e.organization.toLowerCase().includes(filters.search.toLowerCase()))
    );
    setFiltered(result);
  }, [filters, experts]);

  const handleChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered_experts.json";
    a.click();
  };

  const countries = getUniqueValues(experts, "country");
  const domains = getUniqueValues(experts, "domain");
  const expertises = getUniqueValues(experts, "expertise");
  const titles = getUniqueValues(experts, "title");

  return (
    <main className="p-4 max-w-6xl mx-auto space-y-4 font-sans">
      <h1 className="text-xl font-bold">Expert Lookup</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <select onChange={(e) => handleChange("country", e.target.value)} value={filters.country}>
          <option value="">All Countries</option>
          {countries.map(c => <option key={c}>{c}</option>)}
        </select>

        <select onChange={(e) => handleChange("domain", e.target.value)} value={filters.domain}>
          <option value="">All Domains</option>
          {domains.map(d => <option key={d}>{d}</option>)}
        </select>

        <select onChange={(e) => handleChange("expertise", e.target.value)} value={filters.expertise}>
          <option value="">All Expertises</option>
          {expertises.map(e => <option key={e}>{e}</option>)}
        </select>

        <select onChange={(e) => handleChange("title", e.target.value)} value={filters.title}>
          <option value="">All Titles</option>
          {titles.map(t => <option key={t}>{t}</option>)}
        </select>

        <input
          placeholder="Search by name/org"
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
        />
      </div>

      <div className="text-sm text-gray-600">{filtered.length} results found</div>

      <div className="grid gap-3">
        {filtered.map((e, i) => (
          <div key={i} className="border p-4 rounded shadow">
            <div className="font-semibold text-lg">{e.name}</div>
            <div>{e.title} @ {e.organization}</div>
            <div className="text-sm text-gray-600">{e.country}</div>
            <div className="text-sm">Domain: {e.domain}</div>
            <div className="text-sm">Expertise: {e.expertise}</div>
            {e.email && <div className="text-sm">Email: {e.email}</div>}
            {e.website && <div className="text-sm">Website: <a href={e.website} className="text-blue-500 underline" target="_blank">{e.website}</a></div>}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={downloadJSON} className="mt-2 px-4 py-2 border rounded bg-white hover:bg-gray-100">
          Export JSON
        </button>
      </div>
    </main>
  );
}
