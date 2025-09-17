const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.register = async (req, res) => {
  const { email, password, invitationCode } = req.body;

  if (!email || !password || !invitationCode) {
    return res.status(400).json({ error: "Email, password, and invitation code are required" });
  }

  try {
    // Find the tenant by the invitation code
    const tenant = await prisma.tenant.findUnique({ where: { invitationCode } });
    if (!tenant) {
      return res.status(400).json({ error: "Invalid invitation code" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        tenantId: tenant.id, // Associate user with the found tenant's ID
      },
    });

    res.status(201).json({ message: "User created successfully", userId: user.id });
  } catch (err) {
    res.status(500).json({ error: "Server error during registration" });
  }
};

// Login a user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId },
      process.env.JWT_SECRET || "your_jwt_secret", // Add a JWT_SECRET to your .env file
      { expiresIn: "1h" }
    );

    res.json({ token, tenantId: user.tenantId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};