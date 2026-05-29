const { Client } = require('pg')
const bcrypt = require('bcryptjs')

async function seedAdmin() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/zhongai_alliance'

  const client = new Client({ connectionString: databaseUrl })

  try {
    await client.connect()
    console.log('Connected to database')

    const username = process.env.ADMIN_USERNAME || 'admin'
    const password = process.env.ADMIN_PASSWORD || 'admin123456'
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await client.query(
      `INSERT INTO users (openid, username, password_hash, role, nickname)
       VALUES ($1, $2, $3, 'admin', '系统管理员')
       ON CONFLICT (username) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         nickname = EXCLUDED.nickname
       RETURNING id, username, role, nickname`,
      ['admin-openid', username, hashedPassword]
    )

    console.log('Admin user seeded successfully:', result.rows[0])
  } catch (error) {
    console.error('Failed to seed admin user:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

seedAdmin()
