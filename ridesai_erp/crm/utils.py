import pandas as pd

COLUMN_ALIASES = {
    "full_name": ["name", "full name", "full_name", "customer name", "client name"],
    "email": ["email", "email address", "e-mail"],
    "phone": ["phone", "phone number", "mobile", "contact", "contact number"],
    "business_name": ["company", "business", "business name", "company name"],
    "location": ["location", "city", "address"],
    "category": ["category", "industry", "business category", "sector"],
    "company_size": ["company size", "size", "employees", "no of employees"],
}


def detect_columns(df):
    mapping = {}
    normalized_cols = {str(c).strip().lower(): c for c in df.columns}
    for field, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if alias in normalized_cols:
                mapping[field] = normalized_cols[alias]
                break
    return mapping


def read_leads_file(file):
    filename = file.name.lower()
    if filename.endswith(".csv"):
        df = pd.read_csv(file)
    else:
        df = pd.read_excel(file)
    return df.dropna(how="all")


def is_valid_row(row_data):
    if not row_data.get("full_name"):
        return False
    if not row_data.get("email") and not row_data.get("phone"):
        return False
    return True