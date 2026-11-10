import { runPreflightChecks, INDIAN_GST_STATE_CODES, PAN_ENTITY_TYPES } from '../src/lib/validation';
import { calculateReadinessScore } from '../src/lib/scoring';
import { AggregatedExtractedData } from '../src/lib/types';

console.log('========================================================================');
console.log('OFFICIAL INDIAN GOVERNMENT STATUTORY DOCUMENT BENCHMARK TEST');
console.log('========================================================================\n');

let totalTests = 0;
let passedTests = 0;

function testAssert(condition: boolean, title: string, details?: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${title}`);
    if (details) console.log(`   ℹ️ ${details}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${title}`);
    if (details) console.error(`   ⚠️ Details: ${details}`);
  }
}

// ------------------------------------------------------------------------
// CASE 1: Maharashtra Private Limited (Engineering & Fabrication)
// Official Formats: GST REG-06 (27AABCU9603R1ZM), PAN (AABCU9603R), HDFC IFSC (HDFC0000128), Udyam (UDYAM-MH-01-0012345)
// ------------------------------------------------------------------------
console.log('📌 CASE 1: Maharashtra Private Limited Company (Pvt Ltd, 27, PAN Entity: "C")');
const case1: AggregatedExtractedData = {
  companyName: 'ACME ENGINEERING PRIVATE LIMITED',
  legalName: 'ACME ENGINEERING PRIVATE LIMITED',
  tradeName: 'ACME FABRICATORS',
  gstin: '27AABCU9603R1ZM',
  pan: 'AABCU9603R',
  udyamNumber: 'UDYAM-MH-01-0012345',
  msmeCategory: 'Small',
  bankAccountName: 'ACME ENGINEERING PVT LTD',
  bankAccountNumber: '50200012345678',
  bankIfsc: 'HDFC0000128',
  bankName: 'HDFC Bank Ltd',
  isPrePrintedCheque: true,
  bankDetails: {
    accountHolderName: 'ACME ENGINEERING PVT LTD',
    accountNumber: '50200012345678',
    ifsc: 'HDFC0000128',
    isPrePrinted: true
  },
  documents: [
    { id: '1', fileName: 'GST_Certificate_REG06.pdf', type: 'gst_certificate', confidence: 0.99, issues: [] },
    { id: '2', fileName: 'Company_PAN_Card.png', type: 'pan_card', confidence: 0.98, issues: [] },
    { id: '3', fileName: 'Cancelled_Cheque_HDFC.jpg', type: 'bank_proof', confidence: 0.97, issues: [] },
    { id: '4', fileName: 'Udyam_Registration_Certificate.pdf', type: 'udyam_certificate', confidence: 0.99, issues: [] }
  ]
};

const res1 = runPreflightChecks(case1);
const score1 = calculateReadinessScore(case1, res1);

const gstin1 = res1.find((r) => r.id === 'gstin_pan_match');
testAssert(gstin1?.status === 'PASS', 'Case 1: GSTIN ↔ PAN linkage passes with full state code recognition', gstin1?.message);
testAssert(gstin1?.message.includes('Maharashtra (27)') === true, 'Case 1: State code 27 resolved to Maharashtra');
testAssert(gstin1?.message.includes('Company (Private / Public Limited)') === true, 'Case 1: PAN 4th character "C" resolved to Company entity');

const name1 = res1.find((r) => r.id === 'name_bank_match');
testAssert(name1?.status === 'PASS', 'Case 1: Legal Name vs Bank Cheque match passes', name1?.message);

const ifsc1 = res1.find((r) => r.id === 'ifsc_format');
testAssert(ifsc1?.status === 'PASS', 'Case 1: RBI IFSC structure passes (HDFC Bank)', ifsc1?.message);

const udyam1 = res1.find((r) => r.id === 'udyam_presence');
testAssert(udyam1?.status === 'PASS', 'Case 1: Udyam statutory registration passes', udyam1?.message);

testAssert(score1.totalScore === 100, `Case 1: Readiness Score is perfect 100/100 (Actual: ${score1.totalScore})`);

// ------------------------------------------------------------------------
// CASE 2: Delhi Sole Proprietorship (Services & Retail)
// Official Formats: GST REG-06 (07AAPPR1234F1Z8), PAN (AAPPR1234F - 4th char "P"), ICICI IFSC (ICIC0000007), Cheque with Proprietor Name
// ------------------------------------------------------------------------
console.log('\n📌 CASE 2: Delhi Sole Proprietorship (Individual PAN "P", Trade Name vs Cheque Name)');
const case2: AggregatedExtractedData = {
  companyName: 'RAMESH ENTERPRISES',
  legalName: 'RAMESH TRADING COMPANY',
  tradeName: 'RAMESH ENTERPRISES',
  gstin: '07AAPPR1234F1Z8',
  pan: 'AAPPR1234F',
  udyamNumber: 'UDYAM-DL-02-0098765',
  msmeCategory: 'Micro',
  bankAccountName: 'RAMESH KUMAR (PROPRIETOR)',
  bankAccountNumber: '000701509821',
  bankIfsc: 'ICIC0000007',
  bankName: 'ICICI Bank Ltd',
  isPrePrintedCheque: false, // Handwritten leaf
  bankDetails: {
    accountHolderName: 'RAMESH KUMAR (PROPRIETOR)',
    accountNumber: '000701509821',
    ifsc: 'ICIC0000007',
    isPrePrinted: false
  },
  documents: [
    { id: '1', fileName: 'GST_Delhi_REG06.pdf', type: 'gst_certificate', confidence: 0.95, issues: [] },
    { id: '2', fileName: 'Proprietor_PAN.jpg', type: 'pan_card', confidence: 0.96, issues: [] },
    { id: '3', fileName: 'Cheque_Leaf_Handwritten.png', type: 'bank_proof', confidence: 0.91, issues: [] },
    { id: '4', fileName: 'Udyam_Delhi_Cert.pdf', type: 'udyam_certificate', confidence: 0.94, issues: [] }
  ]
};

const res2 = runPreflightChecks(case2);
const score2 = calculateReadinessScore(case2, res2);

const gstin2 = res2.find((r) => r.id === 'gstin_pan_match');
testAssert(gstin2?.status === 'PASS', 'Case 2: Delhi GSTIN (07) ↔ PAN structural link passes');
testAssert(gstin2?.message.includes('Delhi (07)') === true, 'Case 2: State code 07 correctly identified as Delhi');
testAssert(gstin2?.message.includes('Individual / Sole Proprietor') === true, 'Case 2: 4th char "P" identified as Individual / Sole Proprietor');

const name2 = res2.find((r) => r.id === 'name_bank_match');
testAssert(name2?.status === 'REVIEW', 'Case 2: Name difference flags REVIEW (Human-in-the-loop)');
testAssert(name2?.message.includes('sole proprietorships') === true, 'Case 2: Informative note about sole proprietorship conventions provided');

const cheque2 = res2.find((r) => r.id === 'cheque_preprinted');
testAssert(cheque2?.status === 'REVIEW', 'Case 2: Handwritten cheque leaf flagged as REVIEW');

testAssert(score2.totalScore >= 75 && score2.totalScore <= 90, `Case 2: Readiness Score accurately reflects single Review item (${score2.totalScore}/100)`);

// ------------------------------------------------------------------------
// CASE 3: Karnataka Partnership Firm / LLP (Bangalore)
// Official Formats: GST (29AABFK4567Q1Z2), PAN (AABFK4567Q - 4th char "F"), Axis Bank (UTIB0000010)
// ------------------------------------------------------------------------
console.log('\n📌 CASE 3: Karnataka Partnership Firm (29, PAN Entity: "F" Partnership)');
const case3: AggregatedExtractedData = {
  companyName: 'NEXUS LOGISTICS LLP',
  legalName: 'NEXUS LOGISTICS LLP',
  tradeName: 'NEXUS CARGO',
  gstin: '29AABFK4567Q1Z2',
  pan: 'AABFK4567Q',
  bankAccountName: 'NEXUS LOGISTICS LLP',
  bankAccountNumber: '912020045678901',
  bankIfsc: 'UTIB0000010',
  bankName: 'Axis Bank Ltd',
  isPrePrintedCheque: true,
  bankDetails: {
    accountHolderName: 'NEXUS LOGISTICS LLP',
    accountNumber: '912020045678901',
    ifsc: 'UTIB0000010',
    isPrePrinted: true
  },
  documents: [
    { id: '1', fileName: 'GST_Karnataka.pdf', type: 'gst_certificate', confidence: 0.98, issues: [] },
    { id: '2', fileName: 'Firm_PAN_Card.png', type: 'pan_card', confidence: 0.99, issues: [] },
    { id: '3', fileName: 'Axis_Bank_Cheque.jpg', type: 'bank_proof', confidence: 0.97, issues: [] }
  ]
};

const res3 = runPreflightChecks(case3);
const gstin3 = res3.find((r) => r.id === 'gstin_pan_match');
testAssert(gstin3?.status === 'PASS', 'Case 3: Karnataka GSTIN (29) ↔ PAN structural link passes');
testAssert(gstin3?.message.includes('Karnataka (29)') === true, 'Case 3: State code 29 identified as Karnataka');
testAssert(gstin3?.message.includes('Partnership Firm / LLP') === true, 'Case 3: 4th char "F" identified as Partnership Firm');

// ------------------------------------------------------------------------
// CASE 4: Adversarial Checks (Mismatches & Invalid Banking Formats)
// ------------------------------------------------------------------------
console.log('\n📌 CASE 4: Adversarial Statutory Mismatches');

// Mismatched PAN embedded
const case4A: AggregatedExtractedData = {
  gstin: '33AABCT9999C1ZM', // Embeds AABCT9999C
  pan: 'ZZZZZ1111Z',        // Discrepancy
  documents: [
    { id: '1', fileName: 'gst.pdf', type: 'gst_certificate', confidence: 0.95, issues: [] },
    { id: '2', fileName: 'pan.pdf', type: 'pan_card', confidence: 0.95, issues: [] }
  ]
};
const res4A = runPreflightChecks(case4A);
const gstin4A = res4A.find((r) => r.id === 'gstin_pan_match');
testAssert(gstin4A?.status === 'REVIEW', 'Case 4A: Embedded PAN discrepancy flagged as REVIEW');

// Invalid IFSC (5th char is NOT '0')
const case4B: AggregatedExtractedData = {
  bankAccountName: 'ABC CORP',
  bankIfsc: 'SBIN1234567', // Invalid: 5th char is '1' instead of '0'
  documents: [{ id: '1', fileName: 'cheque.jpg', type: 'bank_proof', confidence: 0.9, issues: [] }]
};
const res4B = runPreflightChecks(case4B);
const ifsc4B = res4B.find((r) => r.id === 'ifsc_format');
testAssert(ifsc4B?.status === 'REVIEW', 'Case 4B: Invalid RBI IFSC (non-zero 5th char) flagged as REVIEW');

console.log('\n========================================================================');
console.log(`OFFICIAL GOVT DOC BENCHMARK: ${totalTests} TESTS | ${passedTests} PASSED | ${totalTests - passedTests} FAILED`);
console.log('========================================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
