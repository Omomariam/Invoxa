# Invoice Detail Page Component

'use client';

This page displays the complete details of a single invoice including:
- Invoice information (number, description, amount, dates)
- Client and issuer addresses
- Current status with visual indicators
- QR code for invoice sharing
- Payment link that can be copied
- Action buttons (Mark as Paid, Share, Export)
- Payment receipt if invoice is paid

The component uses:
- useParams() to get the invoice ID from URL
- useInvoiceStore() to retrieve invoice data
- Zustand store for state management
- QR code generation for sharing
- Formatted dates and addresses

Features:
- Responsive design that works on mobile
- Copy-to-clipboard functionality
- QR code toggle
- Overdue invoice warnings
- Payment receipt display
