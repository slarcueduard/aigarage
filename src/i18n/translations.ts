// Romanian/English/German UI translations for AI Garage OS
// Usage: t('key', lang) or use the useLang() hook

type Lang = 'ro' | 'en' | 'de';

const translations = {
    // ─── Navigation ──────────────────────────────────────────────────────────────
    nav_home: { ro: 'Acasă', en: 'Home', de: 'Start' },
    nav_diagnosis: { ro: 'Diagnostic', en: 'Diagnosis', de: 'Diagnose' },
    nav_jobs: { ro: 'Lucrări', en: 'Jobs', de: 'Aufträge' },
    nav_invoice: { ro: 'Facturi', en: 'Invoices', de: 'Rechnungen' },
    nav_dashboard: { ro: 'Rapoarte', en: 'Dashboard', de: 'Dashboard' },
    nav_settings: { ro: 'Setări', en: 'Settings', de: 'Einstellungen' },

    // ─── Home Screen ──────────────────────────────────────────────────────────────
    home_new_diagnosis: { ro: 'Diagnostic Nou', en: 'New Diagnosis', de: 'Neue Diagnose' },
    home_past_jobs: { ro: 'Lucrări Anterioare', en: 'Past Jobs', de: 'Vergangene Aufträge' },
    home_generate_invoice: { ro: 'Generează Factură', en: 'Generate Invoice', de: 'Rechnung erstellen' },
    home_settings: { ro: 'Setări Service', en: 'Garage Settings', de: 'Werkstatt-Einstellungen' },
    home_greeting: { ro: 'Bună ziua', en: 'Good day', de: 'Guten Tag' },
    home_jobs_today: { ro: 'lucrări azi', en: 'jobs today', de: 'Aufträge heute' },
    home_recent_jobs: { ro: 'Ultimele lucrări', en: 'Recent jobs', de: 'Letzte Aufträge' },
    home_no_jobs: { ro: 'Nicio lucrare salvată', en: 'No jobs saved yet', de: 'Noch keine Aufträge' },

    // ─── Diagnosis Screen ─────────────────────────────────────────────────────────
    diag_title: { ro: 'Diagnostic Nou', en: 'New Diagnosis', de: 'Neue Diagnose' },
    diag_vin_label: { ro: 'Serie VIN sau Număr de înmatriculare', en: 'VIN or License Plate', de: 'VIN oder Kennzeichen' },
    diag_vin_placeholder: { ro: 'ex: WBA3A5G59DNP... sau B-123-ABC', en: 'ex: WBA3A5G59DNP... or B-123-ABC', de: 'z.B.: WBA3A5G59DNP... oder B-AB-1234' },
    diag_mileage_label: { ro: 'Kilometraj', en: 'Mileage', de: 'Kilometerstand' },
    diag_mileage_placeholder: { ro: 'ex: 145000', en: 'ex: 145000', de: 'z.B.: 145000' },
    diag_dtc_label: { ro: 'Cod DTC (opțional)', en: 'DTC Code (optional)', de: 'DTC-Code (optional)' },
    diag_dtc_placeholder: { ro: 'ex: P0171', en: 'ex: P0171', de: 'z.B.: P0171' },
    diag_symptoms_label: { ro: 'Sau selectează simptomele:', en: 'Or select symptoms:', de: 'Oder Symptome auswählen:' },
    diag_run_button: { ro: '🔍 Rulează Diagnostic', en: '🔍 Run Diagnosis', de: '🔍 Diagnose starten' },
    diag_vehicle_detected: { ro: 'Vehicul identificat:', en: 'Vehicle detected:', de: 'Fahrzeug erkannt:' },
    diag_manual_entry: { ro: 'Introducere manuală', en: 'Manual entry', de: 'Manuelle Eingabe' },
    diag_brand_label: { ro: 'Marcă', en: 'Brand', de: 'Marke' },
    diag_model_label: { ro: 'Model', en: 'Model', de: 'Modell' },
    diag_engine_label: { ro: 'Motor', en: 'Engine', de: 'Motor' },
    diag_year_label: { ro: 'An fabricație', en: 'Year', de: 'Baujahr' },
    diag_select_brand: { ro: 'Selectează marca', en: 'Select brand', de: 'Marke auswählen' },

    // ─── Diagnostic Result ────────────────────────────────────────────────────────
    result_title: { ro: 'Rezultat Diagnostic', en: 'Diagnostic Result', de: 'Diagnoseergebnis' },
    result_causes: { ro: 'Cauze posibile', en: 'Possible Causes', de: 'Mögliche Ursachen' },
    result_check_first: { ro: 'Verifică primul:', en: 'Check first:', de: 'Zuerst prüfen:' },
    result_est_time: { ro: 'Timp estimat:', en: 'Estimated time:', de: 'Geschätzte Zeit:' },
    result_confidence: { ro: 'Încredere diagnostic:', en: 'Diagnostic confidence:', de: 'Diagnose-Konfidenz:' },
    result_checked_ok: { ro: '✓ Verificat — OK', en: '✓ Checked — OK', de: '✓ Geprüft — OK' },
    result_checked_notok: { ro: '✗ Verificat — Defect', en: '✗ Checked — Defective', de: '✗ Geprüft — Defekt' },
    result_confirm_cause: { ro: '✔ Confirmă această cauză și salvează lucrarea', en: '✔ Confirm cause & save job', de: '✔ Ursache bestätigen & Auftrag speichern' },
    result_view_parts: { ro: 'Piesele necesare', en: 'Required parts', de: 'Benötigte Teile' },
    result_minutes: { ro: 'min', en: 'min', de: 'Min.' },

    // ─── Parts Screen ─────────────────────────────────────────────────────────────
    parts_title: { ro: 'Piese disponibile', en: 'Available Parts', de: 'Verfügbare Teile' },
    parts_sort_cheapest: { ro: 'Cel mai ieftin', en: 'Cheapest', de: 'Günstigste' },
    parts_sort_fastest: { ro: 'Livrare rapidă', en: 'Fastest delivery', de: 'Schnellste Lieferung' },
    parts_sort_brand: { ro: 'Marcă', en: 'Brand', de: 'Marke' },
    parts_add_to_job: { ro: 'Adaugă la lucrare', en: 'Add to job', de: 'Zum Auftrag hinzufügen' },
    parts_added: { ro: 'Adăugat ✓', en: 'Added ✓', de: 'Hinzugefügt ✓' },
    parts_call: { ro: 'Sună', en: 'Call', de: 'Anrufen' },
    parts_delivery: { ro: 'Livrare:', en: 'Delivery:', de: 'Lieferung:' },
    parts_days: { ro: 'zile', en: 'days', de: 'Tage' },
    parts_in_stock: { ro: 'Stoc', en: 'In Stock', de: 'Auf Lager' },
    parts_on_order: { ro: 'Comandă', en: 'On Order', de: 'Bestellung' },
    parts_unavailable: { ro: 'Indisponibil', en: 'Unavailable', de: 'Nicht verfügbar' },
    parts_no_results: { ro: 'Nu s-au găsit piese potrivite', en: 'No matching parts found', de: 'Keine passenden Teile gefunden' },

    // ─── Job History ─────────────────────────────────────────────────────────────
    jobs_title: { ro: 'Lucrări anterioare', en: 'Job History', de: 'Auftragsverlauf' },
    jobs_search_placeholder: { ro: 'Caută după VIN, marcă, cod DTC, simptom, piesă, client...', en: 'Search by VIN, brand, DTC, symptom, part, customer...', de: 'Suche nach VIN, Marke, DTC, Symptom, Teil, Kunde...' },
    jobs_filter_all: { ro: 'Toate', en: 'All', de: 'Alle' },
    jobs_no_results: { ro: 'Nicio lucrare găsită', en: 'No jobs found', de: 'Keine Aufträge gefunden' },
    jobs_new: { ro: '+ Lucrare nouă', en: '+ New job', de: '+ Neuer Auftrag' },
    jobs_hours: { ro: 'ore manoperă', en: 'labor hours', de: 'Arbeitsstunden' },
    jobs_status_diagnostic: { ro: 'Diagnostic', en: 'Diagnosis', de: 'Diagnose' },
    jobs_status_in_lucru: { ro: 'În lucru', en: 'In progress', de: 'In Bearbeitung' },
    jobs_status_finalizat: { ro: 'Finalizat', en: 'Completed', de: 'Abgeschlossen' },

    // ─── Invoice ─────────────────────────────────────────────────────────────────
    inv_title: { ro: 'Factură', en: 'Invoice', de: 'Rechnung' },
    inv_number: { ro: 'Număr factură', en: 'Invoice number', de: 'Rechnungsnummer' },
    inv_date: { ro: 'Data', en: 'Date', de: 'Datum' },
    inv_garage_info: { ro: 'Informații service', en: 'Garage info', de: 'Werkstatt-Info' },
    inv_customer_info: { ro: 'Date client', en: 'Customer info', de: 'Kundendaten' },
    inv_vehicle_info: { ro: 'Vehicul', en: 'Vehicle', de: 'Fahrzeug' },
    inv_line_items: { ro: 'Produse și servicii', en: 'Items & services', de: 'Artikel & Leistungen' },
    inv_subtotal: { ro: 'Subtotal', en: 'Subtotal', de: 'Zwischensumme' },
    inv_vat: { ro: 'TVA', en: 'VAT', de: 'MwSt.' },
    inv_total: { ro: 'TOTAL', en: 'TOTAL', de: 'GESAMT' },
    inv_add_line: { ro: '+ Adaugă linie', en: '+ Add line', de: '+ Zeile hinzufügen' },
    inv_export_pdf: { ro: '📄 Exportă PDF', en: '📄 Export PDF', de: '📄 PDF exportieren' },
    inv_print: { ro: '🖨 Printează', en: '🖨 Print', de: '🖨 Drucken' },
    inv_status_ciorna: { ro: 'Ciornă', en: 'Draft', de: 'Entwurf' },
    inv_status_trimisa: { ro: 'Trimisă', en: 'Sent', de: 'Gesendet' },
    inv_status_platita: { ro: 'Plătită ✓', en: 'Paid ✓', de: 'Bezahlt ✓' },
    inv_mark_paid: { ro: 'Marchează ca plătită', en: 'Mark as Paid', de: 'Als bezahlt markieren' },
    inv_description: { ro: 'Descriere', en: 'Description', de: 'Beschreibung' },
    inv_qty: { ro: 'Cant.', en: 'Qty', de: 'Anz.' },
    inv_unit_price: { ro: 'Preț/u', en: 'Unit price', de: 'Einzelpreis' },
    inv_amount: { ro: 'Total', en: 'Amount', de: 'Betrag' },
    inv_manopera: { ro: 'Manoperă', en: 'Labor', de: 'Arbeitskosten' },
    inv_notes: { ro: 'Notițe', en: 'Notes', de: 'Notizen' },
    inv_discount: { ro: 'Reducere', en: 'Discount', de: 'Rabatt' },

    // ─── Dashboard ────────────────────────────────────────────────────────────────
    dash_title: { ro: 'Rapoarte', en: 'Dashboard', de: 'Dashboard' },
    dash_this_month: { ro: 'Luna aceasta', en: 'This month', de: 'Diesen Monat' },
    dash_jobs: { ro: 'Lucrări', en: 'Jobs', de: 'Aufträge' },
    dash_revenue: { ro: 'Venituri', en: 'Revenue', de: 'Umsatz' },
    dash_avg_value: { ro: 'Valoare medie', en: 'Avg. job value', de: 'Ø Auftragswert' },
    dash_top_dtcs: { ro: 'Top coduri DTC', en: 'Top DTC codes', de: 'Top DTC-Codes' },
    dash_top_brands: { ro: 'Mărci frecvente', en: 'Top brands', de: 'Häufigste Marken' },
    dash_pro_mode: { ro: 'Mod Avansat', en: 'Pro Mode', de: 'Profi-Modus' },
    dash_pro_desc: { ro: 'Instrumente avansate de diagnostic', en: 'Advanced diagnostic tools', de: 'Erweiterte Diagnose-Tools' },

    // ─── Settings ─────────────────────────────────────────────────────────────────
    settings_title: { ro: 'Setări Service', en: 'Garage Settings', de: 'Werkstatt-Einstellungen' },
    settings_name: { ro: 'Numele service-ului', en: 'Garage name', de: 'Werkstattname' },
    settings_address: { ro: 'Adresă', en: 'Address', de: 'Adresse' },
    settings_phone: { ro: 'Telefon', en: 'Phone', de: 'Telefon' },
    settings_email: { ro: 'Email', en: 'Email', de: 'E-Mail' },
    settings_vat: { ro: 'CUI (Cod fiscal)', en: 'VAT number', de: 'USt-IdNr.' },
    settings_tradenum: { ro: 'Nr. Registru Comerț', en: 'Trade reg. number', de: 'Handelsreg.-Nr.' },
    settings_labor_rate: { ro: 'Tarif manoperă (RON/h)', en: 'Labor rate (RON/h)', de: 'Stundensatz (RON/h)' },
    settings_currency: { ro: 'Monedă implicită', en: 'Default currency', de: 'Standardwährung' },
    settings_language: { ro: 'Limbă interfață', en: 'Interface language', de: 'Oberflächensprache' },
    settings_save: { ro: 'Salvează setările', en: 'Save settings', de: 'Einstellungen speichern' },
    settings_saved: { ro: 'Salvat ✓', en: 'Saved ✓', de: 'Gespeichert ✓' },
    settings_danger_zone: { ro: 'Zonă de risc', en: 'Danger zone', de: 'Gefahrenzone' },
    settings_clear_data: { ro: 'Șterge toate datele', en: 'Clear all data', de: 'Alle Daten löschen' },
    settings_clear_confirm: { ro: 'Ești sigur? Datele NU pot fi recuperate!', en: 'Are you sure? Data CANNOT be recovered!', de: 'Sicher? Daten können NICHT wiederhergestellt werden!' },
    settings_logo: { ro: 'Logo service', en: 'Garage logo', de: 'Werkstatt-Logo' },

    // ─── Common ───────────────────────────────────────────────────────────────────
    common_back: { ro: '← Înapoi', en: '← Back', de: '← Zurück' },
    common_save: { ro: 'Salvează', en: 'Save', de: 'Speichern' },
    common_cancel: { ro: 'Anulează', en: 'Cancel', de: 'Abbrechen' },
    common_delete: { ro: 'Șterge', en: 'Delete', de: 'Löschen' },
    common_edit: { ro: 'Editează', en: 'Edit', de: 'Bearbeiten' },
    common_search: { ro: 'Caută...', en: 'Search...', de: 'Suchen...' },
    common_loading: { ro: 'Se procesează...', en: 'Processing...', de: 'Wird verarbeitet...' },
    common_customer_name: { ro: 'Numele clientului', en: 'Customer name', de: 'Kundenname' },
    common_customer_phone: { ro: 'Telefon client', en: 'Customer phone', de: 'Kundentelefon' },
    common_notes: { ro: 'Notițe', en: 'Notes', de: 'Notizen' },
    common_km: { ro: 'km', en: 'km', de: 'km' },
    common_hour_abbr: { ro: 'h', en: 'h', de: 'Std.' },
    common_ron: { ro: 'RON', en: 'RON', de: 'RON' },
    common_eur: { ro: 'EUR', en: 'EUR', de: 'EUR' },
    common_optional: { ro: '(opțional)', en: '(optional)', de: '(optional)' },
    common_generate_invoice: { ro: '🧾 Generează Factură', en: '🧾 Generate Invoice', de: '🧾 Rechnung erstellen' },
    common_confirmed_cause: { ro: 'Cauza confirmată', en: 'Confirmed cause', de: 'Bestätigte Ursache' },
    common_parts_used: { ro: 'PieȘe utilizate', en: 'Parts used', de: 'Verwendete Teile' },
    common_new_diagnosis: { ro: '+ Diagnostic Nou', en: '+ New Diagnosis', de: '+ Neue Diagnose' },
} as const;

type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
    const entry = translations[key];
    if (!entry) return key;
    return (entry as Record<string, string>)[lang] ?? entry['en'];
}

export type { Lang, TranslationKey };
export { translations };
