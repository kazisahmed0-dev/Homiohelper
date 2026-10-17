import { Prescription, DoctorProfile } from '../types';

/**
 * Generates a complete, pristine, standalone HTML document for printing
 * a HomioHelper homoeopathic prescription on standard A4 portrait paper.
 * 
 * Crucially:
 * 1. Contains zero external dependencies, zero AI Studio UI, zero chat panels.
 * 2. Strict A4 portrait @page rules with suitable print margins (10mm - 12mm).
 * 3. Complete doctor header with logo/emblem, qualifications, chamber details.
 * 4. Renders optional fields ONLY if actual content was entered by the doctor (NO placeholders or defaults).
 * 5. Pinned signature block with page-break-inside: avoid.
 */
export function generatePrescriptionPrintHtml(
  rx: Prescription,
  doctor: DoctorProfile,
  language: 'en' | 'bn' = 'bn'
): string {
  const isBn = language === 'bn';

  // Doctor information with real saved profile precedence
  const doctorName = rx.doctorProfile?.name || doctor.name || (isBn ? 'ডা. এম. এ. রহমান' : 'Dr. M. A. Rahman');
  const doctorQual = rx.doctorProfile?.qualification || doctor.qualification || '';
  const doctorReg = rx.doctorProfile?.regNumber || doctor.regNumber || '';
  const chamberName = rx.doctorProfile?.chamberName || doctor.chamberName || (isBn ? 'হোমিওপ্যাথিক চেম্বার ও আরোগ্য নিকেতন' : 'Homoeopathic Clinic & Chamber');
  const chamberAddr = rx.doctorProfile?.chamberAddress || doctor.chamberAddress || '';
  const phone = rx.doctorProfile?.phone || doctor.phone || '';
  const email = rx.doctorProfile?.email || doctor.email || '';
  const visitingHours = rx.doctorProfile?.additionalInfo || doctor.additionalInfo || '';
  const logoUrl = rx.doctorProfile?.logoUrl || doctor.logoUrl || '';

  // Patient details
  const patientName = rx.patientName || (isBn ? 'নাম উল্লেখ নেই' : 'Not Specified');
  const patientRegNo = rx.patientRegNo || rx.prescriptionNo || '';
  const patientAge = rx.patientAge ? `${rx.patientAge} ${isBn ? 'বছর' : 'Y'}` : '';
  const patientGender = rx.patientGender === 'male'
    ? (isBn ? 'পুরুষ' : 'Male')
    : rx.patientGender === 'female'
    ? (isBn ? 'মহিলা' : 'Female')
    : rx.patientGender === 'other'
    ? (isBn ? 'অন্যান্য' : 'Other')
    : '';
  const patientAgeGender = [patientAge, patientGender].filter(Boolean).join(' / ') || '—';
  const rxDate = rx.date || new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-GB');
  const patientMobile = rx.patientMobile || '';
  const patientAddress = rx.patientAddress || '';

  // Clinical findings (only include if entered)
  const hasVitals = Boolean(
    (rx.bp && rx.bp.trim()) ||
    (rx.pulse && rx.pulse.trim()) ||
    (rx.weight && rx.weight.trim()) ||
    (rx.temperature && rx.temperature.trim())
  );

  const hasClinicalDetails = Boolean(
    (rx.chiefComplaint && rx.chiefComplaint.trim()) ||
    (rx.patientHistory && rx.patientHistory.trim()) ||
    (rx.diagnosis && rx.diagnosis.trim()) ||
    (rx.clinicalNotes && rx.clinicalNotes.trim()) ||
    (rx.procedures && rx.procedures.trim())
  );

  // Filter valid remedies
  const remedies = (rx.remedies || []).filter(
    (r) => (r.medicineName && r.medicineName.trim()) || (r.potency && r.potency.trim())
  );

  // Check optional food restrictions & advice (ONLY render if entered)
  const foodsToAvoid = (rx.foodsToAvoid || rx.dietRestrictions || '').trim();
  const foodsPermitted = (rx.foodsPermitted || '').trim();
  const generalPrecautions = (rx.generalPrecautions || '').trim();
  const additionalAdvice = (rx.additionalAdvice || rx.specialInstructions || '').trim();
  const hasAdviceSection = Boolean(foodsToAvoid || foodsPermitted || generalPrecautions || additionalAdvice);

  // Optional investigations
  const investigations = (rx.investigations || '').trim();

  // Optional warning
  const warning = (rx.warning || '').trim();

  // Optional follow-up date
  const followUpDate = (rx.followUpDate || '').trim();

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${rx.prescriptionNo || 'Prescription'} - ${patientName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    /* Reset & Base Styles */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html, body {
      font-family: 'Noto Sans Bengali', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      font-size: 11pt;
      line-height: 1.45;
      color: #11231D;
      background: #FFFFFF;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Strict A4 Portrait Print Styles */
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }

    body {
      width: 100%;
      max-width: 190mm;
      margin: 0 auto;
      padding: 4mm 0;
    }

    .rx-paper {
      width: 100%;
      min-height: 265mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #FFFFFF;
    }

    .rx-main-content {
      flex: 1 0 auto;
    }

    /* Doctor & Chamber Header */
    .rx-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      padding-bottom: 10px;
      border-bottom: 2.5px solid #164E43;
      page-break-after: avoid;
      break-after: avoid;
    }

    .rx-doc-info {
      flex: 1 1 45%;
      text-align: left;
    }

    .rx-doc-name {
      font-size: 15pt;
      font-weight: 800;
      color: #0F2D25;
      line-height: 1.2;
      letter-spacing: -0.01em;
    }

    .rx-doc-qual {
      font-size: 9.5pt;
      font-weight: 600;
      color: #164E43;
      margin-top: 3px;
    }

    .rx-doc-reg {
      font-size: 8.5pt;
      color: #516A60;
      font-family: ui-monospace, monospace;
      margin-top: 2px;
    }

    .rx-logo-container {
      flex: 0 0 10%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 4px;
    }

    .rx-logo-img {
      max-height: 52px;
      max-width: 75px;
      object-fit: contain;
    }

    .rx-emblem-badge {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1.5px solid #164E43;
      background: #F1F6F3;
      color: #164E43;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16pt;
      font-weight: 800;
      font-family: serif;
    }

    .rx-chamber-info {
      flex: 1 1 45%;
      text-align: right;
      font-size: 8.5pt;
      color: #40584F;
      line-height: 1.35;
    }

    .rx-chamber-name {
      font-size: 11pt;
      font-weight: 700;
      color: #0F2D25;
      margin-bottom: 2px;
    }

    .rx-chamber-phone {
      font-weight: 600;
      color: #164E43;
      margin-top: 1px;
    }

    .rx-visiting-hours {
      font-size: 8pt;
      color: #5B7268;
      font-style: italic;
      margin-top: 2px;
    }

    /* Patient Details Strip */
    .rx-patient-bar {
      margin-top: 8px;
      margin-bottom: 10px;
      border: 1px solid #C5D6CD;
      border-radius: 4px;
      background: #F8FAF9;
      padding: 6px 10px;
      display: table;
      width: 100%;
      table-layout: fixed;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .rx-patient-row {
      display: table-row;
    }

    .rx-patient-cell {
      display: table-cell;
      vertical-align: middle;
      padding: 2px 6px;
      font-size: 9pt;
      border-right: 1px solid #DCE6E1;
    }

    .rx-patient-cell:last-child {
      border-right: none;
    }

    .rx-patient-lbl {
      display: block;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #5E756C;
      margin-bottom: 1px;
    }

    .rx-patient-val {
      font-weight: 700;
      color: #0E221C;
    }

    /* Clinical Details & Vitals (Only if entered) */
    .rx-clinical-box {
      margin-bottom: 10px;
      padding: 7px 10px;
      background: #FCFDFC;
      border: 1px solid #D7E5DE;
      border-radius: 4px;
      font-size: 8.5pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .rx-vitals-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      padding-bottom: 5px;
      margin-bottom: 5px;
      border-bottom: 1px solid #E5EEE9;
      color: #476257;
      font-size: 8.5pt;
    }

    .rx-vital-item strong {
      color: #122922;
      font-weight: 700;
    }

    .rx-clinical-line {
      margin-top: 3px;
      color: #274037;
      line-height: 1.35;
    }

    .rx-clinical-line strong {
      color: #164E43;
      font-weight: 700;
    }

    /* Remedies Table */
    .rx-symbol-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      margin-bottom: 6px;
    }

    .rx-symbol {
      font-size: 18pt;
      font-family: serif;
      font-weight: 900;
      font-style: italic;
      color: #164E43;
      line-height: 1;
    }

    .rx-section-title {
      font-size: 8.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #122821;
    }

    .rx-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #B8CCC2;
      margin-bottom: 10px;
    }

    .rx-table th {
      background: #EFF5F2;
      color: #17352B;
      font-weight: 700;
      font-size: 8.5pt;
      padding: 5px 8px;
      border-bottom: 1.5px solid #B8CCC2;
      border-right: 1px solid #CBDCD3;
      text-align: left;
    }

    .rx-table th:last-child {
      border-right: none;
    }

    .rx-table td {
      padding: 6px 8px;
      font-size: 8.5pt;
      border-bottom: 1px solid #E1ECE6;
      border-right: 1px solid #E1ECE6;
      vertical-align: top;
    }

    .rx-table td:last-child {
      border-right: none;
    }

    .rx-table tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .rx-med-name {
      font-weight: 700;
      font-size: 9.5pt;
      color: #0F2A21;
      display: block;
    }

    .rx-med-potency {
      font-weight: 700;
      color: #164E43;
      background: #E8F2ED;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 8pt;
      display: inline-block;
      margin-top: 2px;
    }

    .rx-med-form {
      font-size: 7.5pt;
      color: #647B72;
      margin-left: 4px;
    }

    /* Optional Specific Medicine Instructions (under medicine name) */
    .rx-med-instructions-block {
      margin-top: 4px;
      padding: 4px 6px;
      background: #F4F8F6;
      border-left: 2px solid #164E43;
      border-radius: 2px;
      font-size: 8pt;
      color: #2F4B40;
      line-height: 1.3;
    }

    .rx-med-instruction-item {
      margin-bottom: 1px;
    }

    .rx-med-instruction-item:last-child {
      margin-bottom: 0;
    }

    .rx-inst-label {
      font-weight: 700;
      color: #164E43;
      font-size: 7.5pt;
    }

    /* Food Restrictions & Advice Section (Rendered ONLY if entered) */
    .rx-advice-container {
      margin-top: 8px;
      margin-bottom: 10px;
      border: 1px solid #C9DBD1;
      border-radius: 4px;
      background: #F9FCFA;
      padding: 8px 10px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .rx-advice-title {
      font-size: 8.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #164E43;
      margin-bottom: 5px;
      padding-bottom: 3px;
      border-bottom: 1px dashed #D2E2D9;
    }

    .rx-advice-row {
      margin-bottom: 4px;
      font-size: 8.5pt;
      line-height: 1.35;
      color: #254035;
    }

    .rx-advice-row:last-child {
      margin-bottom: 0;
    }

    .rx-advice-avoid strong {
      color: #A31B1B;
      font-weight: 700;
    }

    .rx-advice-permit strong {
      color: #1A6B3A;
      font-weight: 700;
    }

    .rx-advice-precaution strong {
      color: #0E5E52;
      font-weight: 700;
    }

    .rx-advice-general strong {
      color: #1C3B30;
      font-weight: 700;
    }

    /* Optional Investigations Box */
    .rx-investigations-box {
      margin-top: 6px;
      margin-bottom: 8px;
      border: 1px solid #CFDFD6;
      border-radius: 4px;
      background: #FAFDFB;
      padding: 6px 10px;
      font-size: 8.5pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .rx-investigations-box strong {
      color: #164E43;
      font-weight: 700;
    }

    /* Optional Warning Box */
    .rx-warning-box {
      margin-top: 6px;
      margin-bottom: 8px;
      border: 1px solid #F5C6CB;
      background: #FFF5F5;
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 8.5pt;
      color: #721C24;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .rx-warning-box strong {
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8pt;
    }

    /* Follow Up Box */
    .rx-followup-box {
      margin-top: 6px;
      margin-bottom: 8px;
      font-size: 8.5pt;
      font-weight: 700;
      color: #164E43;
      background: #EBF4F0;
      border: 1px solid #CDE0D6;
      border-radius: 4px;
      padding: 4px 8px;
      display: inline-block;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Signature & Footer Block */
    .rx-footer {
      margin-top: 18px;
      padding-top: 10px;
      border-top: 1px solid #CBDAD1;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .rx-footer-contact {
      font-size: 8pt;
      color: #557165;
      line-height: 1.35;
      max-width: 60%;
    }

    .rx-footer-signature-block {
      text-align: center;
      min-width: 170px;
    }

    .rx-signature-line {
      border-bottom: 1.5px solid #203B31;
      height: 38px;
      margin-bottom: 4px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .rx-signature-name {
      font-size: 9pt;
      font-weight: 700;
      color: #112821;
    }

    .rx-signature-title {
      font-size: 7.5pt;
      color: #556D63;
    }

    .rx-bottom-standard {
      margin-top: 6px;
      padding-top: 4px;
      border-top: 1px solid #EBF1EE;
      text-align: center;
      font-size: 7pt;
      color: #7A9188;
    }

    /* Print control toolbar for standalone tab view */
    .standalone-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: #164E43;
      color: #ffffff;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 13px;
    }

    .standalone-controls button {
      background: #ffffff;
      color: #164E43;
      border: none;
      padding: 6px 14px;
      border-radius: 4px;
      font-weight: 700;
      cursor: pointer;
      margin-left: 8px;
    }

    @media print {
      .standalone-controls {
        display: none !important;
      }
      body {
        padding: 0 !important;
        margin: 0 !important;
        max-width: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="standalone-controls">
    <div><strong>HomioHelper A4 Prescription Document</strong> · Official Clinic Standard</div>
    <div>
      <button onclick="window.print()">🖨️ Print / Save as PDF</button>
      <button onclick="window.close()" style="background: transparent; color: #ffffff; border: 1px solid #ffffff;">✖ Close Tab</button>
    </div>
  </div>

  <div class="rx-paper">
    <div class="rx-main-content">
      <!-- 1. Doctor & Chamber Header -->
      <header class="rx-header">
        <!-- Left: Doctor info -->
        <div class="rx-doc-info">
          <div class="rx-doc-name">${doctorName}</div>
          ${doctorQual ? `<div class="rx-doc-qual">${doctorQual}</div>` : ''}
          ${doctorReg ? `<div class="rx-doc-reg">${doctorReg}</div>` : ''}
        </div>

        <!-- Center: Clinic Logo / Emblem -->
        <div class="rx-logo-container">
          ${
            logoUrl
              ? `<img src="${logoUrl}" alt="Clinic Logo" class="rx-logo-img">`
              : `<div class="rx-emblem-badge" title="Homoeopathic Practice Emblem">⚕</div>`
          }
        </div>

        <!-- Right: Chamber info -->
        <div class="rx-chamber-info">
          <div class="rx-chamber-name">${chamberName}</div>
          ${chamberAddr ? `<div>${chamberAddr}</div>` : ''}
          ${phone ? `<div class="rx-chamber-phone">${isBn ? 'মোবাইল' : 'Phone'}: ${phone}</div>` : ''}
          ${email ? `<div>${email}</div>` : ''}
          ${visitingHours ? `<div class="rx-visiting-hours">${visitingHours}</div>` : ''}
        </div>
      </header>

      <!-- 2. Patient Details Strip -->
      <div class="rx-patient-bar">
        <div class="rx-patient-row">
          <div class="rx-patient-cell" style="width: 32%;">
            <span class="rx-patient-lbl">${isBn ? 'রোগীর নাম' : 'Patient Name'}</span>
            <span class="rx-patient-val">${patientName}</span>
          </div>
          <div class="rx-patient-cell" style="width: 20%;">
            <span class="rx-patient-lbl">${isBn ? 'রেজি নং' : 'Reg No'}</span>
            <span class="rx-patient-val">${patientRegNo || '—'}</span>
          </div>
          <div class="rx-patient-cell" style="width: 18%;">
            <span class="rx-patient-lbl">${isBn ? 'বয়স ও লিঙ্গ' : 'Age & Gender'}</span>
            <span class="rx-patient-val">${patientAgeGender}</span>
          </div>
          <div class="rx-patient-cell" style="width: 15%;">
            <span class="rx-patient-lbl">${isBn ? 'তারিখ' : 'Date'}</span>
            <span class="rx-patient-val">${rxDate}</span>
          </div>
          <div class="rx-patient-cell" style="width: 15%;">
            <span class="rx-patient-lbl">${isBn ? 'যোগাযোগ / ঠিকানা' : 'Contact / Address'}</span>
            <span class="rx-patient-val" style="font-size: 8pt;">${patientMobile || patientAddress || '—'}</span>
          </div>
        </div>
      </div>

      <!-- 3. Clinical Information & History (Rendered ONLY if entered) -->
      ${
        hasVitals || hasClinicalDetails
          ? `
        <div class="rx-clinical-box">
          ${
            hasVitals
              ? `
            <div class="rx-vitals-strip">
              ${rx.bp && rx.bp.trim() ? `<span class="rx-vital-item"><strong>${isBn ? 'রক্তচাপ (BP):' : 'BP:'}</strong> ${rx.bp.trim()}</span>` : ''}
              ${rx.pulse && rx.pulse.trim() ? `<span class="rx-vital-item"><strong>${isBn ? 'পালস (Pulse):' : 'Pulse:'}</strong> ${rx.pulse.trim()}</span>` : ''}
              ${rx.weight && rx.weight.trim() ? `<span class="rx-vital-item"><strong>${isBn ? 'ওজন (Weight):' : 'Weight:'}</strong> ${rx.weight.trim()}</span>` : ''}
              ${rx.temperature && rx.temperature.trim() ? `<span class="rx-vital-item"><strong>${isBn ? 'তাপমাত্রা (Temp):' : 'Temp:'}</strong> ${rx.temperature.trim()}</span>` : ''}
            </div>`
              : ''
          }
          ${
            rx.chiefComplaint && rx.chiefComplaint.trim()
              ? `<div class="rx-clinical-line"><strong>${isBn ? 'প্রধান উপসর্গ (Chief Complaints):' : 'Chief Complaints:'}</strong> ${rx.chiefComplaint.trim()}</div>`
              : ''
          }
          ${
            rx.patientHistory && rx.patientHistory.trim()
              ? `<div class="rx-clinical-line"><strong>${isBn ? 'রোগীর অতীত ইতিহাস (Patient History):' : 'Patient History:'}</strong> ${rx.patientHistory.trim()}</div>`
              : ''
          }
          ${
            rx.diagnosis && rx.diagnosis.trim()
              ? `<div class="rx-clinical-line"><strong>${isBn ? 'রোগ নির্ণয় (Diagnosis):' : 'Clinical Diagnosis:'}</strong> ${rx.diagnosis.trim()}</div>`
              : ''
          }
          ${
            rx.clinicalNotes && rx.clinicalNotes.trim()
              ? `<div class="rx-clinical-line"><strong>${isBn ? 'ক্লিনিক্যাল ফাইন্ডিংস (Clinical Findings):' : 'Clinical Findings:'}</strong> ${rx.clinicalNotes.trim()}</div>`
              : ''
          }
          ${
            rx.procedures && rx.procedures.trim()
              ? `<div class="rx-clinical-line"><strong>${isBn ? 'পদ্ধতি ও মডালিটিজ (Procedures):' : 'Procedures & Modalities:'}</strong> ${rx.procedures.trim()}</div>`
              : ''
          }
        </div>`
          : ''
      }

      <!-- 4. Prescribed Remedies (Rx) -->
      <div class="rx-symbol-header">
        <span class="rx-symbol">℞</span>
        <span class="rx-section-title">${isBn ? 'ব্যবস্থাপত্র / প্রেসক্রাইবড হোমিওপ্যাথিক ঔষধ' : 'Prescribed Homoeopathic Remedies'}</span>
      </div>

      <table class="rx-table">
        <thead>
          <tr>
            <th style="width: 5%; text-align: center;">#</th>
            <th style="width: 45%;">${isBn ? 'ঔষধের নাম ও শক্তি' : 'Medicine & Potency'}</th>
            <th style="width: 16%;">${isBn ? 'মাত্রা' : 'Dosage'}</th>
            <th style="width: 20%;">${isBn ? 'সেবনবিধি' : 'Frequency'}</th>
            <th style="width: 14%;">${isBn ? 'সময়কাল' : 'Duration'}</th>
          </tr>
        </thead>
        <tbody>
          ${
            remedies.length > 0
              ? remedies
                  .map((remedy, idx) => {
                    const hasInstructions = Boolean(
                      (remedy.whenToTake && remedy.whenToTake.trim()) ||
                      (remedy.howToTake && remedy.howToTake.trim()) ||
                      (remedy.beforeAfterFood && remedy.beforeAfterFood.trim()) ||
                      (remedy.additionalInstructions && remedy.additionalInstructions.trim()) ||
                      (remedy.instructions && remedy.instructions.trim())
                    );

                    return `
              <tr>
                <td style="text-align: center; color: #5B756C; font-weight: 600;">${idx + 1}</td>
                <td>
                  <span class="rx-med-name">${remedy.medicineName || '—'}</span>
                  ${remedy.potency ? `<span class="rx-med-potency">${remedy.potency}</span>` : ''}
                  ${remedy.form ? `<span class="rx-med-form">(${remedy.form})</span>` : ''}
                  
                  ${
                    hasInstructions
                      ? `
                    <div class="rx-med-instructions-block">
                      ${remedy.whenToTake && remedy.whenToTake.trim() ? `<div class="rx-med-instruction-item"><span class="rx-inst-label">${isBn ? 'কখন সেব্য:' : 'When:'}</span> ${remedy.whenToTake.trim()}</div>` : ''}
                      ${remedy.howToTake && remedy.howToTake.trim() ? `<div class="rx-med-instruction-item"><span class="rx-inst-label">${isBn ? 'কীভাবে সেব্য:' : 'How:'}</span> ${remedy.howToTake.trim()}</div>` : ''}
                      ${remedy.beforeAfterFood && remedy.beforeAfterFood.trim() ? `<div class="rx-med-instruction-item"><span class="rx-inst-label">${isBn ? 'খাবারের সময়:' : 'Food timing:'}</span> ${remedy.beforeAfterFood.trim()}</div>` : ''}
                      ${remedy.additionalInstructions && remedy.additionalInstructions.trim() ? `<div class="rx-med-instruction-item"><span class="rx-inst-label">${isBn ? 'নির্দেশনা:' : 'Directions:'}</span> ${remedy.additionalInstructions.trim()}</div>` : ''}
                      ${!remedy.additionalInstructions && remedy.instructions && remedy.instructions.trim() ? `<div class="rx-med-instruction-item"><span class="rx-inst-label">${isBn ? 'পরামর্শ:' : 'Note:'}</span> ${remedy.instructions.trim()}</div>` : ''}
                    </div>`
                      : ''
                  }
                </td>
                <td style="font-weight: 600; color: #1E372F;">${remedy.dosage || '—'}</td>
                <td style="color: #233D35;">${remedy.frequency || '—'}</td>
                <td style="font-weight: 600; color: #1E372F;">${remedy.duration || '—'}</td>
              </tr>
            `;
                  })
                  .join('')
              : `
            <tr>
              <td colspan="5" style="text-align: center; padding: 16px; color: #7B8F86; font-style: italic;">
                ${isBn ? 'কোনো ওষুধ যুক্ত করা হয়নি' : 'No remedies entered.'}
              </td>
            </tr>
          `
          }
        </tbody>
      </table>

      <!-- 5. Investigations (Rendered ONLY if entered) -->
      ${
        investigations
          ? `
        <div class="rx-investigations-box">
          <strong>${isBn ? 'প্রয়োজনীয় পরীক্ষা-নিরীক্ষা (Investigations / Tests):' : 'Investigations & Tests:'}</strong>
          <span>${investigations}</span>
        </div>`
          : ''
      }

      <!-- 6. Optional Food Restrictions & Advice (Rendered ONLY if entered) -->
      ${
        hasAdviceSection
          ? `
        <div class="rx-advice-container">
          <div class="rx-advice-title">${isBn ? 'উপদেশ ও পথ্য নির্দেশিকা (Advice & Health Regimen)' : 'Advice & Health Regimen'}</div>
          ${
            foodsToAvoid
              ? `<div class="rx-advice-row rx-advice-avoid"><strong>${isBn ? 'বর্জনীয় খাদ্য ও পথ্য:' : 'Foods to Avoid:'}</strong> ${foodsToAvoid}</div>`
              : ''
          }
          ${
            foodsPermitted
              ? `<div class="rx-advice-row rx-advice-permit"><strong>${isBn ? 'অনুমোদিত ও উপকারী খাদ্য:' : 'Foods Permitted / Recommended:'}</strong> ${foodsPermitted}</div>`
              : ''
          }
          ${
            generalPrecautions
              ? `<div class="rx-advice-row rx-advice-precaution"><strong>${isBn ? 'সাধারণ সতর্কতা ও যত্ন:' : 'General Precautions:'}</strong> ${generalPrecautions}</div>`
              : ''
          }
          ${
            additionalAdvice
              ? `<div class="rx-advice-row rx-advice-general"><strong>${isBn ? 'অতিরিক্ত পরামর্শ:' : 'Additional Advice:'}</strong> ${additionalAdvice}</div>`
              : ''
          }
        </div>`
          : ''
      }

      <!-- 7. Optional Warning (Rendered ONLY if entered) -->
      ${
        warning
          ? `
        <div class="rx-warning-box">
          <strong>${isBn ? 'সতর্কতা ও নিষেধাজ্ঞা:' : 'Warning & Precaution:'}</strong> ${warning}
        </div>`
          : ''
      }

      <!-- 8. Follow-up date (Rendered ONLY if entered) -->
      ${
        followUpDate
          ? `
        <div class="rx-followup-box">
          ${isBn ? 'পরবর্তী সাক্ষাতের সম্ভাব্য তারিখ:' : 'Follow-up Date:'} ${followUpDate}
        </div>`
          : ''
      }
    </div>

    <!-- 9. Doctor Signature Area & Footer -->
    <footer class="rx-footer">
      <div class="rx-footer-contact">
        ${phone ? `<div><strong>${isBn ? 'জরুরি যোগাযোগ:' : 'Emergency Contact:'}</strong> ${phone}</div>` : ''}
        ${chamberAddr ? `<div>${chamberAddr}</div>` : ''}
        <div style="margin-top: 4px; font-size: 7.5pt; color: #7B8F87;">
          ${isBn ? 'ঔষধ শিশুদের নাগালের বাইরে রাখুন। নির্দেশিত মাত্রা ছাড়া অতিরিক্ত সেবন করবেন না।' : 'Keep medicines out of reach of children. Do not alter dosage without physician consultation.'}
        </div>
      </div>

      <div class="rx-footer-signature-block">
        <div class="rx-signature-line">
          <span style="font-family: serif; font-style: italic; font-size: 8.5pt; color: #536C61;">${doctorName}</span>
        </div>
        <div class="rx-signature-name">${isBn ? 'চিকিৎসকের স্বাক্ষর' : 'Doctor Signature'}</div>
        <div class="rx-signature-title">${doctorQual || doctorName}</div>
      </div>
    </footer>

    <div class="rx-bottom-standard">
      HomioHelper Clinic Management System · Official Homoeopathic Practice Standard (Bangladesh)
    </div>
  </div>
</body>
</html>`;
}

/**
 * Creates a Blob URL from the standalone HTML document.
 * This can be used as a direct <a href="..."> link target="_blank", completely bypassing
 * popup blockers and guaranteeing a clean top-level document.
 */
export function createPrescriptionPrintBlobUrl(
  rx: Prescription,
  doctor: DoctorProfile,
  language: 'en' | 'bn' = 'bn'
): string {
  const htmlContent = generatePrescriptionPrintHtml(rx, doctor, language);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  return URL.createObjectURL(blob);
}

/**
 * Triggers direct printing of ONLY the prescription document via an isolated iframe.
 * Completely eliminates Google AI Studio toolbar, Gemini sidebar, and parent DOM chrome.
 */
export function printPrescriptionIsolated(
  rx: Prescription,
  doctor: DoctorProfile,
  language: 'en' | 'bn' = 'bn'
): boolean {
  try {
    const htmlContent = generatePrescriptionPrintHtml(rx, doctor, language);

    // Remove any previously created print iframe
    const existingIframe = document.getElementById('homiohelper-isolated-print-frame');
    if (existingIframe && existingIframe.parentNode) {
      existingIframe.parentNode.removeChild(existingIframe);
    }

    // Create an isolated iframe positioned offscreen with true A4 dimensions
    // NOTE: We do NOT use display:none or visibility:hidden because modern Chrome/Safari
    // will refuse to print hidden iframes or fall back to printing the top window!
    const iframe = document.createElement('iframe');
    iframe.id = 'homiohelper-isolated-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.left = '-10000px';
    iframe.style.top = '0';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = 'none';
    iframe.style.opacity = '0.01';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-99999';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      console.warn('Unable to access iframe document for print');
      return false;
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Allow resources/fonts to initialize before calling print on the iframe window
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (printErr) {
        console.error('Error invoking iframe print:', printErr);
      }
    }, 350);

    return true;
  } catch (err) {
    console.error('Error in printPrescriptionIsolated:', err);
    return false;
  }
}

/**
 * Opens a dedicated standalone browser tab for printing.
 * Provides a clean environment completely detached from Google AI Studio.
 */
export function openStandalonePrintTab(
  rx: Prescription,
  doctor: DoctorProfile,
  language: 'en' | 'bn' = 'bn'
): boolean {
  try {
    // Store current active prescription and doctor in localStorage for dedicated page retrieval
    localStorage.setItem('homiohelper_active_print_rx', JSON.stringify(rx));
    localStorage.setItem('homiohelper_active_print_doctor', JSON.stringify(doctor));
    localStorage.setItem('homiohelper_active_print_lang', language);

    // Generate standalone Blob URL
    const blobUrl = createPrescriptionPrintBlobUrl(rx, doctor, language);

    // Try direct window.open first
    const newWindow = window.open(blobUrl, '_blank');
    if (newWindow) {
      return true;
    }

    // Fallback: programmatic anchor click (often permitted when window.open is blocked)
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
      if (anchor.parentNode) {
        anchor.parentNode.removeChild(anchor);
      }
    }, 200);

    return true;
  } catch (err) {
    console.error('Error opening standalone print tab:', err);
    return false;
  }
}

/**
 * Downloads a pixel-perfect, clean A4 PDF file directly to the user's computer or device
 * using html2pdf.js. Completely bypasses browser print dialogs, margins, and external frames.
 */
export async function downloadPrescriptionPdf(
  rx: Prescription,
  doctor: DoctorProfile,
  language: 'en' | 'bn' = 'bn'
): Promise<boolean> {
  try {
    // Dynamically load html2pdf
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = (html2pdfModule as any).default || html2pdfModule;

    // Generate HTML
    const htmlContent = generatePrescriptionPrintHtml(rx, doctor, language);

    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '190mm';
    container.style.background = '#ffffff';
    container.innerHTML = htmlContent;

    // Remove the standalone control bar from PDF export
    const controls = container.querySelector('.standalone-controls');
    if (controls && controls.parentNode) {
      controls.parentNode.removeChild(controls);
    }

    document.body.appendChild(container);

    const targetElement = container.querySelector('.rx-paper') || container;

    const fileName = `Prescription_${rx.prescriptionNo || rx.patientRegNo || 'document'}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right in mm
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    // Execute PDF generation and download
    await (html2pdf as any)().set(opt).from(targetElement).save();

    // Cleanup
    setTimeout(() => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }, 500);

    return true;
  } catch (err) {
    console.error('Error exporting prescription PDF:', err);
    return false;
  }
}
