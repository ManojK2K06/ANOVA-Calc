from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import statsmodels.api as sm
from statsmodels.formula.api import ols

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnovaRequest(BaseModel):
    type: str 
    axis: str 
    data: list

@app.post("/calculate")
async def calculate_anova(req: AnovaRequest):
    try:
        all_points = []
        for entry in req.data:
            values = str(entry['value']).split(',')
            for v in values:
                if v.strip():
                    all_points.append({"row": entry['row'], "col": entry['col'], "value": float(v.strip())})
        
        df = pd.DataFrame(all_points)
        if df.empty: return {"error": "No data provided."}

        if req.type == "1way":
            target_factor = 'row' if req.axis == 'rows' else 'col'
            formula = f'value ~ C({target_factor})'
            model = ols(formula, data=df).fit()
            table = sm.stats.anova_lm(model, typ=2)
            sources = [(f'Between {req.axis.capitalize()}', f'C({target_factor})'), ('Within Groups (Error)', 'Residual')]
        else:
            has_replicates = df.groupby(['row', 'col']).size().min() > 1
            if has_replicates:
                model = ols('value ~ C(row) + C(col) + C(row):C(col)', data=df).fit()
                sources = [('Rows', 'C(row)'), ('Cols', 'C(col)'), ('Interaction', 'C(row):C(col)'), ('Error', 'Residual')]
            else:
                model = ols('value ~ C(row) + C(col)', data=df).fit()
                sources = [('Rows', 'C(row)'), ('Cols', 'C(col)'), ('Error', 'Residual')]
            table = sm.stats.anova_lm(model, typ=2)

        output = []
        total_ss, total_df = 0, 0
        for label, key in sources:
            ss, df_v = table.loc[key, 'sum_sq'], table.loc[key, 'df']
            ms = table.loc[key, 'mean_sq'] if 'mean_sq' in table.columns else (ss/df_v if df_v>0 else 0)
            f_val = table.loc[key, 'F'] if 'F' in table.columns and not pd.isna(table.loc[key, 'F']) else None
            p_val = table.loc[key, 'PR(>F)'] if 'PR(>F)' in table.columns and not pd.isna(table.loc[key, 'PR(>F)']) else None
            total_ss += ss
            total_df += df_v
            output.append({
                "source": label, "ss": round(ss, 4), "df": int(df_v), "ms": round(ms, 4) if ms != 0 else "—",
                "f": round(f_val, 4) if f_val is not None else "—",
                "p": round(p_val, 4) if p_val is not None else "—",
                "sig05": "Rejected" if p_val is not None and p_val < 0.05 else "Accepted" if p_val is not None else "—"
            })
        
        output.append({"source": "TOTAL", "ss": round(total_ss, 4), "df": int(total_df), "ms": "—", "f": "—", "p": "—", "sig05": "—"})
        
        chart_data = []
        group_key = 'row' if (req.type == '1way' and req.axis == 'rows') else 'col'
        for g in df[group_key].unique():
            vals = df[df[group_key] == g]['value'].tolist()
            chart_data.append({"group": f"G{int(g)+1}", "mean": np.mean(vals), "max": np.max(vals)})

        return {"results": output, "chartData": chart_data}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)