import { z } from 'zod'
import { createPost } from '#server/services/market.service'
import { success, createErrorResponse, ResponseCode } from '#server/utils/response'

const createPostSchema = z.object({
  type: z.enum(['job', 'resume', 'idle']),
  title: z.string().min(5, '标题长度需在5-100字符之间').max(100, '标题长度需在5-100字符之间'),
  content: z.string().min(20, '内容长度需在20-2000字符之间').max(2000, '内容长度需在20-2000字符之间'),
  images: z.array(z.string()).max(9, '最多上传9张图片').optional(),
  contactInfo: z.string().min(1, '请填写联系方式'),
  location: z.string().max(100).optional(),
  price: z.number().min(0, '价格不能为负数').optional(),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth) {
    throw createErrorResponse(401, '未登录', ResponseCode.UNAUTHORIZED)
  }

  const body = await readBody(event)

  const parsed = createPostSchema.safeParse(body)
  if (!parsed.success) {
    throw createErrorResponse(422, parsed.error.errors.map((e) => e.message).join(', '), ResponseCode.VALIDATION_ERROR)
  }

  const post = await createPost(auth.userId, parsed.data)
  return success(post)
})
