# SKR03-Steuerkategorien (Deutsche Buchhaltung)

## Übersicht

SKR03 (Standardkontenrahmen 03) ist der deutsche Standardkontenplan. Jede Ausgabenkategorie hat einen Code und einen abzugsfähigen Prozentsatz für Steuerberichte.

---

## Vollständige Kategorieliste

| Code | Kategoriename | Abzugsfähig % | Beschreibung | Anwendungsfälle |
|------|--------------|--------------|-------------|-----------|
| **4210** | Fahrzeugkosten | 100% | Auto-bezogene Kosten | Kraftstoff, Wartung, Versicherung, Reparaturen |
| **4800** | Verschiedenes | 100% | Standard-Fallback | Nicht spezifizierte Ausgaben, allgemeine Kosten |
| **4890** | Bankgebühren | 100% | Bankkosten | Transaktionsgebühren, Kontogebühren, Überweisungen |
| **4910** | Telefon & Internet | 100% | Kommunikationsdienste | Telefonrechnungen, Internet, Mobilfunkpläne, VoIP |
| **4920** | Büromiete | 100% | Büroraummiete | Büromiete, Arbeitsplatzkosten, Co-Working-Spaces |
| **4930** | Nebenkosten | 100% | Gebäudenebenkosten | Strom, Wasser, Heizung, Gas, Müllentsorgung |
| **4940** | Büromaterial | 100% | Büromaterialien | Schreibwaren, Ausrüstung, Möbel, Vorräte |
| **4960** | Software & Tools | 100% | Softwarekosten | Abonnements, Lizenzen, Cloud-Dienste, Tools |
| **6000** | Personalkosten | 100% | Mitarbeiterlöhne | Gehälter, Löhne, Leistungen, Lohnkosten |
| **6300** | Reisekosten | 100% | Geschäftsreisen | Flüge, Hotels, Mahlzeiten (während der Reise), Transport |
| **6400** | Werbung & Marketing | 100% | Marketingkosten | Anzeigen, Kampagnen, Werbeaktionen, soziale Medien |
| **6805** | Bewirtung & Unterhaltung | **70%** ⚠️ | Geschäftsmahlzeiten | Restaurant, Catering, Veranstaltungen, Kundenunterhaltung |
| **6825** | Schulung & Bildung | 100% | Lernkosten | Kurse, Schulungen, Bildung, Zertifizierungen |
| **6850** | Recht & Beratung | 100% | Professionelle Dienstleistungen | Rechtsgebühren, Beratung, Buchhaltung, Steuerberatung |

---

## Wichtige Regeln

### **70% Abzugsfähigkeitsregel**

**Kategorie 6805 (Bewirtung & Unterhaltung)** ist nur zu **70% steuerlich absetzbar** nach deutschem Steuerrecht.

**Warum?** Die deutschen Steuerbehörden betrachten Geschäftsmahlzeiten und Unterhaltung als teilweise persönliche Ausgaben, daher können nur 70% vom zu versteuernden Einkommen abgezogen werden.

**Beispiel:**
```
Expense: €100.00 (Geschäftsmahlzeit)
Deductible: €70.00 (70%)
Non-deductible: €30.00 (30%)
```

**Wann zu verwenden:**
- Geschäftsessen mit Kunden
- Firmenabendessen
- Catering für Veranstaltungen
- Kundenunterhaltungskosten

---

### **100% Abzugsfähig**

Alle anderen Kategorien sind **100% steuerlich absetzbar**. Der volle Ausgabenbetrag kann vom zu versteuernden Einkommen abgezogen werden.

**Beispiel:**
```
Expense: €100.00 (Büromaterial)
Deductible: €100.00 (100%)
Non-deductible: €0.00
```

---

## Anwendungsbeispiele

### **Beispiel 1: Büromiete (4920)**
```
Expense: €1,200.00/Monat Büromiete
Category: 4920 - Office Rent
Deductible: 100% (€1,200.00)
Use Case: Monatliche Büroraummietzahlung
```

### **Beispiel 2: Geschäftsmahlzeit (6805)**
```
Expense: €150.00 Kundenessen
Category: 6805 - Meal & Entertainment
Deductible: 70% (€105.00)
Non-deductible: 30% (€45.00)
Use Case: Geschäftsessen mit potenziellem Kunden
```

### **Beispiel 3: Software-Abonnement (4960)**
```
Expense: €29.99/Monat Cloud-Service
Category: 4960 - Software & Tools
Deductible: 100% (€29.99)
Use Case: Monatliches Abonnement für Projektmanagement-Tool
```

### **Beispiel 4: Reisekosten (6300)**
```
Expense: €450.00 Flug + €120.00 Hotel
Category: 6300 - Travel Expenses
Deductible: 100% (€570.00)
Use Case: Geschäftsreise zur Teilnahme an einer Konferenz
```

### **Beispiel 5: Bankgebühren (4890)**
```
Expense: €5.00 Überweisungsgebühr
Category: 4890 - Bank Fees
Deductible: 100% (€5.00)
Use Case: Internationale Zahlungsbearbeitungsgebühr
```

---

## Automatische Zuweisung

Wenn Sie eine Kategorie im Ausgabenformular auswählen:

- ✅ System weist automatisch SKR03-Code zu
- ✅ System setzt automatisch abzugsfähigen Prozentsatz
- ✅ Keine manuelle Eingabe erforderlich

**Beispiel:**
```
User selects: "Meal & Entertainment"
System assigns:
  - tax_category_code: "6805"
  - deductible_percentage: 70.00
```

---

## Kategorieauswahl-Tipps

### **Wählen Sie die richtige Kategorie:**

1. **Bewirtung & Unterhaltung (6805)** - Nur für Geschäftsmahlzeiten und Kundenunterhaltung
2. **Reisekosten (6300)** - Für Mahlzeiten während Geschäftsreisen (100% abzugsfähig)
3. **Büromaterial (4940)** - Für physische Büromaterialien
4. **Software & Tools (4960)** - Für digitale Tools und Abonnements
5. **Verschiedenes (4800)** - Nur verwenden, wenn keine andere Kategorie passt

---

## Verwandte Dokumentation

- [MwSt-Berechnung](./vat-calculation.md)
- [Abzugsfähige Prozentsätze](./deductible-percentages.md) _(in Kürze)_
- [Deutsche Steuerberichte](./german-tax-reporting.md) _(in Kürze)_
- [Finanzberechnungen](../02-financial/calculations.md)

---

**Letzte Aktualisierung:** 2026-01-25  
**Version:** 1.0
