# MwSt-Berechnung (Mehrwertsteuer)

## Übersicht

Das System berechnet automatisch die MwSt (Mehrwertsteuer) für die deutsche Steuerkonformität. Alle Berechnungen folgen dem deutschen Steuerrecht und aktualisieren sich **in Echtzeit**, während Sie tippen.

---

## Formeln

### **Von Bruttobetrag (inkl. MwSt):**

```
net_amount = gross_amount ÷ (1 + vat_rate/100)
vat_amount = gross_amount - net_amount
```

### **Von Nettobetrag (exkl. MwSt):**

```
gross_amount = net_amount × (1 + vat_rate/100)
vat_amount = gross_amount - net_amount
```

---

## Standard-MwSt-Sätze (Deutschland)

- **Standardsatz:** 19% (Standard für die meisten Waren und Dienstleistungen)
- **Ermäßigter Satz:** 7% (Bücher, Lebensmittel, bestimmte Dienstleistungen)
- **Nullsatz:** 0% (Exporte, bestimmte Dienstleistungen)

---

## Beispiele

### **Beispiel 1: Standard 19% MwSt (Von Brutto)**

**Eingabe:**
- Bruttobetrag: €119.00
- MwSt-Satz: 19%

**Berechnung:**
```
Net Amount = €119.00 ÷ 1.19 = €100.00
VAT Amount = €119.00 - €100.00 = €19.00
```

**Überprüfung:**
```
Gross = Net + VAT
€119.00 = €100.00 + €19.00 ✅
```

---

### **Beispiel 2: Ermäßigter 7% MwSt (Von Brutto)**

**Eingabe:**
- Bruttobetrag: €107.00
- MwSt-Satz: 7%

**Berechnung:**
```
Net Amount = €107.00 ÷ 1.07 = €100.00
VAT Amount = €107.00 - €100.00 = €7.00
```

---

### **Beispiel 3: Von Nettobetrag (19%)**

**Eingabe:**
- Nettobetrag: €100.00
- MwSt-Satz: 19%

**Berechnung:**
```
Gross Amount = €100.00 × 1.19 = €119.00
VAT Amount = €119.00 - €100.00 = €19.00
```

---

## Echtzeitberechnung

Das System berechnet die MwSt **automatisch**, während Sie tippen:

- ✅ **Bearbeiten von `gross_amount`** → Berechnet automatisch `net_amount` und `vat_amount`
- ✅ **Bearbeiten von `vat_rate`** → Berechnet automatisch `net_amount` und `vat_amount`
- ✅ **Bearbeiten von `net_amount`** → Berechnet automatisch `gross_amount` und `vat_amount`

**Kein Speichern erforderlich** - Berechnungen aktualisieren sich sofort in der Benutzeroberfläche.

---

## Rundung

- Alle Beträge werden auf **2 Dezimalstellen** gerundet
- Verwendet Standardrundung (0.5 wird aufgerundet)
- Beispiel: €100.005 → €100.01

---

## Verwandte Dokumentation

- [SKR03-Steuerkategorien](./skr03-categories.md) _(in Kürze)_
- [Abzugsfähige Prozentsätze](./deductible-percentages.md) _(in Kürze)_
- [Deutsche Steuerberichte](./german-tax-reporting.md) _(in Kürze)_
- [Finanzberechnungen](../02-financial/calculations.md)

---

**Letzte Aktualisierung:** 2026-01-25  
**Version:** 1.0
