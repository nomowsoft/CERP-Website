import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
// @ts-ignore
import ArabicReshaper from 'arabic-reshaper';

// Helper to fix Arabic text for jsPDF
const fixArabic = (text: string) => {
    if (!text) return '';
    try {
        // First reshape the Arabic characters
        const reshaped = ArabicReshaper.reshape(text);
        // Then reverse the string because jsPDF renders LTR
        const reversed = reshaped.split('').reverse().join('');

        // Restore numbers and Latin characters to their original order
        // This regex matches sequences of numbers (including Arabic-Indic), Latin letters, and common symbols like . , : /
        return reversed.replace(/[0-9a-zA-Z\u0660-\u0669.:/]+[-0-9a-zA-Z\u0660-\u0669.:/]*/g, (match: string) => {
            return match.split('').reverse().join('');
        });
    } catch (e) {
        console.error("Arabic reshaping failed", e);
        return text;
    }
};

export const generateInvoicePDF = async (invoice: any, subscription: any, locale: string) => {
    try {
        const doc = new jsPDF();
        const isAr = locale === 'ar';
        const amount = Number(invoice.amount);
        const vatRate = 0.15;
        const subtotal = amount / (1 + vatRate);
        const vatAmount = amount - subtotal;

        // Load Font for Arabic Support
        const fontUrl = '/fonts/Tajawal-Regular.ttf';
        const fontResponse = await fetch(fontUrl);
        const fontBuffer = await fontResponse.arrayBuffer();

        // More robust way to convert buffer to base64
        const binary = new Uint8Array(fontBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '');
        const fontBase64 = btoa(binary);

        doc.addFileToVFS('Tajawal-Regular.ttf', fontBase64);
        doc.addFont('Tajawal-Regular.ttf', 'Tajawal', 'normal');
        doc.setFont('Tajawal');

        // --- Header Section ---
        // Blue Top Bar
        doc.setFillColor(30, 41, 59); // Dark blue
        doc.rect(0, 0, 210, 15, 'F');

        // Title
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        const title = isAr ? 'فاتورة ضريبية مبسطة' : 'Simplified Tax Invoice';
        doc.text(isAr ? fixArabic(title) : title, 105, 30, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        const vatIdText = isAr ? 'الرقم الضريبي: 310294857600003' : 'VAT ID: 310294857600003';
        doc.text(isAr ? fixArabic(vatIdText) : vatIdText, 105, 37, { align: 'center' });

        doc.setLineWidth(0.5);
        doc.setDrawColor(220, 220, 220);
        doc.line(20, 45, 190, 45);

        // --- Info Section ---
        doc.setFontSize(12);
        doc.setTextColor(30, 30, 30);

        // Issuer Info
        const leftX = 20;
        const rightX = 190;
        let infoY = 60;

        if (isAr) {
            // Right: Company Info
            doc.setFontSize(14);
            doc.text(fixArabic('مؤسسة سرب للاتصالات وتقنية المعلومات'), rightX, infoY, { align: 'right' });
            doc.setFontSize(10);
            doc.text(fixArabic('الرياض، المملكة العربية السعودية'), rightX, infoY + 7, { align: 'right' });
            doc.text(fixArabic('هاتف: 920012345'), rightX, infoY + 12, { align: 'right' });

            // Left: Client Info
            doc.setFontSize(14);
            doc.text(fixArabic('فاتورة إلى:'), 20, infoY, { align: 'left' });
            doc.setFontSize(11);
            doc.text(fixArabic(`العميل: ${subscription.fullName}`), 20, infoY + 7, { align: 'left' });
            doc.text(fixArabic(`النطاق: ${subscription.domainName || '--'}`), 20, infoY + 12, { align: 'left' });
            doc.text(fixArabic(`تاريخ الفاتورة: ${invoice.date}`), 20, infoY + 17, { align: 'left' });
            doc.text(fixArabic(`رقم الفاتورة: ${invoice.id}`), 20, infoY + 22, { align: 'left' });
        } else {
            // Left: Company Info
            doc.setFontSize(14);
            doc.text('SERP Communications & IT', leftX, infoY);
            doc.setFontSize(10);
            doc.text('Riyadh, Saudi Arabia', leftX, infoY + 7);
            doc.text('Tel: 920012345', leftX, infoY + 12);

            // Right: Client Info
            doc.setFontSize(14);
            doc.text('Bill To:', rightX, infoY, { align: 'right' });
            doc.setFontSize(11);
            doc.text(`Customer: ${subscription.fullName}`, rightX, infoY + 7, { align: 'right' });
            doc.text(`Domain: ${subscription.domainName || '--'}`, rightX, infoY + 12, { align: 'right' });
            doc.text(`Date: ${invoice.date}`, rightX, infoY + 17, { align: 'right' });
            doc.text(`Invoice No: ${invoice.id}`, rightX, infoY + 22, { align: 'right' });
        }

        // --- Table Section ---
        const packageName = isAr ?
            (subscription.package?.name_ar || subscription.package?.name) :
            (subscription.package?.name_en || subscription.package?.name);

        const tableHead = [
            isAr ? 'الوصف' : 'Description',
            isAr ? 'سعر الوحدة' : 'Unit Price',
            isAr ? 'الكمية' : 'Qty',
            isAr ? 'المجموع' : 'Total'
        ];

        autoTable(doc, {
            startY: infoY + 35,
            theme: 'striped',
            headStyles: {
                fillColor: [30, 41, 59],
                textColor: 255,
                font: 'Tajawal',
                fontSize: 12,
                halign: isAr ? 'right' : 'left'
            },
            styles: {
                font: 'Tajawal',
                fontSize: 10,
                halign: isAr ? 'right' : 'left'
            },
            head: [isAr ? tableHead.map(h => fixArabic(h)) : tableHead],
            body: [
                [
                    isAr ? fixArabic(packageName) : packageName,
                    `${subtotal.toFixed(2)} SAR`,
                    '1',
                    `${subtotal.toFixed(2)} SAR`
                ]
            ],
            // For Arabic, we might need to swap columns if we want true RTL feel in the table
            // But jspdf-autotable handles halign per cell, so let's keep the order for now
        });

        // --- Summary Section ---
        //@ts-ignore
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(130, finalY, 190, finalY);

        doc.setFontSize(10);
        const summaryX = isAr ? 190 : 130;
        const align = isAr ? 'right' : 'left';

        const subtotalText = isAr ? `المجموع الفرعي (غير شامل الضريبة): ${subtotal.toFixed(2)} ر.س` : `Subtotal (Excl. VAT): ${subtotal.toFixed(2)} SAR`;
        const vatText = isAr ? `ضريبة القيمة المضافة (15٪): ${vatAmount.toFixed(2)} ر.س` : `VAT (15%): ${vatAmount.toFixed(2)} SAR`;

        doc.text(isAr ? fixArabic(subtotalText) : subtotalText, summaryX, finalY + 10, { align });
        doc.text(isAr ? fixArabic(vatText) : vatText, summaryX, finalY + 17, { align });

        doc.setFontSize(12);
        doc.setFont('Tajawal', 'bold');
        const grossTotalText = isAr ? `الإجمالي شامل الضريبة: ${amount.toFixed(2)} ر.س` : `Gross Total (Incl. VAT): ${amount.toFixed(2)} SAR`;
        doc.text(isAr ? fixArabic(grossTotalText) : grossTotalText, summaryX, finalY + 27, { align });

        // --- Footer ---
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.setFont('Tajawal', 'normal');

        const footerMsg = isAr ? 'شكراً لتعاملكم معنا - مؤسسة سرب للاتصالات وتقنية المعلومات' : 'Thank you for choosing us - SERP Communications & IT';
        doc.text(isAr ? fixArabic(footerMsg) : footerMsg, 105, pageHeight - 15, { align: 'center' });
        doc.text('www.cerp.sa | support@cerp.sa', 105, pageHeight - 10, { align: 'center' });

        doc.save(`${invoice.id}.pdf`);
    } catch (error) {
        console.error("PDF Generation failed", error);
    }
};

