import User from "./models/userModel.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const migrateUsers = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // Find all users that don't have the 2FA fields
    const users = await User.find({
      $or: [
        { isTwoFactorEnabled: { $exists: false } },
        { twoFactorSecret: { $exists: false } },
        { twoFactorBackupCodes: { $exists: false } },
      ],
    });

    console.log(`Found ${users.length} users to migrate`);

    // Update each user with the new fields
    for (const user of users) {
      user.isTwoFactorEnabled = false; // Default to disabled for existing users
      user.twoFactorSecret = null;
      user.twoFactorBackupCodes = [];

      await user.save();
      console.log(`Migrated user: ${user.email}`);
    }

    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

export default migrateUsers;
