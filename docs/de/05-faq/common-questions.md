# Häufige Fragen (FAQ)

Häufig gestellte Fragen zum LST Travel-System.

---

## Allgemeine Fragen

### **F1: Wie bearbeite ich eine Buchung?**

**A:** Klicken Sie auf eine beliebige Zelle in der Haupttabelle, um inline zu bearbeiten. Änderungen werden automatisch gespeichert, wenn Sie wegklicken oder Enter drücken. Keine "Speichern"-Schaltfläche erforderlich.

**Verwandt:** [Schnellstart-Anleitung](../01-getting-started/quick-start.md)

---

### **F2: Wo kann ich sehen, ob ein Kunde bezahlt hat?**

**A:** Prüfen Sie die Spalte "Zahlungsbilanz" in der Haupttabelle:
- **Grün (€0.00):** Vollständig bezahlt ✅
- **Rot (negativ):** Kunde schuldet Geld ⚠️
- **Blau (positiv):** Kunde überbezahlt 💰

**Verwandt:** [Finanzberechnungen](../02-financial/calculations.md#payment-balance)

---

### **F3: Wie erstelle ich eine neue Buchung?**

**A:** Sie haben zwei Optionen:
1. **Anfrage erstellen:** Gehen Sie zu "Anfragen" → Klicken Sie auf "Neue Anfrage erstellen" → Formular ausfüllen → Gehen Sie zur Haupttabelle, um Details hinzuzufügen
2. **Direkte Eingabe:** Gehen Sie zur "Haupttabelle" → Klicken Sie auf eine beliebige Zelle → Beginnen Sie zu tippen

**Verwandt:** [Schnellstart-Anleitung](../01-getting-started/quick-start.md#step-3-create-your-first-booking)

---

### **F4: Kann ich Änderungen rückgängig machen?**

**A:** Änderungen werden automatisch gespeichert. Wenn Sie Daten korrigieren müssen:
- Bearbeiten Sie die Zelle erneut mit dem korrekten Wert
- Kontaktieren Sie Ihren Systemadministrator für Datenkorrekturen
- Prüfen Sie den "Papierkorb" in den Einstellungen, um gelöschte Elemente wiederherzustellen

---

### **F5: Wie lösche ich eine Buchung?**

**A:** 
1. Gehen Sie zur Haupttabelle
2. Finden Sie die Buchungszeile
3. Klicken Sie auf das Löschsymbol (Papierkorb) in der Zeile
4. Löschung bestätigen
5. Gelöschte Elemente gehen in den Papierkorb (können wiederhergestellt werden)

---

### **F6: Kann ich meine Daten exportieren?**

**A:** Ja! Gehen Sie zu Einstellungen → Export-Tab. Sie können exportieren:
- Alle Daten (CSV, Excel, JSON)
- Bestimmte Abschnitte (Anfragen, Buchungen, Ausgaben)
- Datumsgefilterte Exporte

---

### **F7: Wie ändere ich die Sprache?**

**A:** Gehen Sie zu Einstellungen → Einstellungen-Tab → Sprache auswählen (EN/DE). Änderungen werden sofort angewendet.

---

### **F8: Was bedeutet die orange Hervorhebung?**

**A:** Der orange/gelbe Hintergrund zeigt die Spalte "Gesamter fälliger Betrag" an. Dies ist der Gesamtbetrag, den der Kunde zahlen muss (Ticket + Visagebühren).

**Verwandt:** [Finanzberechnungen](../02-financial/calculations.md#total-amount-due)

---

### **F9: Wie filtere oder suche ich Buchungen?**

**A:** 
- **Suche:** Verwenden Sie das Suchfeld oben in der Haupttabelle (durchsucht alle Felder)
- **Filter:** Verwenden Sie Datumsfilter oder Status-Dropdowns
- **Sortieren:** Klicken Sie auf Spaltenüberschriften zum Sortieren

---

### **F10: Kann ich dies auf Mobilgeräten verwenden?**

**A:** Ja! Das System ist mobil-responsiv. Sie können:
- Buchungen auf Ihrem Telefon anzeigen
- Einträge auf Tablets bearbeiten
- Auf allen mobilen Geräten auf alle Funktionen zugreifen

---

## Finanzfragen

### **F11: Wie werden Summen berechnet?**

**A:** Alle Berechnungen sind automatisch:

- **Total Ticket Price** = Airlines Price + Service Ticket
- **Total Visa Fees** = Visa Price + Service Visa
- **Total Amount Due** = Total Ticket Price + Total Visa Fees
- **Total Customer Payment** = Cash Paid + Bank Transfer
- **Payment Balance** = Total Customer Payment - Total Amount Due
- **LST Profit** = Service Ticket + Service Visa + Commission - Loan Fee

**Verwandt:** [Finanzberechnungen](../02-financial/calculations.md)

---

### **F12: Warum ist meine Zahlungsbilanz negativ?**

**A:** Eine negative Bilanz bedeutet, dass der Kunde Geld schuldet. Der angezeigte Betrag ist, wie viel sie noch zahlen müssen.

**Beispiel:**
- Gesamter fälliger Betrag: €650.00
- Gesamte Kundenzahlung: €500.00
- Zahlungsbilanz: -€150.00 (Kunde schuldet €150)

**Verwandt:** [Zahlungsbilanz](../02-financial/calculations.md#payment-balance)

---

### **F13: Kann ich Teilzahlungen eingeben?**

**A:** Ja! Geben Sie Zahlungen ein, wie sie eintreffen:
- Erste Zahlung: Geben Sie in "Bar bezahlt" oder "Banküberweisung" ein
- Zweite Zahlung: Fügen Sie zum gleichen Feld hinzu oder verwenden Sie die andere Zahlungsmethode
- System summiert automatisch alle Zahlungen

**Beispiel:**
- Zahlung 1: €200 bar → Geben Sie in "Bar bezahlt" ein
- Zahlung 2: €450 Überweisung → Geben Sie in "Banküberweisung" ein
- Gesamt: €650 (automatisch berechnet)

---

### **F14: Was ist, wenn ein Kunde überbezahlt?**

**A:** Die Zahlungsbilanz zeigt einen positiven Betrag (blauer Text) an. Dies bedeutet:
- Kunde zahlte mehr als erforderlich
- Sie müssen möglicherweise eine Rückerstattung ausstellen
- Betrag zeigt, wie viel zurückzuerstatten ist

**Beispiel:**
- Gesamter fälliger Betrag: €650.00
- Gesamte Kundenzahlung: €700.00
- Zahlungsbilanz: €50.00 (überbezahlt, €50 zurückerstatten)

---

### **F15: Wie wird der Gewinn berechnet?**

**A:** LST Profit = Service Ticket + Service Visa + Commission from Airlines - Loan Fee

**Beispiel:**
- Servicegebühr: €50
- Visum-Servicegebühr: €20
- Provision: €30
- Darlehensgebühr: €10
- **Gewinn: €90**

**Hinweis:** Gewinn kann negativ sein, wenn Darlehensgebühr Einnahmen übersteigt.

**Verwandt:** [LST Gewinn](../02-financial/calculations.md#lst-profit)

---

### **F16: Kann ich negative Beträge eingeben?**

**A:** Ja, für bestimmte Felder:
- **Bar bezahlt / Banküberweisung:** Kann negativ sein (für Rückerstattungen)
- **Darlehensgebühr:** Kann negativ sein (für Gutschriften)
- **Zahlungsbilanz:** Kann negativ sein (Kunde schuldet)

**Hinweis:** Fluggesellschaftspreis und Servicegebühr sollten positiv sein.

---

## Steuer- & MwSt-Fragen

### **F17: Wie wird die MwSt berechnet?**

**A:** Die MwSt wird automatisch berechnet, wenn Sie Ausgaben eingeben:

- **Von Brutto:** Net = Gross ÷ (1 + VAT Rate/100)
- **Von Netto:** Gross = Net × (1 + VAT Rate/100)
- **MwSt-Betrag:** Gross - Net

**Beispiel (19% MwSt):**
- Brutto: €119.00
- Netto: €100.00
- MwSt: €19.00

**Verwandt:** [MwSt-Berechnung](../03-tax/vat-calculation.md)

---

### **F18: Welche MwSt-Sätze werden unterstützt?**

**A:** Standard deutsche MwSt-Sätze:
- **19%** (Standard) - Die meisten Waren und Dienstleistungen
- **7%** - Bücher, Lebensmittel, bestimmte Dienstleistungen
- **0%** - Exporte, bestimmte Dienstleistungen

**Verwandt:** [MwSt-Berechnung](../03-tax/vat-calculation.md)

---

### **F19: Warum ist Bewirtung & Unterhaltung nur zu 70% abzugsfähig?**

**A:** Dies ist deutsches Steuerrecht. Geschäftsmahlzeiten und Unterhaltung gelten als teilweise persönliche Ausgaben, daher können nur 70% vom zu versteuernden Einkommen abgezogen werden.

**Beispiel:**
- Ausgabe: €100 Mahlzeit
- Abzugsfähig: €70 (70%)
- Nicht abzugsfähig: €30 (30%)

**Verwandt:** [SKR03-Kategorien](../03-tax/skr03-categories.md#70-deductible-rule)

---

### **F20: Was sind SKR03-Kategorien?**

**A:** SKR03 (Standardkontenrahmen 03) ist der deutsche Standardkontenplan. Jede Ausgabenkategorie hat einen Code und einen abzugsfähigen Prozentsatz für Steuerberichte.

**Beispielkategorien:**
- 4920 - Büromiete (100% abzugsfähig)
- 6805 - Bewirtung & Unterhaltung (70% abzugsfähig)
- 4960 - Software & Tools (100% abzugsfähig)

**Verwandt:** [SKR03-Kategorien](../03-tax/skr03-categories.md)

---

## Technische Fehlerbehebung

### **F21: Änderungen werden nicht gespeichert**

**A:** Versuchen Sie diese Schritte:
1. Prüfen Sie Ihre Internetverbindung
2. Klicken Sie von der Zelle weg (Blur-Ereignis löst Speicherung aus)
3. Aktualisieren Sie die Seite (Strg+R oder Cmd+R)
4. Browser-Cache löschen
5. Kontaktieren Sie den Administrator, wenn das Problem weiterhin besteht

---

### **F22: Seite lädt langsam**

**A:** 
1. Prüfen Sie Ihre Internetverbindung
2. Browser-Cache löschen
3. Andere Browser-Tabs schließen
4. Einen anderen Browser versuchen
5. Kontaktieren Sie den Administrator, wenn das Problem weiterhin besteht

---

### **F23: Ich kann nicht alle Spalten sehen**

**A:** 
1. Verwenden Sie horizontales Scrollen (Scrollleiste unten)
2. Browser verkleinern (Strg + -)
3. Browserfenster vergrößern
4. Einige Spalten können ausgeblendet sein - prüfen Sie Spaltensichtbarkeitseinstellungen

---

### **F24: Berechnungen sind falsch**

**A:** 
1. Prüfen Sie, dass alle Eingabefelder korrekte Werte haben
2. Überprüfen Sie, dass keine NULL- oder leeren Werte in Berechnungsfeldern vorhanden sind
3. Seite aktualisieren, um neu zu berechnen
4. Prüfen Sie [Finanzberechnungen](../02-financial/calculations.md) für Formeldetails
5. Kontaktieren Sie den Administrator, wenn Berechnungen weiterhin falsch erscheinen

---

### **F25: Ich erhalte eine Fehlermeldung**

**A:** 
1. Lesen Sie die Fehlermeldung sorgfältig
2. Prüfen Sie, ob Sie erforderliche Felder vermissen (mit * markiert)
3. Überprüfen Sie Ihr Datenformat (Daten, Zahlen)
4. Versuchen Sie, die Seite zu aktualisieren
5. Kontaktieren Sie den Administrator mit Fehlerdetails

---

### **F26: Kann mich nicht anmelden**

**A:**
1. Überprüfen Sie Ihren Benutzernamen und Ihr Passwort
2. Prüfen Sie, ob Feststelltaste aktiviert ist
3. Browser-Cache und Cookies löschen
4. Einen anderen Browser versuchen
5. Kontaktieren Sie Ihren Administrator für Passwort-Reset

---

### **F27: Daten sind verschwunden**

**A:**
1. Prüfen Sie, ob Sie die Ansicht filtern (Filter entfernen)
2. Prüfen Sie Papierkorb in Einstellungen
3. Überprüfen Sie, dass Sie in der richtigen Organisation angemeldet sind
4. Kontaktieren Sie Administrator - Daten können möglicherweise wiederhergestellt werden

---

### **F28: Export funktioniert nicht**

**A:**
1. Prüfen Sie, ob Sie Daten zum Exportieren haben
2. Versuchen Sie ein anderes Exportformat (CSV, Excel, JSON)
3. Prüfen Sie Browser-Download-Einstellungen
4. Einen anderen Browser versuchen
5. Kontaktieren Sie Administrator, wenn das Problem weiterhin besteht

---

## Daten- & Sicherheitsfragen

### **F29: Sind meine Daten sicher?**

**A:** Ja! Das System verwendet:
- Sichere Authentifizierung (Supabase Auth)
- Verschlüsselte Verbindungen (HTTPS)
- Zeilenebenen-Sicherheitsrichtlinien (RLS)
- Organisationsbasierte Datenisolierung

---

### **F30: Können andere Organisationen meine Daten sehen?**

**A:** Nein. Die Daten jeder Organisation sind vollständig isoliert. Sie können nur Daten für Ihre eigene Organisation sehen.

---

### **F31: Wie lange werden Daten gespeichert?**

**A:** Daten werden unbegrenzt gespeichert, es sei denn, sie werden gelöscht. Gelöschte Elemente gehen in den Papierkorb und können 30 Tage lang wiederhergestellt werden (konfigurierbar).

---

## Kontakt & Support

### **Benötigen Sie mehr Hilfe?**

**Dokumentation:**
- [Schnellstart-Anleitung](../01-getting-started/quick-start.md)
- [Finanzberechnungen](../02-financial/calculations.md)
- [MwSt-Berechnung](../03-tax/vat-calculation.md)
- [SKR03-Kategorien](../03-tax/skr03-categories.md)

**Support:**
- Kontaktieren Sie Ihren Systemadministrator
- Prüfen Sie Systemstatusseite (falls verfügbar)
- Überprüfen Sie Fehlerprotokolle in Browser-Konsole (F12)

---

**Letzte Aktualisierung:** 2026-01-25  
**Version:** 1.0
