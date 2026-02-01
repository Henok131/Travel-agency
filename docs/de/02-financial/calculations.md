# Finanzberechnungen & Formeln

## Übersicht

Dieses Dokument erklärt alle Finanzberechnungen, die im LST Travel-System verwendet werden. Alle Formeln werden **automatisch in Echtzeit** berechnet, während Sie Daten eingeben. Keine manuelle Berechnung erforderlich.

---

## Inhaltsverzeichnis

1. [Gesamter Ticketpreis](#total-ticket-price)
2. [Gesamte Visagebühren](#total-visa-fees)
3. [Gesamte Kundenzahlung](#total-customer-payment)
4. [Gesamter fälliger Betrag](#total-amount-due)
5. [Zahlungsbilanz](#payment-balance)
6. [LST Gewinn](#lst-profit)
7. [Berechnungsabhängigkeiten](#calculation-dependencies)
8. [Beispiele](#examples)
9. [Rundungsregeln](#rounding-rules)
10. [Sonderfälle](#edge-cases)

---

## Gesamter Ticketpreis

**Formel:**
```
total_ticket_price = airlines_price + service_fee
```

**Komponenten:**
- `airlines_price`: Grundpreis der Fluggesellschaft (manuelle Eingabe)
- `service_fee`: Service-Ticket für den Kunden (manuelle Eingabe)

**Berechnungslogik:**
- ✅ Echtzeitberechnung während der Bearbeitung
- ✅ Speichert automatisch in der Datenbank, wenn sich Komponenten ändern
- ✅ Anzeige mit 2 Dezimalstellen
- ✅ Zeigt `-` an, wenn Ergebnis = 0

**Beispiel:**
```
Airlines Price: €500.00
Service Ticket:   €50.00
─────────────────────
Total Ticket:  €550.00
```

**Praxisbeispiel:**
- Kunde bucht einen Flug von Frankfurt nach London
- Fluggesellschaft berechnet: €500.00
- LST Servicegebühr: €50.00
- **Gesamter Ticketpreis: €550.00**

**Verwandt:**
- [Gesamter fälliger Betrag](#total-amount-due) - Verwendet total_ticket_price
- [LST Gewinn](#lst-profit) - Verwendet service_fee

---

## Gesamte Visagebühren

**Formel:**
```
tot_visa_fees = visa_price + service_visa
```

**Komponenten:**
- `visa_price`: Grundpreis für Visum (manuelle Eingabe)
- `service_visa`: Servicegebühr für Visumsbearbeitung (manuelle Eingabe)

**Berechnungslogik:**
- ✅ Echtzeitberechnung während der Bearbeitung
- ✅ Speichert automatisch in der Datenbank, wenn sich Komponenten ändern
- ✅ Anzeige mit 2 Dezimalstellen
- ✅ Zeigt `-` an, wenn Ergebnis = 0

**Beispiel:**
```
Visa Price:    €80.00
Service Visa:  €20.00
─────────────────────
Total Visa:    €100.00
```

**Praxisbeispiel:**
- Kunde benötigt ein UK-Visum
- Visumsantragsgebühr: €80.00
- LST Visumsbearbeitungs-Servicegebühr: €20.00
- **Gesamte Visagebühren: €100.00**

**Verwandt:**
- [Gesamter fälliger Betrag](#total-amount-due) - Verwendet tot_visa_fees
- [LST Gewinn](#lst-profit) - Verwendet service_visa

---

## Gesamte Kundenzahlung

**Formel:**
```
total_customer_payment = cash_paid + bank_transfer
```

**Komponenten:**
- `cash_paid`: Bar bezahlter Betrag (manuelle Eingabe)
- `bank_transfer`: Per Überweisung bezahlter Betrag (manuelle Eingabe)

**Berechnungslogik:**
- ✅ Echtzeitberechnung während der Bearbeitung
- ✅ Speichert automatisch in der Datenbank, wenn sich Komponenten ändern
- ✅ Anzeige mit 2 Dezimalstellen
- ✅ Zeigt `-` an, wenn Ergebnis = 0

**Beispiel:**
```
Cash Paid:        €200.00
Bank Transfer:    €450.00
─────────────────────────
Total Payment:    €650.00
```

**Praxisbeispiel:**
- Kunde zahlt teilweise bar: €200.00
- Kunde zahlt Rest per Überweisung: €450.00
- **Gesamte Kundenzahlung: €650.00**

**Verwandt:**
- [Zahlungsbilanz](#payment-balance) - Verwendet total_customer_payment

---

## Gesamter fälliger Betrag

**Formel:**
```
total_amount_due = total_ticket_price + tot_visa_fees
```

**Erweiterte Formel:**
```
total_amount_due = (airlines_price + service_fee) + (visa_price + service_visa)
```

**Visueller Indikator:**
- 🟠 **Orange/gelber Hintergrund** in der Benutzeroberfläche (leicht zu erkennen)

**Berechnungslogik:**
- ✅ Echtzeitberechnung während der Bearbeitung
- ✅ Speichert automatisch in der Datenbank, wenn sich Komponenten ändern
- ✅ Anzeige mit 2 Dezimalstellen
- ✅ Zeigt `-` an, wenn Ergebnis = 0

**Beispiel:**
```
Total Ticket Price: €550.00
Total Visa Fees:    €100.00
────────────────────────────
Total Amount Due:  €650.00
```

**Praxisbeispiel:**
- Kunde bucht Flug (€550.00) + Visum (€100.00)
- **Gesamter fälliger Betrag: €650.00**

**Verwandt:**
- [Gesamter Ticketpreis](#total-ticket-price)
- [Gesamte Visagebühren](#total-visa-fees)
- [Zahlungsbilanz](#payment-balance)

---

## Zahlungsbilanz

**Formel:**
```
payment_balance = total_customer_payment - total_amount_due
```

**Anzeigelogik:**
- ✅ **Grüner Hintergrund** wenn Bilanz = 0 (Vollständig bezahlt)
- ⚠️ **Roter Text** wenn Bilanz < 0 (Kunde schuldet Geld)
- 💰 **Blauer Text** wenn Bilanz > 0 (Überbezahlt)

**Wichtig:** Dieses Feld ist **nur zur Anzeige** und wird NICHT in der Datenbank gespeichert. Es wird zur Anzeige dynamisch berechnet.

**Beispielszenarien:**

### Szenario 1: Vollständig bezahlt ✅
```
Total Customer Payment: €650.00
Total Amount Due:        €650.00
────────────────────────────────
Payment Balance:         €0.00 ✅ Fully Paid
```

### Szenario 2: Kunde schuldet ⚠️
```
Total Customer Payment: €500.00
Total Amount Due:        €650.00
────────────────────────────────
Payment Balance:         -€150.00 ⚠️ Customer Owes €150
```

### Szenario 3: Überbezahlt 💰
```
Total Customer Payment: €700.00
Total Amount Due:        €650.00
────────────────────────────────
Payment Balance:         €50.00 💰 Overpaid by €50
```

**Praxisbeispiele:**

**Fall 1: Teilzahlung**
- Kunde zahlt €500.00 im Voraus
- Gesamter fälliger Betrag: €650.00
- **Bilanz: -€150.00** (Kunde schuldet noch €150.00)

**Fall 2: Rückerstattungssituation**
- Kunde zahlte €700.00
- Gesamter fälliger Betrag: €650.00
- **Bilanz: €50.00** (Kunde überbezahlt, Rückerstattung erforderlich)

**Verwandt:**
- [Gesamte Kundenzahlung](#total-customer-payment)
- [Gesamter fälliger Betrag](#total-amount-due)

---

## LST Gewinn

**Formel:**
```
lst_profit = service_fee + service_visa + commission_from_airlines - lst_loan_fee
```

**Komponenten:**
- `service_fee`: Service-Ticket-Einnahmen (positiv)
- `service_visa`: Visum-Servicegebühren-Einnahmen (positiv)
- `commission_from_airlines`: Erhaltene Provision (positiv)
- `lst_loan_fee`: Darlehensgebühren-Abzug (subtrahiert)

**Geschäftslogik:**
- **Positiver Wert:** Gewinn (Einnahmen übersteigen Abzüge)
- **Negativer Wert:** Verlust (Darlehensgebühr übersteigt Einnahmen)
- **Nullwert:** Break-Even

**Berechnungslogik:**
- ✅ Echtzeitberechnung während der Bearbeitung
- ✅ Speichert automatisch in der Datenbank, wenn sich Komponenten ändern
- ✅ Anzeige mit 2 Dezimalstellen
- ✅ Zeigt `-` an, wenn Ergebnis = 0
- ✅ **Kann negative Werte anzeigen** (Verlustsituation)

**Beispiel 1: Gewinn ✅**
```
Service Ticket:            €50.00
Service Visa:           €20.00
Commission:             €30.00
──────────────────────────────
Total Income:           €100.00
Loan Fee:              -€10.00
──────────────────────────────
LST Profit:             €90.00 ✅ Profit
```

**Beispiel 2: Verlust ⚠️**
```
Service Fee:            €10.00
Service Visa:           €5.00
Commission:             €2.00
──────────────────────────────
Total Income:           €17.00
Loan Fee:              -€20.00
──────────────────────────────
LST Profit:            -€3.00 ⚠️ Loss
```

**Beispiel 3: Break-Even**
```
Service Ticket:            €50.00
Service Visa:           €20.00
Commission:             €30.00
──────────────────────────────
Total Income:           €100.00
Loan Fee:              -€100.00
──────────────────────────────
LST Profit:             €0.00 (Break-even)
```

**Praxisbeispiele:**

**Szenario 1: Erfolgreiche Buchung**
- Servicegebühren: €50 + €20 = €70
- Fluggesellschaftsprovision: €30
- Darlehensgebühr: €10
- **Gewinn: €90.00**

**Szenario 2: Hohe Darlehensgebühr**
- Servicegebühren: €10 + €5 = €15
- Fluggesellschaftsprovision: €2
- Darlehensgebühr: €20
- **Verlust: -€3.00** (Darlehensgebühr übersteigt Einnahmen)

**Verwandt:**
- [Servicegebühr](#total-ticket-price)
- [Visum-Servicegebühr](#total-visa-fees)
- [Provisionslogik](./commission-logic.md) _(in Kürze)_

---

## Berechnungsabhängigkeiten

### **Abhängigkeitsdiagramm:**

```
airlines_price ──┐
                 ├──→ total_ticket_price ──┐
service_fee ─────┘                         │
                                           ├──→ total_amount_due ──┐
visa_price ────┐                           │                      │
               ├──→ tot_visa_fees ─────────┘                      │
service_visa ──┘                                                    │
                                                                   ├──→ payment_balance
cash_paid ─────┐                                                    │
               ├──→ total_customer_payment ─────────────────────────┘
bank_transfer ─┘

service_fee ──────────┐
                      │
service_visa ─────────┼──→ lst_profit
                      │
commission_from_airlines ─┘
                      │
lst_loan_fee ─────────┘ (subtracted)
```

### **Echtzeit-Aktualisierungskette:**

#### **Beim Bearbeiten von `service_fee`:**
1. Aktualisiert `total_ticket_price` (sofort)
2. Aktualisiert `total_amount_due` (kaskadiert)
3. Aktualisiert `payment_balance` (kaskadiert)
4. Aktualisiert `lst_profit` (sofort)

#### **Beim Bearbeiten von `airlines_price`:**
1. Aktualisiert `total_ticket_price` (sofort)
2. Aktualisiert `total_amount_due` (kaskadiert)
3. Aktualisiert `payment_balance` (kaskadiert)

#### **Beim Bearbeiten von `visa_price`:**
1. Aktualisiert `tot_visa_fees` (sofort)
2. Aktualisiert `total_amount_due` (kaskadiert)
3. Aktualisiert `payment_balance` (kaskadiert)

#### **Beim Bearbeiten von `service_visa`:**
1. Aktualisiert `tot_visa_fees` (sofort)
2. Aktualisiert `total_amount_due` (kaskadiert)
3. Aktualisiert `payment_balance` (kaskadiert)
4. Aktualisiert `lst_profit` (sofort)

#### **Beim Bearbeiten von `cash_paid`:**
1. Aktualisiert `total_customer_payment` (sofort)
2. Aktualisiert `payment_balance` (kaskadiert)

#### **Beim Bearbeiten von `bank_transfer`:**
1. Aktualisiert `total_customer_payment` (sofort)
2. Aktualisiert `payment_balance` (kaskadiert)

#### **Beim Bearbeiten von `commission_from_airlines`:**
1. Aktualisiert `lst_profit` (sofort)

#### **Beim Bearbeiten von `lst_loan_fee`:**
1. Aktualisiert `lst_profit` (sofort)

---

## Beispiele

### **Vollständiges Buchungsbeispiel:**

**Eingabewerte:**
- Airlines Price: €500.00
- Service Fee: €50.00
- Visa Price: €80.00
- Service Visa: €20.00
- Cash Paid: €200.00
- Bank Transfer: €450.00
- Commission from Airlines: €30.00
- LST Loan Fee: €10.00

**Schritt-für-Schritt-Berechnungen:**

**Schritt 1: Gesamten Ticketpreis berechnen**
```
total_ticket_price = airlines_price + service_fee
total_ticket_price = €500.00 + €50.00
total_ticket_price = €550.00
```

**Schritt 2: Gesamte Visagebühren berechnen**
```
tot_visa_fees = visa_price + service_visa
tot_visa_fees = €80.00 + €20.00
tot_visa_fees = €100.00
```

**Schritt 3: Gesamten fälligen Betrag berechnen**
```
total_amount_due = total_ticket_price + tot_visa_fees
total_amount_due = €550.00 + €100.00
total_amount_due = €650.00
```

**Schritt 4: Gesamte Kundenzahlung berechnen**
```
total_customer_payment = cash_paid + bank_transfer
total_customer_payment = €200.00 + €450.00
total_customer_payment = €650.00
```

**Schritt 5: Zahlungsbilanz berechnen**
```
payment_balance = total_customer_payment - total_amount_due
payment_balance = €650.00 - €650.00
payment_balance = €0.00 ✅ Fully Paid
```

**Schritt 6: LST Gewinn berechnen**
```
lst_profit = service_fee + service_visa + commission_from_airlines - lst_loan_fee
lst_profit = €50.00 + €20.00 + €30.00 - €10.00
lst_profit = €90.00 ✅ Profit
```

**Zusammenfassung:**
```
┌─────────────────────────────────────┐
│         BOOKING SUMMARY              │
├─────────────────────────────────────┤
│ Total Ticket Price:    €550.00     │
│ Total Visa Fees:       €100.00     │
│ ─────────────────────────────────── │
│ Total Amount Due:      €650.00     │
│ Total Customer Payment: €650.00     │
│ ─────────────────────────────────── │
│ Payment Balance:        €0.00 ✅     │
│ ─────────────────────────────────── │
│ LST Profit:            €90.00 ✅    │
└─────────────────────────────────────┘
```

---

## Rundungsregeln

### **Dezimalgenauigkeit:**
- Alle Berechnungen verwenden **2 Dezimalstellen**
- Rundungsmethode: **Standardrundung** (0.5 wird aufgerundet)
- Anzeigeformat: `XX.XX` (z.B. `550.00`)

### **Nullwert-Anzeige:**
- Nullwerte werden als `-` (leere Zeichenkette) angezeigt
- Ausnahme: `payment_balance` zeigt `€0.00` an, wenn vollständig bezahlt

### **Beispiele:**

**Rundungsbeispiele:**
- `550.004` → `550.00`
- `550.005` → `550.01` (wird aufgerundet)
- `550.015` → `550.02` (wird aufgerundet)

**Nullwert-Anzeigebeispiele:**
- `total_ticket_price = 0` → wird als `-` angezeigt
- `payment_balance = 0` → wird als `€0.00 ✅ Fully Paid` angezeigt

---

## Sonderfälle

### **NULL-Werte:**
- NULL-Werte werden in Berechnungen als `0` behandelt
- Wenn alle Komponenten NULL sind, ist das Ergebnis NULL (wird als `-` angezeigt)

**Beispiel:**
```
airlines_price = NULL (wird als 0 behandelt)
service_fee = NULL (wird als 0 behandelt)
total_ticket_price = 0 + 0 = 0 → wird als "-" angezeigt
```

### **Negative Werte:**
- `cash_paid` und `bank_transfer` können negativ sein (Rückerstattungen)
- `lst_loan_fee` wird subtrahiert (kann negativen Gewinn verursachen)
- `payment_balance` kann negativ sein (Kunde schuldet)

**Beispiel 1: Rückerstattung**
```
cash_paid = -€50.00 (Rückerstattung gegeben)
bank_transfer = €700.00
total_customer_payment = -€50.00 + €700.00 = €650.00
```

**Beispiel 2: Negativer Gewinn**
```
service_fee = €10.00
service_visa = €5.00
commission = €2.00
loan_fee = €20.00
lst_profit = €10 + €5 + €2 - €20 = -€3.00 ⚠️ Loss
```

**Beispiel 3: Kunde schuldet**
```
total_customer_payment = €500.00
total_amount_due = €650.00
payment_balance = €500 - €650 = -€150.00 ⚠️ Customer Owes €150
```

### **Sehr große Zahlen:**
- System unterstützt bis zu **€99,999,999.99** (NUMERIC(10,2))
- Keine automatische Validierung für Maximalwerte
- Verwenden Sie gesunden Menschenverstand beim Eingeben von Beträgen

### **Teilzahlungen:**
- Kunde kann in mehreren Raten zahlen
- System verfolgt kumulative Zahlungen
- Zahlungsbilanz aktualisiert sich automatisch

**Beispiel:**
```
Total Amount Due: €650.00

Payment 1: Cash €200.00
  → Payment Balance: -€450.00 (Kunde schuldet €450)

Payment 2: Bank Transfer €450.00
  → Payment Balance: €0.00 ✅ Fully Paid
```

---

## Verwandte Dokumentation

### **Finanzsystem:**
- [Zahlungsmethoden](./payment-methods.md) _(in Kürze)_
- [Provisionslogik](./commission-logic.md) _(in Kürze)_
- [Buchhaltungsgrundlagen](./accounting-basics.md) _(in Kürze)_

### **Steuerkonformität:**
- [MwSt-Berechnung](../03-tax/vat-calculation.md) _(in Kürze)_
- [SKR03-Kategorien](../03-tax/skr03-categories.md) _(in Kürze)_

### **Funktionen:**
- [Buchungsverwaltung](../04-features/booking-management.md) _(in Kürze)_
- [Anfragenerstellung](../04-features/request-creation.md) _(in Kürze)_

### **FAQ:**
- [Finanzfragen](../05-faq/financial-questions.md) _(in Kürze)_

---

## Schnellreferenz

### **Formel-Spickzettel:**

```
1. total_ticket_price = airlines_price + service_fee
2. tot_visa_fees = visa_price + service_visa
3. total_customer_payment = cash_paid + bank_transfer
4. total_amount_due = total_ticket_price + tot_visa_fees
5. payment_balance = total_customer_payment - total_amount_due
6. lst_profit = service_fee + service_visa + commission_from_airlines - lst_loan_fee
```

### **Berechnungsreihenfolge:**

1. Berechnen Sie zuerst Ticket- und Visagesamtsummen
2. Summieren Sie sie für den gesamten fälligen Betrag
3. Summieren Sie Zahlungsmethoden für die gesamte Kundenzahlung
4. Berechnen Sie die Bilanz (Zahlung - fällig)
5. Berechnen Sie den Gewinn (Einnahmen - Abzüge)

---

**Letzte Aktualisierung:** 2026-01-25  
**Version:** 1.0  
**Status:** ✅ Abgeschlossen
