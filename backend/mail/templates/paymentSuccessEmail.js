// Payment Success Email Template
const paymentSuccessEmail = (name, amount, orderId, paymentId) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding-bottom: 30px;">
          <h1 style="color: #28a745; margin: 0;">Payment Successful! 🎉</h1>
        </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your payment has been successfully processed.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          <p><strong>Amount Paid:</strong> ₹${amount}</p>
        </div>
        <p>You will receive a separate enrollment confirmation email for your courses shortly.</p>
        <p>Thank you for choosing LearnX!</p>
        <p style="margin-top: 30px;">Best regards,<br /><strong>LearnX Team</strong></p>
      </body>
    </html>
  `;
};

module.exports = paymentSuccessEmail;
