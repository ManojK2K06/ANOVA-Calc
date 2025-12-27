"use client";
import { useState } from "react";

export default function EggshellAnova() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("");
  const [axis, setAxis] = useState("cols");
  const [dims, setDims] = useState({ rows: 2, cols: 2 });
  const [grid, setGrid] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const calculate = async () => {
    setError("");
    const payload = [];
    for (let r = 0; r < dims.rows; r++) {
      for (let c = 0; c < dims.cols; c++) {
        const val = grid[`${r}-${c}`];
        if (!val) {
          setError("Please fill all cells.");
          return;
        }
        payload.push({ row: r, col: c, value: val });
      }
    }
    try {
      const res = await fetch("http://127.0.0.1:8000/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, axis, data: payload }),
      });
      const json = await res.json();
      if (json.error) setError(json.error);
      else {
        setResults(json);
        setStep(4);
      }
    } catch {
      setError("Backend Connection Failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-slate-800 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50">
        {/* Step Indicator Dot Navigation */}
        <div className="flex justify-center gap-2 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s ? "w-8 bg-slate-800" : "w-2 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Selection */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
              <h1 className="text-4xl font-light tracking-tight text-slate-900 mb-2">
                Analysis Type
              </h1>
              <p className="text-slate-400 font-medium">
                Choose your statistical model
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => {
                  setType("1way");
                  setStep(2);
                }}
                className="bg-[#F9F8F1] border border-slate-100 p-12 rounded-[2rem] hover:bg-slate-50 transition-all text-center group"
              >
                <div className="text-3xl mb-4 grayscale opacity-60 group-hover:opacity-100 transition">
                  📊
                </div>
                <span className="text-xl font-semibold text-slate-800">
                  1-Way ANOVA
                </span>
              </button>
              <button
                onClick={() => {
                  setType("2way");
                  setStep(2);
                }}
                className="bg-[#F9F8F1] border border-slate-100 p-12 rounded-[2rem] hover:bg-slate-50 transition-all text-center group"
              >
                <div className="text-3xl mb-4 grayscale opacity-60 group-hover:opacity-100 transition">
                  📉
                </div>
                <span className="text-xl font-semibold text-slate-800">
                  2-Way ANOVA
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Dimensions */}
        {step === 2 && (
          <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-light text-center text-slate-900">
              Configure Grid
            </h2>
            {type === "1way" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Analyze difference between:
                </label>
                <select
                  value={axis}
                  onChange={(e) => setAxis(e.target.value)}
                  className="w-full bg-[#F9F8F1] border border-slate-200 p-4 rounded-2xl font-medium outline-none focus:ring-2 ring-slate-100"
                >
                  <option value="cols">Columns (Vertical)</option>
                  <option value="rows">Rows (Horizontal)</option>
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Rows
                </label>
                <input
                  type="number"
                  value={dims.rows}
                  onChange={(e) => setDims({ ...dims, rows: +e.target.value })}
                  className="w-full bg-[#F9F8F1] border border-slate-200 p-4 rounded-2xl text-center font-bold outline-none focus:ring-2 ring-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Columns
                </label>
                <input
                  type="number"
                  value={dims.cols}
                  onChange={(e) => setDims({ ...dims, cols: +e.target.value })}
                  className="w-full bg-[#F9F8F1] border border-slate-200 p-4 rounded-2xl text-center font-bold outline-none focus:ring-2 ring-slate-100"
                />
              </div>
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full bg-slate-800 text-white py-5 rounded-2xl font-bold hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
            >
              Generate Data Grid
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full text-slate-400 font-medium hover:text-slate-600"
            >
              Go Back
            </button>
          </div>
        )}

        {/* Step 3: Input */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="text-center">
              <h2 className="text-2xl font-light text-slate-900">Data Entry</h2>
              <p className="text-slate-400 text-sm italic">
                Separate replicates with commas (e.g. 10.2, 11.5)
              </p>
            </div>
            <div className="overflow-auto border border-slate-100 bg-[#F9F8F1]/50 p-8 rounded-[2rem]">
              <table className="mx-auto border-separate border-spacing-3">
                <tbody>
                  {[...Array(dims.rows)].map((_, r) => (
                    <tr key={r}>
                      {[...Array(dims.cols)].map((_, c) => (
                        <td key={c}>
                          <input
                            placeholder="0"
                            className="w-24 p-3 bg-white border border-slate-200 rounded-xl text-center font-medium focus:ring-2 ring-slate-100 transition-all outline-none"
                            onChange={(e) =>
                              setGrid({
                                ...grid,
                                [`${r}-${c}`]: e.target.value,
                              })
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Back
              </button>
              <button
                onClick={calculate}
                className="flex-[2] bg-slate-800 text-white py-5 rounded-2xl font-bold hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
              >
                Run Calculation
              </button>
            </div>
            {error && (
              <p className="text-center font-bold text-red-400 text-sm">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && results && (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="border-b border-slate-100 pb-6 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-light text-slate-900">
                  Deviation Table
                </h2>
                <p className="text-slate-400 font-medium text-sm">
                  Statistical Summary Matrix
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-slate-100 px-3 py-1 rounded-full text-slate-500">
                Standard Report
              </span>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-[#F9F8F1] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4 text-left">Source</th>
                    <th>SS</th>
                    <th>DF</th>
                    <th>MS</th>
                    <th>F-Ratio</th>
                    <th>P-Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.results.map((res: any, i: number) => (
                    <tr
                      key={i}
                      className={
                        res.source === "TOTAL" ? "bg-[#F9F8F1] font-bold" : ""
                      }
                    >
                      <td className="p-4 font-semibold text-slate-700">
                        {res.source}
                      </td>
                      <td className="text-center text-slate-500">{res.ss}</td>
                      <td className="text-center text-slate-500">{res.df}</td>
                      <td className="text-center text-slate-500">{res.ms}</td>
                      <td className="text-center font-bold text-slate-900">
                        {res.f}
                      </td>
                      <td className="text-center font-medium text-slate-400 italic">
                        {res.p}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Diagrams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#F9F8F1] rounded-[2rem] p-8 space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Mean Comparison
                </h3>
                <div className="flex items-end gap-6 h-40 px-4 border-b border-slate-200">
                  {results.chartData.map((d: any, i: number) => (
                    <div
                      key={i}
                      className="flex-1 bg-slate-800 rounded-t-xl transition-all hover:bg-slate-600"
                      style={{
                        height: `${
                          (d.mean /
                            Math.max(
                              ...results.chartData.map((x: any) => x.max)
                            )) *
                          100
                        }%`,
                      }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between px-4 text-[10px] font-bold text-slate-300">
                  {results.chartData.map((d: any, i: number) => (
                    <span key={i}>{d.group}</span>
                  ))}
                </div>
              </div>

              <div className="bg-[#F9F8F1] rounded-[2rem] p-8 flex flex-col justify-center items-center text-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
                  Statistical Inference
                </h3>
                <div
                  className={`text-5xl font-light mb-4 ${
                    results.results[0].sig05 === "Rejected"
                      ? "text-slate-900"
                      : "text-slate-300"
                  }`}
                >
                  {results.results[0].sig05 === "Rejected"
                    ? "Significant"
                    : "Insignificant"}
                </div>
                <div className="h-px w-12 bg-slate-200 mb-4" />
                <p className="text-xs leading-relaxed text-slate-400 font-medium px-4">
                  {results.results[0].sig05 === "Rejected"
                    ? "The calculated F-ratio exceeds the critical threshold. There is strong evidence of variance between groups."
                    : "The calculated F-ratio falls below the critical threshold. Variance observed is likely due to chance."}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setResults(null);
                setGrid({});
              }}
              className="w-full bg-slate-100 text-slate-600 py-5 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Start New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
