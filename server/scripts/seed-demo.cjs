const { Client } = require('pg')
const bcrypt = require('bcryptjs')

async function seedDemoData() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/zhongai_alliance'
  const client = new Client({ connectionString: databaseUrl })

  try {
    await client.connect()
    console.log('Connected to database')

    const users = [
      {
        openid: 'volunteer-1-openid',
        phone: '13800138001',
        nickname: '志愿者张三',
        role: 'volunteer',
      },
      {
        openid: 'volunteer-2-openid', 
        phone: '13800138002',
        nickname: '志愿者李四',
        role: 'volunteer',
      },
      {
        openid: 'volunteer-3-openid',
        phone: '13800138003',
        nickname: '志愿者王五',
        role: 'volunteer',
      },
    ]

    for (const user of users) {
      const result = await client.query(
        `INSERT INTO users (openid, phone, nickname, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (openid) DO NOTHING
         RETURNING id, nickname`,
        [user.openid, user.phone, user.nickname, user.role]
      )
      if (result.rows.length > 0) {
        console.log('Created user:', result.rows[0])
      }
    }

    const activities = [
      {
        title: '社区环保清洁活动',
        category: 'environment',
        description: '组织志愿者对社区进行全面清洁，包括垃圾分类、绿化维护等工作。',
        coverImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=community%20environmental%20cleaning%20activity%20volunteers&image_size=landscape_16_9',
        location: '幸福社区广场',
        startTime: '2026-06-01 09:00:00',
        endTime: '2026-06-01 12:00:00',
        checkinRadius: 500,
        maxParticipants: 30,
        rewardPoints: 100,
        status: 'published',
      },
      {
        title: '关爱孤寡老人活动',
        category: 'elderly',
        description: '陪伴社区孤寡老人聊天、做家务，给予他们温暖和关怀。',
        coverImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=volunteers%20visiting%20elderly%20people%20care%20activity&image_size=landscape_16_9',
        location: '敬老院',
        startTime: '2026-06-08 09:00:00',
        endTime: '2026-06-08 11:30:00',
        checkinRadius: 300,
        maxParticipants: 20,
        rewardPoints: 80,
        status: 'published',
      },
      {
        title: '贫困儿童助学活动',
        category: 'education',
        description: '为贫困地区儿童捐赠书籍和学习用品，帮助他们更好地学习。',
        coverImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=children%20education%20donation%20activity%20school%20supplies&image_size=landscape_16_9',
        location: '希望小学',
        startTime: '2026-06-15 10:00:00',
        endTime: '2026-06-15 14:00:00',
        checkinRadius: 200,
        maxParticipants: 25,
        rewardPoints: 120,
        status: 'draft',
      },
    ]

    const adminResult = await client.query('SELECT id FROM users WHERE role = $1', ['admin'])
    const adminId = adminResult.rows[0]?.id
    console.log('Found admin user:', adminId)

    for (const activity of activities) {
      const result = await client.query(
        `INSERT INTO activities (title, category, description, cover_image, location, start_time, end_time, checkin_radius, max_participants, reward_points, status, organizer_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id, title, status`,
        [activity.title, activity.category, activity.description, activity.coverImage, activity.location, activity.startTime, activity.endTime, activity.checkinRadius, activity.maxParticipants, activity.rewardPoints, activity.status, adminId]
      )
      if (result.rows.length > 0) {
        console.log('Created activity:', result.rows[0])
      }
    }

    const volunteerUsersResult = await client.query('SELECT id FROM users WHERE role = $1', ['volunteer'])
    const volunteerIds = volunteerUsersResult.rows.map(row => row.id)
    console.log('Found volunteer users:', volunteerIds)

    const donations = [
      {
        userId: volunteerIds[0],
        donationType: 'money',
        amount: 500,
        evidenceImages: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=donation%20receipt%20bank%20transfer&image_size=square'],
        evidenceDesc: '通过银行转账捐赠500元用于公益事业',
        status: 'approved',
        pointsGranted: true,
      },
      {
        userId: volunteerIds[1],
        donationType: 'material',
        materialDesc: '捐赠书籍100本，学习用品若干',
        materialValue: 300,
        evidenceImages: ['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=book%20donation%20boxes%20education%20supplies&image_size=square'],
        evidenceDesc: '为希望小学捐赠图书',
        status: 'pending',
        pointsGranted: false,
      },
    ]

    for (const donation of donations) {
      const result = await client.query(
        `INSERT INTO donations (user_id, donation_type, amount, material_desc, material_value, evidence_images, evidence_desc, status, points_granted)
         VALUES ($1, $2, $3, $4, $5, $6::json, $7, $8, $9)
         RETURNING id, donation_type, status`,
        [donation.userId, donation.donationType, donation.amount, donation.materialDesc, donation.materialValue, JSON.stringify(donation.evidenceImages), donation.evidenceDesc, donation.status, donation.pointsGranted]
      )
      if (result.rows.length > 0) {
        console.log('Created donation:', result.rows[0])
      }
    }

    const pointRules = [
      { ruleType: 'activity_checkin', pointType: 'reward', pointsPerUnit: 10, unitDesc: '次', isActive: true },
      { ruleType: 'activity_complete', pointType: 'reward', pointsPerUnit: 0, unitDesc: '次', isActive: true },
      { ruleType: 'first_register', pointType: 'reward', pointsPerUnit: 50, unitDesc: '次', isActive: true },
      { ruleType: 'realname_verify', pointType: 'reward', pointsPerUnit: 30, unitDesc: '次', isActive: true },
      { ruleType: 'donation', pointType: 'reward', pointsPerUnit: 1, unitDesc: '元', minAmount: 1, isActive: true },
    ]

    for (const rule of pointRules) {
      const result = await client.query(
        `INSERT INTO point_rules (rule_type, point_type, points_per_unit, unit_desc, min_amount, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, rule_type`,
        [rule.ruleType, rule.pointType, rule.pointsPerUnit, rule.unitDesc, rule.minAmount, rule.isActive]
      )
      if (result.rows.length > 0) {
        console.log('Created point rule:', result.rows[0])
      }
    }

    console.log('Demo data seeded successfully!')
  } catch (error) {
    console.error('Failed to seed demo data:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

seedDemoData()