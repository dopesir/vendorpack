import type { Metadata } from 'next';
import '@/styles/globals.css';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nobuswork.pages.dev';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'VendorPack — Preflight Audit & Submission Dossier Compiler for Indian B2B Suppliers',
    template: '%s | VendorPack by Nobuswork'
  },
  description:
    'Turn your statutory company documents (GST, PAN, Cancelled Cheque, MSME Udyam) into a preflight-checked, indexed PDF vendor registration dossier for corporate procurement.',
  alternates: {
    canonical: '/'
  },
  keywords: [
    'VendorPack',
    'Nobuswork',
    'vendor registration dossier',
    'supplier empanelment packet',
    'GST PAN cancelled cheque check',
    'Indian vendor compliance preflight',
    'statutory document compiler',
    'procurement readiness check',
    'GSTIN PAN consistency check',
    'CBDT PAN verification rules',
    'RBI IFSC code check',
    'MSME Udyam registration verification'
  ],
  authors: [{ name: 'Nobuswork', url: appUrl }],
  creator: 'Nobuswork',
  publisher: 'Nobuswork',
  openGraph: {
    title: 'VendorPack — Preflight Audit & Submission Dossier Compiler',
    description:
      'Turn your statutory company documents into a preflight-checked, indexed PDF vendor registration dossier for corporate procurement.',
    url: appUrl,
    siteName: 'VendorPack by Nobuswork',
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VendorPack — Preflight Audit & Submission Dossier Compiler',
    description:
      'Turn your statutory company documents into a preflight-checked, indexed PDF vendor registration dossier for corporate procurement.'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  other: {
    'geo.region': 'IN',
    'geo.placename': 'India',
    'geo.position': '20.5937;78.9629',
    'ICBM': '20.5937, 78.9629'
  }
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${appUrl}/#software`,
      name: 'VendorPack',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All (Web Browser)',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        description: 'Free Statutory Preflight Audit & Compliance Verification'
      },
      featureList: [
        'Deterministic GSTIN and PAN cross-verification',
        'Bank account holder and cancelled cheque validation',
        'IFSC branch resolution and format validation',
        'MSME Udyam registration recognition',
        'Indexed, preflight-checked submission dossier PDF compilation',
        '100% ephemeral in-memory privacy model'
      ],
      description:
        'VendorPack is an industrial preflight tool for Indian B2B suppliers to cross-check statutory documents and compile clean vendor empanelment dossiers.'
    },
    {
      '@type': 'Organization',
      '@id': `${appUrl}/#organization`,
      name: 'Nobuswork',
      url: appUrl,
      areaServed: {
        '@type': 'Country',
        name: 'India'
      },
      knowsAbout: [
        'Indian Statutory Compliance',
        'GST Registration REG-06',
        'CBDT PAN Verification',
        'RBI Banking Standards',
        'Vendor Empanelment Dossiers'
      ]
    },
    {
      '@type': 'FAQPage',
      '@id': `${appUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What documents can I upload to VendorPack?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'VendorPack accepts GST Registration Certificates (REG-06), PAN Cards, Cancelled Bank Cheques, Bank Passbooks, Udyam MSME Certificates, Certificates of Incorporation, and buyer-specific registration forms in PDF, JPG, and PNG formats (up to 15MB each).'
          }
        },
        {
          '@type': 'Question',
          name: 'Does VendorPack verify my business with government portals?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. VendorPack is an automated document organization and consistency-checking aid. It performs deterministic cross-checks between your uploaded files (such as confirming that your GSTIN embeds your PAN, and checking name alignment between your bank proof and statutory records). It does not access paid government portals or provide legal certification.'
          }
        },
        {
          '@type': 'Question',
          name: 'Are my uploaded documents stored permanently?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. VendorPack operates with minimal data retention. Files are processed in temporary memory to generate your preflight report and compiled pack. You can click "Delete My Documents Now" at any time to immediately wipe all data, and any uncollected files are automatically purged within 24 hours.'
          }
        },
        {
          '@type': 'Question',
          name: 'What happens if a document or check is flagged as REVIEW?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A REVIEW status is not a failure. It highlights common legitimate variations—such as an individual proprietor name on a bank cheque differing from a trade name on a GST certificate. VendorPack provides plain-English explanations so you can confirm buyer preferences before submitting.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can I reorder documents to match a buyer specific checklist?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The Pack Customizer lets you drag to reorder attachments, exclude specific files, select whether your Legal Name or Trade Name appears in the cover header, and add optional signatory contact details.'
          }
        }
      ]
    },
    {
      '@type': 'HowTo',
      '@id': `${appUrl}/#howto`,
      name: 'How to Prepare a Statutory Vendor Registration Dossier for Indian Corporate Procurement',
      description: 'Step-by-step guide to cross-checking company statutory records and compiling an indexed submission dossier.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload Statutory Records',
          text: 'Upload your GST Registration Certificate (REG-06), PAN Card, Cancelled Cheque or Bank Passbook, and MSME Udyam Certificate.'
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Review Preflight Consistency Matrix',
          text: 'Inspect automated cross-checks for GSTIN-to-PAN matching, bank account name alignment, IFSC validity, and document legibility.'
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Compile and Download Stamped Dossier',
          text: 'Generate an indexed PDF dossier containing a formal cover sheet, table of contents, and compiled statutory exhibits ready for procurement submission.'
        }
      ]
    }
  ]
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#FAFAFA] text-neutral-900 min-h-screen flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
