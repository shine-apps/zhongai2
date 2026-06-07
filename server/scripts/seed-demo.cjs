const { Client } = require('pg')
const bcrypt = require('bcryptjs')

async function seedDemoData() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/zhongai'
  const client = new Client({ connectionString: databaseUrl })

  try {
    await client.connect()
    console.log('Connected to database')
    await client.query('BEGIN')

    // ─────────────────────────────────────────────────────────────
    // ENSURE MISSING TABLES / INDEXES EXIST
    // ─────────────────────────────────────────────────────────────
    console.log('\n[0/15] Ensuring missing tables and indexes exist...')

    await client.query(`CREATE TABLE IF NOT EXISTS honor_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name varchar(100) NOT NULL,
      type varchar(20) NOT NULL,
      description varchar(500),
      image_url varchar(500),
      unlock_type varchar(20) NOT NULL,
      unlock_value integer NOT NULL,
      unlock_level integer DEFAULT 0,
      unlock_activity_count integer DEFAULT 0,
      unlock_donation_amount numeric(10,2) DEFAULT 0,
      is_active boolean DEFAULT true,
      stock integer DEFAULT -1,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )`)

    await client.query(`CREATE TABLE IF NOT EXISTS honor_records (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id),
      item_id uuid NOT NULL REFERENCES honor_items(id),
      item_name varchar(100) NOT NULL,
      item_type varchar(20) NOT NULL,
      status varchar(20) DEFAULT 'pending',
      certificate_no varchar(50),
      certificate_url varchar(500),
      issue_time timestamptz,
      receive_time timestamptz,
      receive_location varchar(200),
      receive_contact varchar(100),
      issued_by uuid REFERENCES users(id),
      note varchar(200),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )`)

    await client.query(`CREATE TABLE IF NOT EXISTS feedbacks (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id),
      type varchar(20) NOT NULL,
      title varchar(100) NOT NULL,
      content text NOT NULL,
      images varchar(500)[],
      contact_info varchar(100),
      status varchar(20) DEFAULT 'pending',
      priority varchar(10) DEFAULT 'normal',
      assigned_to uuid REFERENCES users(id),
      response text,
      response_time timestamptz,
      resolved_time timestamptz,
      user_rating integer,
      user_rating_note varchar(200),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )`)

    await client.query(`CREATE TABLE IF NOT EXISTS notifications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type varchar(30) NOT NULL,
      title varchar(100) NOT NULL,
      content text NOT NULL,
      data jsonb DEFAULT '{}',
      is_read boolean DEFAULT false,
      read_at timestamptz,
      created_at timestamptz DEFAULT now(),
      expires_at timestamptz
    )`)

    // Add unique composite indexes where missing
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_reg_act_user ON activity_registrations (activity_id, user_id)`)
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_chk_act_user  ON activity_checkins    (activity_id, user_id)`)
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_honor_records_user_item ON honor_records        (user_id, item_id)`)

    // Ensure columns added by migration 0002 exist (idempotent)
    await client.query(`ALTER TABLE point_transactions ADD COLUMN IF NOT EXISTS change_type varchar(10) DEFAULT 'earn'`)
    await client.query(`ALTER TABLE point_transactions ADD COLUMN IF NOT EXISTS balance_after integer`)

    console.log('  Tables/indexes ensured.')

    // Clean previous demo data (order matters due to FK constraints)
    console.log('  Cleaning previous demo data...')
    await client.query(`TRUNCATE
      notifications, feedbacks, honor_records, honor_items,
      market_posts, point_transactions, point_accounts,
      donations, activity_galleries, activity_checkins, activity_registrations,
      activities, banners, point_rules
      CASCADE`)
    // Delete volunteer users only (keep admin)
    await client.query(`DELETE FROM users WHERE role = 'volunteer'`)
    console.log('  Previous demo data cleaned.\n')

    // ─────────────────────────────────────────────────────────────
    // 1. USERS (5 volunteers)
    // ─────────────────────────────────────────────────────────────
    console.log('\n[1/15] Seeding users...')
    const userData = [
      { openid: 'vol-001', phone: '13800138001', nickname: '志愿者张三', real_name: '张三', id_card_no: '110101199001011234', real_name_verified: true, member_no: 'VA20260001', role: 'volunteer', honor_level: 2 },
      { openid: 'vol-002', phone: '13800138002', nickname: '志愿者李四', real_name: '李四', id_card_no: '310101199205052345', real_name_verified: true, member_no: 'VA20260002', role: 'volunteer', honor_level: 1 },
      { openid: 'vol-003', phone: '13800138003', nickname: '志愿者王五', real_name: null, id_card_no: null, real_name_verified: false, member_no: 'VA20260003', role: 'volunteer', honor_level: 0 },
      { openid: 'vol-004', phone: '13800138004', nickname: '爱心赵六',   real_name: '赵六', id_card_no: '440301198803033456', real_name_verified: true, member_no: 'VA20260004', role: 'volunteer', honor_level: 3 },
      { openid: 'vol-005', phone: '13800138005', nickname: '公益孙七',   real_name: '孙七', id_card_no: '330102199107074567', real_name_verified: true, member_no: 'VA20260005', role: 'volunteer', honor_level: 1 },
    ]

    const userIds = {}
    // Pre-hash a shared password for all volunteer demo accounts: zhangsan/123456, lisi/123456, etc.
    const volPasswordHash = await bcrypt.hash('123456', 10)
    for (const u of userData) {
      const r = await client.query(
        `INSERT INTO users (openid, phone, nickname, real_name, id_card_no, real_name_verified, member_no, role, honor_level, status, username, password_hash)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active',$10,$11)
         ON CONFLICT (openid) DO UPDATE SET nickname=EXCLUDED.nickname, member_no=EXCLUDED.member_no, honor_level=EXCLUDED.honor_level, username=EXCLUDED.username, password_hash=EXCLUDED.password_hash
         RETURNING id, nickname`,
        [u.openid, u.phone, u.nickname, u.real_name, u.id_card_no, u.real_name_verified, u.member_no, u.role, u.honor_level, u.openid, volPasswordHash]
      )
      userIds[u.openid] = r.rows[0].id
      console.log('  user:', r.rows[0].nickname, '(login:', u.openid + '/123456)', '-', r.rows[0].id)
    }

    // Fetch admin id (must already exist via seed-admin.cjs)
    const adminRes = await client.query("SELECT id FROM users WHERE role='admin' LIMIT 1")
    if (adminRes.rows.length === 0) {
      throw new Error('Admin user not found. Please run seed-admin.cjs first.')
    }
    const adminId = adminRes.rows[0].id
    console.log('  admin id:', adminId)

    // ─────────────────────────────────────────────────────────────
    // 2. BANNERS
    // ─────────────────────────────────────────────────────────────
    console.log('\n[2/15] Seeding banners...')
    const banners = [
      { title: '加入众爱，温暖世界', image_url: 'https://picsum.photos/seed/banner1/750/300', link_type: 'page', link_value: '/pages/activity/list', sort_order: 1, is_active: true },
      { title: '2026年志愿者招募进行中', image_url: 'https://picsum.photos/seed/banner2/750/300', link_type: 'page', link_value: '/pages/user/realname', sort_order: 2, is_active: true },
      { title: '积分兑换好礼', image_url: 'https://picsum.photos/seed/banner3/750/300', link_type: 'page', link_value: '/pages/points/index', sort_order: 3, is_active: true },
    ]
    for (const b of banners) {
      const r = await client.query(
        `INSERT INTO banners (title, image_url, link_type, link_value, sort_order, is_active)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [b.title, b.image_url, b.link_type, b.link_value, b.sort_order, b.is_active]
      )
      console.log('  banner:', b.title, '-', r.rows[0].id)
    }

    // ─────────────────────────────────────────────────────────────
    // 3. POINT RULES
    // ─────────────────────────────────────────────────────────────
    console.log('\n[3/15] Seeding point rules...')
    const rules = [
      { rule_type: 'activity_checkin', point_type: 'reward', points_per_unit: 10, unit_desc: '次', min_amount: 0, is_active: true },
      { rule_type: 'activity_complete', point_type: 'reward', points_per_unit: 0, unit_desc: '次', min_amount: 0, is_active: true },
      { rule_type: 'first_register', point_type: 'reward', points_per_unit: 50, unit_desc: '次', min_amount: 0, is_active: true },
      { rule_type: 'realname_verify', point_type: 'reward', points_per_unit: 30, unit_desc: '次', min_amount: 0, is_active: true },
      { rule_type: 'donation', point_type: 'reward', points_per_unit: 1, unit_desc: '元', min_amount: 1, is_active: true },
    ]
    for (const r of rules) {
      const res = await client.query(
        `INSERT INTO point_rules (rule_type, point_type, points_per_unit, unit_desc, min_amount, is_active)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [r.rule_type, r.point_type, r.points_per_unit, r.unit_desc, r.min_amount, r.is_active]
      )
      console.log('  rule:', r.rule_type, '-', res.rows[0].id)
    }

    // ─────────────────────────────────────────────────────────────
    // 4. ACTIVITIES (6 activities: 2 past, 2 upcoming, 1 draft, 1 cancelled)
    // ─────────────────────────────────────────────────────────────
    console.log('\n[4/15] Seeding activities...')
    const now = new Date()
    const d = (daysOffset, h, m = 0) => {
      const dt = new Date(now)
      dt.setDate(dt.getDate() + daysOffset)
      dt.setHours(h, m, 0, 0)
      return dt.toISOString()
    }

    const activityData = [
      { title: '社区环保清洁活动',       category: 'environment',  desc: '组织志愿者对幸福社区进行全面清洁，包括垃圾分类宣传、公共区域清扫和绿化带维护。欢迎热爱环保的朋友加入！', location: '幸福社区广场',  lat: '39.9042000', lng: '116.4073963', start: d(-14, 9),  end: d(-14, 12), radius: 500, max_p: 30, reward: 100, status: 'published', published: d(-20, 10) },
      { title: '关爱孤寡老人志愿服务',   category: 'elderly',      desc: '前往阳光敬老院陪伴老人聊天、读报、做手工，为他们送去温暖和欢乐。每次活动都会安排不同的互动主题。', location: '阳光敬老院',      lat: '39.9152000', lng: '116.4223963', start: d(-7, 9),   end: d(-7, 11, 30), radius: 300, max_p: 20, reward: 80,  status: 'published', published: d(-13, 10) },
      { title: '贫困儿童助学行动',       category: 'education',    desc: '为偏远地区儿童筹集学习用品和书籍，并组织线上辅导志愿者一对一帮扶。让每个孩子都有读书的机会。', location: '希望小学',      lat: '39.8800000', lng: '116.3800000', start: d(7, 10),   end: d(7, 14),   radius: 200, max_p: 25, reward: 120, status: 'published', published: d(-3, 10) },
      { title: '社区健康知识讲座',       category: 'health',       desc: '邀请三甲医院医生为社区居民免费讲解慢性病预防、营养膳食搭配等健康知识，现场答疑。', location: '和谐社区活动中心', lat: '39.9200000', lng: '116.4400000', start: d(14, 14),  end: d(14, 16, 30), radius: 400, max_p: 50, reward: 60,  status: 'published', published: d(-1, 10) },
      { title: '城市绿道植树活动',       category: 'environment',  desc: '在城市绿道沿线种植景观树木，美化城市环境。请穿着便于运动的服装，工具和树苗由组织方提供。', location: '城市绿道公园',  lat: '39.9500000', lng: '116.4600000', start: d(21, 8),   end: d(21, 12),  radius: 600, max_p: 40, reward: 150, status: 'draft',     published: null },
      { title: '流浪动物关爱行动',       category: 'community',    desc: '因天气原因活动取消。原计划前往流浪动物救助站进行清洁和陪伴活动，下次重新安排。', location: '爱心动物救助站', lat: '39.8700000', lng: '116.3500000', start: d(-3, 9),   end: d(-3, 12),  radius: 300, max_p: 15, reward: 70,  status: 'cancelled', published: d(-10, 10) },
    ]

    // Activities 2 and 3 are organized by volunteer 王五 (vol-003) so admin can test registration on them
    const vol003Id = userIds['vol-003']
    const activityOrganizer = (idx) => (idx === 2 || idx === 3) ? vol003Id : adminId
    const activityIds = []
    for (let i = 0; i < activityData.length; i++) {
      const a = activityData[i]
      const organizerId = activityOrganizer(i)
      const r = await client.query(
        `INSERT INTO activities (title, category, description, cover_image, location, latitude, longitude, start_time, end_time,
          checkin_radius, max_participants, reward_points, status, organizer_id, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id, title`,
        [a.title, a.category, a.desc,
          `https://picsum.photos/seed/${encodeURIComponent(a.title)}/800/450`,
          a.location, a.lat, a.lng, a.start, a.end, a.radius, a.max_p, a.reward,
          a.status, organizerId, a.published]
      )
      activityIds.push(r.rows[0].id)
      console.log('  activity:', r.rows[0].title, '(organizer:', organizerId === adminId ? 'admin' : 'vol-003', ')', '-', r.rows[0].id)
    }

    // ─────────────────────────────────────────────────────────────
    // 5. ACTIVITY REGISTRATIONS
    // ─────────────────────────────────────────────────────────────
    console.log('\n[5/15] Seeding activity registrations...')
    const volIds = Object.values(userIds)
    const regs = [
      // activity 0 (env clean - past): 张三 approved, 李四 approved, 王五 approved
      { ai: 0, uid: volIds[0], status: 'approved' },
      { ai: 0, uid: volIds[1], status: 'approved' },
      { ai: 0, uid: volIds[2], status: 'approved' },
      // activity 1 (elderly - past): 赵六 approved, 孙七 approved
      { ai: 1, uid: volIds[3], status: 'approved' },
      { ai: 1, uid: volIds[4], status: 'approved' },
      // activity 2 (education - upcoming): 张三 pending, 赵六 approved, 孙七 pending
      { ai: 2, uid: volIds[0], status: 'pending'  },
      { ai: 2, uid: volIds[3], status: 'approved' },
      { ai: 2, uid: volIds[4], status: 'pending'  },
      // activity 3 (health - upcoming): 李四 pending
      { ai: 3, uid: volIds[1], status: 'pending'  },
    ]
    for (const reg of regs) {
      const r = await client.query(
        `INSERT INTO activity_registrations (activity_id, user_id, status)
         VALUES ($1,$2,$3)
         RETURNING id`,
        [activityIds[reg.ai], reg.uid, reg.status]
      )
      console.log('  registration: activity', reg.ai, 'user status:', reg.status, r.rows[0] ? '- created' : '- exists')
    }
    // update current_participants on activities that have approved registrations
    for (let i = 0; i < activityData.length; i++) {
      await client.query(
        `UPDATE activities SET current_participants = (
           SELECT COUNT(*) FROM activity_registrations WHERE activity_id=$1 AND status='approved'
         ) WHERE id=$1`,
        [activityIds[i]]
      )
    }

    // ─────────────────────────────────────────────────────────────
    // 6. ACTIVITY CHECKINS (for past activities 0 and 1)
    // ─────────────────────────────────────────────────────────────
    console.log('\n[6/15] Seeding activity checkins...')
    const tenDaysAgo = new Date(); tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
    const checkins = [
      { ai: 0, uid: volIds[0], type: 'location', lat: '39.9043000', lng: '116.4074963', verified: true,  pts: true  },
      { ai: 0, uid: volIds[1], type: 'location', lat: '39.9041500', lng: '116.4072000', verified: true,  pts: true  },
      { ai: 0, uid: volIds[2], type: 'location', lat: '39.9042200', lng: '116.4073100', verified: false, pts: false },
      { ai: 1, uid: volIds[3], type: 'location', lat: '39.9152200', lng: '116.4224100', verified: true,  pts: true  },
      { ai: 1, uid: volIds[4], type: 'location', lat: '39.9151800', lng: '116.4223800', verified: true,  pts: true  },
    ]
    for (const c of checkins) {
      const r = await client.query(
        `INSERT INTO activity_checkins (activity_id, user_id, checkin_type, latitude, longitude, checkin_time, verified, verified_by, verified_at, points_granted)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING id`,
        [activityIds[c.ai], c.uid, c.type, c.lat, c.lng, tenDaysAgo, c.verified,
          c.verified ? adminId : null,
          c.verified ? tenDaysAgo : null,
          c.pts]
      )
      console.log('  checkin: activity', c.ai, 'verified:', c.verified, r.rows[0] ? '- created' : '- exists')
    }

    // ─────────────────────────────────────────────────────────────
    // 7. ACTIVITY GALLERIES (photos for past activities)
    // ─────────────────────────────────────────────────────────────
    console.log('\n[7/15] Seeding activity galleries...')
    const galleries = [
      { ai: 0, media: 'image', sort: 1 },
      { ai: 0, media: 'image', sort: 2 },
      { ai: 0, media: 'image', sort: 3 },
      { ai: 1, media: 'image', sort: 1 },
      { ai: 1, media: 'image', sort: 2 },
    ]
    for (const g of galleries) {
      const r = await client.query(
        `INSERT INTO activity_galleries (activity_id, media_type, file_url, thumbnail_url, file_size, width, height, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [activityIds[g.ai], g.media,
          `https://picsum.photos/seed/gallery${g.ai}${g.sort}/1200/800`,
          `https://picsum.photos/seed/gallery${g.ai}${g.sort}/300/200`,
          245760 + g.sort * 10000, 1200, 800, g.sort]
      )
      console.log('  gallery: activity', g.ai, 'photo', g.sort, '-', r.rows[0].id)
    }

    // ─────────────────────────────────────────────────────────────
    // 8. DONATIONS (5 records)
    // ─────────────────────────────────────────────────────────────
    console.log('\n[8/15] Seeding donations...')
    const donations = [
      { uid: volIds[0], type: 'money',    amount: 500,  mat_desc: null,                     mat_val: null, evidence: JSON.stringify(['https://picsum.photos/seed/don1/400/400']), ev_desc: '银行转账500元支持教育事业',    status: 'approved',  reviewer: adminId, pts: true  },
      { uid: volIds[1], type: 'material', amount: null, mat_desc: '图书100本、文具50套',    mat_val: 800,  evidence: JSON.stringify(['https://picsum.photos/seed/don2/400/400']), ev_desc: '向希望小学捐赠图书和文具',      status: 'approved',  reviewer: adminId, pts: true  },
      { uid: volIds[2], type: 'money',    amount: 200,  mat_desc: null,                     mat_val: null, evidence: JSON.stringify(['https://picsum.photos/seed/don3/400/400']), ev_desc: '微信转账200元关爱老人',        status: 'pending',   reviewer: null,    pts: false },
      { uid: volIds[3], type: 'money',    amount: 2000, mat_desc: null,                     mat_val: null, evidence: JSON.stringify(['https://picsum.photos/seed/don4/400/400']), ev_desc: '大额捐赠2000元用于社区建设',    status: 'approved',  reviewer: adminId, pts: true  },
      { uid: volIds[4], type: 'material', amount: null, mat_desc: '冬季棉被20床、衣物50件', mat_val: 1500, evidence: JSON.stringify(['https://picsum.photos/seed/don5/400/400']), ev_desc: '为贫困地区捐赠冬衣棉被',      status: 'rejected',  reviewer: adminId, pts: false },
    ]
    const donationIds = []
    for (const dn of donations) {
      const r = await client.query(
        `INSERT INTO donations (user_id, donation_type, amount, material_desc, material_value, evidence_images, evidence_desc, status, reviewer_id, reviewed_at, points_granted)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11) RETURNING id`,
        [dn.uid, dn.type, dn.amount, dn.mat_desc, dn.mat_val, dn.evidence, dn.ev_desc, dn.status,
          dn.reviewer, dn.reviewer ? new Date() : null, dn.pts]
      )
      donationIds.push(r.rows[0].id)
      console.log('  donation:', dn.type, dn.status, '-', r.rows[0].id)
    }

    // ─────────────────────────────────────────────────────────────
    // 9. POINT ACCOUNTS (one per volunteer)
    // ─────────────────────────────────────────────────────────────
    console.log('\n[9/15] Seeding point accounts...')
    const pointAccounts = [
      { uid: volIds[0], act_bal: 150, act_total: 200, don_bal: 500, don_total: 500 },  // 张三
      { uid: volIds[1], act_bal: 130, act_total: 130, don_bal: 800, don_total: 800 },  // 李四
      { uid: volIds[2], act_bal: 20,  act_total: 20,  don_bal: 0,   don_total: 0   },  // 王五
      { uid: volIds[3], act_bal: 380, act_total: 450, don_bal: 2000,don_total: 2000},  // 赵六
      { uid: volIds[4], act_bal: 160, act_total: 180, don_bal: 0,   don_total: 0   },  // 孙七 (rejected donation)
    ]
    for (const pa of pointAccounts) {
      const r = await client.query(
        `INSERT INTO point_accounts (user_id, activity_points_balance, activity_points_total, donation_points_balance, donation_points_total)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (user_id) DO UPDATE SET
           activity_points_balance=EXCLUDED.activity_points_balance,
           activity_points_total=EXCLUDED.activity_points_total,
           donation_points_balance=EXCLUDED.donation_points_balance,
           donation_points_total=EXCLUDED.donation_points_total
         RETURNING id`,
        [pa.uid, pa.act_bal, pa.act_total, pa.don_bal, pa.don_total]
      )
      console.log('  point_account:', r.rows[0].id)
    }

    // ─────────────────────────────────────────────────────────────
    // 10. POINT TRANSACTIONS
    // ─────────────────────────────────────────────────────────────
    console.log('\n[10/15] Seeding point transactions...')
    const txns = [
      { uid: volIds[0], pt: 'reward', change: 'earn',  amt: 50,  bal: 50,   src: 'first_register',    desc: '首次注册奖励' },
      { uid: volIds[0], pt: 'reward', change: 'earn',  amt: 30,  bal: 80,   src: 'realname_verify',   desc: '实名认证奖励' },
      { uid: volIds[0], pt: 'reward', change: 'earn',  amt: 100, bal: 180,  src: 'activity_checkin',  desc: '社区环保清洁签到奖励' },
      { uid: volIds[0], pt: 'reward', change: 'earn',  amt: 500, bal: 680,  src: 'donation',          desc: '捐赠500元积分奖励' },
      { uid: volIds[1], pt: 'reward', change: 'earn',  amt: 50,  bal: 50,   src: 'first_register',    desc: '首次注册奖励' },
      { uid: volIds[1], pt: 'reward', change: 'earn',  amt: 30,  bal: 80,   src: 'realname_verify',   desc: '实名认证奖励' },
      { uid: volIds[1], pt: 'reward', change: 'earn',  amt: 80,  bal: 160,  src: 'activity_checkin',  desc: '社区环保清洁签到奖励' },
      { uid: volIds[3], pt: 'reward', change: 'earn',  amt: 50,  bal: 50,   src: 'first_register',    desc: '首次注册奖励' },
      { uid: volIds[3], pt: 'reward', change: 'earn',  amt: 80,  bal: 130,  src: 'activity_checkin',  desc: '关爱孤寡老人签到奖励' },
      { uid: volIds[3], pt: 'reward', change: 'earn',  amt: 2000,bal: 2130, src: 'donation',          desc: '捐赠2000元积分奖励' },
      { uid: volIds[4], pt: 'reward', change: 'earn',  amt: 50,  bal: 50,   src: 'first_register',    desc: '首次注册奖励' },
      { uid: volIds[4], pt: 'reward', change: 'earn',  amt: 80,  bal: 130,  src: 'activity_checkin',  desc: '关爱孤寡老人签到奖励' },
    ]
    for (const t of txns) {
      const r = await client.query(
        `INSERT INTO point_transactions (user_id, point_type, change_type, amount, balance_after, source_type, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [t.uid, t.pt, t.change, t.amt, t.bal, t.src, t.desc]
      )
      console.log('  txn:', t.desc, '-', r.rows[0].id)
    }

    // ─────────────────────────────────────────────────────────────
    // 11. MARKET POSTS (points exchange)
    // ─────────────────────────────────────────────────────────────
    console.log('\n[11/15] Seeding market posts...')
    const posts = [
      { uid: volIds[0], type: 'supply',  title: '全新保温杯兑换',      content: '积分兑换全新不锈钢保温杯，500ml容量，颜色可选。适合日常使用和户外活动。', status: 'approved', contact: '微信: zhangsan_vol' },
      { uid: volIds[3], type: 'supply',  title: '志愿者定制T恤转让',   content: '众爱联盟2025年度志愿者纪念T恤，L码，全新未穿，有两件可兑换。', status: 'approved', contact: '电话: 13800138004' },
      { uid: volIds[1], type: 'demand',  title: '求兑换儿童绘本套装', content: '希望用积分兑换适合6-10岁儿童的绘本套装，用于捐赠给希望小学。', status: 'pending',  contact: '微信: lisi_charity' },
    ]
    for (const p of posts) {
      const r = await client.query(
        `INSERT INTO market_posts (user_id, type, title, content, images, contact_info, status, reviewed_by)
         VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8) RETURNING id`,
        [p.uid, p.type, p.title, p.content, JSON.stringify([]), p.contact, p.status,
          p.status === 'approved' ? adminId : null]
      )
      console.log('  market_post:', p.title, '-', r.rows[0].id)
    }

    // ─────────────────────────────────────────────────────────────
    // 12. HONOR ITEMS (badges / titles)
    // ─────────────────────────────────────────────────────────────
    console.log('\n[12/15] Seeding honor items...')
    const honorItems = [
      { name: '环保先锋',   type: 'badge', desc: '参加环保类活动累计5次以上',           img: 'https://picsum.photos/seed/honor1/200/200', unlock_type: 'activity_count', unlock_val: 5,  unlock_lvl: 1, unlock_act_cnt: 5,  unlock_don_amt: 0    },
      { name: '爱心大使',   type: 'badge', desc: '累计捐赠金额达到1000元',              img: 'https://picsum.photos/seed/honor2/200/200', unlock_type: 'donation_amount',unlock_val: 1000, unlock_lvl: 2, unlock_act_cnt: 0,  unlock_don_amt: 1000 },
      { name: '志愿之星',   type: 'title', desc: '荣誉等级达到3级',                     img: 'https://picsum.photos/seed/honor3/200/200', unlock_type: 'honor_level',   unlock_val: 3,    unlock_lvl: 3, unlock_act_cnt: 0,  unlock_don_amt: 0    },
      { name: '新人勋章',   type: 'badge', desc: '完成首次志愿者注册',                  img: 'https://picsum.photos/seed/honor4/200/200', unlock_type: 'activity_count', unlock_val: 1,  unlock_lvl: 0, unlock_act_cnt: 1,  unlock_don_amt: 0    },
    ]
    const honorItemIds = []
    for (const h of honorItems) {
      const r = await client.query(
        `INSERT INTO honor_items (name, type, description, image_url, unlock_type, unlock_value, unlock_level, unlock_activity_count, unlock_donation_amount, is_active, stock)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,-1) RETURNING id`,
        [h.name, h.type, h.desc, h.img, h.unlock_type, h.unlock_val, h.unlock_lvl, h.unlock_act_cnt, h.unlock_don_amt]
      )
      honorItemIds.push(r.rows[0].id)
      console.log('  honor_item:', h.name, '-', r.rows[0].id)
    }

    // ─────────────────────────────────────────────────────────────
    // 13. HONOR RECORDS (users who earned honors)
    // ─────────────────────────────────────────────────────────────
    console.log('\n[13/15] Seeding honor records...')
    const honorRecords = [
      { uid: volIds[0], hi: 3, item_name: '新人勋章', item_type: 'badge', status: 'issued', cert_no: 'CERT-2026-0001' },
      { uid: volIds[3], hi: 1, item_name: '爱心大使', item_type: 'badge', status: 'issued', cert_no: 'CERT-2026-0002' },
      { uid: volIds[3], hi: 2, item_name: '志愿之星', item_type: 'title', status: 'issued', cert_no: 'CERT-2026-0003' },
    ]
    for (const hr of honorRecords) {
      const r = await client.query(
        `INSERT INTO honor_records (user_id, item_id, item_name, item_type, status, certificate_no, issue_time, issued_by)
         VALUES ($1,$2,$3,$4,$5,$6,NOW(),$7)
         RETURNING id`,
        [hr.uid, honorItemIds[hr.hi], hr.item_name, hr.item_type, hr.status, hr.cert_no, adminId]
      )
      console.log('  honor_record:', hr.item_name, '->', hr.uid.slice(0, 8), r.rows[0] ? '- created' : '- exists')
    }

    // ─────────────────────────────────────────────────────────────
    // 14. FEEDBACKS
    // ─────────────────────────────────────────────────────────────
    console.log('\n[14/15] Seeding feedbacks...')
    const feedbacks = [
      { uid: volIds[0], type: 'bug',       title: '签到定位偶有偏差',   content: '在室内进行签到时，GPS定位偶尔偏差超过500米导致签到失败，建议增加手动确认功能。', contact: '13800138001', status: 'resolved', priority: 'high',   response: '感谢反馈！我们已在最新版本中优化了室内定位算法，并新增了管理员手动确认签到的功能。' },
      { uid: volIds[1], type: 'suggestion',title: '增加活动日历视图',   content: '建议在活动列表页增加月历视图，方便志愿者直观查看各天的活动安排和冲突提醒。',       contact: 'lisi@example.com', status: 'processing', priority: 'normal', response: '好的建议，我们已将日历视图纳入下个版本的开发计划中。' },
      { uid: volIds[3], type: 'general',   title: '感谢信',             content: '感谢众爱联盟提供的平台，让我能够持续参与公益活动，认识了很多志同道合的朋友！',    contact: '13800138004', status: 'pending',    priority: 'low',    response: null },
    ]
    for (const f of feedbacks) {
      const r = await client.query(
        `INSERT INTO feedbacks (user_id, type, title, content, contact_info, status, priority, assigned_to, response, response_time)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [f.uid, f.type, f.title, f.content, f.contact, f.status, f.priority,
          f.status !== 'pending' ? adminId : null,
          f.response,
          f.response ? new Date() : null]
      )
      console.log('  feedback:', f.title, '-', r.rows[0].id)
    }

    // ─────────────────────────────────────────────────────────────
    // 15. NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────
    console.log('\n[15/15] Seeding notifications...')
    const notifs = [
      { uid: volIds[0], type: 'activity_reminder',   title: '活动提醒：贫困儿童助学行动', content: '您报名的"贫困儿童助学行动"将于明天上午10点开始，请准时到达希望小学。',           read: true  },
      { uid: volIds[0], type: 'donation_approved',   title: '捐赠审核通过',              content: '您的500元现金捐赠已审核通过，500积分已发放至您的账户。感谢善举！',               read: true  },
      { uid: volIds[1], type: 'donation_approved',   title: '捐赠审核通过',              content: '您捐赠的图书100本、文具50套已审核通过，800积分已到账。',                        read: false },
      { uid: volIds[2], type: 'activity_cancelled',  title: '活动取消通知',              content: '您参与的"流浪动物关爱行动"因天气原因已取消，请关注后续重新安排通知。',           read: false },
      { uid: volIds[3], type: 'honor_unlocked',        title: '恭喜获得新荣誉！',          content: '您已获得"爱心大使"徽章！累计捐赠金额达到1000元，感谢您的持续贡献。',            read: true  },
      { uid: volIds[4], type: 'system',              title: '系统公告：积分规则调整',     content: '自2026年7月起，签到积分奖励将由每次10分调整为15分，详情请查看积分规则页面。',    read: false },
    ]
    for (const n of notifs) {
      const r = await client.query(
        `INSERT INTO notifications (user_id, type, title, content, data, is_read, read_at)
         VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7) RETURNING id`,
        [n.uid, n.type, n.title, n.content, JSON.stringify({}), n.read,
          n.read ? new Date() : null]
      )
      console.log('  notification:', n.title, '-', r.rows[0].id)
    }

    await client.query('COMMIT')
    console.log('\n✓ Demo data seeded successfully!')
    console.log(`  Tables populated: users, banners, point_rules, activities, activity_registrations,
  activity_checkins, activity_galleries, donations, point_accounts, point_transactions,
  market_posts, honor_items, honor_records, feedbacks, notifications`)
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('\n✗ Failed to seed demo data:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

seedDemoData()
