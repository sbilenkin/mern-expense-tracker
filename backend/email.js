import nodemailer from 'nodemailer';
import { User, Transaction } from './server.js';

// Email configuration
// const emailTransporter = nodemailer.createTransporter({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// Replace the emailTransporter configuration with this for testing:
const emailTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'autumn.reichel@ethereal.email',
        pass: 'v4N5rDwvF1chCcWJWW'
    }
});

const testEmailConnection = async () => {
  try {
    await emailTransporter.verify();
    console.log('Email transporter is ready to send emails');
  } catch (error) {
    console.error('Email transporter error:', error);
  }
};

const generateMonthlyEmailHTML = (user, transactions, stats) => {
  const { totalIncome, totalExpenses, netAmount, transactionCount } = stats;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
        .stat-box { background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #28a745; }
        .expense { color: #dc3545; }
        .transaction-list { margin-top: 20px; }
        .transaction-item { padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
        .transaction-amount.income { color: #28a745; }
        .transaction-amount.expense { color: #dc3545; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Monthly Expense Summary</h1>
          <p>Hello ${user.username}! Here's your financial summary for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-value">$${totalIncome.toFixed(2)}</div>
            <div>Total Income</div>
          </div>
          <div class="stat-box">
            <div class="stat-value expense">$${totalExpenses.toFixed(2)}</div>
            <div>Total Expenses</div>
          </div>
          <div class="stat-box">
            <div class="stat-value ${netAmount >= 0 ? '' : 'expense'}">$${netAmount.toFixed(2)}</div>
            <div>Net Amount</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${transactionCount}</div>
            <div>Transactions</div>
          </div>
        </div>
        
        ${transactions.length > 0 ? `
          <div class="transaction-list">
            <h3>Recent Transactions</h3>
            ${transactions.slice(0, 10).map(t => `
              <div class="transaction-item">
                <div>
                  <strong>${t.description}</strong><br>
                  <small>${new Date(t.date).toLocaleDateString()}</small>
                </div>
                <div class="transaction-amount ${t.type}">
                  ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                </div>
              </div>
            `).join('')}
            ${transactions.length > 10 ? '<p><em>... and ' + (transactions.length - 10) + ' more transactions</em></p>' : ''}
          </div>
        ` : '<p>No transactions this month.</p>'}
        
        <div class="footer">
          <p>This is an automated email from your Expense Tracker app.</p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Visit your dashboard</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendMonthlyEmail = async (user, transactions, stats) => {
  console.log(`Sending monthly email to ${user.email}...`);
  try {
    const htmlContent = generateMonthlyEmailHTML(user, transactions, stats);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Monthly Summary - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      html: htmlContent,
    };
    
    await emailTransporter.sendMail(mailOptions);
    console.log(`Monthly email sent to ${user.email}`);
  } catch (error) {
    console.error(`Failed to send email to ${user.email}:`, error);
  }
};

const generateMonthlySummaries = async () => {
  console.log('Generating monthly email summaries...');
  try {
    console.log('Starting monthly email summaries...');
    
    // Get all users who have email notifications enabled
    const users = await User.find({ emailNotifications: true });
    console.log(users);
    
    for (const user of users) {
      // Get transactions for the current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const transactions = await Transaction.find({
        username: user.username,
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      }).sort({ date: -1 });
      
      // Calculate statistics
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const stats = {
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
        transactionCount: transactions.length,
      };
      
      // Send email
      await sendMonthlyEmail(user, transactions, stats);
      
      // Add small delay to avoid overwhelming the email service
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Monthly email summaries completed');
  } catch (error) {
    console.error('Error generating monthly summaries:', error);
  }
};

export { generateMonthlySummaries, sendMonthlyEmail, testEmailConnection };