require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const emailArg = process.argv[2];
const passwordArg = process.argv[3] || 'admin123';

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  let admin = null;

  if (emailArg) {
    admin = await Admin.findOne({ email: emailArg });
  }

  if (!admin) {
    admin = await Admin.findOne().sort({ createdAt: 1 });
  }

  if (!admin) {
    const fallbackEmail = emailArg || 'admin@library.local';
    admin = new Admin({
      name: 'Admin',
      email: fallbackEmail,
      password: passwordArg
    });
    await admin.save();

    console.log(`Created admin ${admin.email} with password ${passwordArg}`);
    return;
  }

  admin.password = passwordArg;
  await admin.save();

  console.log(`Updated admin ${admin.email} with new password ${passwordArg}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
